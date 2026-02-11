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
     // Check Top Down using dynamic rules
     if (arn >= tierRules.EMERALD.arn && members >= tierRules.EMERALD.directs) return { tier: 'EMERALD', status: 'CURRENT' };
     if (arn >= tierRules.DIAMOND.arn && members >= tierRules.DIAMOND.directs) return { tier: 'DIAMOND', status: 'CURRENT' };
     if (arn >= tierRules.PLATINUM.arn && members >= tierRules.PLATINUM.directs) return { tier: 'PLATINUM', status: 'CURRENT' };
     if (arn >= tierRules.GOLD.arn && members >= tierRules.GOLD.directs) return { tier: 'GOLD', status: 'CURRENT' };
     if (arn >= tierRules.SILVER.arn && members >= tierRules.SILVER.directs) return { tier: 'SILVER', status: 'CURRENT' };
     if (arn >= tierRules.BRONZE.arn && members >= tierRules.BRONZE.directs) return { tier: 'BRONZE', status: 'CURRENT' };
     
     return { tier: 'NEWBIE', status: 'CURRENT' };
  }

  return (
    <div className="p-8 space-y-8">
       <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tier Audit & Integrity</h1>
            <p className="text-gray-500">Detect and fix discrepancies between user points/members and their assigned Tier.</p>
          </div>
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
