import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Tier, TierStatus } from "@prisma/client"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await auth()

    // 1. Admin Verification
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // 2. Perform Reset
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        tier: Tier.NEWBIE,
        tierStatus: TierStatus.CURRENT,
        points: 0,
        activeMembers: 0,
        isActiveMember: false,
        totalDeposit: 0 // Optional: Reset deposit history too? The prompt said "progress", but usually totalDeposit is financial. The reset script reset it. I will follow the reset script logic.
      }
    })

    // 3. Log Action
    await prisma.mLMLog.create({
      data: {
        userId: userId,
        type: "ADMIN_RESET",
        description: `Admin ${session.user.email} reset user progress to NEWBIE/0.`,
        amount: 0
      }
    })

    return NextResponse.json({ success: true, user: updatedUser })

  } catch (error) {
    console.error("Reset Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
