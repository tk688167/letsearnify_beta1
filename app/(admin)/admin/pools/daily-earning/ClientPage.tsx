"use client"

import { useState } from "react"
import { format, differenceInDays } from "date-fns"
import { ClockIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"

export function AdminDailyEarningClient({ allInvestments }: { allInvestments: any[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const filteredInvestments = allInvestments.filter(inv => {
    // 1. Search Filter
    const searchString = searchTerm.toLowerCase()
    const nameMatch = inv.user?.name?.toLowerCase().includes(searchString) || false
    const emailMatch = inv.user?.email?.toLowerCase().includes(searchString) || false
    if (searchTerm && !nameMatch && !emailMatch) return false
    
    // 2. Status Filter
    if (statusFilter !== "ALL") {
       if (statusFilter === "ACTIVE" && inv.status !== "ACTIVE") return false
       if (statusFilter === "COMPLETED" && inv.status !== "COMPLETED") return false
       if (statusFilter === "REINVESTED" && inv.status !== "REINVESTED") return false
    }
    
    return true
  })

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden mt-6">
       
       <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <MagnifyingGlassIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
             </div>
             <input 
               type="text"
               placeholder="Search by name or email..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
             />
          </div>

          <div className="w-full sm:w-auto">
             <select
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
             >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Locks</option>
                <option value="COMPLETED">Completed/Withdrawn</option>
                <option value="REINVESTED">Auto-Reinvested</option>
             </select>
          </div>
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
              {filteredInvestments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    No investments matched your search.
                  </td>
                </tr>
              ) : (
                filteredInvestments.map((inv: any) => {
                   const now = new Date()
                   const isComplete = inv.status === "COMPLETED" || inv.status === "REINVESTED" || now >= new Date(inv.expiresAt)
                   const daysLeft = isComplete ? 0 : differenceInDays(new Date(inv.expiresAt), now)
                   
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
                          {format(new Date(inv.createdAt), 'MMM d, yyyy')}
                       </td>
                       <td className="px-6 py-4 text-right font-mono text-sm font-bold text-gray-900 dark:text-white">
                          ${inv.amount.toFixed(2)}
                       </td>
                       <td className="px-6 py-4 text-right font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          +${inv.profitEarned.toFixed(2)}
                       </td>
                       <td className="px-6 py-4 text-center">
                          {inv.status === "REINVESTED" ? (
                             <span className="inline-flex items-center justify-center px-2.5 py-1 bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 rounded-lg text-xs font-bold min-w-[90px]">
                                Reinvested
                             </span>
                          ) : inv.status === "COMPLETED" ? (
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
  )
}
