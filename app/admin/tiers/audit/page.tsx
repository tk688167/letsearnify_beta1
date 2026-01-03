import { prisma } from "@/lib/prisma"
import { TIER_RULES, TierLevel } from "@/lib/mlm"
import { CheckCircleIcon, ExclamationTriangleIcon, WrenchIcon } from "@heroicons/react/24/outline"
import { Tier, TierStatus } from "@prisma/client"
import TierAuditTable from "./TierAuditTable"

export default async function TierAuditPage() {
  // Fetch users (LIMIT 50 for performance, could add pagination)
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
       id: true,
       name: true,
       email: true,
       tier: true,
       tierStatus: true,
       points: true,
       activeMembers: true
    }
  })

  // Helper to determine Expected Tier
  const getExpectedTier = (points: number, members: number): { tier: string, status: string } => {
     // Check Top Down
     if (points >= TIER_RULES.EMERALD.points && members >= TIER_RULES.EMERALD.members) return { tier: 'EMERALD', status: 'CURRENT' };
     if (points >= TIER_RULES.DIAMOND.points && members >= TIER_RULES.DIAMOND.members) return { tier: 'DIAMOND', status: 'CURRENT' };
     if (points >= TIER_RULES.PLATINUM.points && members >= TIER_RULES.PLATINUM.members) return { tier: 'PLATINUM', status: 'CURRENT' };
     if (points >= TIER_RULES.GOLD.points && members >= TIER_RULES.GOLD.members) return { tier: 'GOLD', status: 'CURRENT' };
     if (points >= TIER_RULES.SILVER.points && members >= TIER_RULES.SILVER.members) return { tier: 'SILVER', status: 'CURRENT' };
     if (points >= TIER_RULES.BRONZE.points && members >= TIER_RULES.BRONZE.members) return { tier: 'BRONZE', status: 'CURRENT' };
     
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
                users={users.map(u => {
                   const expected = getExpectedTier(u.points, u.activeMembers)
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
