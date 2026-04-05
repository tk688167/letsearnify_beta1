import { prisma } from "@/lib/prisma";
import { mintArnForDeposit } from "@/lib/tokens";

// --- CONFIGURATION ---

export const TIER_COMMISSIONS: Record<string, { L1: number, L2: number, L3: number }> = {
    NEWBIE:   { L1: 5,  L2: 3,  L3: 2 },
    BRONZE:   { L1: 9,  L2: 4,  L3: 2 },
    SILVER:   { L1: 12, L2: 5,  L3: 3 },
    GOLD:     { L1: 15, L2: 7,  L3: 3 },
    PLATINUM: { L1: 18, L2: 8,  L3: 4 },
    DIAMOND:  { L1: 22, L2: 9,  L3: 4 },
    EMERALD:  { L1: 25, L2: 10, L3: 5 }
};

// Signup bonus given to NEW USER immediately at signup based on their referrers tier
export const SIGNUP_BONUS_RATES: Record<string, number> = {
    NEWBIE: 3, BRONZE: 4, SILVER: 5, GOLD: 6,
    PLATINUM: 7, DIAMOND: 8, EMERALD: 10
};

export const DEFAULT_TIER_REQUIREMENTS: Record<string, { arn: number, directs: number }> = {
    NEWBIE:   { arn: 0,      directs: 0 },
    BRONZE:   { arn: 400,    directs: 40 },
    SILVER:   { arn: 1000,   directs: 100 },
    GOLD:     { arn: 1800,   directs: 250 },
    PLATINUM: { arn: 1500,   directs: 500 },
    DIAMOND:  { arn: 7000,   directs: 1200 },
    EMERALD:  { arn: 15000,  directs: 250 }
};

export const TIER_WITHDRAWAL_LIMITS: Record<string, number> = {
    NEWBIE: 10, BRONZE: 12, SILVER: 15, GOLD: 18,
    PLATINUM: 20, DIAMOND: 25, EMERALD: 30
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
        configs.forEach((c: any) => { rules[c.tier] = { arn: c.requiredArn, directs: c.members }; });
        return rules;
    } catch { return DEFAULT_TIER_REQUIREMENTS; }
}

const TIER_ORDER = ["NEWBIE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "EMERALD"];

// ─────────────────────────────────────────────────────────────
// UNLOCK USER ACCOUNT ($1 activation)
//
// Per PDF flow:
// 1. User pays $1 → account unlocked (withdrawals enabled)
// 2. User receives signup bonus (based on REFERRER's tier at time of signup)
// 3. Referrer receives L1 commission (5% of $1 for Newbie tier)
// 4. Referrer's referrer gets L2, and so on up to L3
// 5. All parties get tier check
// ─────────────────────────────────────────────────────────────
export async function unlockUserAccount(userId: string, tx?: any) {
    console.log(`[MLM] Unlocking account for user ${userId}`);
    const db = tx || prisma;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    
    if (user.isActiveMember && (!user.unlockExpiry || new Date(user.unlockExpiry) > new Date())) {
        throw new Error("User account is already active and unlocked.");
    }

    const now = new Date();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 3);

    // 1. Activate the account
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

    // 2. Signup bonus is now granted immediately at registration.
    
    await db.mLMLog.create({
        data: {
            userId: userId,
            type: "ACCOUNT_UNLOCK",
            amount: 1.0,
            description: "Account unlocked for 3 months via $1 activation. Withdrawals enabled."
        }
    });

    // 3. Pool allocation
    let rewardPercentage = 20;
    const existingRewardPool = await db.pool.findUnique({ where: { name: "REWARD" } });
    if (existingRewardPool && existingRewardPool.percentage > 0) {
        rewardPercentage = existingRewardPool.percentage;
    }
    
    const achievementAllocation = 1.0 * (rewardPercentage / 100);

    await db.pool.upsert({
        where: { name: "REWARD" },
        update: { balance: { increment: achievementAllocation } },
        create: { name: "REWARD", balance: achievementAllocation, percentage: rewardPercentage }
    });

    // 4. Distribute referral commissions from the $1 unlock
    // Per PDF: "When Talha deposits $1 to unlock, Ali receives his referral reward"
    const referralEmissions = await distributeCommissions(userId, 1.0, db);
    
    const companyRemainder = Math.max(1.0 - achievementAllocation - referralEmissions, 0);

    await db.unlockActivation.create({
        data: {
            userId: userId,
            amount: 1.0,
            achievementPool: achievementAllocation,
            referrals: referralEmissions,
            cbsp: 0.0,
            royalty: 0.0,
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

    // 5. Update referrer's activeMembers count
    if (user.referredByCode) {
        const referrer = await db.user.findUnique({
            where: { referralCode: user.referredByCode },
            select: { id: true }
        });
        if (referrer) {
            await refreshUserMlmStats(referrer.id, db);
        }
    }

    await db.adminLog.create({
        data: {
            adminId: "SYSTEM",
            targetUserId: userId,
            actionType: "USER_ACTIVATION",
            details: `User ${user.email || userId} activated. Refs: $${referralEmissions.toFixed(2)}, Company: $${companyRemainder.toFixed(2)}`
        }
    });

    // 6. Check tier upgrade for this user and referrer
    await checkTierUpgrade(userId, db);
}

export async function finalizeDeposit(userId: string, amount: number, txId: string, description: string = "", tx?: any) {
    const db = tx || prisma;
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (amount > 0) {
        try { await mintArnForDeposit(userId, amount, txId, db); } 
        catch (e) { console.error("[MLM] Token Minting Failed", e); throw e; }

        if (user.isActiveMember) {
            await distributeCommissions(userId, amount, db);
        }
    }
    await checkTierUpgrade(userId, db);
}

export const processMlmDeposit = async (userId: string, amount: number, txId: string) => {
    return finalizeDeposit(userId, amount, txId, "Legacy Process Call");
};

/**
 * Distributes USD commissions up 3 levels.
 * Always credits real balance. Withdrawal blocked by isActiveMember.
 */
export async function distributeCommissions(sourceUserId: string, amount: number, db: any): Promise<number> {
    let totalDistributed = 0;
    
    const tree = await db.referralTree.findUnique({
        where: { userId: sourceUserId }
    });
    if (!tree) return 0;

    const sourceUser = await db.user.findUnique({
        where: { id: sourceUserId },
        select: { name: true, email: true }
    });
    const sourceName = sourceUser?.name || sourceUser?.email || "a team member";

    const uplineIds = [tree.advisorId, tree.supervisorId, tree.managerId].filter(Boolean) as string[];

    for (let i = 0; i < uplineIds.length; i++) {
        const uplineId = uplineIds[i];
        const level = i + 1;

        const referrer = await db.user.findUnique({
            where: { id: uplineId },
            select: { id: true, tier: true, isActiveMember: true }
        });
        if (!referrer) continue;

        const validTier = TIER_COMMISSIONS[referrer.tier] ? referrer.tier : "NEWBIE";
        const rates = TIER_COMMISSIONS[validTier];
        const rate = level === 1 ? rates.L1 : level === 2 ? rates.L2 : rates.L3;

        if (rate > 0) {
            const commissionUSD = amount * (rate / 100);
            const commissionARN = commissionUSD * 10;

            // Always credit real balance
            await db.user.update({
                where: { id: uplineId },
                data: { 
                    arnBalance: { increment: commissionARN },
                    balance: { increment: commissionUSD }
                }
            });

            await db.referralCommission.create({
                data: {
                    earnerId: uplineId, sourceUserId: sourceUserId,
                    amount: commissionUSD, level: level, percentage: rate
                }
            });

            await db.transaction.create({
                data: {
                    userId: uplineId,
                    amount: commissionUSD, arnMinted: commissionARN,
                    type: "REFERRAL_COMMISSION", status: "COMPLETED", method: "SYSTEM",
                    description: `L${level} commission (${rate}%) from ${sourceName}'s $${amount.toFixed(2)} activity`
                }
            });

            totalDistributed += commissionUSD;
            console.log(`[MLM] Paid $${commissionUSD} (L${level} @ ${rate}%) to ${uplineId}`);
            
            await checkTierUpgrade(uplineId, db);
        }
    }
    
    return totalDistributed;
}

/**
 * Tier upgrade check.
 * Per PDF:
 * - arnBalance has ALL earned ARN (signup bonus, tasks, spins, referral commissions, deposits)
 * - Signup count = ALL users who joined with your referral code (not just active)
 */
export async function checkTierUpgrade(userId: string, tx?: any) {
    const db = tx || prisma;
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, tier: true, arnBalance: true, referralCode: true }
    });
    if (!user) return;

    const currentTierIndex = TIER_ORDER.indexOf(user.tier) >= 0 ? TIER_ORDER.indexOf(user.tier) : 0;
    
    // Count ALL signups (everyone who used this referral code)
    let totalSignups = 0;
    if (user.referralCode) {
        totalSignups = await db.user.count({
            where: { referredByCode: user.referralCode }
        });
    }

    const currentArn = user.arnBalance || 0;
    const tierRules = await getTierRequirements(db);

    for (let i = currentTierIndex + 1; i < TIER_ORDER.length; i++) {
        const nextTier = TIER_ORDER[i];
        const threshold = tierRules[nextTier] || DEFAULT_TIER_REQUIREMENTS[nextTier];

        if (currentArn >= threshold.arn && totalSignups >= threshold.directs) {
            console.log(`[MLM] UPGRADE: ${userId} → ${nextTier} (ARN: ${currentArn}/${threshold.arn}, Signups: ${totalSignups}/${threshold.directs})`);
            
            await db.user.update({ where: { id: userId }, data: { tier: nextTier } });
            await grantTierRewards(userId, nextTier, db);
            
            await db.mLMLog.create({
                data: {
                    userId: userId, type: "TIER_UPGRADE", amount: 0,
                    description: `Upgraded to ${nextTier} (ARN: ${currentArn}/${threshold.arn}, Signups: ${totalSignups}/${threshold.directs})`
                }
            });
        } else { break; }
    }
}

export async function refreshUserMlmStats(userId: string, tx?: any) {
    const db = tx || prisma;
    const user = await db.user.findUnique({
        where: { id: userId },
        select: {
            id: true, referralCode: true,
            referrals: {
                where: { isActiveMember: true },
                select: { id: true,
                    referrals: { where: { isActiveMember: true },
                        select: { id: true,
                            referrals: { where: { isActiveMember: true }, select: { id: true } }
                        }
                    }
                }
            }
        }
    });
    if (!user) return;

    let totalActiveNetwork = 0;
    user.referrals?.forEach((l1: any) => {
        totalActiveNetwork++;
        l1.referrals?.forEach((l2: any) => {
            totalActiveNetwork++;
            if (l2.referrals) totalActiveNetwork += l2.referrals.length;
        });
    });

    await db.user.update({ where: { id: userId }, data: { activeMembers: totalActiveNetwork } });
}

export function generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function generateMemberId(): string {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
}

export async function addUserPoints(userId: string, amount: number, tx?: any) {
    const db = tx || prisma;
    if (amount > 0) {
        await db.user.update({
            where: { id: userId },
            data: { arnBalance: { increment: amount }, balance: { increment: amount / 10 } }
        });
    }
    await checkTierUpgrade(userId, db);
}

export async function getTierRules() { return await getTierRequirements(prisma); }

export async function grantTierRewards(userId: string, tier: string, tx?: any) {
    const db = tx || prisma;
    const reward = TIER_REWARDS[tier];
    if (!reward) return;

    await db.user.update({
        where: { id: userId },
        data: { balance: { increment: reward.balance }, arnBalance: { increment: reward.arn } }
    });

    await db.mLMLog.create({
        data: { userId, type: "TIER_REWARD", amount: reward.balance, description: reward.description }
    });

    await db.transaction.create({
        data: {
            userId, amount: reward.balance, arnMinted: reward.arn,
            type: "REWARD", status: "COMPLETED", method: "SYSTEM",
            description: `Tier Achievement: ${tier}`
        }
    });
}

export function getTierWithdrawLimit(tier: string): number {
    return TIER_WITHDRAWAL_LIMITS[tier] || 10;
}

export async function checkAccountLock(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, isActiveMember: true, unlockExpiry: true, lastActivityAt: true }
        });
        if (!user || !user.isActiveMember) return;

        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const isExpired = user.unlockExpiry && new Date(user.unlockExpiry) < now;
        const isInactive = user.lastActivityAt && new Date(user.lastActivityAt) < threeMonthsAgo;

        if (isExpired || isInactive) {
            await prisma.user.update({ where: { id: userId }, data: { isActiveMember: false } });
            await prisma.mLMLog.create({
                data: {
                    userId: user.id, type: "ACCOUNT_RE_LOCKED", amount: 0,
                    description: isExpired ? "Re-locked: 3-month expiry." : "Re-locked: 3 months inactive."
                }
            });
        } else {
            await prisma.user.update({ where: { id: userId }, data: { lastActivityAt: now } });
        }
    } catch (error) { console.error("[MLM] checkAccountLock error:", error); }
}