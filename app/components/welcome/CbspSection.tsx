"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRightIcon, CheckBadgeIcon, LockOpenIcon, SparklesIcon, TrophyIcon } from "@heroicons/react/24/solid"
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
  const isEligible = (user?.totalDeposit || 0) >= 1

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 text-white p-8 md:p-12 shadow-2xl border border-white/10">
         {/* Background Ambience */}
         <div className="absolute top-0 right-0 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-indigo-600/20 rounded-full blur-[80px] md:blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[200px] md:w-[600px] h-[200px] md:h-[600px] bg-fuchsia-600/20 rounded-full blur-[60px] md:blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.03] pointer-events-none"></div>
         
         <div className="relative z-10 space-y-12">
             {/* HEADER */}
             <div className="text-center max-w-3xl mx-auto space-y-6">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                    Weekly Profit System
                 </div>
                 <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
                     CBSP <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Profit Share</span>
                 </h2>
                 <p className="text-lg text-gray-400 font-light leading-relaxed max-w-2xl mx-auto">
                     A transparent breakdown of how the <span className="text-white font-bold">3% Weekly Pool</span> is distributed. Elevate your tier to maximize your passive income.
                 </p>

                 {/* GLOBAL STATS CARDS */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-6 max-w-4xl mx-auto">
                    <StatCard 
                        label="Total Pool Balance" 
                        value={`$${(stats?.poolBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        subtext="Funded by 5% of Deposits"
                        icon={<TrophyIcon className="w-5 h-5 text-amber-400" />}
                    />
                    <StatCard 
                        label="This Week's Payout" 
                        value={`$${weeklyDistributable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        subtext="Distributed Every Friday"
                        highlight
                        icon={<SparklesIcon className="w-5 h-5 text-indigo-400" />}
                    />
                     <StatCard 
                        label="Active Participants" 
                        value={stats?.totalMembers || 0}
                        subtext="Qualified Members"
                        icon={<CheckBadgeIcon className="w-5 h-5 text-emerald-400" />}
                    />
                 </div>
             </div>

             {/* DETAILED TIER TABLE */}
             <div className="space-y-4">
                 
                 {/* Mobile: Stacked Cards */}
                 <div className="md:hidden space-y-4">
                     {tiers.map((tier) => {
                         const percent = CBSP_TIER_PERCENTAGES[tier] || 0
                         const tierShareTotal = weeklyDistributable * (percent / 100)
                         const count = stats?.tierMap?.[tier] || 0
                         const perUser = count > 0 ? tierShareTotal / count : 0
                         const isCurrent = user?.tier === tier

                         return (
                             <div key={tier} className={`p-5 rounded-2xl border ${isCurrent ? "bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10" : "bg-white/5 border-white/10"}`}>
                                 <div className="flex items-center justify-between mb-4">
                                     <div className="flex items-center gap-3">
                                         <TierBadge tier={tier} />
                                         <span className={`font-bold ${isCurrent ? "text-indigo-300" : "text-gray-200"}`}>
                                             {tier}
                                         </span>
                                     </div>
                                     {isCurrent && <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide font-bold">Current</span>}
                                 </div>
                                 
                                 <div className="space-y-3">
                                     <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                         <span className="text-xs text-gray-400 font-bold uppercase">Pool Share</span>
                                         <span className="font-mono font-bold text-indigo-300 text-lg">${tierShareTotal.toFixed(2)}</span>
                                     </div>
                                     
                                     <div className="grid grid-cols-2 gap-3">
                                         <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                             <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Percentage</div>
                                             <div className="font-bold text-white">{percent}%</div>
                                         </div>
                                         <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                              <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Active Users</div>
                                              <div className="font-bold text-white">{count}</div>
                                         </div>
                                     </div>

                                     <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                         <span className="text-xs text-gray-400">Est. Per Activity</span>
                                         <span className={`font-mono font-bold ${count > 0 ? "text-emerald-400" : "text-gray-600"}`}>
                                              {count > 0 ? `$${perUser.toFixed(4)}` : "-"}
                                         </span>
                                     </div>
                                 </div>
                             </div>
                         )
                     })}
                 </div>

                 {/* Desktop: Table */}
                 <div className="hidden md:block overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-white/5 backdrop-blur-md">
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-5">Tier Level</th>
                                    <th className="px-6 py-5 text-center">Percentage</th>
                                    <th className="px-6 py-5 text-right">Pool Share</th>
                                    <th className="px-6 py-5 text-center">Active Users</th>
                                    <th className="px-6 py-5 text-right text-indigo-300">Est. Per Activity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {tiers.map((tier) => {
                                    const percent = CBSP_TIER_PERCENTAGES[tier] || 0
                                    const tierShareTotal = weeklyDistributable * (percent / 100)
                                    const count = stats?.tierMap?.[tier] || 0
                                    const perUser = count > 0 ? tierShareTotal / count : 0
                                    const isCurrent = user?.tier === tier

                                    return (
                                        <tr key={tier} className={`group transition-colors hover:bg-white/5 ${isCurrent ? "bg-indigo-500/10" : ""}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <TierBadge tier={tier} />
                                                    <span className={`font-bold ${isCurrent ? "text-indigo-300" : "text-gray-200"}`}>
                                                        {tier} {isCurrent && <span className="ml-2 text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">You</span>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <span className="font-bold text-gray-300">{percent}%</span>
                                                    <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${(percent / 25) * 100}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold text-gray-300">
                                                ${tierShareTotal.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${count > 0 ? "bg-white/10 text-white border border-white/10" : "text-gray-600 bg-white/5"}`}>
                                                    {count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-mono font-bold text-sm ${count > 0 ? "text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20" : "text-gray-600"}`}>
                                                    {count > 0 ? `$${perUser.toFixed(4)}` : "-"}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                     </div>
                 </div>
             </div>
             
             {/* CTA FOOTER */}
             <div className="flex flex-col items-center justify-center pt-8">
                {isEligible ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20"
                    >
                        <div className="px-8 py-4 bg-gray-900 rounded-xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <CheckBadgeIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">You are Active & Eligible</h3>
                                <p className="text-sm text-gray-400">Your account is qualified for the next weekly profit distribution.</p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <a href="/dashboard/wallet?tab=deposit" className="group relative">
                         <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                         <div className="relative flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl font-bold shadow-xl hover:scale-105 transition-all">
                             <span>Unlock Eligibility (Min $1)</span>
                             <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                         </div>
                    </a>
                )}
             </div>
         </div>
    </div>
  )
}

function StatCard({ label, value, subtext, highlight = false, icon }: { label: string, value: string | number, subtext: string, highlight?: boolean, icon: React.ReactNode }) {
    return (
        <div className={`p-6 rounded-2xl border flex flex-col items-center text-center transition-all ${highlight ? "bg-white/10 border-indigo-500/30 shadow-xl shadow-indigo-500/10" : "bg-white/5 border-white/5 hover:bg-white/10"}`}>
            <div className={`mb-3 p-3 rounded-xl ${highlight ? "bg-indigo-500/20" : "bg-white/5"}`}>
                {icon}
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl md:text-3xl font-bold mb-1 tracking-tight text-white">{value}</p>
            <p className={`text-xs font-medium rounded-full px-2 py-0.5 ${highlight ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-gray-500"}`}>{subtext}</p>
        </div>
    )
}

function TierBadge({ tier }: { tier: string }) {
    const colors: Record<string, string> = {
        STARTER: "bg-gray-600",
        BRONZE: "bg-amber-700",
        SILVER: "bg-slate-500",
        GOLD: "bg-yellow-600",
        PLATINUM: "bg-cyan-600",
        DIAMOND: "bg-indigo-600",
        EMERALD: "bg-emerald-600",
    }
    const color = colors[tier] || "bg-gray-700"
    
    return (
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white text-xs font-serif font-bold shadow-md border border-white/10`}>
            {tier[0]}
        </div>
    )
}
