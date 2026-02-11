import { TIER_COMMISSIONS, getTierRules } from "@/lib/mlm"
import TierManagementClient from "./TierManagementClient"

export default async function TierPage() {
   // Use static rules since DB model is missing/deprecated
   const rules = await getTierRules(); 

   // Convert rules object to array for the client component
   const tierOrder = ['NEWBIE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'EMERALD'];
   const tiers = tierOrder.map(tier => ({
       id: tier,
       tier: tier,
       points: rules[tier]?.arn || 0,
       members: rules[tier]?.directs || 0,
       levels: [
          TIER_COMMISSIONS[tier]?.L1 || 0,
          TIER_COMMISSIONS[tier]?.L2 || 0,
          TIER_COMMISSIONS[tier]?.L3 || 0
       ]
   }));

   return (
     <TierManagementClient tiers={tiers} />
   )
}
