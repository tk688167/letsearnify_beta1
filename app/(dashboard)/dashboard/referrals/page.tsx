export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ReferralView from "./referral-view"
import { getTierRules } from "@/lib/mlm"
import { getMlmData } from "@/lib/services/mlm-service"
import { FeatureGuard } from "../FeatureGuard";

export default async function ReferralsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  let tierConfig = await getTierRules();
  const { user, referralTree, stats, isOffline } = await getMlmData(session.user.id);
 
  let displayUser = user;
  

  if (!displayUser && !isOffline) redirect("/login")

  
  // Offline Fallback for Tier Config if needed (though getTierRules is likely static/lib)
  if (isOffline && !tierConfig) {
       tierConfig = { 
          NEWBIE: { points: 0, members: 0, levels: [1] }, 
          // ... minimal fallback
       } as any;
  }
  
  const teamSize = stats.teamSize;

  return (
    <div className="p-4 md:p-10 min-h-screen bg-background">

         <ReferralView 
            user={{
               name: displayUser.name,
               tier: displayUser.tier,
               arnBalance: displayUser.arnBalance || 0,
               referralCode: displayUser.referralCode,
               balance: displayUser.balance
            }}
            stats={{
               teamSize: stats.teamSize, // total active network from mlm-service
               totalEarnings: stats.totalEarnings,
               todayEarnings: stats.todayEarnings
            }}
            tierConfig={tierConfig}
            referralTree={referralTree.map(n => ({
               id: n.id,
               name: n.name,
               email: n.email,
               tier: n.tier,
               arnBalance: n.arnBalance ?? 0,
               isActiveMember: !!n.isActiveMember,
               lastUnlockAt: n.lastUnlockAt,
               createdAt: n.createdAt,
               level: n.level,
               withdrawnTotal: n.withdrawnTotal || 0
            }))}
            commissions={displayUser.referralsMade?.map((c: any) => ({
               id: c.id,
               amount: c.amount,
               level: c.level,
               percentage: c.percentage,
               sourceUserId: c.sourceUserId,
               sourceUser: c.sourceUser,
               sourceUserWithdrawn: c.sourceUserWithdrawn || 0,
               txDescription: c.txDescription,
               txArnMinted: c.txArnMinted || 0,
               txStatus: c.txStatus || "COMPLETED",
               txMethod: c.txMethod,
               txCreatedAt: c.txCreatedAt || c.createdAt,
               createdAt: c.createdAt
            })) || []}
         />
      </div>
  )
}
