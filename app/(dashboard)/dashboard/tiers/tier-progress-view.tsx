"use client"

import { motion } from "framer-motion"
import { useMemo, useState } from "react"
import { 
  CheckCircleIcon, 
  LockClosedIcon, 
  StarIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { SparklesIcon } from "@heroicons/react/24/solid"
import { TIER_COMMISSIONS, TIER_WITHDRAWAL_LIMITS, TIER_REWARDS } from "@/lib/mlm"
import { cn } from "@/lib/utils"

const TIER_STYLES: Record<string, { badge: string, border: string, text: string, icon: string, bg: string, ring: string, accent: string }> = {
    NEWBIE: { badge: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300", border: "border-gray-200 dark:border-gray-700", text: "text-gray-900 dark:text-gray-100", icon: "🚀", bg: "bg-white dark:bg-gray-900", ring: "ring-gray-100 dark:ring-gray-800", accent: "bg-gray-400 dark:bg-gray-500" },
    BRONZE: { badge: "bg-orange-50 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800/60", text: "text-orange-900 dark:text-orange-300", icon: "🥉", bg: "bg-white dark:bg-gray-900", ring: "ring-orange-100 dark:ring-orange-900/40", accent: "bg-orange-400 dark:bg-orange-500" },
    SILVER: { badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700", text: "text-slate-900 dark:text-slate-100", icon: "🥈", bg: "bg-white dark:bg-gray-900", ring: "ring-slate-100 dark:ring-slate-800", accent: "bg-slate-400 dark:bg-slate-500" },
    GOLD: { badge: "bg-yellow-50 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300", border: "border-yellow-200 dark:border-yellow-800/60", text: "text-yellow-900 dark:text-yellow-300", icon: "🥇", bg: "bg-white dark:bg-gray-900", ring: "ring-yellow-100 dark:ring-yellow-900/40", accent: "bg-yellow-400 dark:bg-yellow-500" },
    PLATINUM: { badge: "bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-300", border: "border-slate-300 dark:border-slate-600", text: "text-slate-900 dark:text-slate-100", icon: "💎", bg: "bg-white dark:bg-gray-900", ring: "ring-slate-200 dark:ring-slate-700", accent: "bg-slate-500 dark:bg-slate-400" },
    DIAMOND: { badge: "bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800/60", text: "text-blue-900 dark:text-blue-300", icon: "💠", bg: "bg-white dark:bg-gray-900", ring: "ring-blue-100 dark:ring-blue-900/40", accent: "bg-blue-500 dark:bg-blue-400" },
    EMERALD: { badge: "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800/60", text: "text-emerald-900 dark:text-emerald-300", icon: "✳️", bg: "bg-white dark:bg-gray-900", ring: "ring-emerald-100 dark:ring-emerald-900/40", accent: "bg-emerald-500 dark:bg-emerald-400" },
}

const TIERS = ["NEWBIE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "EMERALD"]

type TierProgressViewProps = {
  user: { tier: string; arnBalance: number; balance: number }
  stats: { teamSize: number }
  tierConfig: Record<string, { arn: number, directs: number }>
  referralTree: any[]
}

export default function TierProgressView({ user, stats, tierConfig, referralTree }: TierProgressViewProps) {
  const currentTierIndex = TIERS.indexOf(user.tier)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const calcPercent = (current: number, min: number, max: number) => {
      if (max <= min) return 100 
      const gained = Math.max(0, current - min)
      const needed = max - min
      return Math.min((gained / needed) * 100, 100)
  }

  const networkMembersTable = useMemo(() => {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden ">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-indigo-500" />
            Network Members
          </h3>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-100 dark:border-indigo-800/50">
            {referralTree.length} Partners
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">Partner</th>
                <th className="px-6 py-4 text-center">Level</th>
                <th className="px-6 py-4 text-center">Tier</th>
                <th className="px-6 py-4 text-right">Join Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {referralTree.length > 0 ? referralTree.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center font-bold text-indigo-600 border border-indigo-100 dark:border-indigo-800/50">
                        {member.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">{member.name || "Member Account"}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold border",
                      member.level === 1 ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50" :
                      member.level === 2 ? "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50" :
                      "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50"
                    )}>
                      LVL {member.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">{member.tier}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 font-medium">
                    No network members found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }, [referralTree])

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto">
      
      {/* ═══ HERO BANNER ═══ */}
      <div className="relative isolate overflow-hidden rounded-2xl text-white"
        style={{ background: "linear-gradient(135deg, #1c1917 0%, #44250a 50%, #1c1003 100%)" }}>
        <div className="absolute -top-8 -right-8 w-36 h-36 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-yellow-500/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zm40 0h1v40h-1zM0 0v1h41V0zm0 40v1h41v-1z'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative z-10 px-5 sm:px-8 py-5 sm:py-6 text-center">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 border border-white/15 mb-3">
            <StarIcon className="w-4 h-4 text-amber-200" />
          </div>
          <div className="mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/8 border border-white/10 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300/80">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Career Path
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight leading-tight mb-2 text-white">
            Your{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-200 to-yellow-300">Journey</span>
          </h1>
          <p className="text-amber-200/70 text-sm max-w-sm mx-auto mb-4">Unlock higher commissions as you progress through the tiers</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/20 text-[11px] font-semibold text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Current Tier: {user.tier}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />
      </div>

      {/* Mobile: History button opens Network Members popup */}
      <div className="md:hidden -mt-2">
        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold
            bg-white/90 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100
            shadow-sm active:scale-[0.99] transition"
        >
          <UsersIcon className="w-4 h-4 text-indigo-500" />
          History
          <span className="ml-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-300 px-2 py-0.5 rounded-full uppercase tracking-wider border border-indigo-100 dark:border-indigo-800/50">
            {referralTree.length}
          </span>
        </button>
      </div>

      {/* ═══ TIMELINE CONTAINER ═══ */}
      <div className="relative pl-6 md:pl-0">
          <div className="absolute left-[5px] md:left-8 top-4 bottom-4 w-px bg-gray-200 dark:bg-gray-700 transition-colors duration-300" />

          <div className="space-y-6 sm:space-y-8">
             {TIERS.map((tierName, index) => {
                const config = tierConfig[tierName] || { arn: 0, directs: 0 }
                const commissions = TIER_COMMISSIONS[tierName] || { L1: 0, L2: 0, L3: 0 }
                const levels = [commissions.L1, commissions.L2, commissions.L3]
                const style = TIER_STYLES[tierName]
                
                const isCompleted = index < currentTierIndex
                const isCurrent = index === currentTierIndex
                const isLocked = index > currentTierIndex
                
                const prevConfig = index > 0 ? tierConfig[TIERS[index - 1]] || { arn: 0, directs: 0 } : { arn: 0, directs: 0 }
                const baselineArn = prevConfig.arn
                const baselineDirects = prevConfig.directs
                const targetArn = config.arn
                const targetDirects = config.directs
                const stepArn = Math.max(0, targetArn - baselineArn)
                const stepDirects = Math.max(0, targetDirects - baselineDirects)
                const currentArnInStep = Math.max(0, (user.arnBalance || (user.balance * 10)) - baselineArn)
                const currentDirectsInStep = Math.max(0, stats.teamSize - baselineDirects)

                // ═══ KEY FIX: Only current tier shows real progress ═══
                // All locked tiers (including the very next one) show 0
                const pointsProgress = isLocked ? 0 : calcPercent(currentArnInStep, 0, stepArn)
                const membersProgress = isLocked ? 0 : calcPercent(currentDirectsInStep, 0, stepDirects)
                const combinedProgress = Math.round(Math.min(pointsProgress, membersProgress))

                const isFinal = index === TIERS.length - 1

                // Display values — locked tiers show 0
                const displayArn = isLocked ? 0 : Math.round(user.arnBalance || (user.balance * 10))
                const displayTeam = isLocked ? 0 : currentDirectsInStep

                return (
                   <motion.div 
                     key={tierName}
                     initial={{ opacity: 0, x: -20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true, margin: "-40px" }}
                     transition={{ duration: 0.4, delay: index * 0.05 }}
                     className="relative isolate md:pl-24"
                   >
                      {/* Timeline Dot */}
                      <div className={`absolute left-[-19px] md:left-4 top-6 sm:top-8 w-3.5 h-3.5 rounded-full border-2 z-10 transition-all duration-500 ${
                          isCompleted
                            ? "border-emerald-500 bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-400"
                            : isCurrent
                              ? "border-indigo-500 dark:border-indigo-400 bg-white dark:bg-gray-900 animate-pulse scale-125"
                              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                      }`} />

                      {/* ═══ TIER CARD ═══ */}
                      <div className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${
                          isCurrent 
                            ? "bg-white dark:bg-gray-900 border-indigo-200 dark:border-indigo-700/60 shadow-xl shadow-indigo-100/40 dark:shadow-indigo-900/20 ring-1 ring-indigo-50 dark:ring-indigo-900/40" 
                            : isCompleted
                                ? "bg-white dark:bg-gray-900/80 border-gray-200 dark:border-gray-700/60 opacity-80 hover:opacity-100 transition-opacity"
                                : "bg-gray-50/60 dark:bg-gray-900/40 border-gray-200/70 dark:border-gray-700/40"
                      }`}>
                          
                          {/* Card Header */}
                          <div className={`px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 sm:items-center border-b ${
                            isCurrent ? "border-indigo-100/60 dark:border-indigo-800/40" : "border-gray-100/60 dark:border-gray-700/40"
                          }`}>
                               <div className="flex items-center gap-4">
                                   <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-sm border shrink-0 transition-all duration-300 ${
                                       isLocked ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 grayscale opacity-50" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                                   }`}>
                                       {style.icon}
                                   </div>
                                   <div className="min-w-0">
                                       <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 flex-wrap ${
                                         isCurrent ? "text-indigo-900 dark:text-indigo-200" : isCompleted ? "text-gray-800 dark:text-gray-200" : "text-gray-500 dark:text-gray-500"
                                       }`}>
                                           {tierName}
                                          {isCompleted && <CheckCircleIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />}
                                           {isCurrent && (
                                             <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide border border-indigo-200/60 dark:border-indigo-700/40">Active</span>
                                           )}
                                          {isLocked && <LockClosedIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600 shrink-0" />}
                                       </h3>
                                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs mt-1">
                                           <span className={isLocked ? "text-gray-400 dark:text-gray-600" : "text-gray-500 dark:text-gray-400"}>
                                             L1: <strong className={isLocked ? "text-gray-400 dark:text-gray-600" : "text-gray-700 dark:text-gray-300"}>{levels[0]}%</strong>
                                           </span>
                                           <span className="w-0.5 h-0.5 bg-gray-300 dark:bg-gray-600 rounded-full hidden sm:block" />
                                           <span className={isLocked ? "text-gray-400 dark:text-gray-600" : "text-gray-500 dark:text-gray-400"}>
                                             L2: <strong className={isLocked ? "text-gray-400 dark:text-gray-600" : "text-gray-700 dark:text-gray-300"}>{levels[1]}%</strong>
                                           </span>
                                           <span className="w-0.5 h-0.5 bg-gray-300 dark:bg-gray-600 rounded-full hidden sm:block" />
                                           <span className={isLocked ? "text-gray-400 dark:text-gray-600" : "text-gray-500 dark:text-gray-400"}>
                                             L3: <strong className={isLocked ? "text-gray-400 dark:text-gray-600" : "text-gray-700 dark:text-gray-300"}>{levels[2]}%</strong>
                                           </span>
                                       </div>
                                   </div>
                               </div>

                               {isCurrent ? (
                                   <div className="sm:text-right flex flex-col items-center sm:items-end gap-1">
                                       <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 sm:justify-end">
                                           <SparklesIcon className="w-3.5 h-3.5" />
                                           Next Tier Progress: {combinedProgress}%
                                       </div>
                                       <div className="h-1.5 w-32 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                           <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: combinedProgress + "%" }} />
                                       </div>
                                   </div>
                               ) : isLocked ? (
                                    <div className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest sm:text-right">Locked</div>
                               ) : (
                                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest sm:text-right">Completed</div>
                               )}
                          </div>

                          {/* Card Body — Requirements (only for current and locked, not completed, not final) */}
                          {!isCompleted && !isFinal && (
                            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 grid sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Required ARN</span>
                                        <span className={`text-xs font-bold ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {displayArn.toLocaleString()}
                                            <span className="text-gray-400 dark:text-gray-600 font-normal"> / {targetArn.toLocaleString()}</span>
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${isCurrent ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-gray-300 dark:bg-gray-600'}`} 
                                          style={{ width: Math.min(pointsProgress, 100) + "%" }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Required Team Size</span>
                                        <span className={`text-xs font-bold ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {displayTeam.toLocaleString()}
                                            <span className="text-gray-400 dark:text-gray-600 font-normal"> / {targetDirects.toLocaleString()}</span>
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${isCurrent ? 'bg-purple-500 dark:bg-purple-400' : 'bg-gray-300 dark:bg-gray-600'}`} 
                                          style={{ width: Math.min(membersProgress, 100) + "%" }} />
                                    </div>
                                </div>
                            </div>
                          )}
                          
                          {isCompleted && (
                             <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4">
                                 <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/25 border border-emerald-200/60 dark:border-emerald-800/40 inline-flex items-center gap-1.5 px-3 py-1 rounded-full">
                                   <CheckCircleIcon className="w-3 h-3" />
                                   Requirements Met · Access Granted
                                 </span>
                             </div>
                          )}

                          {isFinal && (
                             <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5">
                                 <div className={`p-3 sm:p-4 rounded-xl border flex items-center justify-center gap-2.5 text-sm font-medium ${
                                     isCurrent ? "bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-indigo-100 dark:border-indigo-800/40 text-indigo-800 dark:text-indigo-300"
                                     : isCompleted ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400"
                                     : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/60 text-gray-500 dark:text-gray-500"
                                 }`}>
                                    <SparklesIcon className={`w-4 h-4 shrink-0 ${
                                      isCurrent ? "text-indigo-500 dark:text-indigo-400" : isCompleted ? "text-emerald-500 dark:text-emerald-400" : "text-gray-400 dark:text-gray-600"
                                    }`} />
                                    <span className="text-xs sm:text-sm text-center">
                                        {isCurrent ? "You have reached the maximum tier — Pinnacle of success!" 
                                         : isCompleted ? "Maximum tier achieved. You are at the pinnacle!"
                                         : "The ultimate goal. The final tier."}
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
      
      {/* ═══ NETWORK MEMBERS TABLE ═══ */}
      <div className="hidden md:block">
        {networkMembersTable}
      </div>

      {/* Mobile popup */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsHistoryOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-indigo-500" />
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">Network Members</div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-300 px-2 py-0.5 rounded-full uppercase tracking-wider border border-indigo-100 dark:border-indigo-800/50">
                  {referralTree.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(88vh-52px)] p-4">
              {networkMembersTable}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}