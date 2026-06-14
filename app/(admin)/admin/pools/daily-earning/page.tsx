import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { 
  ChartBarIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon
} from "@heroicons/react/24/outline"
import { format, differenceInDays } from "date-fns"

export const metadata = {
  title: "Admin | Daily Earning Pool Management",
  description: "Manage global daily earning lockpools.",
}

export default async function AdminDailyEarningPoolPage() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  // 1. Fetch the macro state of the entire global pool
  const allInvestments = await prisma.dailyEarningInvestment.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          tier: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // 2. Perform Server-Side Analytics
  const activeInvestments = allInvestments.filter((i: any) => i.status === "ACTIVE")
  const completedInvestments = allInvestments.filter((i: any) => i.status === "COMPLETED")
  
  const totalPrincipalLocked = activeInvestments.reduce((sum: number, i: any) => sum + i.amount, 0)
  const totalPendingProfit = activeInvestments.reduce((sum: number, i: any) => sum + i.profitEarned, 0)
  
  const historicalPrincipalPaid = completedInvestments.reduce((sum: number, i: any) => sum + i.amount, 0)
  const historicalProfitPaid = completedInvestments.reduce((sum: number, i: any) => sum + i.profitEarned, 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-gray-50/50 dark:bg-slate-900/50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Daily Earning Pool</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">System-wide overview of all active and completed 30-day locks.</p>
        </div>
      </div>

      {/* Global Macro Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Active Principal */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CurrencyDollarIcon className="w-16 h-16 text-indigo-600" />
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 relative z-10">Total Active Principal</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white font-mono relative z-10">${totalPrincipalLocked.toFixed(2)}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
             <UserGroupIcon className="w-4 h-4" />
             Across {activeInvestments.length} Active Locks
          </div>
        </div>

        {/* Pending Unlocked Profits */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/30 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ChartBarIcon className="w-16 h-16 text-indigo-600" />
          </div>
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 relative z-10">Pending Profit Liability</p>
          <p className="text-3xl font-black text-indigo-700 dark:text-indigo-300 font-mono relative z-10">${totalPendingProfit.toFixed(2)}</p>
          <p className="mt-4 text-xs font-medium text-indigo-600/70 dark:text-indigo-400/70 leading-relaxed">
             This is the 1% compounding profit that will be claimed when these locks expire.
          </p>
        </div>

        {/* Historical Principal */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Historical Returned Principal</p>
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 font-mono">${historicalPrincipalPaid.toFixed(2)}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
             <CheckCircleIcon className="w-4 h-4" />
             From {completedInvestments.length} Completed Locks
          </div>
        </div>

        {/* Historical Profit */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Historical Paid Profit</p>
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 font-mono">${historicalProfitPaid.toFixed(2)}</p>
          <div className="mt-4 text-xs font-medium text-gray-500 dark:text-gray-400">
             Total 30-day yields paid out over time.
          </div>
        </div>
      </div>

      {/* Complete Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
         <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-slate-800 flex items-center gap-3 bg-gray-50/50 dark:bg-slate-800/50">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
               <ChartBarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Daily Earning Ledger</h2>
         </div>
         
         <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tier</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inv. Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Principal</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Acc. Profit</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {allInvestments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      No Daily Earning investments exist in the system yet.
                    </td>
                  </tr>
                ) : (
                  allInvestments.map((inv: any) => {
                     const now = new Date()
                     const isComplete = inv.status === "COMPLETED" || now >= inv.expiresAt
                     const daysLeft = isComplete ? 0 : differenceInDays(inv.expiresAt, now)
                     
                     return (
                       <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                         <td className="px-6 py-4">
                            <div className="font-bold text-sm text-gray-900 dark:text-white">{inv.user?.name || "Unknown"}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{inv.user?.email || "No Email"}</div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded text-xs font-bold border border-gray-200 dark:border-slate-700">
                               {inv.user?.tier || "NEWBIE"}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                            {format(inv.createdAt, 'MMM d, yyyy')}
                         </td>
                         <td className="px-6 py-4 text-right font-mono text-sm font-bold text-gray-900 dark:text-white">
                            ${inv.amount.toFixed(2)}
                         </td>
                         <td className="px-6 py-4 text-right font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            +${inv.profitEarned.toFixed(2)}
                         </td>
                         <td className="px-6 py-4 text-center">
                            {inv.status === "COMPLETED" ? (
                               <span className="inline-flex items-center justify-center px-2.5 py-1 bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 rounded-lg text-xs font-bold min-w-[90px]">
                                  Withdrawn
                               </span>
                            ) : isComplete ? (
                               <span className="inline-flex items-center justify-center px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg text-xs font-bold min-w-[90px]">
                                  Unlocked
                               </span>
                            ) : (
                               <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-lg text-xs font-bold min-w-[90px]">
                                  <ClockIcon className="w-3.5 h-3.5" />
                                  {daysLeft} Days
                               </span>
                            )}
                         </td>
                       </tr>
                     )
                  })
                )}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  )
}
