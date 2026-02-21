export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ReferralView from "./referral-view"
import { getTierRules } from "@/lib/mlm"
import { getMlmData } from "@/lib/services/mlm-service"

export default async function ReferralsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  let tierConfig = await getTierRules();
  const { user, referralTree, stats, isOffline } = await getMlmData(session.user.id);
 
  let displayUser = user;
  
  // Anti-Gravity: Handle Super Admin
  if (!displayUser && session.user.id === "super-admin-id") {
      displayUser = {
          name: "Super Admin",
          tier: "EMERALD",
          arnBalance: 1000,
          referralCode: "SUPER-ADMIN",
          balance: 5000,
          activeMembers: 0,
          referralsMade: []
      } as any;
      stats.teamSize = 0;
      stats.totalEarnings = 5000;
  }

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
             arnBalance: displayUser.arnBalance,
             referralCode: displayUser.referralCode,
             balance: displayUser.balance
          }}
          stats={{
             teamSize: displayUser.activeMembers || stats.teamSize, // Use DB count if available (handles admin overrides), else tree
             totalEarnings: stats.totalEarnings,
             todayEarnings: stats.todayEarnings
          }}
          tierConfig={tierConfig}
          referralTree={referralTree.map(n => ({
             id: n.id,
             name: n.name,
             email: n.email,
             tier: n.tier,
             arnBalance: n.points || 0, // Fallback if n.points exists in tree or n.arnBalance
             createdAt: n.createdAt,
             level: n.level
          }))}
          commissions={displayUser.referralsMade?.map((c: any) => ({
             id: c.id,
             amount: c.amount,
             level: c.level,
             sourceUser: c.sourceUser,
             createdAt: c.createdAt
          })) || []}
       />
    </div>
  )
}
