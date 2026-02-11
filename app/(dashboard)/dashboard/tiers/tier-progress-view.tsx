"use client"

import { motion } from "framer-motion"
import { 
  CheckCircleIcon, 
  LockClosedIcon, 
  StarIcon,
  ArrowLongRightIcon
} from "@heroicons/react/24/outline"
import { SparklesIcon } from "@heroicons/react/24/solid"
import { TIER_COMMISSIONS } from "@/lib/mlm"

// ... (imports)

// Professional Color Map (Subtle, Banking-style)
const TIER_STYLES: Record<string, { badge: string, border: string, text: string, icon: string, bg: string, ring: string }> = {
    NEWBIE: { badge: "bg-gray-100 text-gray-700", border: "border-gray-200", text: "text-gray-900", icon: "🚀", bg: "bg-white", ring: "ring-gray-100" },
    BRONZE: { badge: "bg-orange-50 text-orange-800", border: "border-orange-200", text: "text-orange-900", icon: "🥉", bg: "bg-white", ring: "ring-orange-100" },
    SILVER: { badge: "bg-slate-100 text-slate-700", border: "border-slate-200", text: "text-slate-900", icon: "🥈", bg: "bg-white", ring: "ring-slate-100" },
    GOLD:   { badge: "bg-yellow-50 text-yellow-800", border: "border-yellow-200", text: "text-yellow-900", icon: "🥇", bg: "bg-white", ring: "ring-yellow-100" },
    PLATINUM: { badge: "bg-slate-50 text-slate-800", border: "border-slate-300", text: "text-slate-900", icon: "💎", bg: "bg-white", ring: "ring-slate-200" },
    DIAMOND: { badge: "bg-blue-50 text-blue-800", border: "border-blue-200", text: "text-blue-900", icon: "💠", bg: "bg-white", ring: "ring-blue-100" },
    EMERALD: { badge: "bg-emerald-50 text-emerald-800", border: "border-emerald-200", text: "text-emerald-900", icon: "✳️", bg: "bg-white", ring: "ring-emerald-100" },
}

const TIERS = ["NEWBIE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "EMERALD"]

type TierProgressViewProps = {
  user: {
    tier: string
    arnBalance: number
  }
  stats: {
    teamSize: number
  }
  tierConfig: Record<string, { arn: number, directs: number }>
}

export default function TierProgressView({ user, stats, tierConfig }: TierProgressViewProps) {
  const currentTierIndex = TIERS.indexOf(user.tier)

  // Helper to calculate percentage between range [min, max]
  const calcPercent = (current: number, min: number, max: number) => {
      if (max <= min) return 100 
      const gained = Math.max(0, current - min)
      const needed = max - min
      return Math.min((gained / needed) * 100, 100)
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
         <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                  Career Path
               </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Journey</h1>
            <p className="text-gray-500 mt-1">Track your progress and unlock higher commission tiers.</p>
         </div>
         <div className="text-right hidden md:block">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Current Status</div>
            <div className="text-2xl font-bold text-indigo-600">{user.tier}</div>
         </div>
      </div>

      {/* Timeline Container */}
      <div className="relative pl-8 md:pl-0">
          
          {/* Vertical Line (Desktop: Center / Mobile: Left) */}
          <div className="absolute left-0 md:left-8 top-4 bottom-4 w-px bg-gray-200"></div>

          <div className="space-y-12">
             {TIERS.map((tierName, index) => {
                const config = tierConfig[tierName] || { arn: 0, directs: 0 }
                // Use imported commissions or fallback
                const commissions = TIER_COMMISSIONS[tierName] || { L1: 0, L2: 0, L3: 0 }
                const levels = [commissions.L1, commissions.L2, commissions.L3]
                
                const style = TIER_STYLES[tierName]
                
                const isCompleted = index < currentTierIndex
                const isCurrent = index === currentTierIndex
                const isLocked = index > currentTierIndex
                
                // For progress calculation
                const pointsProgress = calcPercent(user.arnBalance, 0, config.arn) 
                const membersProgress = calcPercent(stats.teamSize, 0, config.directs)
                const isFinal = index === TIERS.length - 1

                return (
                   <motion.div 
                     key={tierName}
                     initial={{ opacity: 0, x: -20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true, margin: "-50px" }}
                     className="relative md:pl-24"
                   >
                      {/* Timeline Dot */}
                      <div className={`absolute left-[-5px] md:left-4 top-8 w-3 h-3 rounded-full border-2 bg-white z-10 transition-colors duration-500 ${
                          isCompleted ? "border-emerald-500 bg-emerald-500" :
                          isCurrent ? "border-indigo-500 animate-pulse scale-125" :
                          "border-gray-300"
                      }`}></div>

                      {/* Content Card */}
                      <div className={`group rounded-[1.5rem] border transition-all duration-300 ${
                          isCurrent 
                            ? "bg-white border-indigo-200 shadow-xl shadow-indigo-100/50 ring-1 ring-indigo-50" 
                            : isCompleted
                                ? "bg-white border-gray-200 opacity-75 hover:opacity-100"
                                : "bg-gray-50/50 border-gray-200/60"
                      }`}>
                          
                          {/* Card Header */}
                          <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 md:items-center border-b border-gray-100/50">
                               <div className="flex items-center gap-5">
                                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-gray-100 ${
                                       isLocked ? "bg-gray-100 grayscale opacity-50" : "bg-white"
                                   }`}>
                                       {style.icon}
                                   </div>
                                   <div>
                                       <h3 className={`text-xl font-bold flex items-center gap-2 ${isCurrent ? 'text-indigo-900' : 'text-gray-900'}`}>
                                           {tierName}
                                           {isCompleted && <CheckCircleIcon className="w-5 h-5 text-emerald-500" />}
                                           {isCurrent && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">Active</span>}
                                           {isLocked && <LockClosedIcon className="w-4 h-4 text-gray-400" />}
                                       </h3>
                                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                           <span>Level 1: <strong className="text-gray-700">{levels[0]}%</strong></span>
                                           <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                           <span>Level 2: <strong className="text-gray-700">{levels[1]}%</strong></span>
                                           <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                           <span>Level 3: <strong className="text-gray-700">{levels[2]}%</strong></span>
                                       </div>
                                   </div>
                               </div>

                               {/* Right Side: Status or Quick Stats */}
                               {isCurrent ? (
                                   <div className="text-center md:text-right">
                                       <div className="text-sm font-medium text-indigo-600 flex items-center gap-1 justify-center md:justify-end">
                                           <SparklesIcon className="w-4 h-4" />
                                           Current Benefits Active
                                       </div>
                                   </div>
                               ) : isLocked ? (
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center md:text-right">Locked</div>
                               ) : (
                                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest text-center md:text-right">Completed</div>
                               )}
                          </div>

                          {/* Card Body - Requirements (Show if NOT completed AND NOT the final tier) */}
                          <div className={`p-6 md:p-8 grid md:grid-cols-2 gap-8 ${(isCompleted || isFinal) ? 'hidden' : 'block'}`}>
                              
                              {/* Points Requirement */}
                              <div>
                                  <div className="flex justify-between items-end mb-2">
                                      <span className="text-sm font-medium text-gray-500">Required ARN</span>
                                      <span className={`text-sm font-bold ${isCurrent ? 'text-indigo-600' : 'text-gray-700'}`}>
                                          {user.arnBalance.toLocaleString()} <span className="text-gray-400 font-normal">/ {config.arn.toLocaleString()}</span>
                                      </span>
                                  </div>
                                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${isCurrent ? 'bg-indigo-500' : 'bg-gray-300'}`} 
                                        style={{ width: `${Math.min(pointsProgress, 100)}%` }}
                                      ></div>
                                  </div>
                              </div>

                              {/* Members Requirement */}
                              <div>
                                  <div className="flex justify-between items-end mb-2">
                                      <span className="text-sm font-medium text-gray-500">Required Team Size</span>
                                      <span className={`text-sm font-bold ${isCurrent ? 'text-indigo-600' : 'text-gray-700'}`}>
                                          {stats.teamSize.toLocaleString()} <span className="text-gray-400 font-normal">/ {config.directs.toLocaleString()}</span>
                                      </span>
                                  </div>
                                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${isCurrent ? 'bg-purple-500' : 'bg-gray-300'}`} 
                                        style={{ width: `${Math.min(membersProgress, 100)}%` }}
                                      ></div>
                                  </div>
                              </div>
                          </div>
                          
                          {/* Completed State Footer (Optional Summary) */}
                          {isCompleted && (
                             <div className="px-8 pb-6 pt-0">
                                 <div className="text-xs text-emerald-600 font-medium bg-emerald-50 inline-block px-3 py-1 rounded-full">
                                    Requirements Met • Access Granted
                                 </div>
                             </div>
                          )}

                          {/* Final Tier Indicator */}
                          {isFinal && (
                             <div className="px-8 pb-8 pt-2">
                                 <div className={`p-4 rounded-xl border flex items-center justify-center gap-3 font-medium ${
                                     isCurrent 
                                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100 text-indigo-800"
                                        : "bg-gray-50 border-gray-200 text-gray-600"
                                 }`}>
                                    <SparklesIcon className={`w-5 h-5 ${isCurrent ? "text-indigo-500" : "text-gray-400"}`} />
                                    <span>
                                        {isCurrent 
                                            ? "You have reached the maximum tier. Pinnacle of success!" 
                                            : "This is the final tier. The ultimate goal."}
                                    </span>
                                 </div>
                             </div>
                          )}

                      </div>
                   </motion.div>
                )
             })}
          </div>
      </div>
    </div>
  )
}
