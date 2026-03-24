import { prisma } from "@/lib/prisma";
import { mintArnForDeposit } from "@/lib/tokens";

// --- CONFIGURATION ---

// Exported so merchant.ts can use it for deposit commissions
export const TIER_COMMISSIONS: Record<string, { L1: number, L2: number, L3: number }> = {
    NEWBIE:   { L1: 5,  L2: 3,  L3: 2 },
    BRONZE:   { L1: 9,  L2: 4,  L3: 2 },
    SILVER:   { L1: 12, L2: 5,  L3: 3 },
    GOLD:     { L1: 15, L2: 7,  L3: 3 },
    PLATINUM: { L1: 18, L2: 8,  L3: 4 },
    DIAMOND:  { L1: 22, L2: 9,  L3: 4 },
    EMERALD:  { L1: 26, L2: 10, L3: 4 }
};

export const DEFAULT_TIER_REQUIREMENTS: Record<string, { arn: number, directs: number }> = {
    NEWBIE:   { arn: 0,      directs: 0 },
    BRONZE:   { arn: 100,    directs: 2 },
    SILVER:   { arn: 500,    directs: 5 },
    GOLD:     { arn: 2000,   directs: 10 },
    PLATINUM: { arn: 10000,  directs: 20 },
    DIAMOND:  { arn: 50000,  directs: 50 },
    EMERALD:  { arn: 100000, directs: 100 }
};

export const TIER_WITHDRAWAL_LIMITS: Record<string, number> = {
    NEWBIE:   10,
    BRONZE:   12,
    SILVER:   15,
    GOLD:     18,
    PLATINUM: 20,
    DIAMOND:  25,
    EMERALD:  30
};

export const TIER_REWARDS: Record<string, { balance: number, arn: number, description: string }> = {
    BRONZE:   { balance: 1.0,   arn: 10,   description: "Bronze Milestone Gift" },
    SILVER:   { balance: 5.0,   arn: 50,   description: "Silver Achievement Reward" },
    GOLD:     { balance: 25.0,  arn: 250,  description: "Gold Status Bonus" },
    PLATINUM: { balance: 100.0, arn: 1000, description: "Platinum Excellence Reward" },
    DIAMOND:  { balance: 500.0, arn: 5000, description: "Diamond Elite Gift" },
    EMERALD:  { balance: 1000.0,arn: 10000,description: "Emerald Ultimate Achievement Reward" }
};

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
    
    const isCurrentlyUnlocked = user.isActiveMember && (!user.unlockExpiry || new Date(user.unlockExpiry) > new Date());
    if (isCurrentlyUnlocked) throw new Error("User account is already active and unlocked.");

    const now = new Date();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 3);

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

    await db.pool.upsert({
        where: { name: "REWARD" },
        update: { balance: { increment: 0.20 } },
        create: { name: "REWARD", balance: 0.20, percentage: 20 }
    });

    // Distribute referral commissions from the $1 unlock fee
    // Per PDF: "When Talha deposits $1 to unlock, Ali receives his referral reward"
    const referralEmissions = await distributeCommissions(userId, 1.0, db);
    
    const cbspAmount = 0.0;
    const royaltyAmount = 0.0;
    const companyRemainder = 1.0 - 0.20 - referralEmissions - cbspAmount - royaltyAmount;

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

    if (companyRemainder > 0) {
        await db.pool.upsert({
            where: { name: "COMPANY" },
            update: { balance: { increment: companyRemainder } },
            create: { name: "COMPANY", balance: companyRemainder, percentage: 0 }
        });
    }

    // Update referrer's activeMembers count
    if (user.referredByCode) {
        const referrer = await db.user.findUnique({
            where: { referralCode: user.referredByCode },
            select: { id: true }
        });
        if (referrer) {
            await refreshUserMlmStats(referrer.id, db);
            console.log(`[MLM] Updated activeMembers count for referrer ${referrer.id}`);
        }
    }

    await db.adminLog.create({
        data: {
            adminId: "SYSTEM",
            targetUserId: userId,
            actionType: "USER_ACTIVATION",
            details: `User ${user.email || userId} activated. Achv: $0.20, Refs: $${referralEmissions.toFixed(2)}, Company: $${companyRemainder.toFixed(2)}`
        }
    });

    await checkTierUpgrade(userId, db);
}

export async function finalizeDeposit(userId: string, amount: number, txId: string, description: string = "", tx?: any) {
    console.log(`[MLM] Finalizing deposit of $${amount} for user ${userId}. TX: ${txId}`);
    const db = tx || prisma;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (amount > 0) {
        try {
            await mintArnForDeposit(userId, amount, txId, db);
        } catch (e) {
            console.error("[MLM] Token Minting Failed", e);
            throw e;
        }

        if (user.isActiveMember) {
            await distributeCommissions(userId, amount, db);
        } else {
            console.log(`[MLM] Skipping commission distribution for unactivated user ${userId}.`);
        }
    }

    await checkTierUpgrade(userId, db);
}

export const processMlmDeposit = async (userId: string, amount: number, txId: string) => {
    return finalizeDeposit(userId, amount, txId, "Legacy Process Call");
};

/**
 * Distributes USD commissions up 3 levels.
 * Per PDF: Referral earnings are only released when the referred user is active.
 * Creates Transaction records so commissions show in wallet history.
 * 
 * EXPORTED so merchant.ts can also call it for deposit commissions.
 */
export async function distributeCommissions(sourceUserId: string, amount: number, db: any): Promise<number> {
    let totalDistributed = 0;
    
    const tree = await db.referralTree.findUnique({
        where: { userId: sourceUserId },
        include: { user: { select: { name: true } } }
    });

    if (!tree) return 0;

    const sourceUser = await db.user.findUnique({
        where: { id: sourceUserId },
        select: { name: true, email: true }
    });
    const sourceName = sourceUser?.name || sourceUser?.email || "a team member";

    const uplineIds = [tree.advisorId, tree.supervisorId, tree.managerId].filter((id: string | null) => id !== null) as string[];

    for (let i = 0; i < uplineIds.length; i++) {
        const uplineId = uplineIds[i];
        const level = i + 1;

        const referrer = await db.user.findUnique({
            where: { id: uplineId },
            select: { id: true, tier: true, activeMembers: true, arnBalance: true, isActiveMember: true }
        });

        if (!referrer) continue;

        const validTier = TIER_COMMISSIONS[referrer.tier] ? referrer.tier : "NEWBIE";
        const rates = TIER_COMMISSIONS[validTier];
        const rate = level === 1 ? rates.L1 : level === 2 ? rates.L2 : rates.L3;

        if (rate > 0) {
            const commissionUSD = amount * (rate / 100);
            const commissionARN = commissionUSD * 10;
            
            const isUplineActive = referrer.isActiveMember;

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

            await db.referralCommission.create({
                data: {
                    earnerId: uplineId,
                    sourceUserId: sourceUserId,
                    amount: commissionUSD,
                    level: level,
                    percentage: rate
                }
            });

            if (isUplineActive) {
                await db.transaction.create({
                    data: {
                        userId: uplineId,
                        amount: commissionUSD,
                        arnMinted: commissionARN,
                        type: "REFERRAL_COMMISSION",
                        status: "COMPLETED",
                        method: "SYSTEM",
                        description: `L${level} commission (${rate}%) from ${sourceName}'s $${amount.toFixed(2)} activity`
                    }
                });
            }

            totalDistributed += commissionUSD;
            console.log(`[MLM] ${isUplineActive ? 'Paid' : 'Locked'} $${commissionUSD} (L${level} @ ${rate}%) for ${uplineId}`);
            
            if (isUplineActive) {
                await checkTierUpgrade(uplineId, db);
            }
        }
    }
    
    return totalDistributed;
}

/**
 * Checks if a user qualifies for the next tier.
 * 
 * Per PDF:
 * - ARN from ALL sources counts: signup bonus, tasks, spins, referral rewards, deposits
 * - Team size = TOTAL signups (users who joined with your referral code), NOT just active members
 * - "Each user who joins using your referral code = 1 Signup"
 * - "There are no restrictions on who can sign up, every valid referral is counted equally"
 */
export async function checkTierUpgrade(userId: string, tx?: any) {
    const db = tx || prisma;
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { 
            id: true, 
            tier: true, 
            arnBalance: true,
            referralCode: true
        }
    });

    if (!user) return;

    const currentTierIndex = TIER_ORDER.indexOf(user.tier) >= 0 ? TIER_ORDER.indexOf(user.tier) : 0;
    
    // Count TOTAL signups (all users who used this referral code, regardless of active status)
    // Per PDF: "Each user who joins using your referral code = 1 Signup"
    let totalSignups = 0;
    if (user.referralCode) {
        totalSignups = await db.user.count({
            where: { referredByCode: user.referralCode }
        })
    }

    const currentArn = user.arnBalance || 0;
    const teamSize = totalSignups;

    const tierRules = await getTierRequirements(db);

    const tierThresholds: Record<string, { arn: number, directs: number }> = {};
    for (const tierName of TIER_ORDER) {
        tierThresholds[tierName] = tierRules[tierName] || DEFAULT_TIER_REQUIREMENTS[tierName] || { arn: 0, directs: 0 };
    }

    for (let i = currentTierIndex + 1; i < TIER_ORDER.length; i++) {
        const nextTier = TIER_ORDER[i];
        const threshold = tierThresholds[nextTier];

        if (currentArn >= threshold.arn && teamSize >= threshold.directs) {
            console.log(`[MLM] UPGRADE: User ${userId} promoted to ${nextTier} (ARN: ${currentArn}/${threshold.arn}, Signups: ${teamSize}/${threshold.directs})`);
            
            await db.user.update({
                where: { id: userId },
                data: { tier: nextTier }
            });

            await grantTierRewards(userId, nextTier, db);
            
            await db.mLMLog.create({
                data: {
                    userId: userId,
                    type: "TIER_UPGRADE",
                    amount: 0,
                    description: `Upgraded to ${nextTier} (ARN: ${currentArn}/${threshold.arn}, Signups: ${teamSize}/${threshold.directs})`
                }
            });
        } else {
            break;
        }
    }
}

/**
 * Refreshes user's activeMembers count from actual DB data.
 */
export async function refreshUserMlmStats(userId: string, tx?: any) {
    const db = tx || prisma;
    const user = await db.user.findUnique({
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

    await db.user.update({
        where: { id: userId },
        data: { activeMembers: totalActiveNetwork }
    });
}

export function generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function generateMemberId(): string {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
}

/**
 * Adds ARN + equivalent USD to user. Intentional gift — withdrawable after $1 activation.
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

export function getTierWithdrawLimit(tier: string): number {
    return TIER_WITHDRAWAL_LIMITS[tier] || 10;
}

/**
 * Check account expiry/inactivity and re-lock if needed.
 */
export async function checkAccountLock(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { 
                id: true, 
                isActiveMember: true, 
                unlockExpiry: true, 
                lastActivityAt: true 
            }
        });

        if (!user || !user.isActiveMember) return;

        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const isExpired = user.unlockExpiry && new Date(user.unlockExpiry) < now;
        const isInactive = user.lastActivityAt && new Date(user.lastActivityAt) < threeMonthsAgo;

        if (isExpired || isInactive) {
            await prisma.user.update({
                where: { id: userId },
                data: { isActiveMember: false }
            });
            
            await prisma.mLMLog.create({
                data: {
                    userId: user.id,
                    type: "ACCOUNT_RE_LOCKED",
                    amount: 0,
                    description: isExpired 
                        ? "Account re-locked due to 3-month unlock expiry." 
                        : "Account re-locked due to 3 months of continuous inactivity."
                }
            });
        } else {
            await prisma.user.update({
                where: { id: userId },
                data: { lastActivityAt: now }
            });
        }
    } catch (error) {
        console.error("[MLM] checkAccountLock error:", error);
    }
}