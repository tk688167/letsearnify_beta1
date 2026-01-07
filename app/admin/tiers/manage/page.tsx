import { prisma } from "@/lib/prisma"
import TierManagementClient from "./TierManagementClient"
import { getTierRules } from "@/lib/mlm"

// Ensure we have access to the seed logic if needed via getTierRules()
// But for management, we want IDs, so we query Prisma directly.

export default async function TierPage() {
   // Ensure DB is seeded properly first
   await getTierRules(); 

   const tiers = await prisma.tierConfiguration.findMany({
      orderBy: { points: 'asc' }
   })

   // Define custom order
   const tierOrder = ['NEWBIE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'EMERALD'];
   const sortedTiers = tiers.sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));

   return (
     <TierManagementClient tiers={sortedTiers.map(t => ({
        id: t.id,
        tier: t.tier,
        points: t.points,
        members: t.members,
        levels: t.levels
     }))} />
   )
}
