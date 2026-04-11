import { PrismaClient } from "@prisma/client";
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';
import ws from 'ws';

/**
 * 2. Global Instance Pattern to prevent multiple connections in Vercel
 * In development, we persist the PrismaClient instance globally to prevent the 
 * "Too many connections" error during Hot Module Replacement (HMR).
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Creates a singleton instance of the Prisma Client.
 * Supports Neon via PrismaNeon adapter and other PostgreSQL providers
 * (e.g. Supabase) via PrismaPg adapter.
 * 
 * IMPORTANT: This function will throw if neither DATABASE_URL nor DIRECT_URL is defined.
 */
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL or DIRECT_URL must be defined in environment variables.');
  }

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
    });
  }

  // Supabase and other PostgreSQL providers use the generic Postgres adapter.
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
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
  ? (globalThis.prisma || createPrismaClient())
  : (null as unknown as PrismaClient);

// Persist only on the server
if (typeof window === 'undefined' && process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
