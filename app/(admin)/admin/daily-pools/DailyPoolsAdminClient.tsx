"use client"

import { useState } from "react"
import { format } from "date-fns"
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  UsersIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline"

export function DailyPoolsAdminClient({ pools }: { pools: any[] }) {
    const [search, setSearch] = useState("")
    
    // Derived states
    const filteredPools = pools.filter(p => {
        const query = search.toLowerCase()
        return p.user?.email?.toLowerCase().includes(query) ||
               p.user?.name?.toLowerCase().includes(query) ||
               p.user?.memberId?.toLowerCase().includes(query)
    })

    const activePools = pools.filter(p => p.status === "ACTIVE")
    const totalAllocated = activePools.reduce((sum, p) => sum + p.amount, 0)
    
    // Count unique users who have ever interacted with the pool, or active users.
    const uniqueActiveUsers = new Set(activePools.map(p => p.userId)).size
    const totalDistributedProfit = pools.reduce((sum, p) => sum + p.profitEarned, 0)

    return (
        <div className="space-y-6">
            
            {/* Top Premium Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Total Pool Amount */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <CurrencyDollarIcon className="w-32 h-32 transform translate-x-8 -translate-y-8" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Total Pool Amount</p>
                                <h3 className="text-4xl font-black">${totalAllocated.toFixed(2)}</h3>
                            </div>
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                                <CurrencyDollarIcon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="text-sm font-medium text-indigo-100 flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                           Live Active Allocation
                        </div>
                    </div>
                </div>
                
                {/* Total Unique Users */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Users Invested</p>
                            <h3 className="text-4xl font-black text-gray-900 dark:text-white">{uniqueActiveUsers}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                            <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                        Unique user accounts currently locked in active pools.
                    </p>
                </div>
                
                {/* Total Distributed Profit */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Lifetime Profit Payout</p>
                            <h3 className="text-4xl font-black text-emerald-600 dark:text-emerald-400">${totalDistributedProfit.toFixed(2)}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                            <ChartBarIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                        Total 1% daily yields distributed system-wide.
                    </p>
                </div>
                
            </div>

            {/* Main Table Interface */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/20">
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            type="text"
                            placeholder="Find user by email, name, or Member ID..."
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-widest font-black">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Deposit</th>
                                <th className="px-6 py-4">Profit Earned (1%/day)</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Timestamps (Local Time)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredPools.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                        No pools match your search query.
                                    </td>
                                </tr>
                            ) : (
                                filteredPools.map(pool => (
                                    <tr key={pool.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        
                                        {/* User Column */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                                                    {pool.user?.name ? pool.user.name.charAt(0).toUpperCase() : "?"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{pool.user?.name || "Unknown"}</span>
                                                    <span className="text-xs text-gray-500">{pool.user?.email}</span>
                                                    <span className="text-[10px] text-indigo-500 font-mono mt-0.5 font-bold cursor-pointer hover:underline">{pool.user?.memberId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* Deposit Column */}
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-black text-gray-900 dark:text-white text-base">
                                                ${pool.amount.toFixed(2)}
                                            </span>
                                        </td>

                                        {/* Profit Earned Column */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                                    +${pool.profitEarned.toFixed(2)}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium">Added to wallet daily</span>
                                            </div>
                                        </td>

                                        {/* Status Column */}
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                pool.status === 'ACTIVE' 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                                                : pool.status === 'COMPLETED'
                                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                                                : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                            }`}>
                                                {pool.status}
                                            </span>
                                        </td>

                                        {/* Timestamps Column */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-[11px] font-medium text-gray-500 dark:text-gray-400 space-y-1">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-gray-400 uppercase text-[9px] font-bold tracking-wider">Start</span>
                                                    <span className="font-mono text-gray-900 dark:text-gray-300">{format(new Date(pool.createdAt), 'MMM d, yyyy HH:mm')}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-gray-400 uppercase text-[9px] font-bold tracking-wider">Last Paid</span>
                                                    <span className="font-mono text-gray-900 dark:text-gray-300">{format(new Date(pool.lastCalculatedDate), 'MMM d, yyyy HH:mm')}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-gray-400 uppercase text-[9px] font-bold tracking-wider">Expiry</span>
                                                    <span className="font-mono text-gray-900 dark:text-gray-300">{format(new Date(pool.expiresAt), 'MMM d, yyyy HH:mm')}</span>
                                                </div>
                                            </div>
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
