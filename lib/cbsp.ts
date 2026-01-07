import { prisma } from "@/lib/prisma"

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
 * Tier percentages for WEEKLY DISTRIBUTION
 * STRICTLY INCREASING
 */
export const CBSP_TIER_PERCENTAGES: Record<string, number> = {
  Newbie: 5,
  Bronze: 8,
  Silver: 11,
  Gold: 14,
  Platinum: 17,
  Diamond: 20,
  Emerald: 25,
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
 * Distribute Weekly Profit
 * 3% of Total Pool Balance is distributed.
 * Waterfall Logic: If a tier has no users, amount flows to next lower tier.
 */
export async function executeWeeklyCbspDistribution() {
    console.log("[CBSP Distribution] Starting weekly distribution...");

    return await prisma.$transaction(async (tx) => {
        // 1. Get Pool Balance
        const pool = await tx.pool.findUnique({ where: { name: "CBSP" } });
        if (!pool || pool.balance <= 0) {
            console.log("[CBSP Distribution] Pool empty or not found.");
            return { success: false, reason: "Pool empty" };
        }

        const DISTRIBUTABLE_PERCENTAGE = 0.03; // 3%
        const totalDistributable = pool.balance * DISTRIBUTABLE_PERCENTAGE;

        console.log(`[CBSP Distribution] Pool Balance: $${pool.balance}, Distributable (3%): $${totalDistributable}`);

        if (totalDistributable < 0.01) {
             console.log("[CBSP Distribution] Amount too small to distribute.");
             return { success: false, reason: "Amount too small" };
        }

        // 2. Count Eligible Users per Tier
        // Only active users who are CBSP members
        const userCounts = await tx.user.groupBy({
            by: ['tier'],
            where: {
                isActiveMember: true, // Must be active
                isCbspMember: true    // Must be in pool (deposited >= $1 usually sets this)
            },
            _count: { id: true }
        });

        const countMap: Record<string, number> = {};
        userCounts.forEach(g => {
            if (g.tier) countMap[g.tier] = g._count.id;
        });

        console.log("[CBSP Distribution] User counts per tier:", countMap);

        // 3. Waterfall Calculation
        // Tiers from Highest (Emerald) to Lowest (Newbie)
        const tiers = ["EMERALD", "DIAMOND", "PLATINUM", "GOLD", "SILVER", "BRONZE", "NEWBIE"];
        
        let carryOverAmount = 0;
        let totalDistributedActual = 0;
        const distributionLog: any[] = [];

        for (const tier of tiers) {
            // Map strict Enum casing to Title case key for percentage object if needed
            // CBSP_TIER_PERCENTAGES keys are "Emerald", "Newbie" etc.
            // But DB Enum is "EMERALD". 
            // We need to map properly.
            const titleCaseTier = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
            const tierPercent = CBSP_TIER_PERCENTAGES[titleCaseTier] || 0;
            
            // Base allocation for this tier
            const baseAmount = totalDistributable * (tierPercent / 100);
            
            // Total available for this tier = Base + CarryOver from higher tier
            const currentTierTotal = baseAmount + carryOverAmount;
            
            const userCount = countMap[tier] || 0;

            if (userCount > 0) {
                // Distribute
                const amountPerUser = currentTierTotal / userCount;
                
                // Fetch users IDs to distribute
                const users = await tx.user.findMany({
                    where: { 
                        tier: tier as any, 
                        isActiveMember: true,
                        isCbspMember: true
                    },
                    select: { id: true }
                });

                // Batch create transactions
                // Note: processBatch/createMany is efficient
                for (const u of users) {
                   await tx.transaction.create({
                       data: {
                           userId: u.id,
                           amount: amountPerUser,
                           type: "REWARD", // Or specific CBSP_REWARD
                           status: "COMPLETED",
                           description: `CBSP Weekly Reward (${titleCaseTier})`,
                           method: "SYSTEM"
                       }
                   });
                   
                   await tx.user.update({
                       where: { id: u.id },
                       data: { balance: { increment: amountPerUser } }
                   });
                }

                totalDistributedActual += currentTierTotal;
                distributionLog.push({ tier, count: userCount, amountPerUser, totalForTier: currentTierTotal });
                
                // Reset carryOver as it was consumed
                carryOverAmount = 0;
            } else {
                // No users, carry over to next lower tier
                console.log(`[CBSP Distribution] No users in ${tier}, carrying over $${currentTierTotal} to next tier.`);
                carryOverAmount = currentTierTotal;
            }
        }

        // Edge Case: If carryOverAmount > 0 after Newbie, it returns to pool (we just don't deduct it)
        // So actual deduction from pool = totalDistributable - carryOverAmount
        // Wait, logic says "Return to CBSP Pool if no lower tier". 
        // totalDistributable was calculated from pool. 
        // If we only deduct 'totalDistributedActual', effectively the rest stays in pool.
        
        // 4. Update Pool Balance
        if (totalDistributedActual > 0) {
            await tx.pool.update({
                where: { name: "CBSP" },
                data: { balance: { decrement: totalDistributedActual } }
            });

            // 5. Log Distribution Event
            await tx.distribution.create({
                data: {
                    poolName: "CBSP",
                    amount: totalDistributedActual,
                    percentage: (totalDistributedActual / pool.balance) * 100, // Effective %
                    recipients: Object.values(countMap).reduce((a, b) => a + b, 0),
                    tierRates: distributionLog
                }
            });
        }

        console.log(`[CBSP Distribution] Completed. Distributed: $${totalDistributedActual}. Returned to pool: $${carryOverAmount}`);
        return { success: true, distributed: totalDistributedActual, returned: carryOverAmount };
    });
}




