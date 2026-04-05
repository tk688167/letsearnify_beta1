import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const MIN_INVESTMENT = 1.0

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { amount } = body

    if (!amount || typeof amount !== "number" || amount < MIN_INVESTMENT) {
      return NextResponse.json(
        { error: `Minimum investment is $${MIN_INVESTMENT.toFixed(2)}` },
        { status: 400 }
      )
    }

    // 1. Double check the user's available daily earning wallet balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dailyEarningWallet: true }
    })

    if (!user) {
       return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.dailyEarningWallet < amount) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 }
      )
    }

    // 2. Perform the exact 30-day lock transaction
    const now = new Date()
    const expiresAt = new Date()
    expiresAt.setDate(now.getDate() + 30) // Exactly 30 days from now

    // Execute atomically to prevent race conditions during checkout
    const result = await prisma.$transaction(async (tx: any) => {
      // Deduct from Daily Earning Wallet
      await tx.user.update({
        where: { id: session.user.id },
        data: { dailyEarningWallet: { decrement: amount } }
      })

      // Lock funds into the newly minted Pool record
      const investment = await tx.dailyEarningInvestment.create({
        data: {
          userId: session.user.id,
          amount: amount,
          status: "ACTIVE",
          profitEarned: 0,
          expiresAt: expiresAt,
          lastCalculatedDate: new Date(new Date().setHours(0, 0, 0, 0)) // Start of day to catch first reset
        }
      })

      // Log it into system transactions
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          amount: amount,
          type: "INVESTMENT",
          status: "COMPLETED",
          description: `Daily Earning Pool Deposit (30 Day Lock)`
        }
      })

      return investment
    })

    return NextResponse.json({ success: true, investment: result })
  } catch (error) {
    console.error("Daily Earning Investment Error:", error)
    return NextResponse.json(
      { error: "Failed to process investment" },
      { status: 500 }
    )
  }
}
