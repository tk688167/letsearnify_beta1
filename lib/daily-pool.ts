import { prisma } from "@/lib/prisma"

/**
 * Core logic to distribute daily 1% yields for all active pools.
 * Includes catch-up logic for missed days and a force-mode for manual backfills.
 * @param {object} options - Configuration for distribution
 * @param {boolean} options.force - If true, ignores the 24h cooldown and calculates all pending profits.
 * @returns Summary results of processed pools
 */
export async function executeDailyPoolDistribution(options: { force?: boolean } = {}) {
    const { force = false } = options;
    const now = new Date();
    
    // Helper to get Midnight NY Time for a given date
    const getMidnightNY = (date: Date) => {
        const nyDate = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/New_York",
            year: "numeric", month: "numeric", day: "numeric"
        }).format(date);
        return new Date(nyDate);
    };

    const nowNY = getMidnightNY(now);

    console.log(`[Daily Pool] Distribution Started at ${now.toISOString()} (NY Midnight: ${nowNY.toISOString()}) (Force: ${force})`);

    // 1. Calculate Daily Earnings (1%) with Catch-up logic
    const activePools = await prisma.dailyEarningInvestment.findMany({
        where: {
            status: "ACTIVE",
            // If NOT force, only process pools that have not been credited for the current NY day
            ...(force ? {} : { lastCalculatedDate: { lt: nowNY } })
        }
    });

    let processedProfitCount = 0;
    let totalProfitDistributed = 0;

    for (const pool of activePools) {
        const lastNY = getMidnightNY(pool.lastCalculatedDate);
        
        // Count how many "midnights" have passed
        const diffTime = nowNY.getTime() - lastNY.getTime();
        const daysToProcess = Math.floor(diffTime / (24 * 60 * 60 * 1000));
        
        // Skip if we already credited today
        if (daysToProcess < 1) continue;

        const dailyProfitPerDay = pool.amount * 0.01;
        const totalProfitToGrant = dailyProfitPerDay * daysToProcess;
        
        // Set lastCalculatedDate to exactly today's midnight (New York Time)
        const finalCalculatedDate = nowNY;

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
                    description: `Daily 1% earning from pool $${pool.amount.toFixed(2)} (${daysToProcess} days catchup).`
                }
            }),
            prisma.mLMLog.create({
                data: {
                    userId: pool.userId,
                    type: "POOL_EARNING",
                    amount: totalProfitToGrant,
                    description: `Daily Catchup: Received 1% daily profit for ${daysToProcess} missed day(s).`
                }
            })
        ]);
        
        processedProfitCount++;
        totalProfitDistributed += totalProfitToGrant;
    }

    // 2. Handle Expiry (30 Days) -> Return Principal
    // We only process expiry when force=false to prevent accidental early returns
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

    console.log(`[Daily Pool] Finished. Profits Updated: ${processedProfitCount}, Expiries: ${processedExpiry}, Total: $${totalProfitDistributed.toFixed(2)}`);

    return { 
        success: true, 
        calculatedCount: processedProfitCount, 
        expiredCount: processedExpiry,
        totalProfitDistributed
    };
}
