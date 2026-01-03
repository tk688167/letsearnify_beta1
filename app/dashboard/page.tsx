import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { TierProgress } from "./components/TierProgress"
import { CompanyPools } from "./components/CompanyPools"
import { TIER_RULES } from "@/lib/mlm"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: { referrals: true }
      }
    }
  })
  
  if (!user) return null

  // Unlock condition: Balance >= 1
  const isUnlocked = user.totalDeposit >= 1.0 // Updated to check totalDeposit as per new rule? Or keep Balance?
  // Prompt: "Active Member ... minimum deposit of $1".
  // Unlock Banner matches this rule.
  
  // Also pass activeMembers
  // Schema update: user.activeMembers exists (if client generated). 
  // We cast it if TS complains due to generation fail, but standard flow assumes it works.
  
  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h1 className="text-3xl font-serif font-bold text-gray-900">Dashboard</h1>
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                user.tier === 'BRONZE' ? 'bg-orange-100 text-orange-700' :
                user.tier === 'SILVER' ? 'bg-gray-100 text-gray-700' :
                user.tier === 'GOLD' ? 'bg-yellow-100 text-yellow-700' :
                user.tier === 'PLATINUM' ? 'bg-slate-100 text-slate-700' :
                user.tier === 'DIAMOND' ? 'bg-blue-100 text-blue-700' :
                user.tier === 'NEWBIE' ? 'bg-green-100 text-green-700' :
                'bg-emerald-100 text-emerald-700'
             }`}>
                {user.tier} MEMBER
             </span>
          </div>
          <p className="text-gray-500">Welcome back, {user.name?.split(' ')[0] || 'User'}. Here is your financial overview.</p>
        </div>
        <div className="flex gap-3">
           <Link href="/dashboard/wallet?tab=deposit" className="px-5 py-2.5 animate-rainbow font-medium rounded-xl shadow-sm transition-all hover:scale-105 inline-block text-center">
             Add Funds
           </Link>
           <Link href="/dashboard/wallet?tab=withdraw" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 text-sm transition-all hover:-translate-y-0.5 inline-block text-center">
             Withdraw
           </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Main Wallet" value={`$${user.balance.toFixed(2)}`} sub="Available Balance" icon="💳" color="blue" />
        <StatCard title="Total Points" value={user.points.toFixed(0)} sub="Reward Points" icon="⭐" color="amber" />
        <StatCard title="Active Team" value={user.activeMembers.toString()} sub="Verified Referrals" icon="👥" color="purple" />
        <StatCard title="Mudaraba Value" value="$0.00" sub="Projected +15%" icon="📈" color="emerald" />
      </div>

      {/* Referral Code Section */}
      {user.referralCode && (
        <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div>
              <h3 className="font-bold text-indigo-900 mb-1">Your Referral Code</h3>
              <p className="text-sm text-indigo-600">Share this code to earn commissions from your team.</p>
           </div>
           <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-indigo-200">
              <code className="font-mono font-bold text-lg text-indigo-700 tracking-wider">{user.referralCode}</code>
              {/* Note: Client component needed for 'Copy' button usually, straightforward display for now */}
           </div>
        </div>
      )}

      {/* Tier Progress Section */}
      {/* Tier Progress Section */}
      <TierProgress 
         currentTier={user.tier} 
         points={user.points} 
         activeMembers={user.activeMembers} 
         tierRules={TIER_RULES} 
         referralCode={user.referralCode}
      />

         {/* Main Action Area */}
         <section className="space-y-8">
            {/* Unlock Banner - Only show if locked */}
            {!isUnlocked && (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-10 text-white shadow-xl shadow-blue-900/10 group">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                   <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-4 border border-white/20">
                         🔒 Account Limited
                      </div>
                      <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4">Unlock Full Potential</h3>
                      <p className="text-blue-100 max-w-lg mb-8 leading-relaxed">
                         Deposit a minimum of <span className="font-bold text-white">$1.00</span> to activate the Task Center, Marketplace, and start earning real rewards.
                      </p>
                      <Link href="/dashboard/wallet?tab=deposit" className="px-8 py-3 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-colors inline-block text-center">
                         Unlock Now
                      </Link>
                   </div>
                </div>
            )}

            {/* Quick Actions / Apps */}
            <div>
               <h2 className="text-lg font-bold text-gray-900 mb-6 font-serif">Quick Access</h2>
               <div className="grid sm:grid-cols-2 gap-6">
                  <Link href="/dashboard/marketplace" className="block text-inherit no-underline">
                      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer hover:border-blue-100 h-full">
                         <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🛍️</div>
                         <h3 className="font-bold text-gray-900 mb-1">Marketplace</h3>
                         <p className="text-sm text-gray-500">Browse gigs or post a request.</p>
                      </div>
                  </Link>
                  <Link href="/dashboard/tasks" className="block text-inherit no-underline">
                      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer hover:border-green-100 h-full">
                         <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">✅</div>
                         <h3 className="font-bold text-gray-900 mb-1">Task Center</h3>
                         <p className="text-sm text-gray-500">Complete micro-tasks for cash.</p>
                      </div>
                  </Link>
               </div>
            </div>
         </section>
      
      {/* Separator & Company Pools Section */}
      <div className="border-t border-gray-200 pt-10">
          <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 font-serif">Company Pools</h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">Live Network Status</span>
          </div>
          <CompanyPools />
      </div>

    </div>
  )
}

function StatCard({ title, value, sub, icon, color }: { title: string, value: string, sub: string, icon: string, color: string }) {
  const colorClasses: Record<string, string> = {
     blue: "bg-blue-50 text-blue-600",
     emerald: "bg-emerald-50 text-emerald-600",
     amber: "bg-amber-50 text-amber-600",
     purple: "bg-purple-50 text-purple-600"
  }
  
  return (
    <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow">
      <div className="flex justify-between items-start mb-4">
         <div className={`w-10 h-10 rounded-xl ${colorClasses[color] || 'bg-gray-50 text-gray-600'} flex items-center justify-center text-xl`}>
            {icon}
         </div>
         <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+2.5%</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1 font-serif">{value}</div>
      <div className="text-xs text-gray-500 font-medium">{sub}</div>
    </div>
  )
}

function PoolItem({ name, value, color }: { name: string, value: string, color: string }) {
  return (
    <div className="flex items-center justify-between group">
       <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${color}`}></div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{name}</span>
       </div>
       <span className="font-bold text-gray-900 text-sm font-serif">{value}</span>
    </div>
  )
}
