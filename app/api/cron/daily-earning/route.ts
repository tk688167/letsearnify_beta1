import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// THIS ROUTE SHOULD ONLY BE CALLED BY AN EXTERNAL SYSTEM LIKE VERCEL CRON OR A SERVER SCHEDULER.
// We require a manual security token to prevent malicious users from spamming the route and infinitely scaling their profit.
const CRON_SECRET = process.env.CRON_SECRET || "temp_dev_secret_override"

export async function GET(req: Request) {
  try {
    // 1. Authenticate ping
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
    if (token !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 })
    }

    // 2. Locate all ACTIVE Daily Earning Investments
    const now = new Date()
    
    // Check for investments whose `lastCalculatedDate` was at least 24 hours ago
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000))

    const eligibleInvestments = await prisma.dailyEarningInvestment.findMany({
      where: {
        status: "ACTIVE",
        lastCalculatedDate: {
          lte: oneDayAgo // Less than or equal to 24 hours ago
        }
      }
    })

    if (eligibleInvestments.length === 0) {
      return NextResponse.json({ success: true, message: "No eligible investments for daily profit calculation." })
    }

    // 3. Increment exactly 1% profit for each and stamp the new date
    let updatedCount = 0;
    
    // We execute in sequence or chunked parallel to not lock the DB if the pool is massive
    for (const inv of eligibleInvestments) {
      const dailyProfit = inv.amount * 0.01 // Exactly 1% of the principal

      await prisma.dailyEarningInvestment.update({
        where: { id: inv.id },
        data: {
          profitEarned: { increment: dailyProfit },
          lastCalculatedDate: now
        }
      })
      
      // Note: We intentionally do not throw the daily profit straight into their wallet here.
      // It stays in `profitEarned` until the 30 days are up, per standard lockpool designs.
      
      updatedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      processed: updatedCount,
      timestamp: now.toISOString()
    })

  } catch (error) {
    console.error("Cron Daily Earning Error:", error)
    return NextResponse.json({ error: "Failed to process daily earning pools." }, { status: 500 })
  }
}
