"use client"

import { useState } from "react"
import { format } from "date-fns"
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline"

export function DailyPoolsAdminClient({ pools }: { pools: any[] }) {
    const [search, setSearch] = useState("")
    
    const filteredPools = pools.filter(p => 
        p.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.user?.memberId?.toLowerCase().includes(search.toLowerCase())
    )

    const totalAllocated = pools.filter(p => p.status === "ACTIVE").reduce((sum, p) => sum + p.amount, 0)
    const activeCount = pools.filter(p => p.status === "ACTIVE").length

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Active System Allocation</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">${totalAllocated.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Active Pools</p>
                    <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{activeCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">History Total</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{pools.length}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                    <input 
                        type="text"
                        placeholder="Search user by name, email or ID..."
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-widest font-black">
                                <th className="px-6 py-4">User Information</th>
                                <th className="px-6 py-4">Allocated Amount</th>
                                <th className="px-6 py-4">Profit Earned</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Start / Expiry Dates</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredPools.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                        No pools found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredPools.map(pool => (
                                    <tr key={pool.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 dark:text-white text-sm">{pool.user?.name || "No Name"}</span>
                                                <span className="text-xs text-gray-500 font-mono tracking-tight">{pool.user?.email}</span>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-black text-slate-500">{pool.user?.memberId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-gray-900 dark:text-white text-base">${pool.amount.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">+${pool.profitEarned.toFixed(2)}</span>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold">1% Daily Rate</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                pool.status === 'ACTIVE' 
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' 
                                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                            }`}>
                                                {pool.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-[10px] font-bold text-gray-600 dark:text-gray-400 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-12 text-gray-400 font-medium">START:</span>
                                                    <span className="font-mono">{format(new Date(pool.createdAt), 'MMM d, yyyy HH:mm')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-12 text-gray-400 font-medium">EXPIRY:</span>
                                                    <span className="font-mono">{format(new Date(pool.expiresAt), 'MMM d, yyyy HH:mm')}</span>
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
