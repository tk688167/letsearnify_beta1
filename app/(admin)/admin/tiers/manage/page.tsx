import { prisma } from "@/lib/prisma"
import { TIER_COMMISSIONS, DEFAULT_TIER_REQUIREMENTS } from "@/lib/mlm"
import TierManagementClient from "./TierManagementClient"

export default async function TierPage() {
   // Fetch dynamic rules from DB
   const dbTiers = await prisma.tierConfiguration.findMany();
   
   // Create map for easy lookup
   const tierMap = new Map(dbTiers.map(t => [t.tier, t]));

   const tierOrder = ['NEWBIE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'EMERALD'];
   
   const tiers = tierOrder.map(tier => {
       const config = tierMap.get(tier);
       // If config exists, use its ID and values. 
       // If not, use static default values but we can't provide a DB ID yet (unless we create them on the fly, but for now we fallback)
       // The update action now handles "Name" based updates if ID fails, so we can pass the Name as ID if config is missing.
       
       const defaultReqs = DEFAULT_TIER_REQUIREMENTS[tier] || { arn: 0, directs: 0 };
       
       return {
           id: config?.id || tier, // Use DB ID if available, else Tier Name
           tier: tier,
           points: config?.requiredArn ?? defaultReqs.arn,
           members: config?.members ?? defaultReqs.directs,
           levels: [
              TIER_COMMISSIONS[tier]?.L1 || 0,
              TIER_COMMISSIONS[tier]?.L2 || 0,
              TIER_COMMISSIONS[tier]?.L3 || 0
           ]
       }
   });

   return (
     <TierManagementClient tiers={tiers} />
   )
}
