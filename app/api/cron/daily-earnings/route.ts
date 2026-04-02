import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

const CRON_SECRET = process.env.CRON_SECRET || "temp_dev_secret_override"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const token = searchParams.get("token")
        
        if (token !== CRON_SECRET) {
            return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 })
        }

        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        console.log(`[Cron] Daily Earnings Check Started at ${now.toISOString()}`);

        // 1. Calculate Daily Earnings (1%) exactly 24h apart
        const activePools = await prisma.dailyEarningInvestment.findMany({
            where: {
                status: "ACTIVE",
                lastCalculatedDate: { lte: twentyFourHoursAgo }
            }
        });

        let processedProfit = 0;
        for (const pool of activePools) {
            const dailyProfit = pool.amount * 0.01;
            
            // Strictly push the calculated date by 24h from its LAST calculated date
            // This prevents "drift" if cron runs late.
            const nextCalculatedDate = new Date(pool.lastCalculatedDate.getTime() + 24 * 60 * 60 * 1000);
            
            // To prevent spiraling if the cron missed multiple days, clamp it to not exceed `now`
            const finalCalculatedDate = nextCalculatedDate > now ? now : nextCalculatedDate;

            await prisma.$transaction([
                prisma.dailyEarningInvestment.update({
                    where: { id: pool.id },
                    data: {
                        profitEarned: { increment: dailyProfit },
                        lastCalculatedDate: finalCalculatedDate
                    }
                }),
                // Add the 1% profit DIRECTLY to user's dailyEarningWallet so it shows up globally
                prisma.user.update({
                    where: { id: pool.userId },
                    data: { dailyEarningWallet: { increment: dailyProfit } }
                }),
                prisma.transaction.create({
                    data: {
                        userId: pool.userId,
                        amount: dailyProfit,
                        type: "REWARD",
                        status: "COMPLETED",
                        description: `Daily 1% earning from $${pool.amount.toFixed(2)} pool.`
                    }
                }),
                prisma.mLMLog.create({
                    data: {
                        userId: pool.userId,
                        type: "POOL_EARNING",
                        amount: dailyProfit,
                        description: `Processed strictly after 24h for pool ${pool.id}`
                    }
                })
            ]);
            processedProfit++;
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
            // Profit has already been distributed daily, so ONLY return the principal!
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
