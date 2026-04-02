import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { WebSocket } from 'ws'

neonConfig.webSocketConstructor = WebSocket

// Disable WebSocket caching so stale connections get replaced
neonConfig.wsProxy = (host) => host
neonConfig.useSecureWebSocket = true
neonConfig.pipelineTLS = false
neonConfig.pipelineConnect = false

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient
  pool: Pool 
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!
  
  // In Prisma 7, the adapter handles the pool internally if passed a connection string
  // or we can still pass a Pool if we need custom configuration.
  // However, the new standard pattern is to use the adapter directly.
  const adapter = new PrismaNeon({
    connectionString,
  }) as any
  
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;