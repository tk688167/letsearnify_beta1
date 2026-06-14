/**
 * Marketplace Mode — Database Store
 *
 * Stores the marketplace mode in the SystemConfig table (key = "MARKETPLACE_MODE").
 * Reading and writing go through the Prisma database, making this reliable across
 * ALL Next.js App Router contexts (server components, API routes, middleware, etc.)
 */
import { prisma } from "@/lib/prisma"

export type MarketplaceMode = "development" | "live"

const CONFIG_KEY = "MARKETPLACE_MODE"

export async function getMarketplaceMode(): Promise<MarketplaceMode> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: CONFIG_KEY },
    })
    const mode = (config?.value as any)?.mode
    return mode === "live" ? "live" : "development"
  } catch {
    return "development"
  }
}

export async function setMarketplaceMode(mode: MarketplaceMode): Promise<void> {
  await prisma.systemConfig.upsert({
    where: { key: CONFIG_KEY },
    update: { value: { mode } },
    create: { key: CONFIG_KEY, value: { mode } },
  })
  console.log(`🏪 Marketplace mode → ${mode}`)
}
