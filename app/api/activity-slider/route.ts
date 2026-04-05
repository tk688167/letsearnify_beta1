import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const SLIDER_KEY = "ACTIVITY_SLIDER"
export const dynamic = 'force-dynamic'

type SliderMessage = {
  text: string
  active: boolean
  icon?: string
}

export async function GET(req: Request) {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: SLIDER_KEY }
    })

    if (!config || !config.value) {
      return NextResponse.json([])
    }

    // config.value is already a Json type (Prisma.JsonValue)
    // Type guard to ensure it's an array
    if (!Array.isArray(config.value)) {
      return NextResponse.json([])
    }

    // Filter active messages
    const activeMessages = (config.value as SliderMessage[]).filter((m: any) => m.active)

    return NextResponse.json(activeMessages)
  } catch (error) {
    console.error("[ACTIVITY_SLIDER_GET]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
