import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  ArrowLeftIcon, BanknotesIcon, UserGroupIcon, 
  WalletIcon, DocumentTextIcon, CheckBadgeIcon,
  ShoppingCartIcon, ArrowPathIcon, TrophyIcon, StarIcon, ShieldCheckIcon
} from "@heroicons/react/24/outline"
import { format } from "date-fns"

export default async function AdminUserInfoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.email || session.user.role !== "ADMIN") redirect("/dashboard")

  const { id } = await params
  
  // 1. Fetch Primary User Data
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      mudarabahInvestments: { include: { pool: true } }
    }
  })

  if (!user) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800">
         <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Not Found</h2>
         <Link href="/admin/users" className="text-blue-500 hover:underline mt-4 inline-block">Return to Management</Link>
      </div>
    )
  }

  // 2. Fetch Aggregated Statistics concurrently
  const [
    totalWithdrawalsAgg,
    taskCompletionsAgg,
    referralCommissionsAgg,
    recentTransactions,
    teamMembers
  ] = await Promise.all([
    // Total Withdrawals
    prisma.transaction.aggregate({
      where: { userId: id, type: "WITHDRAWAL", status: "COMPLETED" },
      _sum: { amount: true }
    }),
    // Earnings from Tasks
    prisma.taskCompletion.aggregate({
      where: { userId: id, status: "APPROVED" },
      _sum: { pointsEarned: true } // Assuming points are equivalent to earnings or mapping needed
    }),
    // Earnings from Referrals
    prisma.referralCommission.aggregate({
      where: { earnerId: id },
      _sum: { amount: true }
    }),
    // Recent Transactions
    prisma.transaction.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 20
    }),
    // Team Members
    prisma.user.findMany({
      where: { referredByCode: user.referralCode },
      select: {
        id: true,
        name: true,
        email: true,
        tier: true,
        createdAt: true,
        isActiveMember: true,
        mudarabahInvestments: {
          where: { status: 'ACTIVE' },
          select: { id: true, amount: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  ])

  // Extract Gig setup for team members efficiently
  const teamIds = teamMembers.map(tm => tm.id)
  const teamGigs = await prisma.gig.groupBy({
    by: ['sellerId'],
    where: { sellerId: { in: teamIds } },
    _count: { id: true }
  })
  
  // Create a map for quick Gig lookups
  const gigMap = new Map(teamGigs.map(g => [g.sellerId, g._count.id]))

  // 3. Transform & Calculate the UI variables
  const totalWithdrawn = totalWithdrawalsAgg._sum.amount || 0
  const earningsFromTasks = taskCompletionsAgg._sum.pointsEarned || 0 // Verify if pointsearned is USD
  const earningsFromReferrals = referralCommissionsAgg._sum.amount || 0
  
  const activeMudarabahInvestments = user.mudarabahInvestments.filter((inv: any) => inv.status === "ACTIVE")
  const earningsFromMudarabah = user.mudarabahInvestments.reduce((sum: number, inv: any) => sum + inv.profitEarned, 0)
  const totalMudarabahActiveAmount = activeMudarabahInvestments.reduce((sum: number, inv: any) => sum + inv.amount, 0)
  
  const totalLifetimeEarnings = earningsFromTasks + earningsFromReferrals + earningsFromMudarabah

  const activeTeamCount = teamMembers.filter(tm => tm.isActiveMember).length

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* ----------------- SECTION 1: HEADER & CORE ID ----------------- */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 mix-blend-multiply rounded-full blur-3xl -z-0 transform translate-x-1/2 -translate-y-1/2" />
        
        <div className="flex items-start gap-4 sm:gap-6 relative z-10 w-full md:w-auto">
          <Link href="/admin/users" className="p-2 sm:p-3 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-2xl transition-colors shrink-0">
            <ArrowLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
          </Link>
          
          <div className="flex flex-col gap-1 w-full overflow-hidden">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
               <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white truncate">
                 {user.name || "Unnamed User"}
               </h1>
               {user.isActiveMember && (
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-500/20">
                   <ShieldCheckIcon className="w-4 h-4" />
                   Fully Active
                 </div>
               )}
            </div>
            
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 truncate">
              {user.email || "No email available"}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4">
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">User ID</span>
                  <span className="text-xs sm:text-sm font-mono font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/50 px-2 py-1 rounded inline-block">
                    {user.id}
                  </span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Referral Code</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded inline-block">
                    {user.referralCode || "NONE"}
                  </span>
               </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:items-end gap-2 relative z-10 shrink-0">
           <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left md:text-right">Platform Role</div>
           <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md">
             {user.role} ({user.tier})
           </div>
           <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 text-left md:text-right">
             Joined: {format(user.createdAt, 'MMM d, yyyy')}
           </div>
        </div>
      </div>

      {/* ----------------- SECTION 2: FINANCIAL BALANCES ----------------- */}
      <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 px-4 uppercase tracking-widest mt-8">Current Assets & Balances</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <StatCard 
            title="Available USD" 
            value={`$${user.balance.toFixed(2)}`} 
            icon={<WalletIcon className="w-6 h-6" />}
            color="blue"
         />
         <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <BanknotesIcon className="w-24 h-24 text-purple-600" />
           </div>
           <div className="flex items-center gap-3 mb-3 relative z-10">
             <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
               <BanknotesIcon className="w-6 h-6" />
             </div>
             <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total ARN Tokens</p>
           </div>
           <div className="relative z-10">
             <h3 className="text-3xl font-black text-gray-900 dark:text-white font-mono leading-none">
               {((user.balance || 0) * 10).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </h3>
             {user.lockedArnBalance > 0 && (
               <p className="text-[11px] font-bold text-orange-500 dark:text-orange-400 mt-1 inline-flex items-center gap-1 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-full">
                 + {user.lockedArnBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Locked
               </p>
             )}
           </div>
         </div>
         <StatCard 
            title="Lifetime Deposits" 
            value={`$${(user.totalDeposit || 0).toFixed(2)}`} 
            icon={<ArrowPathIcon className="w-6 h-6" />}
            color="emerald"
         />
         <StatCard 
            title="Lifetime Withdrawn" 
            value={`$${totalWithdrawn.toFixed(2)}`} 
            icon={<ArrowPathIcon className="w-6 h-6 transform rotate-180" />}
            color="red"
         />
      </div>

      {/* ----------------- SECTION 3: EARNINGS BREAKDOWN ----------------- */}
      <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 px-4 uppercase tracking-widest mt-8">Lifetime Earnings Breakdown</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 p-6 flex items-center justify-between">
             <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">From Tasks</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">${earningsFromTasks.toFixed(2)}</p>
             </div>
             <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                <StarIcon className="w-6 h-6" />
             </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 p-6 flex items-center justify-between">
             <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">From Referrals</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">${earningsFromReferrals.toFixed(2)}</p>
             </div>
             <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <UserGroupIcon className="w-6 h-6" />
             </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 p-6 flex items-center justify-between">
             <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">From Mudarabah</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">${earningsFromMudarabah.toFixed(2)}</p>
             </div>
             <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <BanknotesIcon className="w-6 h-6" />
             </div>
          </div>
      </div>

      {/* ----------------- SECTION 4: DIRECT TEAM (OVERVIEW & TABLE) ----------------- */}
      <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 px-4 uppercase tracking-widest mt-8">Referred Team Directory</h2>
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Team Summary Bar */}
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20 flex flex-wrap items-center gap-4 sm:gap-8">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                 <UserGroupIcon className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Team Size</p>
                 <p className="text-xl font-black text-gray-900 dark:text-white">{teamMembers.length} Members</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                 <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Depositors</p>
                 <p className="text-xl font-black text-emerald-600 dark:text-emerald-500">{activeTeamCount} Members</p>
              </div>
           </div>
        </div>

        {/* Team Members Data Table */}
        <div className="overflow-x-auto w-full">
           <table className="w-full text-left border-collapse min-w-[700px]">
             <thead>
               <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                 <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team Member</th>
                 <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                 <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ecosystem Categories</th>
                 <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Joined</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {teamMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm font-medium text-gray-500">
                       This user has not referred anyone yet.
                    </td>
                  </tr>
                ) : (
                  teamMembers.map((tm) => {
                     const isMudarabahActive = tm.mudarabahInvestments && tm.mudarabahInvestments.length > 0
                     const hasGigs = gigMap.has(tm.id)
                     
                     return (
                        <tr key={tm.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                             <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{tm.name || "Unknown"}</p>
                             <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{tm.email || "No email"}</p>
                             <div className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-wider">{tm.tier}</div>
                          </td>
                          <td className="px-6 py-4">
                            {tm.isActiveMember ? (
                               <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                                 Active
                               </span>
                            ) : (
                               <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded-md">
                                 Pending
                               </span>
                            )}
                          </td>
                          <td className="px-6 py-4 flex items-center gap-2 flex-wrap">
                             {isMudarabahActive && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                                   💰 Mudarabah
                                </span>
                             )}
                             {hasGigs && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                                   💼 Freelance
                                </span>
                             )}
                             {!isMudarabahActive && !hasGigs && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 italic">Standard Platform</span>
                             )}
                          </td>
                          <td className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                             {format(tm.createdAt, 'MMM d, yyyy')}
                          </td>
                        </tr>
                     )
                  })
                )}
             </tbody>
           </table>
        </div>
      </div>

      {/* ----------------- SECTION 5: TRANSACTION HISTORY ----------------- */}
      <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 px-4 uppercase tracking-widest mt-8">Recent Activities & Transactions</h2>
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
           <table className="w-full text-left border-collapse min-w-[700px]">
             <thead>
               <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                 <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                 <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                 <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                 <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                 <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
               {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-gray-500">
                       No recent transactions found for this user.
                    </td>
                  </tr>
               ) : (
                  recentTransactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {format(new Date(tx.createdAt), 'MMM d, h:mm a')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded tracking-wider">
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-gray-900 dark:text-white font-mono whitespace-nowrap">
                        ${tx.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase ${
                          tx.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          tx.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-300 truncate max-w-[250px]" title={tx.description || ""}>
                        {tx.description || "-"}
                      </td>
                    </tr>
                  ))
               )}
             </tbody>
           </table>
        </div>
      </div>
      
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: 'blue' | 'emerald' | 'red' }) {
  const colorMap = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
    red: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10"
  }
  
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${colorMap[color].split(' ')[0]}`}>
        {icon}
      </div>
      <div className="flex items-center gap-3 mb-3 relative z-10">
        <div className={`p-2.5 rounded-2xl ${colorMap[color]}`}>
          {icon}
        </div>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
      </div>
      <h3 className="text-3xl font-black text-gray-900 dark:text-white relative z-10 font-mono">
        {value}
      </h3>
    </div>
  )
}
