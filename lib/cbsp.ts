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

    // Default to CBSP_POOL_FEE_PERCENTAGE if not set or pool doesn't exist
    const percentage = pool?.percentage ?? CBSP_POOL_FEE_PERCENTAGE;  
    
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


/**
 * Pool Name
 */
export const CBSP_POOL_NAME = "CBSP";

/**
 * Entry fee required to join CBSP Pool (USD)
 */
export const CBSP_ENTRY_FEE = 1;

/**
 * Pool fee percentage for backend distribution calculation
 * Example: 5% from deposit goes to CBSP Pool
 */
export const CBSP_POOL_FEE_PERCENTAGE = 5;

/**
 * Tier percentages (example structure)
 * You can adjust percentages for Newbie, Bronze, Silver, Gold, Platinum, Diamond, Emerald
 */
export const CBSP_TIER_PERCENTAGES: Record<string, number> = {
  Newbie: 4,
  Bronze: 5,
  Silver: 6,
  Gold: 7,
  Platinum: 8,
  Diamond: 10,
  Emerald: 12,
};

/**
 * Helper function to calculate projected share per tier
 * @param totalPool Total amount in CBSP Pool
 * @param tierPercentage Percentage assigned to this tier
 * @returns Amount for the tier
 */
export function calculateProjectedShare(totalPool: number, tierPercentage: number) {
  return (totalPool * tierPercentage) / 100;
}

/**
 * Example function to distribute weekly profit per tier
 * @param totalPool Total CBSP Pool amount
 * @returns Object with tier-wise distribution
 */
export function distributeWeeklyProfit(totalPool: number) {
  const distribution: Record<string, number> = {};
  for (const [tier, percent] of Object.entries(CBSP_TIER_PERCENTAGES)) {
    distribution[tier] = calculateProjectedShare(totalPool, percent);
  }
  return distribution;
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

