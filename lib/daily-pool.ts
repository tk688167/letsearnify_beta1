import { prisma } from "@/lib/prisma"

/**
 * Core logic to distribute daily 1% yields for all active pools.
 * Includes catch-up logic to skip accidental downtime.
 * @returns Summary results of processed pools
 */
export async function executeDailyPoolDistribution() {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    console.log(`[Daily Pool] Distribution Started at ${now.toISOString()}`);

    // 1. Calculate Daily Earnings (1%) with Catch-up logic
    const activePools = await prisma.dailyEarningInvestment.findMany({
        where: {
            status: "ACTIVE",
            lastCalculatedDate: { lte: twentyFourHoursAgo }
        }
    });

    let processedProfit = 0;
    let totalProfitDistributed = 0;

    for (const pool of activePools) {
        const timeSinceLast = now.getTime() - pool.lastCalculatedDate.getTime();
        const daysToProcess = Math.floor(timeSinceLast / (24 * 60 * 60 * 1000));
        
        if (daysToProcess < 1) continue;

        const dailyProfitPerDay = pool.amount * 0.01;
        const totalProfitToGrant = dailyProfitPerDay * daysToProcess;
        
        // Advance the lastCalculatedDate by exact 24h increments
        const finalCalculatedDate = new Date(pool.lastCalculatedDate.getTime() + (daysToProcess * 24 * 60 * 60 * 1000));

        await prisma.$transaction([
            prisma.dailyEarningInvestment.update({
                where: { id: pool.id },
                data: {
                    profitEarned: { increment: totalProfitToGrant },
                    lastCalculatedDate: finalCalculatedDate
                }
            }),
            prisma.user.update({
                where: { id: pool.userId },
                data: { dailyEarningWallet: { increment: totalProfitToGrant } }
            }),
            prisma.transaction.create({
                data: {
                    userId: pool.userId,
                    amount: totalProfitToGrant,
                    type: "REWARD",
                    status: "COMPLETED",
                    description: `Daily 1% earning from $${pool.amount.toFixed(2)} pool for ${daysToProcess} day(s).`
                }
            }),
            prisma.mLMLog.create({
                data: {
                    userId: pool.userId,
                    type: "POOL_EARNING",
                    amount: totalProfitToGrant,
                    description: `Multi-day catchup (${daysToProcess} days) at 1% daily for pool ${pool.id}`
                }
            })
        ]);
        
        processedProfit++;
        totalProfitDistributed += totalProfitToGrant;
    }

    // 2. Handle Expiry (30 Days) -> Return Principal
    const expiredPools = await prisma.dailyEarningInvestment.findMany({
        where: {
            status: "ACTIVE",
            expiresAt: { lte: now }
        }
    });

    let processedExpiry = 0;
    for (const pool of expiredPools) {
        const returnPrincipal = pool.amount;
        
        await prisma.$transaction([
            prisma.dailyEarningInvestment.update({
                where: { id: pool.id },
                data: { status: "COMPLETED" }
            }),
            prisma.user.update({
                where: { id: pool.userId },
                data: { dailyEarningWallet: { increment: returnPrincipal } }
            }),
            prisma.transaction.create({
                data: {
                    userId: pool.userId,
                    amount: returnPrincipal,
                    type: "REWARD",
                    status: "COMPLETED",
                    description: `Daily Earnings Pool completed. Returned principal $${pool.amount.toFixed(2)} to Daily Wallet.`
                }
            })
        ]);
        processedExpiry++;
    }

    console.log(`[Daily Pool] Distribution Finished. Profits: ${processedProfit}, Expiries: ${processedExpiry}, Total Distributed: $${totalProfitDistributed.toFixed(2)}`);

    return { 
        success: true, 
        calculatedCount: processedProfit, 
        expiredCount: processedExpiry,
        totalProfitDistributed
    };
}
