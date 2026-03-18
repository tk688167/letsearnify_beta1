import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        console.log(`[Cron] Daily Earnings Check Started at ${now.toISOString()}`);

        // 1. Calculate Daily Earnings (1%)
        const activePools = await prisma.dailyEarningInvestment.findMany({
            where: {
                status: "ACTIVE",
                lastCalculatedDate: { lte: twentyFourHoursAgo }
            }
        });

        let processedProfit = 0;
        for (const pool of activePools) {
            const dailyProfit = pool.amount * 0.01;
            await prisma.$transaction([
                prisma.dailyEarningInvestment.update({
                    where: { id: pool.id },
                    data: {
                        profitEarned: { increment: dailyProfit },
                        lastCalculatedDate: now
                    }
                }),
                prisma.mLMLog.create({
                    data: {
                        userId: pool.userId,
                        type: "POOL_EARNING",
                        amount: dailyProfit,
                        description: `Daily 1% earning from $${pool.amount} pool.`
                    }
                })
            ]);
            processedProfit++;
        }

        // 2. Handle Expiry (30 Days)
        const expiredPools = await prisma.dailyEarningInvestment.findMany({
            where: {
                status: "ACTIVE",
                expiresAt: { lte: now }
            }
        });

        let processedExpiry = 0;
        for (const pool of expiredPools) {
            const totalReturn = pool.amount + pool.profitEarned;
            await prisma.$transaction([
                prisma.dailyEarningInvestment.update({
                    where: { id: pool.id },
                    data: { status: "COMPLETED" }
                }),
                prisma.user.update({
                    where: { id: pool.userId },
                    data: { dailyEarningWallet: { increment: totalReturn } }
                }),
                prisma.transaction.create({
                    data: {
                        userId: pool.userId,
                        amount: totalReturn,
                        type: "REWARD",
                        status: "COMPLETED",
                        description: `Daily Earnings Pool completed. Returned $${pool.amount} + $${pool.profitEarned.toFixed(2)} profit to Daily Wallet.`
                    }
                })
            ]);
            processedExpiry++;
        }

        console.log(`[Cron] Finished. Profits: ${processedProfit}, Expiries: ${processedExpiry}`);

        return NextResponse.json({ 
            success: true, 
            calculatedCount: processedProfit, 
            expiredCount: processedExpiry 
        });

    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
