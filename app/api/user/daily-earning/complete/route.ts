import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { investmentId } = body

    if (!investmentId) {
      return NextResponse.json({ error: "Investment ID required" }, { status: 400 })
    }

    // 1. Verify existence, ownership, and lock status
    const investment = await prisma.dailyEarningInvestment.findUnique({
      where: { id: investmentId }
    })

    if (!investment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 })
    }

    if (investment.userId !== session.user.id) {
       return NextResponse.json({ error: "Forbidden access to pool." }, { status: 403 })
    }

    if (investment.status !== "ACTIVE") {
      return NextResponse.json({ error: "Investment is not active." }, { status: 400 })
    }

    const now = new Date()
    // 2. Check Expiration Policy
    if (now < investment.expiresAt) {
      return NextResponse.json({ 
        error: "Investment is locked. Funds cannot be withdrawn before the 30 day period completes."
      }, { status: 400 })
    }

    // 3. Execute the payload: Return Principal only (Profits were deposited daily)
    const totalPayout = investment.amount

    await prisma.$transaction(async (tx) => {
      // Return principal to user dailyEarningWallet
      await tx.user.update({
        where: { id: session.user.id },
        data: { dailyEarningWallet: { increment: totalPayout } }
      })

      // Mark the investment record as Complete
      await tx.dailyEarningInvestment.update({
        where: { id: investment.id },
        data: { status: "COMPLETED" }
      })

      // Log the payload return transaction
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          amount: totalPayout,
          type: "REWARD", 
          status: "COMPLETED",
          description: `Daily Earning Principal Payout (30 Days Complete)`
        }
      })
    })

    return NextResponse.json({ success: true, totalReturned: totalPayout })

  } catch (error) {
    console.error("Daily Earning Completion Error:", error)
    return NextResponse.json(
      { error: "Failed to completely withdraw investment." },
      { status: 500 }
    )
  }
}
