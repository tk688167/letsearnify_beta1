import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

const STATS_KEY = "PLATFORM_STATS"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: STATS_KEY }
    })

    if (!config) {
      // Default initial values
      return NextResponse.json({
        totalUsers: "0",
        totalDeposited: "0",
        totalWithdrawn: "0",
        totalRewards: "0",
        serviceStatus: "Active",
        partnersCount: "0"
      })
    }

    return NextResponse.json(config.value)
  } catch (error) {
    console.error("[PLATFORM_STATS_GET]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    
    // Admin Check
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { 
        totalUsers, 
        totalDeposited, 
        totalWithdrawn, 
        totalRewards, 
        serviceStatus, 
        partnersCount 
    } = body

    // Update or Create
    const updated = await prisma.systemConfig.upsert({
        where: { key: STATS_KEY },
        update: {
            value: JSON.stringify({
                totalUsers, 
                totalDeposited, 
                totalWithdrawn, 
                totalRewards, 
                serviceStatus, 
                partnersCount
            })
        },
        create: {
            key: STATS_KEY,
            value: JSON.stringify({
                totalUsers, 
                totalDeposited, 
                totalWithdrawn, 
                totalRewards, 
                serviceStatus, 
                partnersCount
            })
        }
    })

    // Log the action
    await prisma.adminLog.create({
        data: {
            adminId: session.user.id,
            actionType: "UPDATE_STATS",
            details: `Updated platform stats by ${session.user.email}`
        }
    })

    return NextResponse.json(updated.value)

  } catch (error) {
    console.error("[PLATFORM_STATS_UPDATE]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
