import { PrismaClient } from "@prisma/client"

// Helper to calculate and record CBSP contribution

export async function processCbspContribution(
    userId: string, 
    depositAmount: number, 
    txId: string | undefined, 
    description: string,
    prismaTx: any 
) {
    if (depositAmount <= 0) return;

    // 1. Fetch CBSP Pool Config (Percentage)
    // We try to find the pool to get the %
    let pool = await prismaTx.pool.findUnique({
        where: { name: "CBSP" }
    })

    // Default to 4% if not set or pool doesn't exist
    const percentage = pool?.percentage ?? 4.0; 
    
    // 2. Calculate Contribution
    const contributionAmount = depositAmount * (percentage / 100);

    if (contributionAmount > 0) {
        console.log(`[CBSP] Processing contribution: $${contributionAmount} (${percentage}%) for User ${userId}`);

        // 3. Create Contribution Record
        await prismaTx.cbspContribution.create({
            data: {
                userId,
                depositAmount,
                contributionAmount,
                description: `${description} (${percentage}%)`
            }
        })

        // 4. Update Pool Balance
        await prismaTx.pool.upsert({
            where: { name: "CBSP" },
            update: { 
                balance: { increment: contributionAmount }
            },
            create: {
                name: "CBSP",
                balance: contributionAmount,
                percentage: percentage, // create with current default/fetched
                description: "Company Business Share Profit Pool"
            }
        })
    }
}

export const TIER_WEIGHTS = {
    EMERALD: 0.30,
    DIAMOND: 0.20,
    PLATINUM: 0.15,
    GOLD: 0.12,
    SILVER: 0.10,
    BRONZE: 0.08,
    NEWBIE: 0.05
}

export function getTierColor(tier: keyof typeof TIER_WEIGHTS) {
    switch (tier) {
        case "EMERALD": return "from-emerald-500 to-teal-600"
        case "DIAMOND": return "from-cyan-400 to-blue-600"
        case "PLATINUM": return "from-slate-300 to-slate-500"
        case "GOLD": return "from-yellow-400 to-yellow-600"
        case "SILVER": return "from-gray-300 to-gray-500"
        case "BRONZE": return "from-orange-700 to-orange-900"
        case "NEWBIE": return "from-blue-400 to-blue-600"
        default: return "from-gray-700 to-gray-900"
    }
}

export const CBSP_POOL_NAME = "CBSP";

export function calculateProjectedShare(poolBalance: number, tier: string, memberCountInTier: number) {
    // Basic logic: TierPool = (PoolBalance) * TIER_WEIGHT -> Share = TierPool / Count
    // But wait, the Frontend formula was: ((stats.poolBalance * 0.04) * weight) / (tierMembers || 1)
    // The poolBalance in DB is ALREADY the 4% accumulation. 
    // IF the pool balance provided is the TOTAL DEPOSITS, then we multiply by 0.04. 
    // BUT the pool model `balance` IS the accumulated pot. 
    // So the formula should likely be: (PoolBalance * Weight) / Count
    // However, let's stick to the frontend's logic if it assumes poolBalance is the total deposits?
    // No, `processCbspContribution` updates `balance` with the contribution amount.
    // So `pool.balance` IS the pot.
    // So Share = (pool.balance * TIER_WEIGHTS[tier]) / memberCountInTier
    
    // Safety check
    const weight = TIER_WEIGHTS[tier as keyof typeof TIER_WEIGHTS] || 0;
    const count = Math.max(1, memberCountInTier);
    return (poolBalance * weight) / count;
}
