import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const CRON_SECRET = process.env.CRON_SECRET || "temp_dev_secret_override"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
    if (token !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 })
    }

    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // ─── STEP 1: MATURE EXPIRED POOLS ────────────────────────────────────
    const expiredInvestments = await prisma.dailyEarningInvestment.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { lte: now }
      }
    })

    let maturedCount = 0
    for (const inv of expiredInvestments) {
      await prisma.$transaction(async (tx) => {
        await tx.dailyEarningInvestment.update({
          where: { id: inv.id },
          data: { status: "COMPLETED" }
        })

        const totalReturn = inv.amount + inv.profitEarned
        await tx.user.update({
          where: { id: inv.userId },
          data: { dailyEarningWallet: { increment: totalReturn } }
        })

        await tx.transaction.create({
          data: {
            userId: inv.userId,
            amount: totalReturn,
            type: "REWARD",
            status: "COMPLETED",
            method: "DAILY_EARNING_POOL",
            description: `Pool matured: $${inv.amount.toFixed(2)} principal + $${inv.profitEarned.toFixed(2)} profit returned`
          }
        })
      })
      maturedCount++
    }

    // ─── STEP 2: CALCULATE DAILY PROFIT FOR ACTIVE POOLS ─────────────────
    const eligibleInvestments = await prisma.dailyEarningInvestment.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { gt: now },
        lastCalculatedDate: { lte: oneDayAgo }
      }
    })

    let updatedCount = 0
    for (const inv of eligibleInvestments) {
      const dailyProfit = inv.amount * 0.01
      await prisma.dailyEarningInvestment.update({
        where: { id: inv.id },
        data: {
          profitEarned: { increment: dailyProfit },
          lastCalculatedDate: now
        }
      })
      updatedCount++
    }

    return NextResponse.json({
      success: true,
      matured: maturedCount,
      profitCalculated: updatedCount,
      timestamp: now.toISOString()
    })

  } catch (error) {
    console.error("Cron Daily Earning Error:", error)
    return NextResponse.json({ error: "Failed to process daily earning pools." }, { status: 500 })
  }
}