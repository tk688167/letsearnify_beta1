import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await auth()

    // 1. Admin Verification
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { userId, targetTier, targetStatus } = body

    if (!userId || !targetTier) {
      return NextResponse.json({ error: "User ID and Target Tier required" }, { status: 400 })
    }

    // 2. Perform Fix
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        tier: targetTier, // Prisma expecting string locally if schema uses @default("NEWBIE")
        tierStatus: targetStatus || "CURRENT"
      }
    })

    // 3. Log Action
    await prisma.mLMLog.create({
      data: {
        userId: userId,
        type: "ADMIN_TIER_FIX",
        description: `Admin fixed tier to ${targetTier} (${targetStatus || 'CURRENT'}).`,
        amount: 0
      }
    })

    return NextResponse.json({ success: true, user: updatedUser })

  } catch (error) {
    console.error("Fix Tier Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
