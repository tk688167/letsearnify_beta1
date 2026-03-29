"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRightIcon, LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/solid"
import { CBSP_TIER_PERCENTAGES, getTierColor } from "@/lib/cbsp"


// Hooks removed as internal state is replaced by prop-derived logic
export default function CbspSection({ user }: { user: any }) {
  const [stats, setStats] = useState<any>(null)
  
  // Directly derived eligibility
  // const isEligible = (user?.totalDeposit || 0) >= 1.0; 
  // (We use inline check in JSX for simplicity)

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



  const tiers = (Object.keys(CBSP_TIER_PERCENTAGES) as string[]).reverse()

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 text-white p-8 md:p-12 shadow-2xl border border-white/5">
         {/* Background Ambience */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-blue-600/30 to-purple-600/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
         
         <div className="relative z-10 space-y-12">
             {/* HEADER */}
             <div className="text-center max-w-3xl mx-auto space-y-4">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    Weekly Profit Share
                 </div>
                 <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
                     CBSP <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Pool</span>
                 </h2>
                 <p className="text-xl text-gray-300 font-light">
                     Company Business Share Profit • Earn Weekly Tier-Based Dividends
                 </p>
                 <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto">
                     A shared pool growing with every platform activity. Join for just <span className="text-white font-bold">$1</span> and secure your weekly payout share based on your tier.
                 </p>

                 {/* GLOBAL STATS */}
                 {stats && (
                    <div className="flex flex-wrap justify-center gap-6 pt-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-center">
                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Pool Balance</div>
                            <div className="text-2xl font-bold text-white">${stats.poolBalance?.toFixed(2)}</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-center">
                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Active Members</div>
                            <div className="text-2xl font-bold text-white">{stats.totalMembers}</div>
                        </div>
                    </div>
                 )}
             </div>

             {/* TIER CARDS GRID (Descending: Emerald -> Newbie) */}
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
                {tiers.map((tier, i) => (
                    <TierCard 
                        key={tier} 
                        tier={tier} 
                        isCurrent={user?.tier === tier}
                        stats={stats}
                        index={i}
                    />
                ))}
             </div>

             {/* CTA SECTION */}
             <div className="flex flex-col items-center justify-center pt-8 border-t border-white/10">
                {(user?.totalDeposit || 0) >= 1 ? (
                    <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 px-6 py-3 rounded-2xl animate-in fade-in zoom-in duration-500">
                        <div className="bg-green-500 text-white p-1 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                            <LockOpenIcon className="w-4 h-4" />
                        </div>
                        <span className="text-green-400 font-bold tracking-wide">Member Active • Eligible for Payment</span>
                    </div>
                ) : (
                    <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-xl font-bold text-white">
                            Deposit $1 to Activate CBSP Pool
                        </h3>
                        
                        <a href="/dashboard/wallet?tab=deposit">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-10 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl font-bold text-lg text-white shadow-xl shadow-indigo-600/20 flex items-center gap-3 mx-auto hover:shadow-indigo-600/40 transition-all"
                            >
                                Deposit $1 Now <ArrowRightIcon className="w-5 h-5" />
                            </motion.button>
                        </a>
                        
                        <p className="text-sm text-gray-400">
                            Make a minimum $1 deposit to become eligible for CBSP Pool rewards.
                        </p>
                    </div>
                )}
             </div>
         </div>
    </div>
  )
}

function TierCard({ tier, isCurrent, stats, index }: { tier: string, isCurrent: boolean, stats: any, index: number }) {
    const weight = CBSP_TIER_PERCENTAGES[tier] || 0
    const gradient = getTierColor(tier as any)
    const tierMembers = stats?.tierMap?.[tier] || 0
    
    // Estimate share PER USER in this tier
    // Logic: (Pool * Tier%) / Count
    const estimatedShare = stats?.poolBalance 
        ? ((stats.poolBalance * weight) / 100) / (tierMembers || 1)
        : 0

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-4 rounded-2xl border flex flex-col items-center text-center space-y-3 group overflow-hidden ${
                isCurrent 
                ? "bg-white/10 border-white/40 ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20" 
                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
            }`}
        >
            {isCurrent && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"></div>
            )}
            
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-xs font-bold text-white shadow-md mb-1`}>
                {tier[0]}
            </div>
            
            <div>
                <h4 className="font-bold text-sm text-gray-200">{tier}</h4>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{tierMembers} Members</div>
            </div>

            <div className="w-full pt-3 border-t border-white/5 mt-auto">
                <div className="text-[10px] text-gray-400 mb-0.5">Wkly Est.</div>
                <div className="font-mono text-sm text-green-400 font-bold">${estimatedShare.toFixed(3)}</div>
            </div>
        </motion.div>
    )
}
