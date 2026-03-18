import { prisma } from "@/lib/prisma";
import { mintArnForDeposit } from "@/lib/tokens";

// --- CONFIGURATION ---

// 3-Level Commission Rates by Tier (Percentage)
// 3-Level Commission Rates by Tier (Percentage)
export const TIER_COMMISSIONS: Record<string, { L1: number, L2: number, L3: number }> = {
    NEWBIE:   { L1: 5,  L2: 3,  L3: 2 },  // Total 10%
    BRONZE:   { L1: 9,  L2: 4,  L3: 2 },  // Total 15%
    SILVER:   { L1: 12, L2: 5,  L3: 3 },  // Total 20%
    GOLD:     { L1: 15, L2: 7,  L3: 3 },  // Total 25%
    PLATINUM: { L1: 18, L2: 8,  L3: 4 },  // Total 30%
    DIAMOND:  { L1: 22, L2: 9,  L3: 4 },  // Total 35%
    EMERALD:  { L1: 26, L2: 10, L3: 4 }   // Total 40%
};

// Default Fallback (if DB is empty)
export const DEFAULT_TIER_REQUIREMENTS: Record<string, { arn: number, directs: number }> = {
    NEWBIE:   { arn: 0,      directs: 0 },
    BRONZE:   { arn: 100,    directs: 2 },
    SILVER:   { arn: 500,    directs: 5 },
    GOLD:     { arn: 2000,   directs: 10 },
    PLATINUM: { arn: 10000,  directs: 20 },
    DIAMOND:  { arn: 50000,  directs: 50 },
    EMERALD:  { arn: 100000, directs: 100 }
};

// Withdrawal Limits by Tier (Percentage of Balance per 24h)
export const TIER_WITHDRAWAL_LIMITS: Record<string, number> = {
    NEWBIE:   10,
    BRONZE:   12,
    SILVER:   15,
    GOLD:     18,
    PLATINUM: 20,
    DIAMOND:  25,
    EMERALD:  30
};

// Achievement Rewards by Tier
export const TIER_REWARDS: Record<string, { balance: number, arn: number, description: string }> = {
    BRONZE:   { balance: 1.0,   arn: 10,   description: "Bronze Milestone Gift" },
    SILVER:   { balance: 5.0,   arn: 50,   description: "Silver Achievement Reward" },
    GOLD:     { balance: 25.0,  arn: 250,  description: "Gold Status Bonus" },
    PLATINUM: { balance: 100.0, arn: 1000, description: "Platinum Excellence Reward" },
    DIAMOND:  { balance: 500.0, arn: 5000, description: "Diamond Elite Gift" },
    EMERALD:  { balance: 1000.0,arn: 10000,description: "Emerald Ultimate Achievement Reward" }
};

// Helper: Fetch Tier Rules from DB
export async function getTierRequirements(tx?: any) {
    const db = tx || prisma;
    try {
        const configs = await db.tierConfiguration.findMany();
        if (configs.length === 0) return DEFAULT_TIER_REQUIREMENTS;

        const rules: Record<string, { arn: number, directs: number }> = {};
        configs.forEach((c: any) => {
            rules[c.tier] = { arn: c.requiredArn, directs: c.members };
        });
        return rules;
    } catch (error) {
        console.error("Failed to fetch tier configs, using default:", error);
        return DEFAULT_TIER_REQUIREMENTS;
    }
}

const TIER_ORDER = ["NEWBIE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "EMERALD"];

export async function unlockUserAccount(userId: string, tx?: any) {
    console.log(`[MLM] Unlocking account for user ${userId}.`);
    const db = tx || prisma;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    
    // Check if account is already unlocked AND not expired
    const isCurrentlyUnlocked = user.isActiveMember && (!user.unlockExpiry || new Date(user.unlockExpiry) > new Date());
    if (isCurrentlyUnlocked) throw new Error("User account is already active and unlocked.");

    const now = new Date();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 3);

    // 1. Activate User and set expiry
    await db.user.update({
        where: { id: userId },
        data: { 
            isActiveMember: true,
            lastUnlockAt: now,
            unlockExpiry: expiry,
            lastActivityAt: now,
            premiumBonusSpins: { increment: 2 } 
        }
    });

    // 2. Clear out locked balances (Move to active balance)
    if (user.lockedBalance > 0 || user.lockedArnBalance > 0) {
        await db.user.update({
            where: { id: userId },
            data: {
                balance: { increment: user.lockedBalance },
                arnBalance: { increment: user.lockedArnBalance },
                lockedBalance: 0,
                lockedArnBalance: 0
            }
        });
        
        await db.mLMLog.create({
            data: {
                userId: userId,
                type: "LOCKED_BALANCE_RELEASED",
                amount: user.lockedBalance,
                description: `Released $${user.lockedBalance.toFixed(2)} and ${user.lockedArnBalance} ARN from locked storage upon activation.`
            }
        });
    }
    
    await db.mLMLog.create({
        data: {
            userId: userId,
            type: "ACCOUNT_UNLOCK",
            amount: 1.0,
            description: "Account unlocked for 3 months via $1 activation."
        }
    });

    // 3. Pool Distributions ($1.00 Total)
    
    // REWARD (Achievement): 20% ($0.20)
    await db.pool.upsert({
        where: { name: "REWARD" },
        update: { balance: { increment: 0.20 } },
        create: { name: "REWARD", balance: 0.20, percentage: 20 }
    });

    // 4. Referral Pool Distribution for $1 Activation
    const referralEmissions = await distributeCommissions(userId, 1.0, db);
    
    // CBSP & Royalty Pools (Currently inactive, structural preparation)
    // When active, these would be calculated here (e.g. 5% each)
    const cbspAmount = 0.0;
    const royaltyAmount = 0.0;
    
    // Company Remainder
    const companyRemainder = 1.0 - 0.20 - referralEmissions - cbspAmount - royaltyAmount;

    // Record Unlock Activation
    await db.unlockActivation.create({
        data: {
            userId: userId,
            amount: 1.0,
            achievementPool: 0.20,
            referrals: referralEmissions,
            cbsp: cbspAmount,
            royalty: royaltyAmount,
            company: companyRemainder
        }
    });

    // Handle Company Remainder
    if (companyRemainder > 0) {
        await db.pool.upsert({
            where: { name: "COMPANY" },
            update: { balance: { increment: companyRemainder } },
            create: { name: "COMPANY", balance: companyRemainder, percentage: 0 }
        });
    }

    // 5. Admin Notification (Log)
    await db.adminLog.create({
        data: {
            adminId: "SYSTEM",
            targetUserId: userId,
            actionType: "USER_ACTIVATION",
            details: `User ${user.email || userId} successfully unlocked their account through $1 activation. Achv: $0.20, Refs: $${referralEmissions.toFixed(2)}, Company: $${companyRemainder.toFixed(2)}`
        }
    });

    // Check Upgrade for the User (Self)
    await checkTierUpgrade(userId, db);
}

/**
 * Main Entry Point: Process a New USD Deposit
 * 
 * 1. Mint ARN Tokens (System Power)
 * 2. Distribute 3-Level MLM Commissions (USD)
 * 3. Check for Tier Upgrades (Upline & Self)
 */
export async function finalizeDeposit(userId: string, amount: number, txId: string, description: string = "", tx?: any) {
    console.log(`[MLM] Finalizing deposit of $${amount} for user ${userId}. TX: ${txId}`);
    const db = tx || prisma;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (amount > 0) {
        // Mint ARN Tokens (Power) for the remaining amount
        try {
            await mintArnForDeposit(userId, amount, txId, db);
        } catch (e) {
            console.error("[MLM] Token Minting Failed", e);
            throw e;
        }

        // Distribute Commissions (USD) only if the user is active/unlocked
        if (user.isActiveMember) {
            // Note: Currently, normal deposits distribute commissions too.
            await distributeCommissions(userId, amount, db);
        } else {
            console.log(`[MLM] Skipping commission distribution for unactivated user ${userId}.`);
        }
    }

    // Check Upgrade for the User (Self)
    await checkTierUpgrade(userId, db);
}

// Alias for backward compatibility if needed, though we should prefer finalizeDeposit
export const processMlmDeposit = async (userId: string, amount: number, txId: string) => {
    return finalizeDeposit(userId, amount, txId, "Legacy Process Call");
};

/**
 * Distributes USD commissions up 3 levels based on the referrer's Tier.
 * Returns the total amount of USD distributed to referrers.
 */
async function distributeCommissions(sourceUserId: string, amount: number, db: any): Promise<number> {
    let totalDistributed = 0;
    
    // Fetch Upline Tree
    const tree = await db.referralTree.findUnique({
        where: { userId: sourceUserId },
        include: {
            user: { select: { name: true } }
        }
    });

    if (!tree) return 0;

    const uplineIds = [tree.advisorId, tree.supervisorId, tree.managerId].filter((id: string | null) => id !== null) as string[];

    for (let i = 0; i < uplineIds.length; i++) {
        const uplineId = uplineIds[i];
        const level = i + 1; // 1, 2, 3

        // Fetch Referrer's Tier and status
        const referrer = await db.user.findUnique({
            where: { id: uplineId },
            select: { id: true, tier: true, activeMembers: true, arnBalance: true, isActiveMember: true }
        });

        if (!referrer) continue;

        // Calculate Rate based on THEIR tier
        const validTier = TIER_COMMISSIONS[referrer.tier] ? referrer.tier : "NEWBIE";
        const rates = TIER_COMMISSIONS[validTier];
        const rate = level === 1 ? rates.L1 : level === 2 ? rates.L2 : rates.L3;

        if (rate > 0) {
            const commissionUSD = amount * (rate / 100);
            const commissionARN = commissionUSD * 10; // 1 USD = 10 ARN
            
            // Check if referrer is active
            const isUplineActive = referrer.isActiveMember;

            // PAY THE USER
            await db.user.update({
                where: { id: uplineId },
                data: isUplineActive ? { 
                   arnBalance: { increment: commissionARN },
                   balance: { increment: commissionUSD }
                } : {
                   lockedArnBalance: { increment: commissionARN },
                   lockedBalance: { increment: commissionUSD }
                }
            });

            // Log Commission
            await db.referralCommission.create({
                data: {
                    earnerId: uplineId,
                    sourceUserId: sourceUserId,
                    amount: commissionUSD,
                    level: level,
                    percentage: rate
                }
            });

            totalDistributed += commissionUSD;
            console.log(`[MLM] ${isUplineActive ? 'Paid' : 'Locked'} $${commissionUSD} (L${level} @ ${rate}%) for ${uplineId}`);
            
            // Check upgrade for upline (activity based)
            if (isUplineActive) {
                await checkTierUpgrade(uplineId, db);
            }
        }
    }
    
    return totalDistributed;
}

/**
 * checks if a user qualifies for the next tier.
 * Logic: Must have >= Required ARN AND >= Required Active Directs.
 */
export async function checkTierUpgrade(userId: string, tx?: any) {
    const db = tx || prisma;
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { 
            id: true, 
            tier: true, 
            arnBalance: true,
            balance: true,
            referrals: { 
                where: { isActiveMember: true },
                select: { id: true } 
            }
        }
    });

    if (!user) return;

    // Determine current tier index
    const currentTierIndex = TIER_ORDER.indexOf(user.tier) >= 0 ? TIER_ORDER.indexOf(user.tier) : 0;
    
    // Count total active network members (3 levels)
    const userWithNetwork = await db.user.findUnique({
        where: { id: userId },
        select: {
            referrals: {
                where: { isActiveMember: true },
                select: {
                    id: true,
                    referrals: {
                        where: { isActiveMember: true },
                        select: {
                            id: true,
                            referrals: {
                                where: { isActiveMember: true },
                                select: { id: true }
                            }
                        }
                    }
                }
            }
        }
    });

    let totalActiveNetwork = 0;
    if (userWithNetwork?.referrals) {
        userWithNetwork.referrals.forEach((l1: any) => {
            totalActiveNetwork++;
            if (l1.referrals) {
                l1.referrals.forEach((l2: any) => {
                    totalActiveNetwork++;
                    if (l2.referrals) {
                        totalActiveNetwork += l2.referrals.length;
                    }
                });
            }
        });
    }

    const currentArn = user.arnBalance || 0;
    const teamSize = totalActiveNetwork;

    // Check next tiers
    const tierRules = await getTierRequirements(db);

    // Calculate Thresholds based on configured rules
    // The requirement defined for each Tier is the ABSOLUTE value required to reach it.
    
    const tierThresholds: Record<string, { arn: number, directs: number }> = {};
    
    for (const tierName of TIER_ORDER) {
        tierThresholds[tierName] = tierRules[tierName] || DEFAULT_TIER_REQUIREMENTS[tierName] || { arn: 0, directs: 0 };
    }

    // Now check if user qualifies for higher tiers
    // Iterate from next tier upwards
    for (let i = currentTierIndex + 1; i < TIER_ORDER.length; i++) {
        const nextTier = TIER_ORDER[i];
        
        // The threshold to ENTTER 'nextTier' is what we calculated above
        const threshold = tierThresholds[nextTier];

        // Strict Check: User Total >= Cumulative Threshold
        if (currentArn >= threshold.arn && teamSize >= threshold.directs) {
            // QUALIFIED for this tier!
            // But we continue loop? No, usually we upgrade step by step or jump?
            // If we jump, we should check the HIGHEST usage.
            // But for safety, let's just upgrade to this one and let the next event (or loop) handle further jumps.
            // Or simpler: Update to this tier, then continue checking? 
            // Better: Find the HIGHEST reachable tier.
            
            // Actually, safe approach: Upgrade to this tier.
            console.log(`[MLM] UPGRADE: User ${userId} promoted to ${nextTier}`);
            
            await db.user.update({
                where: { id: userId },
                data: { tier: nextTier }
            });

            // Grant Tier Rewards
            await grantTierRewards(userId, nextTier, db);
            
            await db.mLMLog.create({
                data: {
                    userId: userId,
                    type: "TIER_UPGRADE",
                    amount: 0,
                    description: `Upgraded to ${nextTier} (ARN: ${currentArn}/${threshold.arn}, Team: ${teamSize}/${threshold.directs})`
                }
            });
        } else {
            // Cannot reach this tier, stop checking higher ones
            break;
        }
    }
}

/**
 * Helper: Refreshes specific user stats if needed (e.g. active members count)
 * Can be called periodically or on login
 */
export async function refreshUserMlmStats(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            referralCode: true,
            referrals: {
                where: { isActiveMember: true },
                select: {
                    id: true,
                    referrals: {
                        where: { isActiveMember: true },
                        select: {
                            id: true,
                            referrals: {
                                where: { isActiveMember: true },
                                select: { id: true }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!user) return;

    let totalActiveNetwork = 0;
    if (user.referrals) {
        user.referrals.forEach((l1: any) => {
            totalActiveNetwork++;
            if (l1.referrals) {
                l1.referrals.forEach((l2: any) => {
                    totalActiveNetwork++;
                    if (l2.referrals) {
                        totalActiveNetwork += l2.referrals.length;
                    }
                });
            }
        });
    }

    await prisma.user.update({
        where: { id: userId },
        data: { activeMembers: totalActiveNetwork }
    });
}

/**
 * Generates a unique referral code.
 * Format: 8 characters, uppercase alphanumeric.
 */
export function generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

/**
 * Generates a unique 7-digit Member ID.
 */
export function generateMemberId(): string {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
}

/**
 * Adds ARN points to a user (e.g. from Spin or Tasks) and checks for tier upgrade.
 */
export async function addUserPoints(userId: string, amount: number, tx?: any) {
    const db = tx || prisma;
    if (amount > 0) {
        await db.user.update({
            where: { id: userId },
            data: { 
                 arnBalance: { increment: amount },
                 balance: { increment: amount / 10 }
            }
        });
    }
    await checkTierUpgrade(userId, db);
}

export async function getTierRules() {
    return await getTierRequirements(prisma);
}

/**
 * Grants milestone rewards upon tier upgrade.
 */
export async function grantTierRewards(userId: string, tier: string, tx?: any) {
    const db = tx || prisma;
    const reward = TIER_REWARDS[tier];
    if (!reward) return;

    console.log(`[MLM] Granting ${tier} rewards to ${userId}: $${reward.balance}, ${reward.arn} ARN`);

    await db.user.update({
        where: { id: userId },
        data: {
            balance: { increment: reward.balance },
            arnBalance: { increment: reward.arn }
        }
    });

    await db.mLMLog.create({
        data: {
            userId: userId,
            type: "TIER_REWARD",
            amount: reward.balance,
            description: reward.description
        }
    });

    // Also log as a transaction for visibility
    await db.transaction.create({
        data: {
            userId: userId,
            amount: reward.balance,
            arnMinted: reward.arn,
            type: "REWARD",
            status: "COMPLETED",
            method: "SYSTEM",
            description: `Tier Achievement: ${tier}`
        }
    });
}

/**
 * Helper: Get current withdrawal limit percentage for a user's tier.
 */
export function getTierWithdrawLimit(tier: string): number {
    return TIER_WITHDRAWAL_LIMITS[tier] || 10;
}
