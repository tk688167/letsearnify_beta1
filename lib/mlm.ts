import { PrismaClient, Tier, TierStatus } from "@prisma/client"

const prisma = new PrismaClient()

// --- Tier Configuration ---
// Values represent the ENTRY requirement for that tier
// BOTH Points AND Active Members must be met.
export const TIER_RULES = {
  NEWBIE: { 
    points: 0,
    members: 0,
    levels: [0.05, 0.03, 0.02] 
  },
  BRONZE: { 
    points: 150,
    members: 50, 
    levels: [0.10, 0.06, 0.04] 
  },
  SILVER: { 
    points: 350,
    members: 150,
    levels: [0.12, 0.08, 0.05] 
  },
  GOLD: { 
    points: 700,
    members: 300,
    levels: [0.15, 0.10, 0.05] 
  },
  PLATINUM: { 
    points: 1500,
    members: 650,
    levels: [0.18, 0.12, 0.05] 
  },
  DIAMOND: { 
    points: 3500,
    members: 1400,
    levels: [0.20, 0.15, 0.05] 
  },
  EMERALD: { 
    points: 8000, 
    members: 3000,
    levels: [0.30, 0.10, 0.05]
  }
}

export type TierLevel = keyof typeof TIER_RULES;

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
  
  // Logic: Check highest tier first
  let newTier: Tier = user.tier;
  let newStatus: TierStatus = user.tierStatus || 'CURRENT'; // Default if null

  // Helper to check criteria
  const qualifies = (tier: TierLevel) => 
     currentPoints >= TIER_RULES[tier].points && activeMembers >= TIER_RULES[tier].members;

  // STRICT UPGRADE PATH
  if (user.tier === 'NEWBIE') {
      if (currentPoints >= 150 && activeMembers >= 50) {
          newTier = 'BRONZE';
          newStatus = 'CURRENT'; // Start of Bronze is CURRENT
          // Mark previous as completed? DB doesn't store history in User model, just current tier.
      }
  } else if (user.tier === 'BRONZE') {
      if (currentPoints >= 350 && activeMembers >= 150) {
          newTier = 'SILVER';
          newStatus = 'CURRENT';
      }
  } else if (user.tier === 'SILVER') {
        if (currentPoints >= 700 && activeMembers >= 300) {
            newTier = 'GOLD';
            newStatus = 'CURRENT';
        }
  } else if (user.tier === 'GOLD') {
        if (currentPoints >= 1500 && activeMembers >= 650) {
            newTier = 'PLATINUM';
            newStatus = 'CURRENT';
        }
  } else if (user.tier === 'PLATINUM') {
        if (currentPoints >= 3500 && activeMembers >= 1400) {
            newTier = 'DIAMOND';
            newStatus = 'CURRENT';
        }
  } else if (user.tier === 'DIAMOND') {
        if (currentPoints >= 8000 && activeMembers >= 3000) {
            newTier = 'EMERALD';
            newStatus = 'CURRENT';
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
     const tierRules = TIER_RULES[referrer.tier as TierLevel] || TIER_RULES.NEWBIE;
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
    if (!user.isActiveMember && user.totalDeposit >= 1.0) {
        // Mark as Active
        await prisma.user.update({
            where: { id: userId },
            data: { isActiveMember: true }
        });

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
