import { Tier, TierStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// --- Tier Configuration ---
// Values represent the ENTRY requirement for that tier
// BOTH Points AND Active Members must be met.

export const DEFAULT_TIER_RULES = {
  NEWBIE: { points: 0, members: 0, levels: [0.05, 0.03, 0.02] },
  BRONZE: { points: 200, members: 50, levels: [0.10, 0.06, 0.04] },
  SILVER: { points: 350, members: 150, levels: [0.12, 0.08, 0.05] },
  GOLD: { points: 700, members: 300, levels: [0.15, 0.10, 0.05] },
  PLATINUM: { points: 1500, members: 650, levels: [0.18, 0.12, 0.05] },
  DIAMOND: { points: 3500, members: 1400, levels: [0.20, 0.15, 0.05] },
  EMERALD: { points: 8000, members: 3000, levels: [0.30, 0.10, 0.05] }
}

export type TierLevel = keyof typeof DEFAULT_TIER_RULES;
export type TierRules = typeof DEFAULT_TIER_RULES;

/**
 * Fetches the active Tier Configuration from the DB.
 * If no config exists, it seeds the DB with DEFAULT_TIER_RULES.
 */
export async function getTierRules() {
  // 1. Try to fetch from DB
  const configs = await prisma.tierConfiguration.findMany();
  
  // 2. If exists, format and return
  if (configs.length > 0) {
     const rules: Record<string, any> = {};
     configs.forEach(c => {
        rules[c.tier] = {
           points: c.points,
           members: c.members,
           levels: c.levels
        }
     });
     return rules as typeof DEFAULT_TIER_RULES;
  }

  // 3. If empty, Seed and Return
  console.log("Seeding Tier Configurations...");
  for (const [key, value] of Object.entries(DEFAULT_TIER_RULES)) {
      await prisma.tierConfiguration.create({
          data: {
              tier: key as Tier,
              points: value.points,
              members: value.members,
              levels: value.levels
          }
      });
  }
  return DEFAULT_TIER_RULES;
}

// Keep TIER_RULES as a deprecated export for now to avoid breaking imports immediately, 
// BUT IT WILL BE STATIC. We will remove usages gradually.
export const TIER_RULES = DEFAULT_TIER_RULES; 


// --- Helper Functions ---

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Checks if a user qualifies for a tier upgrade and upgrades them if so.
 * IMPORTANT: Upgrade happens ONLY when BOTH Points AND Active Members limit are met.
 */
export async function checkAndUpgradeTier(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) return;

  const currentPoints = user.points;
  const activeMembers = user.activeMembers; 
  
  // FETCH DYNAMIC RULES
  const RULES = await getTierRules();

  // Logic: Check highest tier first
  let newTier: Tier = user.tier;
  
  // Helper to check criteria
  const qualifies = (tier: TierLevel) => 
     currentPoints >= RULES[tier].points && activeMembers >= RULES[tier].members;

  // STRICT UPGRADE PATH - Dynamic Check
  // We check in REVERSE order to find the highest qualified tier
  const tierOrder: TierLevel[] = ['EMERALD', 'DIAMOND', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'];
  
  for (const t of tierOrder) {
      if (qualifies(t)) {
          // Verify we are actually upgrading (e.g. don't downgrade or stay same unless we want to support that)
          // For now, only upgrade if 't' is higher than current 'user.tier'.
          // Simple way: assign if qualified, and rely on the fact we check highest first.
          // However, we need to know if t > user.tier.
          
          const tiers = ['NEWBIE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'EMERALD'];
          if (tiers.indexOf(t) > tiers.indexOf(user.tier)) {
             newTier = t;
             break; // Found highest qualification
          }
      }
  }

  if (newTier !== user.tier) {
    await prisma.user.update({
      where: { id: userId },
      data: { 
          tier: newTier,
          tierStatus: 'CURRENT' // New tier starts as CURRENT
      }
    })
    
    // Log change
    await prisma.mLMLog.create({
      data: {
        userId: userId,
        type: "TIER_UPGRADE",
        description: `Upgraded from ${user.tier} to ${newTier} (Points: ${currentPoints}, Active Members: ${activeMembers})`,
        amount: 0
      }
    })

    // Check for Royalty Qualification (GOLD+)
    const royaltyTiers: Tier[] = ['GOLD', 'PLATINUM', 'DIAMOND', 'EMERALD'];
    if (royaltyTiers.includes(newTier)) {
        await prisma.mLMLog.create({
            data: {
                userId: userId,
                type: "ROYALTY_QUALIFICATION",
                description: `User qualified for Royalty Pool (Reached ${newTier})`,
                amount: 0
            }
        });
    }
  }
}

/**
 * Distributes referral commissions for a deposit amount up to 3 levels using optimized ReferralTree.
 */
export async function distributeReferralCommission(depositorId: string, amount: number) {
  // 1. Get the upline using ReferralTree
  const tree = await prisma.referralTree.findUnique({
    where: { userId: depositorId }
  });

  if (!tree) return; // No upline

  const uplineIds = [tree.advisorId, tree.supervisorId, tree.managerId];

  // 2. Iterate and Distribute
  for (let i = 0; i < uplineIds.length; i++) {
     const referrerId = uplineIds[i];
     const level = i + 1;

     if (!referrerId) continue;

     // Fetch Referrer
     const referrer = await prisma.user.findUnique({
        where: { id: referrerId }
     });

     if (!referrer) continue;

     // Calculate Commission based on REFERRER's Tier
     const RULES = await getTierRules();
     const tierRules = RULES[referrer.tier as TierLevel] || RULES.NEWBIE;
     const percentage = tierRules.levels[i] || 0; // level 1 is index 0

     if (percentage > 0) {
        const rawCommission = amount * percentage;
        const cbspFee = rawCommission * 0.05; // 5% Deduction
        const netCommission = rawCommission - cbspFee;

        // 1. Update User Balance (Net Commission)
        await prisma.user.update({
           where: { id: referrer.id },
           data: { balance: { increment: netCommission } }
        });

        // 2. Fund the CBSP Pool
        await prisma.pool.upsert({
            where: { name: 'CBSP' },
            update: { balance: { increment: cbspFee } },
            create: { name: 'CBSP', balance: cbspFee }
        });

        // 3. Record User Transaction (Net)
        await prisma.transaction.create({
           data: {
              userId: referrer.id,
              amount: netCommission,
              type: "REFERRAL_COMMISSION",
              status: "COMPLETED",
              method: "SYSTEM",
              description: `Level ${level} commission ($${rawCommission.toFixed(2)} - 5% CBSP Fee)`
           }
        });

        // 4. Record Detailed Log (Full Amount for Reference, or Net? usually Net for accounting)
        await prisma.referralCommission.create({
           data: {
              earnerId: referrer.id,
              sourceUserId: depositorId,
              amount: netCommission, 
              level: level,
              percentage: percentage * 100
           }
        });

         // 5. MLM System Log
         await prisma.mLMLog.create({
            data: {
               userId: referrer.id,
               type: "COMMISSION",
               amount: netCommission,
               description: `Earned $${netCommission.toFixed(2)} (Level ${level}) after 5% CBSP fee`
            }
         });
         
         // 6. Log Pool Contribution
         await prisma.mLMLog.create({
            data: {
                userId: "SYSTEM", // System log
                type: "POOL_CONTRIBUTION",
                amount: cbspFee,
                description: `CBSP contribution from User ${referrer.id} commission (Deposit by ${depositorId})`
            } 
         });
     }
  }
}

import { processRoyaltyContribution } from "@/lib/royalty";

/**
 * Handle new deposit event for MLM logic:
 * 1. Update User's total deposit.
 * 2. Check Active Member Status ($1 rule).
 * 3. Update active member counts for upline.
 * 4. Trigger Tier Upgrade Checks.
 */
export async function processDeposit(userId: string, amount: number) {
    // 1. Update Total Deposit
    const user = await prisma.user.update({
        where: { id: userId },
        data: { totalDeposit: { increment: amount } }
    });

    // 2. Check for Active Member Qualification
    // Logic: If they weren't active before, and now have >= $1, they just activated.
    // NOTE: The activation fee is effectively the first $1 of their total deposits.
    if (!user.isActiveMember && user.totalDeposit >= 1.0) {
        // Mark as Active
        await prisma.user.update({
            where: { id: userId },
            data: { isActiveMember: true }
        });

        // TRIGGER ROYALTY POOL CONTRIBUTION
        // "Whenever a user deposits $1 to unlock... 5% of that $1 is added"
        // We only contribute ONCE upon activation.
        await processRoyaltyContribution(userId, 1.0); // Fixed $1 basis

        // 3. Find Referrer and Increment Active Active Members
        // We use the ReferralTree to find the direct upline (advisorId)
        const tree = await prisma.referralTree.findUnique({
            where: { userId }
        });

        if (tree?.advisorId) {
            await prisma.user.update({
                where: { id: tree.advisorId },
                data: { activeMembers: { increment: 1 } }
            });

            // 4. Check Referrer for Tier Upgrade
            await checkAndUpgradeTier(tree.advisorId);
        }
    }
}

/**
 * Adds points to a user (e.g. from Tasks or Investments) and checks for tier upgrade.
 */
export async function addUserPoints(userId: string, points: number) {
  await prisma.user.update({
    where: { id: userId },
    data: { points: { increment: points } }
  });
  
  await checkAndUpgradeTier(userId);
}
