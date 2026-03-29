
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CBSP_ENTRY_FEE, CBSP_POOL_FEE_PERCENTAGE, CBSP_POOL_NAME } from "@/lib/cbsp"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch User with locking (simulated by checking balance immediately)
      const user = await tx.user.findUnique({
        where: { id: userId },
      })

      if (!user) throw new Error("User not found")
      if (user.isCbspMember) throw new Error("Already a member")
      if (user.balance < CBSP_ENTRY_FEE) throw new Error("Insufficient funds")

      // 2. Activate Membership (No Balance Deduction)
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          // balance: { decrement: CBSP_ENTRY_FEE }, // Removed: User keeps the $1
          isCbspMember: true,
          isActiveMember: true, // Also unlock full website access
        },
      })

      // 3. Log Membership Activation (Informational)
      await tx.transaction.create({
        data: {
          userId,
          amount: 0, // No charge to user
          type: "INVESTMENT",
          status: "COMPLETED",
          description: "CBSP Pool Membership Activated (System Funded)",
        },
      })

      // 4. Add to Global Pool Balance & Record Contribution History
      // (Using upsert to ensure pool exists)
      const poolAmount = CBSP_ENTRY_FEE * CBSP_POOL_FEE_PERCENTAGE // $0.05
      
      await tx.pool.upsert({
        where: { name: CBSP_POOL_NAME },
        create: {
          name: CBSP_POOL_NAME,
          balance: poolAmount,
          percentage: 4.0, // Default 4% weekly
          description: "Company Business Share Profit Pool"
        },
        update: {
          balance: { increment: poolAmount }
        }
      })

      // NEW: Record detailed contribution history
      await tx.cbspContribution.create({
        data: {
          userId,
          depositAmount: CBSP_ENTRY_FEE, // $1.0
          contributionAmount: poolAmount, // $0.05
          description: "Initial Membership Contribution"
        }
      })

      return updatedUser
    })

    return NextResponse.json({ success: true, user: result })
  } catch (error: any) {
    console.error("CBSP Join Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to join pool" }, 
      { status: 400 }
    )
  }
}
