"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  TrophyIcon, 
  ChartBarIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  FunnelIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon
} from "@heroicons/react/24/outline"
import { TIER_RULES, TierLevel } from "@/lib/mlm"

// Types matching the data passed from the server
type ReferralNode = {
  id: string
  name: string | null
  email: string | null
  tier: string
  points: number
  createdAt: Date
  level: number // 1, 2, or 3 relative to current user
  depositTotal?: number // Calculated or fetched
}

type Commission = {
  id: string
  amount: number
  level: number
  sourceUser: { name: string | null; email: string | null }
  createdAt: Date
}

type ReferralViewProps = {
  user: {
    name: string | null
    tier: string
    points: number
    referralCode: string | null
    balance: number
  }
  stats: {
    teamSize: number
    totalEarnings: number
    todayEarnings: number
  }
  referralTree: ReferralNode[]
  commissions: Commission[]
}

const TIER_THEME: Record<string, { bg: string, text: string, icon: string, shadow: string, border: string }> = {
  NEWBIE: { 
     bg: "bg-gradient-to-br from-gray-100 to-gray-400", 
     text: "text-gray-500", 
     icon: "🚀",
     shadow: "shadow-gray-500/20",
     border: "border-gray-200"
  },
  BRONZE: { 
     bg: "bg-gradient-to-br from-[#CD7F32] to-[#8B4513]", 
     text: "text-[#CD7F32]", 
     icon: "🥉",
     shadow: "shadow-orange-900/20",
     border: "border-orange-200"
  },
  SILVER: { 
     bg: "bg-gradient-to-br from-[#E0E0E0] to-[#757575]", 
     text: "text-slate-400", 
     icon: "🥈",
     shadow: "shadow-gray-400/20",
     border: "border-gray-200"
  },
  GOLD: { 
     bg: "bg-gradient-to-br from-[#FFD700] to-[#B8860B]", 
     text: "text-yellow-500", 
     icon: "🥇",
     shadow: "shadow-yellow-500/20",
     border: "border-yellow-200"
  },
  PLATINUM: { 
     bg: "bg-gradient-to-br from-[#8A2BE2] to-[#4B0082]", 
     text: "text-purple-500", 
     icon: "💎",
     shadow: "shadow-purple-500/20",
     border: "border-purple-200"
  },
  DIAMOND: { 
     bg: "bg-gradient-to-br from-[#0000FF] to-[#00008B]", 
     text: "text-blue-500", 
     icon: "💠",
     shadow: "shadow-blue-500/20",
     border: "border-blue-200"
  },
  EMERALD: { 
     bg: "bg-gradient-to-br from-[#50C878] to-[#2E8B57]", 
     text: "text-emerald-500", 
     icon: "👑",
     shadow: "shadow-emerald-500/20",
     border: "border-emerald-200"
  }
}

const LEVEL_COLORS = {
   1: "bg-blue-50 text-blue-700 border-blue-200",
   2: "bg-purple-50 text-purple-700 border-purple-200",
   3: "bg-pink-50 text-pink-700 border-pink-200"
}

export default function ReferralView({ user, stats, referralTree, commissions }: ReferralViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "tree" | "rewards">("overview")
  const [levelFilter, setLevelFilter] = useState<"all" | 1 | 2 | 3>("all")

  // Tier Progress Logic
  const currentTier = (user.tier || "NEWBIE") as TierLevel
  const theme = TIER_THEME[currentTier] || TIER_THEME.BRONZE
  const tierConfig = TIER_RULES[currentTier]
  
  // Find next tier
  const tiers: TierLevel[] = ["NEWBIE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "EMERALD"]
  const currentIndex = tiers.indexOf(currentTier)
  const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null
  const nextTierConfig = nextTier ? TIER_RULES[nextTier] : null
  
  const pointsProgress = nextTierConfig ? Math.min((user.points / nextTierConfig.points) * 100, 100) : 100
  const membersProgress = nextTierConfig ? Math.min((stats.teamSize / nextTierConfig.members) * 100, 100) : 100

  const copyCode = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode)
      // Toast would go here
      const btn = document.getElementById("copy-btn")
      if(btn) btn.innerHTML = "Copied!"
      setTimeout(() => { if(btn) btn.innerHTML = "" }, 2000)
    }
  }

  const filteredTree = levelFilter === "all" 
    ? referralTree 
    : referralTree.filter(node => node.level === levelFilter)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Stats Widget (Always Visible) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><UserGroupIcon className="w-5 h-5"/></div>
             <div>
                <div className="text-xs text-gray-400 font-bold uppercase">Team Size</div>
                <div className="text-lg font-bold text-gray-900">{stats.teamSize}</div>
             </div>
         </div>
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><CurrencyDollarIcon className="w-5 h-5"/></div>
             <div>
                <div className="text-xs text-gray-400 font-bold uppercase">Total Earned</div>
                <div className="text-lg font-bold text-gray-900">${stats.totalEarnings.toFixed(2)}</div>
             </div>
         </div>
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><TrophyIcon className="w-5 h-5"/></div>
             <div>
                <div className="text-xs text-gray-400 font-bold uppercase">Current Tier</div>
                <div className="text-lg font-bold text-gray-900">{currentTier}</div>
             </div>
         </div>
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center"><ChartBarIcon className="w-5 h-5"/></div>
             <div>
                <div className="text-xs text-gray-400 font-bold uppercase">My Points</div>
                <div className="text-lg font-bold text-gray-900">{user.points.toFixed(0)}</div>
             </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white rounded-xl border border-gray-100 w-fit shadow-sm">
        {[
          { id: "overview", label: "Dashboard", icon: ChartBarIcon },
          { id: "tree", label: "My Team", icon: UserGroupIcon },
          { id: "rewards", label: "Rewards", icon: CurrencyDollarIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === tab.id 
                ? "bg-gray-900 text-white shadow-md" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Hero Card */}
            <div className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 text-white ${theme.bg} shadow-2xl shadow-current`}>
               {/* Decorative Background Elements */}
               <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
               <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
               
               <div className="relative z-10 flex flex-col md:flex-row gap-10 justify-between items-center">
                  <div className="flex-1 space-y-6">
                     <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/20 shadow-lg">
                        <SparklesIcon className="w-4 h-4 text-yellow-300" />
                        Beta Partner Program
                     </div>
                     <div>
                        <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-2 drop-shadow-sm leading-tight flex items-center gap-4">
                           {currentTier} 
                           <span className="text-6xl animate-pulse">{theme.icon}</span>
                        </h2>
                        <p className="text-lg text-white/90 font-medium max-w-md leading-relaxed">
                           You are performing exceptionally well. Continue expanding your network to unlock <span className="font-bold underline decoration-yellow-400 decoration-2 underline-offset-4">Emerald</span> status.
                        </p>
                     </div>
                     
                     {/* Referral Code Box */}
                     <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-1 flex items-center gap-2 w-fit pr-4 shadow-inner">
                        <div className="bg-white text-gray-900 px-4 py-3 rounded-xl font-mono text-xl font-bold tracking-wider shadow-sm">
                           {user.referralCode || "----"}
                        </div>
                        <div className="flex flex-col items-start px-2">
                            <span className="text-[10px] uppercase font-bold text-white/60 tracking-widest">Referral Code</span>
                            <span className="text-xs font-medium text-white">Share to earn</span>
                        </div>
                        <button onClick={copyCode} className="ml-2 p-2 hover:bg-white/20 rounded-lg transition-colors text-white" title="Copy Code">
                           <ClipboardDocumentCheckIcon className="w-5 h-5" />
                        </button>
                        <span id="copy-btn" className="text-xs font-bold text-emerald-300"></span>
                     </div>
                  </div>

                  {/* Right Side: Progress Circle or Card */}
                  {nextTierConfig && (
                     <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-3xl p-8 w-full md:w-[400px] shadow-xl">
                        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                           <div>
                              <div className="text-xs text-white/50 uppercase tracking-widest font-bold mb-1">Next Milestone</div>
                              <div className="text-2xl font-bold">{nextTier}</div>
                           </div>
                           <div className="text-right">
                               <div className="text-xs text-white/50 uppercase tracking-widest font-bold mb-1">Completion</div>
                               <div className="text-2xl font-bold text-emerald-400">{Math.min(pointsProgress, membersProgress).toFixed(0)}%</div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="space-y-2">
                              <div className="flex justify-between text-xs font-bold">
                                 <span>Points Progress</span>
                                 <span className="text-white/70">{user.points.toFixed(0)} / {nextTierConfig.points}</span>
                              </div>
                              <div className="h-3 bg-black/30 rounded-full overflow-hidden border border-white/5">
                                 <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" style={{ width: `${pointsProgress}%` }}></div>
                              </div>
                           </div>
                           <div className="space-y-2">
                              <div className="flex justify-between text-xs font-bold">
                                 <span>Team Growth</span>
                                 <span className="text-white/70">{stats.teamSize} / {nextTierConfig.members} Members</span>
                              </div>
                              <div className="h-3 bg-black/30 rounded-full overflow-hidden border border-white/5">
                                 <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" style={{ width: `${membersProgress}%` }}></div>
                              </div>
                           </div>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3 text-xs text-white/60">
                           <ClockIcon className="w-4 h-4" />
                           <span>Updates automatically every 5 minutes</span>
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors"></div>
                  <h4 className="font-serif font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                     <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><CheckCircleIcon className="w-5 h-5"/></span>
                     Active Benefits
                  </h4>
                  <div className="space-y-4">
                     {[0, 1, 2].map(idx => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                           <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${LEVEL_COLORS[(idx + 1) as 1|2|3]}`}>
                                 L{idx + 1}
                              </div>
                              <span className="text-sm font-medium text-gray-600">Referral Commission</span>
                           </div>
                           <span className="text-lg font-bold text-gray-900">{(tierConfig.levels[idx] * 100).toFixed(0)}%</span>
                        </div>
                     ))}
                  </div>
               </div>

               {nextTierConfig && (
                  <div className="bg-gray-900 rounded-[2rem] p-8 border border-gray-800 shadow-sm relative overflow-hidden text-white group">
                     {/* Animated Gradient Border Effect */}
                     <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-50"></div>
                     <div className="relative z-10">
                        <h4 className="font-serif font-bold text-xl mb-6 flex items-center gap-2 text-white">
                           <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-yellow-400"><SparklesIcon className="w-5 h-5"/></span>
                           Unlock with {nextTier}
                        </h4>
                        <div className="space-y-4">
                           {[0, 1, 2].map(idx => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                                 <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white/80">
                                       L{idx + 1}
                                    </div>
                                    <span className="text-sm font-medium text-white/60">Referral Commission</span>
                                 </div>
                                 <span className="text-lg font-bold text-yellow-400">+{(nextTierConfig.levels[idx] * 100).toFixed(0)}%</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}
            </div>
          </motion.div>
        )}

        {activeTab === "tree" && (
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }}
             className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden"
           >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <div>
                    <h3 className="font-serif font-bold text-gray-900 text-lg">My Team Structure</h3>
                    <p className="text-xs text-gray-500">View your downline across 3 levels.</p>
                 </div>
                 
                 <div className="flex gap-1.5 p-1 bg-white border border-gray-200 rounded-xl">
                    {(["all", 1, 2, 3] as const).map(lvl => (
                       <button 
                         key={lvl}
                         onClick={() => setLevelFilter(lvl)}
                         className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            levelFilter === lvl 
                               ? "bg-gray-900 text-white shadow-sm" 
                               : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                         }`}
                       >
                          {lvl === 'all' ? 'All' : `Level ${lvl}`}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/30 text-xs uppercase text-gray-400 font-bold tracking-wider">
                       <tr>
                          <th className="p-6 font-medium">Partner</th>
                          <th className="p-6 font-medium">Status</th>
                          <th className="p-6 font-medium">Level</th>
                          <th className="p-6 font-medium">Performance</th>
                          <th className="p-6 font-medium text-right">Joined</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {filteredTree.length > 0 ? filteredTree.map((node) => (
                          <tr key={node.id} className="hover:bg-blue-50/20 transition-colors group">
                             <td className="p-6">
                                <div className="flex items-center gap-3">
                                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                                      node.level === 1 ? 'bg-blue-500' : node.level === 2 ? 'bg-purple-500' : 'bg-pink-500'
                                   }`}>
                                      {node.name ? node.name.charAt(0) : "U"}
                                   </div>
                                   <div>
                                      <div className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{node.name || "Anonymous User"}</div>
                                      <div className="text-xs text-gray-400 font-mono">{node.email}</div>
                                   </div>
                                </div>
                             </td>
                             <td className="p-6">
                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase border ${TIER_THEME[node.tier]?.border || "border-gray-200"} ${TIER_THEME[node.tier]?.text || "text-gray-500"} bg-white`}>
                                   {node.tier}
                                </span>
                             </td>
                             <td className="p-6">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${LEVEL_COLORS[node.level as 1|2|3]}`}>
                                   <div className="w-2 h-2 rounded-full bg-current"></div>
                                   Level {node.level}
                                </div>
                             </td>
                             <td className="p-6">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                   <ChartBarIcon className="w-4 h-4 text-gray-400" />
                                   {node.points.toLocaleString()} PTS
                                </div>
                             </td>
                             <td className="p-6 text-right text-sm text-gray-500">
                                {new Date(node.createdAt).toLocaleDateString()}
                             </td>
                          </tr>
                       )) : (
                          <tr>
                             <td colSpan={5} className="p-20 text-center">
                                <div className="flex flex-col items-center justify-center">
                                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                      <UserGroupIcon className="w-8 h-8 text-gray-300" />
                                   </div>
                                   <h4 className="text-gray-900 font-bold mb-1">No Partners Found</h4>
                                   <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                      {levelFilter === 'all' 
                                         ? "You haven't referred anyone yet. Share your code to start building your team!" 
                                         : `You don't have any Level ${levelFilter} referrals yet.`}
                                   </p>
                                </div>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </motion.div>
        )}

        {/** Rewards Tab matches the premium style with simplified list for now **/}
        {activeTab === "rewards" && (
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }}
             className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40"
           >
              <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                 <h3 className="font-serif font-bold text-gray-900 text-lg">Financial History</h3>
              </div>
              <div className="divide-y divide-gray-50">
                 {commissions.length > 0 ? commissions.map((comm) => (
                    <div key={comm.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100 shadow-sm">
                             <CurrencyDollarIcon className="w-6 h-6" />
                          </div>
                          <div>
                             <div className="font-bold text-gray-900">Referral Commission</div>
                             <div className="text-sm text-gray-500 flex items-center gap-1">
                                From 
                                <span className={`px-1.5 py-0.5 rounded textxs font-bold ${LEVEL_COLORS[comm.level as 1|2|3]}`}>
                                   Level {comm.level}
                                </span>
                             </div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-lg font-bold text-emerald-600">
                             +${comm.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400 font-medium">
                             {new Date(comm.createdAt).toLocaleDateString()}
                          </div>
                       </div>
                    </div>
                 )) : (
                    <div className="p-20 text-center text-gray-500">
                       No commissions earned yet.
                    </div>
                 )}
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
