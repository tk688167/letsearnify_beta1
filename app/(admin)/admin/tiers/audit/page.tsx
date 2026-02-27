export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma"
import { getTierRequirements, DEFAULT_TIER_REQUIREMENTS } from "@/lib/mlm"
import { CheckCircleIcon, ExclamationTriangleIcon, WrenchIcon } from "@heroicons/react/24/outline"
import TierAuditTable from "./TierAuditTable"

export default async function TierAuditPage() {
  // Fetch users & rules
  let users = [];
  let tierRules = DEFAULT_TIER_REQUIREMENTS;

  try {
    const [fetchedUsers, fetchedRules] = await Promise.all([
        prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            select: {
                id: true,
                name: true,
                email: true,
                tier: true,
                tierStatus: true,
                arnBalance: true,
                activeMembers: true
            }
        }),
        getTierRequirements(prisma)
    ]);
    
    users = fetchedUsers as any;
    tierRules = fetchedRules;

  } catch (error) {
      console.error("Tier Audit Offline Mode:", error);
      users = [];
  }

  // Helper to determine Expected Tier
  const getExpectedTier = (arn: number, members: number): { tier: string, status: string } => {
     // Safe accessor: falls back to DEFAULT_TIER_REQUIREMENTS if DB is missing a tier row
     const rule = (tier: string) =>
       tierRules[tier] ?? DEFAULT_TIER_REQUIREMENTS[tier] ?? { arn: 0, directs: 0 };

     // Check Top Down using dynamic rules
     if (arn >= rule('EMERALD').arn && members >= rule('EMERALD').directs) return { tier: 'EMERALD', status: 'CURRENT' };
     if (arn >= rule('DIAMOND').arn && members >= rule('DIAMOND').directs) return { tier: 'DIAMOND', status: 'CURRENT' };
     if (arn >= rule('PLATINUM').arn && members >= rule('PLATINUM').directs) return { tier: 'PLATINUM', status: 'CURRENT' };
     if (arn >= rule('GOLD').arn && members >= rule('GOLD').directs) return { tier: 'GOLD', status: 'CURRENT' };
     if (arn >= rule('SILVER').arn && members >= rule('SILVER').directs) return { tier: 'SILVER', status: 'CURRENT' };
     if (arn >= rule('BRONZE').arn && members >= rule('BRONZE').directs) return { tier: 'BRONZE', status: 'CURRENT' };

     return { tier: 'NEWBIE', status: 'CURRENT' };
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
       <div>
         <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Tier Audit &amp; Integrity</h1>
         <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Detect and fix discrepancies between user points/members and their assigned Tier.</p>
       </div>

             <TierAuditTable 
                users={users.map((u: any) => {
                   const expected = getExpectedTier(u.arnBalance, u.activeMembers)
                   return {
                      ...u,
                      tierStatus: u.tierStatus as any || 'CURRENT', // Cast for now
                      expectedTier: expected.tier,
                      isMismatch: u.tier !== expected.tier
                   }
                })} 
             />
       {/* Removed manual table rendering */}
    </div>
  )
}
