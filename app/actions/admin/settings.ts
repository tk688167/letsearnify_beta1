"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const KEY_COMING_SOON = "COMING_SOON_CONFIG"

export interface SectionConfig {
  title: string
  description: string
  showIcon: boolean
  iconType?: string
  gradientFrom: string
  gradientTo: string
  watermarkText?: string
}

export interface ComingSoonConfig {
  default: SectionConfig
  tasks: SectionConfig
  pools: SectionConfig
  marketplace: SectionConfig
}

const DEFAULT_SECTION: SectionConfig = {
  title: "Coming Soon",
  description: "In Development – Coming Soon. This feature will be available in the near future. Stay tuned!",
  showIcon: true,
  iconType: "rocket",
  gradientFrom: "from-blue-900",
  gradientTo: "to-indigo-900",
  watermarkText: "COMING SOON"
}

const DEFAULT_CONFIG: ComingSoonConfig = {
  default: DEFAULT_SECTION,
  tasks: { ...DEFAULT_SECTION, title: "Task Center Is Coming", description: "Get ready to earn by completing simple tasks. Our comprehensive Task Center is under construction.", gradientFrom: "from-blue-950", gradientTo: "to-purple-900", watermarkText: "TASK CENTER" },
  pools: { ...DEFAULT_SECTION, title: "Mudaraba Pool Opening", description: "Invest in ethical, Sharia-compliant pools. The Mudaraba investment platform is being finalized.", gradientFrom: "from-indigo-950", gradientTo: "to-violet-900", watermarkText: "POOLS" },
  marketplace: { ...DEFAULT_SECTION, title: "Marketplace Launching", description: "Buy and sell services in our upcoming Micro-Earning Marketplace. Stay tuned!", gradientFrom: "from-violet-950", gradientTo: "to-fuchsia-900", watermarkText: "MARKET" }
}

export async function getComingSoonConfig(): Promise<ComingSoonConfig> {
  const config = await prisma.systemConfig.findUnique({
    where: { key: KEY_COMING_SOON }
  })

  // Migration logic: If old config format exists (flat object), migrate it to 'default'
  if (!config) return DEFAULT_CONFIG
  
  const value = config.value as any

  // Check if it's the old flat format (has 'title' at top level)
  if (value && typeof value.title === 'string') {
     return {
         default: value as SectionConfig,
         tasks: { ...DEFAULT_SECTION, ...value, title: "Task Center Coming Soon" },
         pools: { ...DEFAULT_SECTION, ...value, title: "Mudaraba Pool Opening Soon" },
         marketplace: { ...DEFAULT_SECTION, ...value, title: "Marketplace Launching Soon" }
     }
  }
  
  // Merge with defaults to ensure all keys exist
  return { ...DEFAULT_CONFIG, ...value }
}

export async function updateComingSoonConfig(data: Partial<ComingSoonConfig>) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const current = await getComingSoonConfig()
  const updated = { ...current, ...data }

  await prisma.systemConfig.upsert({
    where: { key: KEY_COMING_SOON },
    update: { value: updated as any },
    create: { key: KEY_COMING_SOON, value: updated as any }
  })

  revalidatePath("/dashboard")
  revalidatePath("/admin/settings/coming-soon")
  return { success: true }
}
