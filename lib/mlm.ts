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

/**
 * Main Entry Point: Process a New USD Deposit
 * This replaces the old processMlmDeposit and matches the finalizeDeposit signature.
 * 
 * 1. Mint ARN Tokens (System Power)
 * 2. Update User's Active Status (Handled in mintArnForDeposit now roughly, but double checked here)
 * 3. Distribute 3-Level MLM Commissions (USD)
 * 4. Check for Tier Upgrades (Upline & Self)
 */
export async function finalizeDeposit(userId: string, amount: number, txId: string, description: string = "", tx?: any) {
    console.log(`[MLM] Finalizing deposit of $${amount} for user ${userId}. TX: ${txId}`);
    const db = tx || prisma;

    // 1. Mint ARN Tokens (Power) - Pass db client
    try {
        await mintArnForDeposit(userId, amount, txId, db);
    } catch (e) {
        console.error("[MLM] Token Minting Failed", e);
        throw e;
    }

    // 2. Activate User if >= $1 (Redundant if mintArn does it, but safer here too if logic varies)
    if (amount >= 1.0) {
        await db.user.update({
            where: { id: userId },
            data: { isActiveMember: true }
        });
    }

    // 3. Distribute Commissions (USD)
    await distributeCommissions(userId, amount, db);

    // 4. Check Upgrade for the User (Self)
    await checkTierUpgrade(userId, db);
}

// Alias for backward compatibility if needed, though we should prefer finalizeDeposit
export const processMlmDeposit = async (userId: string, amount: number, txId: string) => {
    return finalizeDeposit(userId, amount, txId, "Legacy Process Call");
};

/**
 * Distributes USD commissions up 3 levels based on the referrer's Tier.
 */
async function distributeCommissions(sourceUserId: string, amount: number, db: any) {
    // Fetch Upline Tree
    const tree = await db.referralTree.findUnique({
        where: { userId: sourceUserId },
        include: {
            user: { select: { name: true } }
        }
    });

    if (!tree) return;

    const uplineIds = [tree.advisorId, tree.supervisorId, tree.managerId].filter((id: string | null) => id !== null) as string[];

    for (let i = 0; i < uplineIds.length; i++) {
        const uplineId = uplineIds[i];
        const level = i + 1; // 1, 2, 3

        // Fetch Referrer's Tier
        const referrer = await db.user.findUnique({
            where: { id: uplineId },
            select: { id: true, tier: true, activeMembers: true, arnBalance: true }
        });

        if (!referrer) continue;

        // Calculate Rate based on THEIR tier
        const validTier = TIER_COMMISSIONS[referrer.tier] ? referrer.tier : "NEWBIE";
        const rates = TIER_COMMISSIONS[validTier];
        const rate = level === 1 ? rates.L1 : level === 2 ? rates.L2 : rates.L3;

        if (rate > 0) {
            const commissionUSD = amount * (rate / 100);
            const commissionARN = commissionUSD * 10; // 1 USD = 10 ARN
            
            // PAY THE USER (ARN)
            await db.user.update({
                where: { id: uplineId },
                data: { arnBalance: { increment: commissionARN } }
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

            console.log(`[MLM] Paid $${commissionUSD} (L${level} @ ${rate}%) to ${uplineId}`);
            
            // Check upgrade for upline (activity based)
            await checkTierUpgrade(uplineId, db);
        }
    }
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
            referrals: { 
                where: { isActiveMember: true },
                select: { id: true } 
            }
        }
    });

    if (!user) return;

    // Determine current tier index
    const currentTierIndex = TIER_ORDER.indexOf(user.tier) >= 0 ? TIER_ORDER.indexOf(user.tier) : 0;
    
    // Count active directs
    // Since we selected `referrals`, we can count them. 
    // Note: In large scale, use _count, but here we need to be careful with transaction support for _count if not standard.
    // Standard prisma supports _count in findUnique select.
    // Let's stick to array length if fetched, or _count if supported.
    // The previous code used _count. Let's use it for efficiency.
    // Re-fetching with _count to be safe/consistent with db client type
    const userCount = await db.user.findUnique({
        where: { id: userId },
        select: {
            _count: {
                select: { referrals: { where: { isActiveMember: true } } }
            }
        }
    });
    
    const activeDirects = userCount?._count?.referrals || 0;
    const currentArn = user.arnBalance;

    // Check next tiers
    const tierRules = await getTierRequirements(db);

    for (let i = currentTierIndex + 1; i < TIER_ORDER.length; i++) {
        const nextTier = TIER_ORDER[i];
        const reqs = tierRules[nextTier] || DEFAULT_TIER_REQUIREMENTS[nextTier];

        if (currentArn >= reqs.arn && activeDirects >= reqs.directs) {
            // QUALIFIED! Upgrade.
            console.log(`[MLM] UPGRADE: User ${userId} promoted to ${nextTier}`);
            
            await db.user.update({
                where: { id: userId },
                data: { tier: nextTier }
            });
            
            await db.mLMLog.create({
                data: {
                    userId: userId,
                    type: "TIER_UPGRADE",
                    amount: 0,
                    description: `Upgraded to ${nextTier} (ARN: ${currentArn}, Directs: ${activeDirects})`
                }
            });
        } else {
            break;
        }
    }
}

/**
 * Helper: Refreshes specific user stats if needed (e.g. active members count)
 * Can be called periodically or on login
 */
export async function refreshUserMlmStats(userId: string) {
    const user = await prisma.user.findUnique({where: {id: userId}});
    if (!user) return;

    const activeRefs = await prisma.user.count({
        where: {
            referredByCode: { equals: user.referralCode },
            isActiveMember: true
        }
    });

    await prisma.user.update({
        where: { id: userId },
        data: { activeMembers: activeRefs }
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
            data: { arnBalance: { increment: amount } }
        });
    }
    await checkTierUpgrade(userId, db);
}

export async function getTierRules() {
    return await getTierRequirements(prisma);
}
