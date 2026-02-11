import { PrismaClient } from "@prisma/client";
import path from "path";

// Prisma Client Instance
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * Robust SQLite URL resolution for Vercel and Local
 * Prevents "URL must start with file:" errors when DATABASE_URL is misconfigured.
 */
const getDatabaseUrl = () => {
    const envUrl = process.env.DATABASE_URL;
    
    // If the URL already starts with file:, trust it but ensure it's used
    if (envUrl?.startsWith("file:")) return envUrl;
    
    // Default to an absolute path resolution for Vercel environment.
    // This is the fallback that fixes the "the URL must start with the protocol file:" error.
    return `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
};

export const prisma = 
  globalForPrisma.prisma || 
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
