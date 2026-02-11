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
  const [activeTab, setActiveTab] = useState<"dashboard" | "team" | "rewards">("dashboard")
  const [levelFilter, setLevelFilter] = useState<"all" | 1 | 2 | 3>("all")
  const [copied, setCopied] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)

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

  // Auto-Carousel for Mobile Hero
  useEffect(() => {
     const timer = setInterval(() => {
         setCarouselIndex(prev => (prev + 1) % 4)
     }, 5000) // 5 seconds slide
     return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      
      {/* 1. HERO SECTION (Dynamic Command Center) */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 border border-gray-800 shadow-2xl shadow-indigo-500/10 p-8 md:p-12 text-white">
          
          {/* Animated Background Mesh */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center justify-between">
              
              {/* Left: Identity & Action */}
              <div className="flex-1 text-center lg:text-left space-y-8 max-w-xl">
                  <div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider mb-4 text-indigo-300"
                      >
                          <SparklesIcon className="w-3.5 h-3.5" /> Partner Program
                      </motion.div>
                      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Expand Your</span><br/>
                          <span className="text-indigo-400">Influence.</span>
                      </h1>
                      <p className="text-lg text-gray-400 leading-relaxed">
                          Build your network, unlock <span className="text-white font-bold">{nextTier || "Max Level"}</span>, and earn real-time commissions. Your growth engine starts here.
                      </p>
                  </div>

                  {/* Smart Copy Button */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex flex-col sm:flex-row items-center gap-4 max-w-md mx-auto lg:mx-0">
                      <div className="flex-1 text-center sm:text-left px-4">
                          <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Your Referral Code</div>
                          <div className="text-2xl font-mono font-bold text-white tracking-wider">{user.referralCode || "---"}</div>
                      </div>
                      <motion.button 
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.95 }}
                         onClick={copyCode}
                         className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                             copied ? "bg-emerald-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                         }`}
                      >
                          {copied ? (
                              <><CheckCircleIcon className="w-5 h-5"/> Copied!</>
                          ) : (
                              <><ClipboardDocumentCheckIcon className="w-5 h-5"/> Copy Link</>
                          )}
                      </motion.button>
                  </div>
              </div>

              {/* Right: Live Stats Carousel (Mobile) / Grid (Desktop) */}
              <div className="w-full lg:w-auto lg:min-w-[400px]">
                  {/* Desktop Grid (Hidden on Mobile) */}
                  <div className="hidden lg:grid grid-cols-2 gap-4 h-full">
                      {/* Partners */}
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl space-y-2 hover:bg-white/10 transition-colors">
                          <UsersIcon className="w-8 h-8 text-blue-400 mb-2" />
                          <div className="text-3xl font-bold"><Counter value={stats.teamSize} /></div>
                          <div className="text-sm text-gray-400 font-medium">Total Partners</div>
                      </div>

                      {/* Points (NEW) */}
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl space-y-2 hover:bg-white/10 transition-colors">
                          <StarIcon className="w-8 h-8 text-amber-400 mb-2" />
                          <div className="text-3xl font-bold"><Counter value={user.arnBalance} /></div>
                          <div className="text-sm text-gray-400 font-medium">Total ARN</div>
                      </div>

                      {/* Earnings */}
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl space-y-2 hover:bg-white/10 transition-colors">
                          <BanknotesIcon className="w-8 h-8 text-emerald-400 mb-2" />
                          <div className="text-3xl font-bold"><Counter value={stats.totalEarnings} prefix="$" decimals={2} /></div>
                          <div className="text-sm text-gray-400 font-medium">Lifetime Earnings</div>
                      </div>

                      {/* Next Goal (Updated Layout) */}
                      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-center">
                          <div className="flex justify-between items-center mb-2 relative z-10">
                              <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Next: {nextTier}</span>
                              <span className="text-xl font-bold text-white">{overallProgress}%</span>
                          </div>
                          <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden relative z-10 mb-2">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${overallProgress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-indigo-500 rounded-full" 
                              />
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-400 font-medium relative z-10">
                              <span>ARN: {Math.round(pointsProgress * 100)}%</span>
                              <span>Team: {Math.round(membersProgress * 100)}%</span>
                          </div>
                      </div>
                  </div>

                  {/* Mobile Carousel (Hidden on Desktop) */}
                  <div className="lg:hidden relative h-48 w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
                      <AnimatePresence mode="wait">
                          {carouselIndex === 0 && (
                              <motion.div 
                                key="tab1"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
                              >
                                  <UsersIcon className="w-10 h-10 text-blue-400 mb-2" />
                                  <div className="text-4xl font-bold"><Counter value={stats.teamSize} /></div>
                                  <div className="text-sm text-gray-400">Total Team Members</div>
                              </motion.div>
                          )}
                          {carouselIndex === 1 && (
                              <motion.div 
                                key="tab2"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
                              >
                                  <StarIcon className="w-10 h-10 text-amber-400 mb-2" />
                                  <div className="text-4xl font-bold"><Counter value={user.arnBalance} /></div>
                                  <div className="text-sm text-gray-400">Total ARN</div>
                              </motion.div>
                          )}
                          {carouselIndex === 2 && (
                              <motion.div 
                                key="tab3"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
                              >
                                  <BanknotesIcon className="w-10 h-10 text-emerald-400 mb-2" />
                                  <div className="text-4xl font-bold"><Counter value={stats.totalEarnings} prefix="$" decimals={2} /></div>
                                  <div className="text-sm text-gray-400">Lifetime Earnings</div>
                              </motion.div>
                          )}
                          {carouselIndex === 3 && (
                               <motion.div 
                               key="tab4"
                               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                               className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-indigo-900/50 to-purple-900/50"
                             >
                                 <div className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Next Goal: {nextTier}</div>
                                 <div className="text-4xl font-bold text-white mb-1">{overallProgress}%</div>
                                 <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden mb-2">
                                     <div className="h-full bg-indigo-400" style={{ width: `${overallProgress}%` }}></div>
                                 </div>
                                 <div className="text-[10px] text-indigo-300">
                                    ARN: {Math.round(pointsProgress * 100)}% • Team: {Math.round(membersProgress * 100)}%
                                 </div>
                             </motion.div>
                          )}
                      </AnimatePresence>
                      <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2">
                          {[0, 1, 2, 3].map(i => (
                              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${carouselIndex === i ? 'bg-white' : 'bg-white/20'}`} />
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[ 
             { id: "dashboard", label: "Dashboard", icon: ChartBarIcon },
             { id: "team", label: "My Team", icon: UserGroupIcon },
             { id: "rewards", label: "Commissions", icon: CurrencyDollarIcon }
          ].map((tab) => (
              <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                       ? "bg-gray-900 text-white shadow-lg shadow-gray-200/50 transform scale-105" 
                       : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
                 }`}
              >
                 <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
          ))}
      </div>

      {/* 3. CONTENT AREA */}
      <AnimatePresence mode="wait">
          
          {/* --- VIEW: DASHBOARD --- */}
          {activeTab === "dashboard" && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                  {/* Current Benefits */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <CheckCircleIcon className="w-6 h-6 text-emerald-500" /> Current Benefits
                      </h3>
                      <div className="space-y-4">
                          {[0, 1, 2].map(idx => (
                              <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 border border-gray-100/50">
                                  <div className="flex items-center gap-3">
                                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                          idx === 0 ? "bg-blue-100 text-blue-600" :
                                          idx === 1 ? "bg-purple-100 text-purple-600" : "bg-pink-100 text-pink-600"
                                      }`}>L{idx + 1}</span>
                                      <span className="font-medium text-gray-600">Referral Comm.</span>
                                  </div>
                                  <span className="font-bold text-gray-900 text-lg">
                                    {(
                                        (idx === 0 ? TIER_COMMISSIONS[currentTier]?.L1 || 0 :
                                         idx === 1 ? TIER_COMMISSIONS[currentTier]?.L2 || 0 :
                                         TIER_COMMISSIONS[currentTier]?.L3 || 0) * 1 ? (
                                            (idx === 0 ? TIER_COMMISSIONS[currentTier]?.L1 || 0 :
                                             idx === 1 ? TIER_COMMISSIONS[currentTier]?.L2 || 0 :
                                             TIER_COMMISSIONS[currentTier]?.L3 || 0)
                                         ) : 0
                                    )}%</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Recent Activity Mini-Feed */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <ClockIcon className="w-6 h-6 text-indigo-500" /> Recent Activity
                      </h3>
                      <div className="space-y-6">
                          {referralTree.slice(0, 3).map(user => (
                              <div key={user.id} className="flex gap-4 items-center">
                                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-sm">
                                      {user.name?.[0] || "U"}
                                  </div>
                                  <div>
                                      <div className="font-bold text-gray-900 text-sm">New Partner Joined</div>
                                      <div className="text-xs text-gray-500">{user.name || "Anonymous"} • Level {user.level}</div>
                                  </div>
                                  <div className="ml-auto text-xs font-bold text-gray-400">
                                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                                  </div>
                              </div>
                          ))}
                          {referralTree.length === 0 && <div className="text-gray-400 text-center py-4">No recent activity</div>}
                      </div>
                  </div>
              </motion.div>
          )}

          {/* --- VIEW: TEAM (SLIDER + TABLE) --- */}
          {activeTab === "team" && (
             <motion.div 
                key="team"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
             >
                 {/* Filter Bar */}
                 <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {(["all", 1, 2, 3] as const).map(lvl => (
                        <button 
                           key={lvl} 
                           onClick={() => setLevelFilter(lvl)}
                           className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                               levelFilter === lvl ? "bg-indigo-600 text-white" : "bg-white text-gray-500 border border-gray-200"
                           }`}
                        >
                           {lvl === 'all' ? 'All Levels' : `Level ${lvl}`}
                        </button>
                    ))}
                 </div>

                 {/* Desktop: Table */}
                 <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                     <table className="w-full text-left">
                         <thead className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                             <tr>
                                 <th className="p-6">Partner</th>
                                 <th className="p-6">Status</th>
                                 <th className="p-6">Level</th>
                                 <th className="p-6 text-right">Joined</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-50">
                             {filteredTree.map(node => (
                                 <tr key={node.id} className="hover:bg-indigo-50/10 transition-colors">
                                     <td className="p-6 flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-500">
                                             {node.name?.[0] || "U"}
                                         </div>
                                         <div>
                                             <div className="font-bold text-gray-900">{node.name || "Anonymous"}</div>
                                             <div className="text-xs text-gray-400">{node.email}</div>
                                         </div>
                                     </td>
                                     <td className="p-6">
                                         <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">{node.tier}</span>
                                     </td>
                                     <td className="p-6">
                                         <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                             node.level === 1 ? "bg-blue-100 text-blue-600" :
                                             node.level === 2 ? "bg-purple-100 text-purple-600" : "bg-pink-100 text-pink-600"
                                         }`}>L{node.level}</span>
                                     </td>
                                     <td className="p-6 text-right text-gray-500 font-medium text-sm">
                                         {format(new Date(node.createdAt), "MMM d, yyyy")}
                                     </td>
                                 </tr>
                             ))}
                             {filteredTree.length === 0 && (
                                 <tr>
                                     <td colSpan={4} className="p-12 text-center text-gray-400 font-medium">No partners found in this filter.</td>
                                 </tr>
                             )}
                         </tbody>
                     </table>
                 </div>

                 {/* Mobile: Swipeable Cards (Slider) */}
                 <div className="md:hidden flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide">
                     {filteredTree.map(node => (
                         <div key={node.id} className="snap-center shrink-0 w-[85vw] bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
                             <div className="flex items-center gap-4">
                                 <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-xl font-bold text-indigo-400">
                                    {node.name?.[0] || "U"}
                                 </div>
                                 <div>
                                     <div className="font-bold text-lg text-gray-900">{node.name || "Anonymous"}</div>
                                     <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                         node.level === 1 ? "bg-blue-50 text-blue-600 border-blue-100" :
                                         node.level === 2 ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-pink-50 text-pink-600 border-pink-100"
                                     }`}>Level {node.level} Partner</span>
                                 </div>
                             </div>
                             <div className="grid grid-cols-2 gap-3 mt-2">
                                 <div className="bg-gray-50 p-3 rounded-2xl">
                                     <div className="text-xs text-gray-400 uppercase font-bold">Status</div>
                                     <div className="font-bold text-gray-900">{node.tier}</div>
                                 </div>
                                 <div className="bg-gray-50 p-3 rounded-2xl">
                                     <div className="text-xs text-gray-400 uppercase font-bold">Joined</div>
                                     <div className="font-bold text-gray-900">{format(new Date(node.createdAt), "MMM d, yyyy")}</div>
                                 </div>
                             </div>
                         </div>
                     ))}
                     {filteredTree.length === 0 && (
                         <div className="w-full text-center py-10 text-gray-400">No partners found.</div>
                     )}
                 </div>
             </motion.div>
          )}

          {/* --- VIEW: REWARDS --- */}
          {activeTab === "rewards" && (
              <motion.div 
                key="rewards"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden"
              >
                  <div className="max-h-[600px] overflow-y-auto p-4 md:p-6 space-y-4">
                      {commissions.length > 0 ? commissions.map(comm => (
                          <div key={comm.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                               <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                       <BanknotesIcon className="w-6 h-6" />
                                   </div>
                                   <div>
                                       <div className="font-bold text-gray-900">Commission Earned</div>
                                       <div className="text-xs text-gray-500">From Level {comm.level} Referral</div>
                                   </div>
                               </div>
                               <div className="text-right">
                                   <div className="text-lg font-bold text-emerald-600">+${comm.amount.toFixed(2)}</div>
                                   <div className="text-xs text-gray-400">{format(new Date(comm.createdAt), "MMM d, yyyy")}</div>
                               </div>
                          </div>
                      )) : (
                          <div className="text-center py-20">
                              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <CurrencyDollarIcon className="w-8 h-8 text-gray-300" />
                              </div>
                              <h3 className="font-bold text-gray-900">No Earnings Yet</h3>
                              <p className="text-gray-500 text-sm">Commissions will appear here once your team starts upgrading.</p>
                          </div>
                      )}
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  )
}
