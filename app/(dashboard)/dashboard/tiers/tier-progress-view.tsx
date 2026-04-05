"use client"

import { motion } from "framer-motion"
import { useMemo, useState } from "react"
import { 
  CheckCircleIcon, 
  LockClosedIcon, 
  StarIcon,
  UsersIcon,
  XMarkIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline"
import { SparklesIcon } from "@heroicons/react/24/solid"
import { TIER_COMMISSIONS, TIER_ORDER } from "@/lib/mlm"
import { cn, calculateTierProgress } from "@/lib/utils"
import { useCurrency } from "@/app/components/providers/CurrencyProvider"
import { format, subDays, startOfDay } from "date-fns"
import { ArnHistory } from "./ArnHistory"

const TIER_STYLES: Record<string, { badge: string, border: string, text: string, icon: string, bg: string, ring: string, accent: string }> = {
    NEWBIE: { badge: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300", border: "border-gray-200 dark:border-gray-700", text: "text-gray-900 dark:text-gray-100", icon: "🚀", bg: "bg-white dark:bg-gray-900", ring: "ring-gray-100 dark:ring-gray-800", accent: "bg-gray-400 dark:bg-gray-500" },
    BRONZE: { badge: "bg-orange-50 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800/60", text: "text-orange-900 dark:text-orange-300", icon: "🥉", bg: "bg-white dark:bg-gray-900", ring: "ring-orange-100 dark:ring-orange-900/40", accent: "bg-orange-400 dark:bg-orange-500" },
    SILVER: { badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700", text: "text-slate-900 dark:text-slate-100", icon: "🥈", bg: "bg-white dark:bg-gray-900", ring: "ring-slate-100 dark:ring-slate-800", accent: "bg-slate-400 dark:bg-slate-500" },
    GOLD: { badge: "bg-yellow-50 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300", border: "border-yellow-200 dark:border-yellow-800/60", text: "text-yellow-900 dark:text-yellow-300", icon: "🥇", bg: "bg-white dark:bg-gray-900", ring: "ring-yellow-100 dark:ring-yellow-900/40", accent: "bg-yellow-400 dark:bg-yellow-500" },
    PLATINUM: { badge: "bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-300", border: "border-slate-300 dark:border-slate-600", text: "text-slate-900 dark:text-slate-100", icon: "💎", bg: "bg-white dark:bg-gray-900", ring: "ring-slate-200 dark:ring-slate-700", accent: "bg-slate-500 dark:bg-slate-400" },
    DIAMOND: { badge: "bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800/60", text: "text-blue-900 dark:text-blue-300", icon: "💠", bg: "bg-white dark:bg-gray-900", ring: "ring-blue-100 dark:ring-blue-900/40", accent: "bg-blue-500 dark:bg-blue-400" },
    EMERALD: { badge: "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800/60", text: "text-emerald-900 dark:text-emerald-300", icon: "✳️", bg: "bg-white dark:bg-gray-900", ring: "ring-emerald-100 dark:ring-emerald-900/40", accent: "bg-emerald-500 dark:bg-emerald-400" },
}

const TIERS = TIER_ORDER;

type TierProgressViewProps = {
  user: { tier: string; arnBalance: number; balance: number; qualifiedArn: number }
  stats: { teamSize: number; totalSignups: number }
  tierConfig: Record<string, { arn: number, directs: number }>
  referralTree: any[]
  commissions: any[]
  qualifiedTransactions: any[]
}

export default function TierProgressView({ user, stats, tierConfig, referralTree, commissions, qualifiedTransactions }: TierProgressViewProps) {
  const currentTierIndex = TIERS.indexOf((user.tier || "NEWBIE").toUpperCase().trim())
  const currentTierIndexLocal = currentTierIndex === -1 ? 0 : currentTierIndex;
  
  const { formatCurrency } = useCurrency();
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historyTab, setHistoryTab] = useState<'PARTNERS' | 'EARNINGS' | 'ARN_LOG'>('PARTNERS')
  const [timeFilter, setTimeFilter] = useState<'7D' | '30D' | 'CUSTOM'>('30D')
  const [searchTerm, setSearchTerm] = useState('')

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
                      member.level === 1 ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50" :
                      member.level === 2 ? "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50" :
                      "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50"
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

      {/* History button */}
      <div className="-mt-2">
        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-4 text-sm font-black
            bg-white/90 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100
            shadow-xl shadow-black/[0.02] active:scale-[0.98] transition-all hover:border-indigo-500/30 group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
            <StarIcon className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="flex-1 text-left ml-2">Growth & Earning Log</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-300 px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-100 dark:border-indigo-800/50">
                View History
            </span>
            <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
          </div>
        </button>
      </div>


      {/* ═══ TIMELINE CONTAINER ═══ */}
      <div className="relative pl-6 md:pl-0">
          <div className="absolute left-[5px] md:left-8 top-4 bottom-4 w-px bg-gray-200 dark:bg-gray-700 transition-colors duration-300" />

          <div className="space-y-6 sm:space-y-8">
             {TIERS.map((tierName: string, index: number) => {
                const config = tierConfig[tierName] || { arn: 0, directs: 0 }
                const comms = TIER_COMMISSIONS[tierName] || { L1: 0, L2: 0, L3: 0 }
                const levels = [comms.L1, comms.L2, comms.L3]
                const style = TIER_STYLES[tierName]
                
                const isCompleted = index < currentTierIndexLocal
                const isCurrent = index === currentTierIndexLocal
                const isLocked = index > currentTierIndexLocal
                
                const nextTierNameInner = TIERS[index + 1]
                const nextConfigInner = nextTierNameInner ? tierConfig[nextTierNameInner] || { arn: 0, directs: 0 } : { arn: 0, directs: 0 }

                const prevConfig = index > 0 ? tierConfig[TIERS[index - 1]] || { arn: 0, directs: 0 } : { arn: 0, directs: 0 }
                const baselineArn = prevConfig.arn
                const baselineDirects = prevConfig.directs

                const { progress: combinedProgress } = calculateTierProgress(
                    user.tier,
                    user.qualifiedArn || 0,
                    stats.totalSignups || 0,
                    tierConfig as any
                )

                const currentArnInStep = Math.max(0, (user.qualifiedArn || 0) - baselineArn)
                const currentDirectsInStep = Math.max(0, (stats.totalSignups || 0) - baselineDirects)

                const stepArn = Math.max(1, nextConfigInner.arn - baselineArn)
                const stepDirects = Math.max(1, nextConfigInner.directs - baselineDirects)

                const pointsProgress = isCompleted ? 100 : isLocked ? 0 : Math.min((currentArnInStep / stepArn) * 100, 100)
                const membersProgress = isCompleted ? 100 : isLocked ? 0 : Math.min((currentDirectsInStep / stepDirects) * 100, 100)

                const isFinal = index === TIERS.length - 1

                const rawArn = Math.round(user.qualifiedArn || 0)
                const rawTeam = Math.round(stats.totalSignups || 0)

                const displayArn = isCompleted ? nextConfigInner.arn : isLocked ? 0 : Math.min(rawArn, nextConfigInner.arn)
                const displayTeam = isCompleted ? nextConfigInner.directs : isLocked ? 0 : Math.min(rawTeam, nextConfigInner.directs)
                
                const displayTargetArn = nextConfigInner.arn
                const displayTargetTeam = nextConfigInner.directs

                const isArnComplete = isCompleted || (rawArn >= nextConfigInner.arn && nextConfigInner.arn > 0)
                const isTeamComplete = isCompleted || (rawTeam >= nextConfigInner.directs && nextConfigInner.directs > 0)

                return (
                   <motion.div 
                     key={tierName}
                     initial={{ opacity: 0, x: -20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true, margin: "-40px" }}
                     transition={{ duration: 0.4, delay: index * 0.05 }}
                     className="relative isolate md:pl-24"
                   >
                      <div className={`absolute left-[-19px] md:left-4 top-6 sm:top-8 w-3.5 h-3.5 rounded-full border-2 z-10 transition-all duration-500 ${
                          isCompleted
                            ? "border-emerald-500 bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-400"
                            : isCurrent
                              ? "border-indigo-500 dark:border-indigo-400 bg-white dark:bg-gray-900 animate-pulse scale-125"
                              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                      }`} />

                      <div className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${
                          isCurrent 
                            ? "bg-white dark:bg-gray-900 border-indigo-200 dark:border-indigo-700/60 shadow-xl shadow-indigo-100/40 dark:shadow-indigo-900/20 ring-1 ring-indigo-50 dark:ring-indigo-900/40" 
                            : isCompleted
                                ? "bg-white dark:bg-gray-900/80 border-gray-200 dark:border-gray-700/60 opacity-80 hover:opacity-100 transition-opacity"
                                : "bg-gray-50/60 dark:bg-gray-900/40 border-gray-200/70 dark:border-gray-700/40"
                      }`}>
                          
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

                          {!isCompleted && !isFinal && (
                            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 grid sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Required ARN</span>
                                        <span className={`text-xs font-bold ${isArnComplete ? 'text-emerald-600 dark:text-emerald-400' : isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {displayArn.toLocaleString()}
                                            <span className="text-gray-400 dark:text-gray-600 font-normal"> / {displayTargetArn.toLocaleString()}</span>
                                            {isArnComplete && !isLocked && !isCompleted && <span className="ml-1.5 text-[9px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-md">Complete</span>}
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
                                        <span className={`text-xs font-bold ${isTeamComplete ? 'text-emerald-600 dark:text-emerald-400' : isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {displayTeam.toLocaleString()}
                                            <span className="text-gray-400 dark:text-gray-600 font-normal"> / {displayTargetTeam.toLocaleString()}</span>
                                            {isTeamComplete && !isLocked && !isCompleted && <span className="ml-1.5 text-[9px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-md">Complete</span>}
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
      
      {/* ═══ DESKTOP TABLES ═══ */}
      <div className="hidden md:block space-y-8">
        {networkMembersTable}
        <ArnHistory transactions={qualifiedTransactions} />
      </div>

      {/* Mobile/Full-screen History Overlay */}
      {isHistoryOpen && (
        <motion.div 
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 bg-white dark:bg-gray-950 flex flex-col pt-safe"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-950 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50">
                <UsersIcon className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 leading-none">History Log</h2>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">Growth & Earnings</p>
              </div>
            </div>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-24">
            {/* Tabs */}
            <div className="px-5 py-4">
              <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
                <button
                  onClick={() => setHistoryTab('PARTNERS')}
                  className={cn(
                    "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                    historyTab === 'PARTNERS' ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
                  )}
                >
                  Partners
                </button>
                <button
                  onClick={() => setHistoryTab('EARNINGS')}
                  className={cn(
                    "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                    historyTab === 'EARNINGS' ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
                  )}
                >
                    Commissions
                </button>
                <button
                  onClick={() => setHistoryTab('ARN_LOG')}
                  className={cn(
                    "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                    historyTab === 'ARN_LOG' ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
                  )}
                >
                  ARN Log
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="px-5 pb-6 space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>

            {/* Content Area */}
            <div className="px-5 space-y-4">
              {historyTab === 'PARTNERS' ? (
                <div className="space-y-3 pb-10">
                  {referralTree
                    .filter((m: any) => !searchTerm || m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((member) => (
                      <div key={member.id} className="p-4 bg-white dark:bg-gray-900 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm border",
                            member.level === 1 ? "bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-950/40 dark:border-blue-900/50" : "bg-purple-50 border-purple-100 text-purple-600 dark:bg-purple-950/40 dark:border-purple-900/50"
                          )}>
                            {member.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-gray-900 dark:text-gray-100">{member.name || "Partner Account"}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                member.level === 1 ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                              )}>
                                {member.level === 1 ? 'Direct' : 'Level ' + member.level}
                              </span>
                              <span className="text-[10px] font-medium text-gray-400">{format(new Date(member.createdAt), "MMM d, yyyy")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : historyTab === 'EARNINGS' ? (
                <div className="space-y-3 pb-10">
                  {commissions
                    .filter((c: any) => !searchTerm || c.sourceUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((comm) => (
                      <div key={comm.id} className="p-4 bg-white dark:bg-gray-900 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600">
                            <CurrencyDollarIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-gray-900 dark:text-gray-100">
                                +{formatCurrency(comm.amount || 0)}
                                <span className="ml-1.5 text-xs text-gray-400 font-medium">commission</span>
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">From {comm.sourceUser?.name || "Direct Referral"}</span>
                                <span className="text-[10px] font-medium text-gray-400">{format(new Date(comm.createdAt), "MMM d, yyyy")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="pb-10">
                    <ArnHistory transactions={qualifiedTransactions} />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

    </div>
  )
}
