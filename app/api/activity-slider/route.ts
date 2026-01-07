import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const SLIDER_KEY = "ACTIVITY_SLIDER"
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: SLIDER_KEY }
    })

    if (!config || !config.value) {
      return NextResponse.json([])
    }

    // @ts-ignore
    const messages = config.value as any[]
    const activeMessages = messages.filter((m: any) => m.active)

    return NextResponse.json(activeMessages)
  } catch (error) {
    console.error("[ACTIVITY_SLIDER_GET]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
