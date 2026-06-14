import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const SLIDER_KEY = "WELCOME_SLIDER"
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: SLIDER_KEY }
    })

    if (!config || !config.value) {
      // Default Fake Data
      return NextResponse.json([
        { text: "User ID 45821 deposited $1,200", active: true, icon: "🔔" },
        { text: "New user joined from Pakistan", active: true, icon: "👤" },
        { text: "$45,000 rewards distributed today", active: true, icon: "💰" },
        { text: "CBSP Pool distributed $12,500 this week", active: true, icon: "🏦" },
        { text: "User ID 78214 upgraded to Diamond Tier", active: true, icon: "🔁" },
        { text: "Reward claimed: $320 from CBSP Pool", active: true, icon: "🎁" }
      ])
    }

    // @ts-ignore
    const messages = config.value as any[]
    const activeMessages = messages.filter((m: any) => m.active)

    return NextResponse.json(activeMessages)
  } catch (error) {
    console.error("[WELCOME_SLIDER_GET]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
