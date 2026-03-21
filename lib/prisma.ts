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
  const pool = new Pool({ 
    connectionString,
    connectionTimeoutMillis: 10000,  // 10s timeout instead of hanging forever
    idleTimeoutMillis: 30000,        // Close idle connections after 30s
    max: 10,                          // Max pool size
  })
  const adapter = new PrismaNeon(pool)
  return new PrismaClient({ adapter } as any)
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;