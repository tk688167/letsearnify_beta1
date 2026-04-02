import { PrismaClient } from "@prisma/client";
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// 1. Neon Driver Adapter Setup for Serverless
if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

// 2. Global Instance Pattern to prevent multiple connections in Vercel
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Creates a singleton instance of the Prisma Client with Neon adapter mapping.
 * Optimized for Prisma 7 standard driver configuration.
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

export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}