
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth();
        // 1. Check Admin Auth
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse overrides (optional)
        const body = await req.json().catch(() => ({})); 
        const { percentage = 4.0 } = body; // Default 4%

        // 3. Get Pool Logic
        const cbspPool = await prisma.pool.findUnique({ where: { name: "CBSP" } });
        if (!cbspPool || cbspPool.balance <= 0) {
             return NextResponse.json({ error: "CBSP Pool is empty or missing" }, { status: 400 });
        }

        const distributionAmount = cbspPool.balance * (percentage / 100);
        
        if (distributionAmount < 0.01) {
             return NextResponse.json({ error: "Distribution amount too small" }, { status: 400 });
        }

        // 4. Fetch Qualified Users (Active Members Only?)
        // Prompt says "accordng to tier". Usually this means Active members.
        // Let's assume all Active Members.
        const users = await prisma.user.findMany({
            where: { 
                isActiveMember: true,
                role: "USER" // Exclude admins? Usually yes.
            },
            select: { id: true, tier: true }
        });

        if (users.length === 0) {
            return NextResponse.json({ error: "No active members to distribute to" }, { status: 400 });
        }

        // 5. Tier Weights Calculation
        // Define weights: Newbie=1, Bronze=2, Silver=3, Gold=4, Platinum=5, Diamond=6, Emerald=7
        const tierWeights: Record<string, number> = {
            NEWBIE: 1,
            BRONZE: 2,
            SILVER: 3,
            GOLD: 4,
            PLATINUM: 5,
            DIAMOND: 6,
            EMERALD: 7
        };

        let totalWeight = 0;
        users.forEach((u: any) => {
            totalWeight += (tierWeights[u.tier] || 1);
        });

        const valuePerWeight = distributionAmount / totalWeight;

        // 6. Distribute
        const transactions = [];
        let count = 0;

        // We'll use a transaction for safety
        await prisma.$transaction(async (tx: any) => {
            // Deduct from Pool
            await tx.pool.update({
                where: { id: cbspPool.id },
                data: { balance: { decrement: distributionAmount } }
            });

            // Credit Users
            for (const user of users) {
                const weight = tierWeights[user.tier] || 1;
                const reward = valuePerWeight * weight;
                
                if (reward > 0) {
                    await tx.user.update({
                        where: { id: user.id },
                        data: { balance: { increment: reward } }
                    });

                    // Log Transaction
                    await tx.transaction.create({
                        data: {
                            userId: user.id,
                            type: "REWARD",
                            amount: reward,
                            status: "COMPLETED",
                            method: "SYSTEM",
                            description: `Weekly CBSP Reward (${percentage}% Pool Split) - Tier: ${user.tier}`
                        }
                    });
                    
                    // Log MLM Log
                    await tx.mLMLog.create({
                        data: {
                            userId: user.id,
                            type: "BONUS",
                            amount: reward,
                            description: `CBSP Weekly Distribution`
                        }
                    });
                    
                    count++;
                }
            }

            // Create Distribution Record
            await tx.distribution.create({
                data: {
                    poolId: cbspPool.id,
                    poolName: "CBSP",
                    amount: distributionAmount,
                    percentage: parseFloat(percentage.toString()),
                    recipients: count,
                    tierRates: JSON.stringify(tierWeights)
                }
            });

             // Admin Log
             await tx.adminLog.create({
                data: {
                    adminId: session.user.id!,
                    actionType: "POOL_DISTRIBUTION",
                    details: `Distributed $${distributionAmount.toFixed(2)} (${percentage}%) to ${count} users from CBSP Pool`
                }
            });
        });

        return NextResponse.json({ 
            success: true, 
            distributed: distributionAmount, 
            recipients: count,
            poolRemaining: cbspPool.balance - distributionAmount 
        });

    } catch (error) {
        console.error("CBSP Distribution Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
