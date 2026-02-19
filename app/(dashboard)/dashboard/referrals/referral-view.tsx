"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion"
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  TrophyIcon, 
  ChartBarIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  BanknotesIcon,
  StarIcon
} from "@heroicons/react/24/outline"
import { TIER_COMMISSIONS } from "@/lib/mlm"
import { format } from "date-fns"
// --- TYPES ---
type ReferralNode = {
  id: string
  name: string | null
  email: string | null
  tier: string
  arnBalance: number
  createdAt: Date
  level: number 
  depositTotal?: number 
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
    arnBalance: number
    referralCode: string | null
    balance: number
  }
  stats: {
    teamSize: number
    totalEarnings: number
    todayEarnings: number
  }
  tierConfig: Record<string, { arn: number, directs: number }>
  referralTree: ReferralNode[]
  commissions: Commission[]
}

// --- ANIMATED COUNTER COMPONENT ---
function Counter({ value, prefix = "", decimals = 0 }: { value: number, prefix?: string, decimals?: number }) {
    const ref = useRef<HTMLSpanElement>(null)
    const inView = useInView(ref, { once: true })
    const springValue = useSpring(0, { stiffness: 50, damping: 20 })

    useEffect(() => {
        if (inView) {
            springValue.set(value)
        }
    }, [inView, value, springValue])

    const [display, setDisplay] = useState("0")

    useEffect(() => {
        return springValue.on("change", (latest) => {
            setDisplay(latest.toFixed(decimals))
        })
    }, [springValue, decimals])

    return <span ref={ref}>{prefix}{display}</span>
}

// --- MAIN COMPONENT ---
export default function ReferralView({ user, stats, referralTree, commissions, tierConfig }: ReferralViewProps) {
  const [levelFilter, setLevelFilter] = useState<'all' | 1 | 2 | 3>('all')
  const [copied, setCopied] = useState(false)

  // Tier Data
  const currentTier = (user.tier || "NEWBIE") 
  
  const tiers = ["NEWBIE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "EMERALD"]
  const currentIndex = tiers.indexOf(currentTier)
  const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null
  const nextTierConfig = nextTier ? tierConfig[nextTier] : null
  
  const pointsProgress = nextTierConfig ? Math.min((user.arnBalance / nextTierConfig.arn), 1) : 1
  const membersProgress = nextTierConfig ? Math.min((stats.teamSize / nextTierConfig.directs), 1) : 1
  
  // Logic synced with Dashboard Overview (TierProgress.tsx): Average of both requirements
  const overallProgress = Math.round(((pointsProgress + membersProgress) / 2) * 100)

  // Filter Logic
  const filteredTree = levelFilter === "all" 
    ? referralTree 
    : referralTree.filter(node => node.level === levelFilter)

  const copyCode = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      
      {/* 1. SECURE PARTNER DASHBOARD (Identity & Action) */}
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 border border-slate-800 shadow-2x-strong p-6 md:p-10 text-white">
          
          {/* Cyberpunk Decorative Accents */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Profile & Tier Badging */}
              <div className="lg:col-span-5 space-y-6">
                  <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-400/30">
                          <UsersIcon className="w-9 h-9 text-white" />
                      </div>
                      <div>
                          <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest">{currentTier} PARTNER</div>
                          <h1 className="text-3xl font-black tracking-tight">{user.name || "Member Account"}</h1>
                      </div>
                  </div>

                  <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-4">
                      <div className="flex justify-between items-end">
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tier Progression</div>
                          <div className="text-lg font-black text-indigo-400">{overallProgress}% <span className="text-[10px] text-gray-500 font-medium">to {nextTier || "Max"}</span></div>
                      </div>
                      <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${overallProgress}%` }}
                              className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-full"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-1">
                          <div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">ARN Points</div>
                              <div className="text-sm font-bold">{user.arnBalance.toLocaleString()} / {nextTierConfig?.arn.toLocaleString() || "Max"}</div>
                          </div>
                          <div className="text-right">
                              <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Active Team</div>
                              <div className="text-sm font-bold">{stats.teamSize} / {nextTierConfig?.directs || "Max"}</div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Referral Tool (Centerpiece) */}
              <div className="lg:col-span-4 flex flex-col justify-center gap-4 p-6 bg-indigo-500/5 rounded-[1.5rem] border border-indigo-500/20">
                  <div className="text-center">
                      <div className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Network Expansion Link</div>
                      <div className="text-2xl font-mono font-black text-white py-2 px-4 bg-white/5 rounded-xl border border-white/5 mb-4">
                          {user.referralCode || "------"}
                      </div>
                      <button 
                          onClick={copyCode}
                          className={`w-full py-4 rounded-xl font-black uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-3 ${
                              copied ? "bg-emerald-500 text-white" : "bg-white text-slate-950 hover:bg-gray-100"
                          }`}
                      >
                          {copied ? (
                              <><CheckCircleIcon className="w-5 h-5"/> Copied to Clipboard</>
                          ) : (
                              <><ClipboardDocumentCheckIcon className="w-5 h-5"/> Copy Partner Link</>
                          )}
                      </button>
                      <p className="mt-4 text-[10px] text-indigo-300/60 font-medium">Share this link to build your multi-level team and earn instant commissions.</p>
                  </div>
              </div>

              {/* Quick Earning Stats */}
              <div className="lg:col-span-3 grid grid-cols-1 gap-3">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <BanknotesIcon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                          <div className="text-[10px] text-gray-500 font-bold uppercase">Total Earnings</div>
                          <div className="text-xl font-black text-white">${stats.totalEarnings.toFixed(2)}</div>
                      </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <UsersIcon className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                          <div className="text-[10px] text-gray-500 font-bold uppercase">Today's Growth</div>
                          <div className="text-xl font-black text-white">{stats.todayEarnings > 0 ? `+${stats.todayEarnings.toFixed(2)}` : "0"}</div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 2. STRATEGY CENTER: How it Works & Commissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step-by-Step Guide */}
          <div className="lg:col-span-2 bg-card p-8 rounded-[2rem] shadow-sm border border-border">
              <h3 className="text-xl font-bold text-foreground mb-8 flex items-center gap-2">
                  <SparklesIcon className="w-6 h-6 text-indigo-600" /> How the Partner Program Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                      { step: "01", title: "Share Your Link", desc: "Invite your network and friends to join using your unique partner code." },
                      { step: "02", title: "Build Your Team", desc: "As your referrals grow their network, you unlock higher tiers and bigger rewards." },
                      { step: "03", title: "3-Level Rewards", desc: "Earn commissions when your Level 1, 2, and 3 partners grow their account." },
                      { step: "04", title: "Unlock Elite Status", desc: "Climb from Newbie to Emerald for up to 40% total network commission." }
                  ].map(item => (
                      <div key={item.step} className="flex gap-4">
                          <div className="text-2xl font-black text-indigo-400 dark:text-indigo-300">{item.step}</div>
                          <div>
                              <div className="font-bold text-foreground mb-1">{item.title}</div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Commission Breakdown Card */}
          <div className="bg-card p-8 rounded-[2rem] shadow-sm border border-border">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-amber-500" /> My Commissions
              </h3>
              <div className="space-y-4">
                  {[
                      { label: "Level 1 (Direct)", val: TIER_COMMISSIONS[currentTier]?.L1 || 0, color: "blue" },
                      { label: "Level 2 (Indirect)", val: TIER_COMMISSIONS[currentTier]?.L2 || 0, color: "purple" },
                      { label: "Level 3 (Indirect)", val: TIER_COMMISSIONS[currentTier]?.L3 || 0, color: "pink" }
                  ].map((idx, i) => (
                      <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-muted/50 border border-border">
                          <div>
                              <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{idx.label}</div>
                              <div className="text-lg font-black text-foreground">{idx.val}% <span className="text-[10px] font-medium text-muted-foreground">Reward Rate</span></div>
                          </div>
                          <div className={`w-10 h-10 rounded-xl bg-${idx.color === 'blue' ? 'blue' : idx.color === 'purple' ? 'purple' : 'pink'}-500/10 flex items-center justify-center text-${idx.color === 'blue' ? 'blue' : idx.color === 'purple' ? 'purple' : 'pink'}-600 font-bold`}>
                              L{i+1}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* 3. OPERATIONAL NETWORK: My Team Explorer */}
      <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <UserGroupIcon className="w-6 h-6 text-blue-600" /> Operational Network
              </h3>
              
              {/* Professional Filter Bar (Segmented Control) */}
              <div className="bg-background/50 backdrop-blur-sm p-1.5 rounded-2xl border border-border inline-flex w-full md:w-auto overflow-x-auto scrollbar-hide">
                  {(["all", 1, 2, 3] as const).map(lvl => (
                      <button 
                          key={lvl} 
                          onClick={() => setLevelFilter(lvl)}
                          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                              levelFilter === lvl 
                              ? "bg-foreground text-background shadow-lg shadow-black/5" 
                              : "text-muted-foreground hover:text-foreground hover:bg-card"
                          }`}
                      >
                          {lvl === 'all' ? (
                              <><UserGroupIcon className="w-3.5 h-3.5" /> All Levels</>
                          ) : (
                              <><div className={`w-2 h-2 rounded-full ${
                                  lvl === 1 ? "bg-blue-500" : lvl === 2 ? "bg-purple-500" : "bg-pink-500"
                              }`} /> L{lvl} Partners</>
                          )}
                      </button>
                  ))}
              </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
              <table className="w-full text-left">
                  <thead className="bg-muted/50 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      <tr>
                          <th className="p-8">Growth Partner</th>
                          <th className="p-8">Tier Status</th>
                          <th className="p-8">Network Depth</th>
                          <th className="p-8 text-right">Expansion Date</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                      {filteredTree.map(node => (
                          <tr key={node.id} className="group hover:bg-muted/50 transition-colors">
                              <td className="p-8 flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center font-black text-indigo-400 border border-indigo-100/50 group-hover:scale-110 transition-transform">
                                      {node.name?.[0] || "U"}
                                  </div>
                                  <div>
                                      <div className="font-bold text-foreground">{node.name || "Identified Partner"}</div>
                                      <div className="text-xs text-muted-foreground font-medium">{node.email}</div>
                                  </div>
                              </td>
                              <td className="p-8">
                                  <span className="px-3 py-1.5 bg-muted rounded-lg text-[10px] font-black uppercase text-muted-foreground tracking-wider ring-1 ring-border">{node.tier}</span>
                              </td>
                              <td className="p-8">
                                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                      node.level === 1 ? "bg-blue-100 text-blue-600 ring-1 ring-blue-200/50" :
                                      node.level === 2 ? "bg-purple-100 text-purple-600 ring-1 ring-purple-200/50" : 
                                      "bg-pink-100 text-pink-600 ring-1 ring-pink-200/50"
                                  }`}>Level {node.level}</span>
                              </td>
                              <td className="p-8 text-right text-muted-foreground font-bold text-sm">
                                  {format(new Date(node.createdAt), "MMM d, yyyy")}
                              </td>
                          </tr>
                      ))}
                      {filteredTree.length === 0 && (
                          <tr>
                              <td colSpan={4} className="p-20 text-center text-muted-foreground font-medium font-serif">No partners identified at this depth.</td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden grid grid-cols-1 gap-4">
              {filteredTree.map(node => (
                  <div key={node.id} className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col gap-5 active:scale-[0.98] transition-transform">
                      <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-xl font-black text-indigo-500 border border-indigo-100/50">
                                {node.name?.[0] || "U"}
                              </div>
                              <div className="min-w-0">
                                  <div className="font-black text-foreground truncate pr-4">{node.name || "New Partner"}</div>
                                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider truncate">{node.email || "Confidential Email"}</div>
                              </div>
                          </div>
                          <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                              node.level === 1 ? "bg-blue-50 text-blue-600 border-blue-100" :
                              node.level === 2 ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-pink-50 text-pink-600 border-pink-100"
                          }`}>LVL {node.level}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                          <div>
                              <div className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.1em] mb-1.5">Growth Status</div>
                              <span className="inline-block px-3 py-1 bg-muted rounded-lg text-[10px] font-black text-foreground uppercase tracking-widest ring-1 ring-border">
                                  {node.tier}
                              </span>
                          </div>
                          <div className="text-right">
                              <div className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.1em] mb-1.5">Network Entry</div>
                              <div className="text-xs font-black text-foreground">{format(new Date(node.createdAt), "MMM d, yyyy")}</div>
                          </div>
                      </div>
                  </div>
              ))}
              {filteredTree.length === 0 && (
                  <div className="w-full text-center py-16 text-muted-foreground bg-muted/30 rounded-3xl border-2 border-dashed border-border">
                      No network partners found yet.
                  </div>
              )}
          </div>
      </div>

      {/* 4. RECENT ACTIVITY: Commissions Feed */}
      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
          <div className="p-8 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <BanknotesIcon className="w-6 h-6 text-emerald-600" /> Recent Network Earnings
              </h3>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Live Updates</span>
          </div>
          <div className="max-h-[600px] overflow-y-auto p-4 md:p-8 space-y-4 scrollbar-hide">
              {commissions.length > 0 ? commissions.map(comm => (
                  <div key={comm.id} className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 border border-border hover:bg-card hover:shadow-md transition-all active:scale-[0.99]">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <BanknotesIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="font-black text-foreground">Network Commission</div>
                                <div className="text-xs text-muted-foreground font-medium">From Level {comm.level} Multi-Level Partner</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-black text-emerald-600">+${comm.amount.toFixed(2)}</div>
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{format(new Date(comm.createdAt), "MMM d, yyyy")}</div>
                        </div>
                  </div>
              )) : (
                  <div className="text-center py-24 text-muted-foreground">
                      <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CurrencyDollarIcon className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-black text-foreground">No Network Commissions Yet</h3>
                      <p className="text-sm font-medium">Earnings will appear here automatically as your team expands.</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  )
}
