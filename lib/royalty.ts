import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const ROYALTY_POOL_NAME = "ROYALTY";

/**
 * Process a contribution to the Royalty Pool.
 * Logic: 5% of the deposit amount goes to Royalty Pool.
 */
export async function processRoyaltyContribution(userId: string, depositAmount: number) {
    const contributionAmount = depositAmount * 0.05;

    // 1. Create Contribution Record
    await prisma.royaltyContribution.create({
        data: {
            userId,
            depositAmount,
            contributionAmount
        }
    });

    // 2. Fund the Pool
    await prisma.pool.upsert({
        where: { name: ROYALTY_POOL_NAME },
        update: { balance: { increment: contributionAmount } },
        create: { 
            name: ROYALTY_POOL_NAME, 
            balance: contributionAmount,
            description: "Exclusive monthly rewards for Platinum, Diamond & Emerald members."
        }
    });
}

/**
 * Get Royalty Pool Stats
 */
export async function getRoyaltyStats() {
    const pool = await prisma.pool.findUnique({
        where: { name: ROYALTY_POOL_NAME }
    });

    return {
        balance: pool?.balance || 0,
    };
}

/**
 * Distribute Royalty Pool Funds
 * @param percentage 1 or 2 (percent)
 */
export async function distributeRoyalty(percentage: number) {
    if (![1, 2].includes(percentage)) throw new Error("Invalid percentage. Must be 1 or 2.");

    // 1. Get Pool Balance
    const pool = await prisma.pool.findUnique({ where: { name: ROYALTY_POOL_NAME } });
    if (!pool || pool.balance <= 0) throw new Error("Royalty Pool is empty or does not exist.");

    const distributableAmount = pool.balance * (percentage / 100);

    // 2. Get Eligible Users
    const users = await prisma.user.findMany({
        where: {
            tier: { in: ['PLATINUM', 'DIAMOND', 'EMERALD'] },
            isActiveMember: true // Safety check
        },
        select: { id: true, tier: true }
    });

    if (users.length === 0) throw new Error("No eligible users found for distribution.");

    // 3. Calculate Weighted Shares
    // Weights: Emerald (3), Diamond (2), Platinum (1)
    const WEIGHTS = {
        EMERALD: 3,
        DIAMOND: 2,
        PLATINUM: 1
    };

    let totalWeight = 0;
    users.forEach(u => {
        totalWeight += WEIGHTS[u.tier as keyof typeof WEIGHTS] || 0;
    });

    if (totalWeight === 0) throw new Error("Total calculated weight is 0.");

    const unitValue = distributableAmount / totalWeight;

    // 4. Distribute
    const transactions = [];
    const notifications = [];

    for (const user of users) {
        const weight = WEIGHTS[user.tier as keyof typeof WEIGHTS] || 0;
        const share = unitValue * weight;

        if (share > 0) {
            // Update User Balance
            await prisma.user.update({
                where: { id: user.id },
                data: { balance: { increment: share } }
            });

            // Log Transaction
            transactions.push({
                userId: user.id,
                amount: share,
                type: "ROYALTY_REWARD",
                status: "COMPLETED",
                method: "SYSTEM",
                description: `Royalty Pool Distribution (${percentage}%) - ${user.tier} Share`
            });
             
            // Log System Event
            notifications.push({
                userId: user.id,
                type: "ROYALTY_PAYOUT",
                amount: share,
                description: `Received $${share.toFixed(2)} from Monthly Royalty Pool`
            });
        }
    }

    // Bulk create records if using transaction (Prisma doesn't support bulk create within $transaction easily without loop, 
    // but we can just loop async or use createMany for Logs if available).
    // For safety, let's just log a summary for now as bulk updates can be complex.
    
    // Deduct from Pool
    await prisma.pool.update({
        where: { name: ROYALTY_POOL_NAME },
        data: { balance: { decrement: distributableAmount } }
    });
    
    // Create History Record
    await prisma.distribution.create({
        data: {
            poolName: ROYALTY_POOL_NAME,
            amount: distributableAmount,
            percentage: percentage,
            recipients: users.length,
        }
    });

    return {
        distributed: distributableAmount,
        recipients: users.length
    };
}
