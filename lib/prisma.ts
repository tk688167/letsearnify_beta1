import { PrismaClient } from "@prisma/client";
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import ws from 'ws';

// Anti-Gravity: Force-extend types to resolve stale IDE caching of generated Prisma client
interface ExtendedPrismaClient extends PrismaClient {
  userNotification: any;
}

/**
 * 2. Global Instance Pattern to prevent multiple connections in Vercel
 * In development, we persist the PrismaClient instance globally to prevent the 
 * "Too many connections" error during Hot Module Replacement (HMR).
 */
declare global {
  // eslint-disable-next-line no-var
  var prismaClientSingleton: ExtendedPrismaClient | undefined;
  // eslint-disable-next-line no-var
  var pgPoolSingleton: Pool | undefined;
}

/**
 * Creates a singleton instance of the Prisma Client.
 * Supports Neon via PrismaNeon adapter and other PostgreSQL providers
 * (e.g. Supabase) via PrismaPg adapter.
 * 
 * IMPORTANT: This function will throw if neither DATABASE_URL nor DIRECT_URL is defined.
 */
function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL?.trim() || process.env.DIRECT_URL?.trim();

  if (!connectionString) {
    throw new Error('DATABASE_URL or DIRECT_URL must be defined in environment variables.');
  }

  let parsed: URL;
  try {
    parsed = new URL(connectionString);
  } catch {
    throw new Error('DATABASE_URL or DIRECT_URL is not a valid PostgreSQL connection string.');
  }

  if (parsed.hostname.toLowerCase() === 'base') {
    throw new Error('Invalid database host "base". Check the DATABASE_URL and DIRECT_URL values configured on Vercel.');
  }

  return connectionString;
}

function createPrismaClient(): ExtendedPrismaClient {
  const connectionString = getConnectionString();

  const isNeon = (() => {
    try {
      return new URL(connectionString).hostname.endsWith('.neon.tech');
    } catch {
      return false;
    }
  })();

  // Neon needs the serverless adapter + websocket constructor.
  if (isNeon && typeof window === 'undefined') {
    neonConfig.webSocketConstructor = ws;
    const adapter = new PrismaNeon({ connectionString }) as any;

    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    }) as any;
  }

  // Supabase and other PostgreSQL providers use the generic Postgres adapter.
  // We initialize the pg.Pool explicitly to set limits, timeouts, and most importantly,
  // trap asynchronous DNS resolution errors like getaddrinfo EAI_AGAIN to prevent server crashing.
  
  if (!globalThis.pgPoolSingleton) {
    globalThis.pgPoolSingleton = new Pool({
      connectionString,
      max: 15,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    });

    globalThis.pgPoolSingleton.on('error', (err) => {
      console.error('Unexpected error on idle client (EAI_AGAIN intercepted)', err);
    });
  }

  const adapter = new PrismaPg(globalThis.pgPoolSingleton as any);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }) as any;
}

function getPrismaClient(): ExtendedPrismaClient {
  if (typeof window !== 'undefined') {
    throw new Error('Prisma client cannot be used in the browser.');
  }

  if (!globalThis.prismaClientSingleton) {
    globalThis.prismaClientSingleton = createPrismaClient();
  }

  return globalThis.prismaClientSingleton;
}

function createPrismaProxy(): ExtendedPrismaClient {
  return new Proxy({} as ExtendedPrismaClient, {
    get(_target, prop, receiver) {
      const client = getPrismaClient() as unknown as Record<PropertyKey, unknown>;
      const value = Reflect.get(client, prop, receiver);
      return typeof value === "function" ? value.bind(client) : value;
    },
  });
}

/**
 * 3. Environment-Safe Singleton Initialization
 * 
 * We must ensure this module can be safely evaluated in a browser context without throwing 
 * an error, even if it's never actually used there. This is necessary because some
 * shared utilities (like MLM logic or Auth) might be imported by Client Components.
 */
export const prisma = typeof window === 'undefined'
  ? createPrismaProxy()
  : (null as unknown as ExtendedPrismaClient);
