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
 
  if (!user && !isOffline) redirect("/login")
  
  // Offline Fallback for Tier Config if needed (though getTierRules is likely static/lib)
  if (isOffline && !tierConfig) {
       tierConfig = { 
          NEWBIE: { points: 0, members: 0, levels: [1] }, 
          // ... minimal fallback
       } as any;
  }
  
  const teamSize = stats.teamSize;

  return (
    <div className="p-4 md:p-10 min-h-screen bg-gray-50/50">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
             <h1 className="text-3xl font-serif font-bold text-gray-900">Partner Program</h1>
             <p className="text-gray-500 mt-1">Track your team, earnings, and progress to the next tier.</p>
          </div>
       </div>

       <ReferralView 
          user={{
             name: user.name,
             tier: user.tier,
             arnBalance: user.arnBalance,
             referralCode: user.referralCode,
             balance: user.balance
          }}
          stats={{
             teamSize: user.activeMembers || stats.teamSize, // Use DB count if available (handles admin overrides), else tree
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
          commissions={user.referralsMade.map((c: any) => ({
             id: c.id,
             amount: c.amount,
             level: c.level,
             sourceUser: c.sourceUser,
             createdAt: c.createdAt
          }))}
       />
    </div>
  )
}
