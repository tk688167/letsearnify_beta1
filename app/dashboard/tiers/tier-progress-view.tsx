"use client"

import { motion } from "framer-motion"
import { 
  CheckCircleIcon, 
  LockClosedIcon, 
  TrophyIcon,
  StarIcon
} from "@heroicons/react/24/outline"
import { TIER_RULES, TierLevel } from "@/lib/mlm"

// Theme config for each tier
const TIER_THEME: Record<string, { bg: string, border: string, text: string, icon: string, glow: string }> = {
  NEWBIE: { 
     bg: "bg-gradient-to-br from-gray-100 to-gray-300", 
     border: "border-gray-200", 
     text: "text-gray-700", 
     icon: "🚀", 
     glow: "shadow-gray-500/10" 
  },
  BRONZE: { 
     bg: "bg-gradient-to-br from-[#CD7F32] to-[#8B4513]", 
     border: "border-orange-200", 
     text: "text-orange-900", 
     icon: "🥉", 
     glow: "shadow-orange-500/20" 
  },
  SILVER: { 
     bg: "bg-gradient-to-br from-[#E0E0E0] to-[#9E9E9E]", 
     border: "border-gray-300", 
     text: "text-gray-900", 
     icon: "🥈", 
     glow: "shadow-gray-500/20" 
  },
  GOLD: { 
     bg: "bg-gradient-to-br from-[#FFD700] to-[#DAA520]", 
     border: "border-yellow-300", 
     text: "text-yellow-900", 
     icon: "🥇", 
     glow: "shadow-yellow-500/30" 
  },
  PLATINUM: { 
     bg: "bg-gradient-to-br from-[#8A2BE2] to-[#4B0082]", 
     border: "border-purple-300", 
     text: "text-purple-900", 
     icon: "💎", 
     glow: "shadow-purple-500/30" 
  },
  DIAMOND: { 
     bg: "bg-gradient-to-br from-[#0000FF] to-[#00008B]", 
     border: "border-blue-300", 
     text: "text-blue-900", 
     icon: "💠", 
     glow: "shadow-blue-500/40" 
  },
  EMERALD: { 
     bg: "bg-gradient-to-br from-[#50C878] to-[#2E8B57]", 
     border: "border-emerald-300", 
     text: "text-emerald-900", 
     icon: "👑", 
     glow: "shadow-emerald-500/40" 
  }
}

const TIERS: TierLevel[] = ["NEWBIE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "EMERALD"]

type TierProgressViewProps = {
  user: {
    tier: string
    points: number
  }
  stats: {
    teamSize: number
  }
}

export default function TierProgressView({ user, stats }: TierProgressViewProps) {
  const currentTierIndex = TIERS.indexOf(user.tier as TierLevel)

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Header Summary */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
         <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-bold border border-blue-100">
            <TrophyIcon className="w-4 h-4" />
            My Journey
         </div>
         <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">Tier Progression</h1>
         <p className="text-gray-500 text-lg">Unlock higher commission rates and exclusive rewards by growing your team and earning points.</p>
      </div>

      {/* Tiers Timeline / Cards */}
      <div className="space-y-8">
         {TIERS.map((tierName, index) => {
            const config = TIER_RULES[tierName]
            const theme = TIER_THEME[tierName]
            
            // Status Logic
            const isCompleted = index < currentTierIndex
            const isCurrent = index === currentTierIndex
            const isLocked = index > currentTierIndex
            const isNext = index === currentTierIndex + 1

            // Determine Target Requirements for THIS Tier Card
            // If I am looking at the "Starter" card:
            // - If I am Starter: Show progress towards Bronze (Next Tier Requirements)
            // - If I am Bronze+: Show "Completed" (Full styling)
            
            // Wait, standard UI pattern:
            // "Starter" is where I AM. The progress bar inside "Starter" usually implies "Progress through Starter".
            // So for Starter card, we show progress to Bronze.
            // For Bronze card, we show progress to Silver.
            
            // Target Config (The goal to complete this stage)
            // If this is the last tier (Emerald), there is no next tier.
            const nextTierName = index < TIERS.length - 1 ? TIERS[index + 1] : null
            const targetConfig = nextTierName ? TIER_RULES[nextTierName] : config
            
            // Base Config (Where this stage starts)
            const baseConfig = config
            
            // Calculate Progress Bars
            let pointsPercent = 0
            let membersPercent = 0
            let pointsDisplay = 0
            let membersDisplay = 0

            // Helper to calculate percentage between range [min, max]
            const calcPercent = (current: number, min: number, max: number) => {
               if (max <= min) return 100 // Avoid divide by zero
               const gained = Math.max(0, current - min)
               const needed = max - min
               return Math.min((gained / needed) * 100, 100)
            }

            if (isCompleted) {
               pointsPercent = 100
               membersPercent = 100
               pointsDisplay = targetConfig.points
               membersDisplay = targetConfig.members
            } else if (isCurrent && nextTierName) {
               // Current Stage: Calculate progress from Base to Target
               // Example: Starter (0) -> Bronze (150). User has 50.
               // Progress = (50 - 0) / (150 - 0) = 33%
               
               // Example: Bronze (150) -> Silver (350). User has 200.
               // Progress = (200 - 150) / (350 - 150) = 50 / 200 = 25%
               
               pointsPercent = calcPercent(user.points, baseConfig.points, targetConfig.points)
               membersPercent = calcPercent(stats.teamSize, baseConfig.members, targetConfig.members)
               
               pointsDisplay = user.points
               membersDisplay = stats.teamSize
            } else {
               // Locked: 0%
               pointsPercent = 0
               membersPercent = 0
               pointsDisplay = 0
               membersDisplay = 0
            }

            // For Emerald (Last one), if current, just show full or special
            if (!nextTierName && isCurrent) {
               pointsPercent = 100
               membersPercent = 100
               pointsDisplay = user.points
               membersDisplay = stats.teamSize
            }

            // Overall Progress (Average of the two conditions)
            const totalProgress = (pointsPercent + membersPercent) / 2

            return (
               <motion.div 
                 key={tierName}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: index * 0.1 }}
                 className={`relative rounded-[2.5rem] overflow-hidden border transition-all duration-300 ${
                    !isLocked 
                       ? `bg-white ${theme.border} shadow-lg ${theme.glow}` 
                       : isNext // Highlight the immediate next goal
                          ? "bg-white ring-2 ring-blue-500 ring-offset-4 shadow-xl scale-[1.02] border-blue-200" 
                          : "bg-gray-50 border-gray-100 opacity-80 grayscale-[0.5]"
                 }`}
               >
                  {/* Background Logic */}
                  {!isLocked && (
                     <div className={`absolute top-0 left-0 w-full h-2 ${theme.bg}`}></div>
                  )}

                  <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 md:items-center">
                     
                     {/* Tier Identity */}
                     <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                           <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${
                              !isLocked ? theme.bg + " text-white" : "bg-gray-200 text-gray-400"
                           }`}>
                              {theme.icon}
                           </div>
                           <div>
                              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                 {tierName}
                                 {isCompleted && <CheckCircleIcon className="w-6 h-6 text-emerald-500" />}
                                 {isLocked && <LockClosedIcon className="w-5 h-5 text-gray-400" />}
                              </h3>
                              <p className="text-sm text-gray-500 font-medium">
                                 {isCompleted ? "Completed" : isCurrent ? "Current Stage" : "Locked"}
                              </p>
                           </div>
                        </div>

                        {/* Rewards / Benefits Grid */}
                        <div className="grid grid-cols-3 gap-2 mt-6">
                           <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                              <div className="text-xs text-gray-400 font-medium uppercase mb-1">Level 1</div>
                              <div className="font-bold text-gray-900">{(config.levels[0] * 100).toFixed(0)}%</div>
                           </div>
                           <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                              <div className="text-xs text-gray-400 font-medium uppercase mb-1">Level 2</div>
                              <div className="font-bold text-gray-900">{(config.levels[1] * 100).toFixed(0)}%</div>
                           </div>
                           <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                              <div className="text-xs text-gray-400 font-medium uppercase mb-1">Level 3</div>
                              <div className="font-bold text-gray-900">{(config.levels[2] * 100).toFixed(0)}%</div>
                           </div>
                        </div>
                     </div>

                     {/* Progress Stats */}
                     <div className="flex-1 bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                           <StarIcon className="w-5 h-5 text-yellow-500" />
                           {isCompleted ? "Requirements Met" : isCurrent ? "Next Milestone Requirements" : "Requirements"}
                        </h4>
                        
                        <div className="space-y-5">
                           {/* Points Bar */}
                           <div>
                              <div className="flex justify-between text-sm mb-1.5">
                                 <span className="font-medium text-gray-600">Points</span>
                                 <span className="font-bold text-gray-900">
                                    {pointsDisplay.toLocaleString()} / {targetConfig ? targetConfig.points.toLocaleString() : "Max"}
                                 </span>
                              </div>
                              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                 <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                    style={{ width: `${pointsPercent}%` }}
                                 ></div>
                              </div>
                              {isCurrent && nextTierName && (
                                 <div className="text-xs text-gray-400 mt-1">
                                    {Math.max(0, targetConfig.points - user.points).toLocaleString()} more needed
                                 </div>
                              )}
                           </div>

                           {/* Members Bar */}
                           <div>
                              <div className="flex justify-between text-sm mb-1.5">
                                 <span className="font-medium text-gray-600">Active Team</span>
                                 <span className="font-bold text-gray-900">
                                    {membersDisplay.toLocaleString()} / {targetConfig ? targetConfig.members.toLocaleString() : "Max"}
                                 </span>
                              </div>
                              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                 <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-purple-500'}`} 
                                    style={{ width: `${membersPercent}%` }}
                                 ></div>
                              </div>
                               {isCurrent && nextTierName && (
                                 <div className="text-xs text-gray-400 mt-1">
                                    {Math.max(0, targetConfig.members - stats.teamSize).toLocaleString()} more needed
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Action / Status */}
                     <div className="w-full md:w-auto flex justify-center">
                        {isCompleted ? (
                           <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                              <CheckCircleIcon className="w-7 h-7" />
                           </div>
                        ) : isCurrent ? (
                           <div className="text-center px-4">
                              <div className="text-3xl font-bold text-blue-600">{totalProgress.toFixed(0)}%</div>
                              <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">Progress</div>
                           </div>
                        ) : (
                           <LockClosedIcon className="w-8 h-8 text-gray-300" />
                        )}
                     </div>

                  </div>
               </motion.div>
            )
         })}
      </div>
    </div>
  )
}
