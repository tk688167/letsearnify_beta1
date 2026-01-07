import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

const SLIDER_KEY = "ACTIVITY_SLIDER"
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const config = await prisma.systemConfig.findUnique({
      where: { key: SLIDER_KEY }
    })

    if (!config || !config.value) {
      return NextResponse.json([
        { text: "User ID 45821 deposited $1,200", active: true, icon: "🔔" },
        { text: "New user joined from Pakistan", active: true, icon: "👤" },
        { text: "$45,000 rewards distributed today", active: true, icon: "💰" },
        { text: "CBSP Pool distributed $12,500 this week", active: true, icon: "🏦" },
        { text: "User ID 78214 upgraded to Diamond Tier", active: true, icon: "🔁" },
        { text: "Reward claimed: $320 from CBSP Pool", active: true, icon: "🎁" }
      ])
    }

    return NextResponse.json(config.value)
  } catch (error) {
    console.error("[ADMIN_SLIDER_GET]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const body = await req.json()
        
        // Validation: body must be array
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
        }

        await prisma.systemConfig.upsert({
            where: { key: SLIDER_KEY },
            update: { value: body },
            create: { key: SLIDER_KEY, value: body }
        })

        // Log
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                actionType: "UPDATE_SLIDER",
                details: `Updated activity slider with ${body.length} messages.`
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("[ADMIN_SLIDER_SAVE]", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
