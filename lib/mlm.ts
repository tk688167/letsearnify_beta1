import { prisma } from "@/lib/prisma";
import { mintArnForDeposit } from "@/lib/tokens";

// --- CONFIGURATION ---

import { 
    TIER_COMMISSIONS, 
    SIGNUP_BONUS_RATES, 
    DEFAULT_TIER_REQUIREMENTS, 
    TIER_WITHDRAWAL_LIMITS, 
    TIER_REWARDS, 
    TIER_ORDER 
} from "./mlm-constants";

export { 
    TIER_COMMISSIONS, 
    SIGNUP_BONUS_RATES, 
    DEFAULT_TIER_REQUIREMENTS, 
    TIER_WITHDRAWAL_LIMITS, 
    TIER_REWARDS, 
    TIER_ORDER 
};

export async function getTierRequirements(tx?: any) {
    return DEFAULT_TIER_REQUIREMENTS;
}

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

    try {
        const { revalidatePath } = await import("next/cache");
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/wallet");
        revalidatePath("/dashboard/tasks");
    } catch (e) { console.error("[MLM] Revalidation failed:", e); }

    // 3. Pool allocation (Strict 20% = $0.20)
    const achievementAllocation = 0.20;

    await db.pool.upsert({
        where: { name: "ACHIEVEMENT" },
        update: { balance: { increment: achievementAllocation } },
        create: { name: "ACHIEVEMENT", balance: achievementAllocation, percentage: 20 }
    });

    // 4. Distribute referral commissions from the $1 unlock based on Referrer's Tier Percentages
    const referralEmissions = await distributeActivationCommissions(userId, db);
    
    // Remaining stays with company
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

        // --- AUTO-UNLOCK LOGIC ---
        // If user is NOT active and their total deposit is now >= $1, auto-unlock them.
        const updatedUser = await db.user.findUnique({
            where: { id: userId },
            select: { id: true, isActiveMember: true, totalDeposit: true, balance: true }
        });

        if (updatedUser && !updatedUser.isActiveMember && (updatedUser.totalDeposit || 0) >= 1.0) {
            console.log(`[MLM] Auto-unlocking user ${userId} (Deposit Threshold Met)`);
            
            // 1. Deduct $1 Activation Fee from Balance
            if (updatedUser.balance >= 1.0) {
                await db.user.update({
                    where: { id: userId },
                    data: { 
                        balance: { decrement: 1.0 },
                        arnBalance: { decrement: 10.0 } // Optional: also deduct tokens if needed, but usually it's a USD fee
                    }
                });

                // 2. Log Payment Transaction
                await db.transaction.create({
                    data: {
                        userId: userId,
                        amount: 1.0,
                        type: "UNLOCK_FEE",
                        status: "COMPLETED",
                        description: "Automated $1.00 activation fee (Deposit Threshold Met)",
                    }
                });

                // 3. Trigger actual Unlock logic (Distributions, Tiers, etc.)
                await unlockUserAccount(userId, db);
            } else {
                console.warn(`[MLM] User ${userId} reached $1 deposit but balance is insufficient ($${updatedUser.balance}) for auto-unlock.`);
            }
        }

        /* 
           Referral commissions are no longer triggered by deposits.
           They are only triggered by the $1 Account Unlock Fee.
        */
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

        const currentTier = (referrer.tier || "NEWBIE").toUpperCase();
        const validTier = TIER_COMMISSIONS[currentTier] ? currentTier : "NEWBIE";
        const rates = TIER_COMMISSIONS[validTier];
        const rate = level === 1 ? rates.L1 : level === 2 ? rates.L2 : rates.L3;

        console.log(`[MLM] Distributing commission: Earner=${uplineId}, Tier=${validTier}, Level=${level}, Rate=${rate}%`);

        if (rate > 0) {
            const commissionUSD = amount * (rate / 100);
            const commissionARN = commissionUSD * 10;

            // Credit balance (Main or Locked depending on referrer status)
            await db.user.update({
                where: { id: uplineId },
                data: referrer.isActiveMember ? { 
                    arnBalance: { increment: commissionARN },
                    balance: { increment: commissionUSD }
                } : {
                    lockedArnBalance: { increment: commissionARN },
                    lockedBalance: { increment: commissionUSD }
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

        try {
            const { revalidatePath } = await import("next/cache");
            revalidatePath("/dashboard/wallet");
            revalidatePath("/dashboard/profile");
        } catch (e) {}
    }
    
    return totalDistributed;
}

/**
 * Specifically distributes percentages of the $1 activation fee to referrers based on their tiers.
 * Logic: L1 % of $1, L2 % of $1, L3 % of $1
 */
export async function distributeActivationCommissions(sourceUserId: string, db: any): Promise<number> {
    const activationFee = 1.0;
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

        const currentTier = (referrer.tier || "NEWBIE").toUpperCase();
        const validTier = TIER_COMMISSIONS[currentTier] ? currentTier : "NEWBIE";
        const rates = TIER_COMMISSIONS[validTier];
        const rate = level === 1 ? rates.L1 : level === 2 ? rates.L2 : rates.L3;

        if (rate > 0) {
            const amountUSD = activationFee * (rate / 100);
            const amountARN = amountUSD * 10;

            // Always credit main balance and ARN balance
            await db.user.update({
                where: { id: uplineId },
                data: { 
                    arnBalance: { increment: amountARN },
                    balance: { increment: amountUSD }
                }
            });

            await db.referralCommission.create({
                data: {
                    earnerId: uplineId, sourceUserId: sourceUserId,
                    amount: amountUSD, level: level, percentage: rate
                }
            });

            await db.transaction.create({
                data: {
                    userId: uplineId,
                    amount: amountUSD, arnMinted: amountARN,
                    type: "REFERRAL_COMMISSION", status: "COMPLETED", method: "SYSTEM",
                    description: `L${level} Activation Reward (${rate}%) from ${sourceName}`
                }
            });

            totalDistributed += amountUSD;
            console.log(`[MLM] Paid $${amountUSD.toFixed(3)} activation reward (L${level} @ ${rate}%) to ${uplineId}`);
        }
    }
    
    return totalDistributed;
}

/**
 * Tier upgrade check.
 * Per PDF & User Final Logic:
 * - Qualified Tier ARN = Sum of (Signup Bonus, Spins, Referral earnings L1, L2, L3, Deposits, Task Rewards)
 * - Tier rewards (milestone gifts) are EXCLUDED.
 * - Team size requirement uses DIRECT L1 referrals only.
 */
export async function checkTierUpgrade(userId: string, tx?: any) {
    const db = tx || prisma;
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, tier: true, referralCode: true }
    });
    if (!user) return;

    const currentTierIndex = TIER_ORDER.indexOf(user.tier) >= 0 ? TIER_ORDER.indexOf(user.tier) : 0;
    
    // 1. Calculate Qualified ARN from Transaction History
    const qualifiedArn = await calculateQualifiedTierArn(userId, db);

    // 2. Count Direct L1 Referrals only
    let totalDirects = 0;
    if (user.referralCode) {
        totalDirects = await db.user.count({
            where: { referredByCode: user.referralCode }
        });
    }

    const tierRules = DEFAULT_TIER_REQUIREMENTS;

    for (let i = currentTierIndex + 1; i < TIER_ORDER.length; i++) {
        const nextTier = TIER_ORDER[i];
        const threshold = tierRules[nextTier];

        if (qualifiedArn >= threshold.arn && totalDirects >= threshold.directs) {
            console.log(`[MLM] UPGRADE: ${userId} → ${nextTier} (Qualified ARN: ${qualifiedArn}/${threshold.arn}, Directs: ${totalDirects}/${threshold.directs})`);
            
            await db.user.update({ where: { id: userId }, data: { tier: nextTier } });
            await grantTierRewards(userId, nextTier, db);
            
            await db.mLMLog.create({
                data: {
                    userId: userId, type: "TIER_UPGRADE", amount: 0,
                    description: `Upgraded to ${nextTier} (Qualified ARN: ${qualifiedArn}/${threshold.arn}, Directs: ${totalDirects}/${threshold.directs})`
                }
            });
        } else { break; }
    }
}

/**
 * Calculates ARN accumulated from qualified sources only.
 * Tier Milestone Rewards are NOT included.
 */
export async function calculateQualifiedTierArn(userId: string, tx?: any): Promise<number> {
    const db = tx || prisma;
    
    const qualifiedResult = await db.transaction.aggregate({
        where: {
            userId: userId,
            status: "COMPLETED",
            OR: [
                { type: "SIGNUP_BONUS" },
                { type: "REFERRAL_COMMISSION" },
                { type: "TASK_REWARD" },
                { type: "DEPOSIT" },
                { type: "REWARD", method: "SPIN" }
            ]
        },
        _sum: { arnMinted: true }
    });

    return qualifiedResult._sum.arnMinted || 0;
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

    try {
        const { revalidatePath } = await import("next/cache");
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/wallet");
    } catch (e) {}
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

    try {
        const { revalidatePath } = await import("next/cache");
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/wallet");
        revalidatePath("/dashboard/profile");
    } catch (e) {}
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

        try {
            const { revalidatePath } = await import("next/cache");
            revalidatePath("/dashboard");
            revalidatePath("/dashboard/wallet");
        } catch (e) {}
    } catch (error) { console.error("[MLM] checkAccountLock error:", error); }
}