import { PrismaClient } from "@prisma/client";
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

/**
 * 1. Neon Driver Adapter Setup for Serverless
 * Ensure WebSockets are correctly configured for non-browser environments.
 */
if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

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
 * Creates a singleton instance of the Prisma Client with Neon adapter mapping.
 * Optimized for Prisma 7 standard driver configuration.
 * 
 * IMPORTANT: This function will throw if DATABASE_URL is missing.
 */
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables.');
  }

  // Use the connection string directly for the adapter instance.
  const adapter = new PrismaNeon({
    connectionString,
  }) as any;
  
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