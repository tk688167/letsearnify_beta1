"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRightIcon, LockOpenIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/solid"
import { CBSP_TIER_PERCENTAGES } from "@/lib/cbsp"

export default function CbspSection({ user }: { user: any }) {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/cbsp/stats")
      const data = await res.json()
      if (res.ok) setStats(data)
    } catch (e) {
      console.error("Failed to fetch stats", e)
    }
  }

  // Tier Order: Emerald (High) -> Newbie (Low)
  const tiers = (Object.keys(CBSP_TIER_PERCENTAGES) as string[]).reverse()
  const weeklyDistributable = (stats?.poolBalance || 0) * 0.03

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-white text-gray-900 p-8 md:p-12 shadow-xl border border-gray-100">
         {/* Background Ambience */}
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-50/50 to-fuchsia-50/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
         
         <div className="relative z-10 space-y-12">
             {/* HEADER */}
             <div className="text-center max-w-3xl mx-auto space-y-6">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    Weekly Distribution System
                 </div>
                 <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight text-gray-900">
                     CBSP <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Profit Breakdown</span>
                 </h2>
                 <p className="text-lg text-gray-500 font-light leading-relaxed max-w-2xl mx-auto">
                     Explore how the <span className="font-bold text-gray-900">3% Weekly Pool</span> is distributed across tiers. Higher tiers unlock larger shares of the profit.
                 </p>

                 {/* GLOBAL STATS CARDS */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-6 max-w-4xl mx-auto">
                    <StatCard 
                        label="Total Pool Balance" 
                        value={`$${(stats?.poolBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        subtext="Funded by 5% of Deposits"
                    />
                    <StatCard 
                        label="This Week's Distributable" 
                        value={`$${weeklyDistributable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        subtext="3% of Pool Balance"
                        highlight
                    />
                     <StatCard 
                        label="Active Members" 
                        value={stats?.totalMembers || 0}
                        subtext="Eligible Participants"
                    />
                 </div>
             </div>

             {/* DETAILED TIER TABLE */}
             <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-lg bg-white/80 backdrop-blur-md">
                 <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-200/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-5">Tier Level</th>
                            <th className="px-6 py-5 text-center">Percentage</th>
                            <th className="px-6 py-5 text-right">Total Tier Share</th>
                            <th className="px-6 py-5 text-center">Active Users</th>
                            <th className="px-6 py-5 text-right text-indigo-600">Est. Per Activity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tiers.map((tier) => {
                            const percent = CBSP_TIER_PERCENTAGES[tier] || 0
                            const tierShareTotal = weeklyDistributable * (percent / 100)
                            const count = stats?.tierMap?.[tier] || 0
                            const perUser = count > 0 ? tierShareTotal / count : 0
                            const isCurrent = user?.tier === tier

                            return (
                                <tr key={tier} className={`group transition-colors hover:bg-indigo-50/30 ${isCurrent ? "bg-indigo-50/50" : ""}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <TierBadge tier={tier} />
                                            <span className={`font-bold ${isCurrent ? "text-indigo-900" : "text-gray-700"}`}>
                                                {tier} {isCurrent && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wide">You</span>}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span className="font-bold text-gray-700">{percent}%</span>
                                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(percent / 25) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-medium text-gray-600">
                                        ${tierShareTotal.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${count > 0 ? "bg-white border border-gray-200 text-gray-700" : "text-gray-400 bg-gray-50"}`}>
                                            {count}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`font-mono font-bold text-sm ${count > 0 ? "text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md" : "text-gray-300"}`}>
                                            {count > 0 ? `$${perUser.toFixed(4)}` : "-"}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                 </table>
             </div>
             
             {/* CTA FOOTER */}
             <div className="flex flex-col items-center justify-center pt-8">
                {(user?.totalDeposit || 0) >= 1 ? (
                    <p className="text-sm text-center text-gray-400 max-w-md mx-auto">
                        <span className="text-green-600 font-bold">You are Eligible.</span> Payouts occur automatically every week based on your tier status at the time of distribution.
                    </p>
                ) : (
                    <a href="/dashboard/wallet?tab=deposit" className="group">
                         <div className="flex items-center gap-3 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all hover:scale-105">
                             <span>Join the Pool Now (Min $1)</span>
                             <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                         </div>
                    </a>
                )}
             </div>
         </div>
    </div>
  )
}

function StatCard({ label, value, subtext, highlight = false }: { label: string, value: string | number, subtext: string, highlight?: boolean }) {
    return (
        <div className={`p-6 rounded-2xl border flex flex-col items-center text-center transition-all ${highlight ? "bg-white border-indigo-100 shadow-xl shadow-indigo-100/50 scale-105 z-10" : "bg-white/60 border-gray-100 hover:bg-white hover:shadow-lg"}`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
            <p className={`text-3xl font-bold mb-2 tracking-tight ${highlight ? "text-indigo-600" : "text-gray-900"}`}>{value}</p>
            <p className={`text-xs font-medium rounded-full px-2 py-0.5 ${highlight ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-500"}`}>{subtext}</p>
        </div>
    )
}

function TierBadge({ tier }: { tier: string }) {
    const colors: Record<string, string> = {
        STARTER: "bg-gray-500",
        BRONZE: "bg-amber-600",
        SILVER: "bg-slate-400",
        GOLD: "bg-yellow-500",
        PLATINUM: "bg-cyan-500",
        DIAMOND: "bg-indigo-500",
        EMERALD: "bg-emerald-500",
    }
    const color = colors[tier] || "bg-gray-400"
    
    return (
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white text-xs font-serif font-bold shadow-sm`}>
            {tier[0]}
        </div>
    )
}
