"use client"

import { useState, useEffect } from "react"

import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  SparklesIcon,
  CheckCircleIcon,
  BanknotesIcon,
  ChartPieIcon,
  CalendarDaysIcon,
  LinkIcon,
  InformationCircleIcon,
  TrophyIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  IdentificationIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline"


import { TIER_COMMISSIONS } from "@/lib/mlm"
import { format, subDays, startOfDay, isAfter } from "date-fns"
import { calculateTierProgress } from "@/lib/utils"

// --- TYPES ---
type ReferralNode = {
  id: string
  name: string | null
  email: string | null
  tier: string
  arnBalance: number
  isActiveMember?: boolean
  lastUnlockAt?: Date | null
  createdAt: Date
  level: 1 | 2 | 3
  withdrawnTotal?: number
  depositTotal?: number 
  advisorId?: string | null
  supervisorId?: string | null
  managerId?: string | null
}

type Commission = {
  id: string
  amount: number
  level: number
  percentage?: number
  sourceUserId?: string
  sourceUserWithdrawn?: number
  txDescription?: string | null
  txArnMinted?: number
  txStatus?: string
  txMethod?: string | null
  txCreatedAt?: Date
  sourceUser: { id?: string; name: string | null; email: string | null; isActiveMember?: boolean; lastUnlockAt?: Date | null }
  createdAt: Date
}

type ReferralViewProps = {
  user: {
    name: string | null
    tier: string
    arnBalance: number
    qualifiedArn: number
    referralCode: string | null
    balance: number
    totalSignups: number
    referrerName?: string | null
    referrerCode?: string | null
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

type TimeFilter = 'TODAY' | '7D' | '1M' | 'CUSTOM'

export default function ReferralView({ user, stats, referralTree, commissions, tierConfig }: ReferralViewProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [activeLevelTab, setActiveLevelTab] = useState<number | 'ALL'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPartner, setSelectedPartner] = useState<ReferralNode | null>(null)


  const currentTier = (user.tier || "NEWBIE").toUpperCase().trim() 
  const [referralLink, setReferralLink] = useState(`https://letsearnify.com/signup?ref=${user.referralCode}`)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setReferralLink(`${window.location.origin}/signup?ref=${user.referralCode}`)
    }
  }, [user.referralCode])


  const copyCode = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const copyLink = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(referralLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const levelRate = (level: 1 | 2 | 3) => {
    if (level === 1) return TIER_COMMISSIONS[currentTier]?.L1 ?? 5
    if (level === 2) return TIER_COMMISSIONS[currentTier]?.L2 ?? 3
    return TIER_COMMISSIONS[currentTier]?.L3 ?? 2
  }

  // Analytics for the structure
  const activeLevel1 = referralTree.filter((n: any) => n.level === 1 && (!!n.isActiveMember || !!n.lastUnlockAt)).length
  const activeLevel2 = referralTree.filter((n: any) => n.level === 2 && (!!n.isActiveMember || !!n.lastUnlockAt)).length
  const activeLevel3 = referralTree.filter((n: any) => n.level === 3 && (!!n.isActiveMember || !!n.lastUnlockAt)).length

  // Calculate potential total commission for 1 transaction ($1 base)
  // PDF Logic: Newbie L1=5%, L2=3%, L3=2%
  const totalCommissionRate = 
     (activeLevel1 > 0 ? levelRate(1) : 0) + 
     (activeLevel2 > 0 ? levelRate(2) : 0) + 
     (activeLevel3 > 0 ? levelRate(3) : 0);
  
  const totalCommissionAmount = (totalCommissionRate / 100) * 1.0;

  const earnedL1 = commissions.filter((c: any) => c.level === 1).reduce((sum: number, c: any) => sum + c.amount, 0)
  const earnedL2 = commissions.filter((c: any) => c.level === 2).reduce((sum: number, c: any) => sum + c.amount, 0)
  const earnedL3 = commissions.filter((c: any) => c.level === 3).reduce((sum: number, c: any) => sum + c.amount, 0)
  const totalEarnedFromNetwork = earnedL1 + earnedL2 + earnedL3

  const { progress, nextTier } = calculateTierProgress(
    currentTier,
    user.qualifiedArn || 0,
    user.totalSignups || 0,
    tierConfig as any
  )

  const TIER_COLORS: Record<string, string> = {
    NEWBIE: "from-slate-400 to-slate-500",
    BRONZE: "from-orange-400 to-orange-500",
    SILVER: "from-slate-300 to-slate-400",
    GOLD: "from-amber-400 to-amber-500",
    PLATINUM: "from-indigo-400 to-indigo-500",
    DIAMOND: "from-blue-400 to-blue-500",
    EMERALD: "from-emerald-400 to-emerald-500",
  };
  const tierColor = TIER_COLORS[nextTier] || "from-indigo-500 to-purple-500";

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-24 px-4 sm:px-6">
      
      {/* ─── 1. PAGE HEADER & ORIGIN ─── */}
      <div className="flex flex-col items-center justify-center text-center space-y-3 px-4 pt-4 sm:pt-6">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 rounded-2xl shadow-xl flex items-center justify-center -rotate-3 hover:rotate-0 transition-transform duration-300">
           <UserGroupIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Partner Program</h1>
        <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto">
           Build your network, rank up your tier, and earn up to 3 levels of deep commissions.
        </p>
        
        {/* Referrer Origin Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/60 border border-border rounded-full text-xs font-bold text-foreground mt-2">
           <SparklesIcon className="w-4 h-4 text-amber-500" />
           {user.referrerName ? (
             <span>Joined using <strong className="text-indigo-500 dark:text-indigo-400 font-black">{user.referrerName}&apos;s</strong> code.</span>
           ) : (
             <span>You joined directly without a partner code.</span>
           )}
        </div>
      </div>

      {/* ─── 2. MAIN HUB (Referral Link & Stats) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Left: Referral Link Box */}
        <div className="bg-card border border-border shadow-sm rounded-2xl p-5 sm:p-7 flex flex-col justify-between relative isolate overflow-hidden">
           {/* Decorator */}
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10" />
           
           <div>
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-foreground">Your Invite Link</h2>
              </div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-6">
                Share this link directly. When someone signs up, your code is automatically applied.
              </p>
           </div>
           
           <div className="space-y-4">
              {/* Copy Link Input */}
              <div className="flex gap-2">
                <div className="flex-1 bg-muted border border-border rounded-xl px-3 py-3 overflow-hidden">
                  <p className="text-xs sm:text-sm font-mono text-foreground truncate select-all">{referralLink}</p>
                </div>
                <button 
                  onClick={copyLink}
                  className={`px-4 sm:px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2 shrink-0 ${copiedLink ? 'bg-emerald-500 text-white' : 'bg-foreground text-background hover:opacity-90'}`}
                >
                  {copiedLink ? <CheckCircleIcon className="w-5 h-5" /> : "Copy URL"}
                </button>
              </div>
              
              {/* Fallback Code Copy */}
              <div className="flex items-center justify-between px-4 py-3 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-xl">
                 <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-indigo-500/70 dark:text-indigo-400/70">Or use code:</span>
                    <span className="text-sm sm:text-base font-black font-mono text-indigo-600 dark:text-indigo-400 truncate">{user.referralCode}</span>
                 </div>
                 <button onClick={copyCode} className={`text-xs font-bold transition-colors ${copiedCode ? "text-emerald-500" : "text-indigo-500 hover:text-indigo-600"} shrink-0`}>
                   {copiedCode ? "Copied!" : "Copy Code"}
                 </button>
              </div>
           </div>
        </div>

        {/* Right: Earnings Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                   <CurrencyDollarIcon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Total Earnings</p>
              </div>
              <div>
                <h3 className="text-3xl sm:text-4xl font-black">${stats.totalEarnings.toFixed(2)}</h3>
                <p className="text-xs font-medium text-emerald-100 mt-1">Lifetime partner revenue</p>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-500/20 mb-4">
                   <ChartPieIcon className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Today's Profit</p>
              </div>
              <div>
                <h3 className="text-3xl sm:text-4xl font-black text-foreground">
                    ${stats.todayEarnings.toFixed(2)}
                </h3>
                <p className="text-xs font-medium text-muted-foreground mt-1 flex items-center gap-1">
                   {stats.todayEarnings > 0 ? <><SparklesIcon className="w-3 h-3 text-emerald-500" /> Great job today!</> : "Keep growing."}
                </p>
              </div>
            </div>
        </div>
      </div>

      {/* ─── 3. OVERVIEW: TIER PROGRESS & NETWORK STRUCTURE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
         {/* Rank Progression Card - Premium Glassmorphic */}
         <div className="relative overflow-hidden group bg-card border-none shadow-xl shadow-black/[0.03] dark:shadow-white/[0.02] rounded-[2.5rem] p-6 lg:p-8 flex flex-col justify-between min-h-[220px]">
             {/* Decorative Background Glow */}
             <div className="absolute -right-4 -top-4 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700" />
             
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border border-amber-100 dark:border-amber-500/20">
                        <TrophyIcon className="w-6 h-6 text-amber-500" />
                    </div>
                </div>
                
                <p className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                    NEXT MILESTONE
                </p>
                <h3 className="text-xl lg:text-2xl font-black text-foreground flex items-baseline gap-2">
                    {nextTier} <span className="text-xs font-bold text-muted-foreground font-sans lowercase">unlocking...</span>
                </h3>
             </div>
             
             <div className="relative z-10 w-full mt-6">
                 <div className="flex justify-between items-baseline mb-2.5">
                     <span className="text-[10px] font-black tracking-widest text-muted-foreground">PROGRESSION</span>
                     <span className="text-2xl font-black text-foreground text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground to-muted-foreground">{progress}%</span>
                 </div>
                 
                 <div className="h-3.5 bg-muted/50 backdrop-blur-sm rounded-full overflow-hidden p-0.5 border border-border/30">
                     <div 
                        className={`h-full rounded-full bg-gradient-to-r ${tierColor} shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-1000 ease-out`} 
                        style={{ width: `${progress}%` }}
                     />
                 </div>
                 
                 <div className="mt-3 flex justify-between text-[9px] font-bold tracking-widest text-muted-foreground/50 uppercase">
                    <span>Initiate</span>
                    <span>{nextTier} RANK</span>
                 </div>
             </div>
         </div>
         
         {/* Network Visualizer spans 2 cols on desktop */}
         <div className="lg:col-span-2 relative overflow-hidden bg-card border-none shadow-xl shadow-black/[0.03] dark:shadow-white/[0.02] rounded-[2.5rem] p-6 lg:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><UserGroupIcon className="w-4 h-4 text-purple-500" /> Active Network</h3>
              <div className="px-2 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-black rounded-lg border border-purple-100 dark:border-purple-500/20">
                 ${totalCommissionAmount.toFixed(2)} Total
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center gap-3">
               {[
                 { label: "Level 1 (Direct)", earned: earnedL1, rate: levelRate(1), bg: "bg-blue-500", border: "border-blue-500/30", text: "text-blue-500" },
                 { label: "Level 2 (Indirect)", earned: earnedL2, rate: levelRate(2), bg: "bg-indigo-500", border: "border-indigo-500/30", text: "text-indigo-500" },
                 { label: "Level 3 (Indirect)", earned: earnedL3, rate: levelRate(3), bg: "bg-pink-500", border: "border-pink-500/30", text: "text-pink-500" }
               ].map((lvl, idx) => (
                 <div key={idx} className="flex items-center gap-3">
                    <div className={`flex-1 bg-muted/40 border border-border hover:${lvl.border} transition-colors rounded-xl p-3 flex justify-between items-center`}>
                       <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${lvl.bg} shadow-[0_0_8px_rgba(0,0,0,0.2)]`} />
                         <div>
                            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{lvl.label}</p>
                            <p className={`text-sm font-black ${lvl.text}`}>${lvl.earned.toFixed(2)} Earned</p>
                         </div>
                       </div>
                       <div className="text-right pl-3 border-l border-border/60">
                          <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Comm.</p>
                          <p className="text-xs sm:text-sm font-bold text-foreground">{lvl.rate}%</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
            <p className="text-[9px] text-center text-muted-foreground font-medium mt-4 flex items-center justify-center gap-1">
               <InformationCircleIcon className="w-3 h-3" /> Lifetime commission earnings by level
            </p>
         </div>
      </div>

      {/* ─── 4. NETWORK DIRECTORY (HIERARCHY SYSTEM) ─── */}
      <div className="bg-card rounded-[2.5rem] border border-border shadow-xl shadow-black/[0.03] dark:shadow-white/[0.02] overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border bg-muted/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <UserGroupIcon className="w-6 h-6 text-indigo-500" />
                </div>
                Network Directory
              </h2>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                Browse and manage your partners across all levels.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative group max-w-sm w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="w-4 h-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>

          {/* Level Tabs */}
          <div className="flex w-full sm:w-max bg-muted/50 p-1 rounded-xl sm:rounded-2xl border border-border mt-6">
            {(['ALL', 1, 2, 3] as const).map((level) => (
              <button
                key={level}
                onClick={() => setActiveLevelTab(level)}
                className={`flex-1 sm:flex-none px-2 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-black transition-all text-center ${
                  activeLevelTab === level
                    ? "bg-foreground text-background shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                <span className="sm:hidden block tracking-widest">{level === 'ALL' ? "ALL" : `L${level}`}</span>
                <span className="hidden sm:inline">{level === 'ALL' ? "All Levels" : `Level ${level} ${level === 1 ? "(Direct)" : ""}`}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 bg-card/40">
          {/* Partner List */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {referralTree
              .filter((n: any) => activeLevelTab === 'ALL' ? true : n.level === activeLevelTab)
              .filter((n: any) => 
                !searchTerm || 
                (n.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 n.email?.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .length > 0 ? (
                referralTree
                  .filter((n: any) => activeLevelTab === 'ALL' ? true : n.level === activeLevelTab)
                  .filter((n: any) => 
                    !searchTerm || 
                    (n.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     n.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map((partner) => (
                    <div 
                      key={partner.id}
                      onClick={() => setSelectedPartner(partner)}
                      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/50 border border-border hover:border-indigo-500/30 rounded-2xl p-4 transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/5 cursor-pointer"
                    >
                      {/* Left: Identity block */}
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
                        <div className={`relative w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-gradient-to-br ${TIER_COLORS[(partner.tier || "NEWBIE").toUpperCase()] || "from-slate-400 to-slate-500"} flex items-center justify-center text-white font-black text-lg shadow-sm border border-black/5`}>
                          {partner.name?.[0]?.toUpperCase() || "P"}
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${partner.isActiveMember ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5 max-w-full">
                              <h4 className="font-bold text-foreground text-sm sm:text-base truncate">
                                {partner.name || "Anonymous Partner"}
                              </h4>
                              <span className={`shrink-0 text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                                  partner.tier === 'NEWBIE' ? 'bg-muted border-border text-muted-foreground' :
                                  'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 dark:text-indigo-400'
                              }`}>
                                  {partner.tier || "NEWBIE"}
                              </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground w-full">
                            <EnvelopeIcon className="w-3.5 h-3.5 shrink-0" />
                            <p className="text-[11px] sm:text-xs font-medium truncate">{partner.email || "No email"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Data block */}
                      <div className="flex flex-row items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-border">
                        <div className="flex flex-col items-start sm:items-end">
                             <div className="flex items-center gap-1.5 mb-1 sm:mb-0.5">
                                 <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-muted text-muted-foreground border border-border">L{partner.level}</span>
                                 <span className="w-1 h-1 rounded-full bg-border" />
                                 <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${(partner.isActiveMember || partner.lastUnlockAt) ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>
                                    {(partner.isActiveMember || partner.lastUnlockAt) ? 'Unlocked' : 'Locked'}
                                 </span>
                             </div>
                             {(partner.isActiveMember || partner.lastUnlockAt) ? (
                                <p className="text-xs sm:text-sm font-black text-foreground mt-1">
                                  Earned: <span className="text-emerald-500">+${commissions.filter((c: any) => c.sourceUser?.id === partner.id).reduce((sum: number, c: any) => sum + c.amount, 0).toFixed(2)}</span>
                                </p>
                             ) : (
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
                                  No earnings yet
                                </p>
                             )}
                        </div>
                        
                        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0" title="View Full Referral Chain">
                          <InformationCircleIcon className="w-4 h-4 text-indigo-500" />
                        </div>
                      </div>
                    </div>
                  ))
            ) : (
              <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted/50 rounded-[2rem] flex items-center justify-center mb-6 transform -rotate-6 border border-border">
                  <UserGroupIcon className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">No Partners Found</h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-xs mx-auto mt-1 leading-relaxed">
                  {searchTerm 
                    ? `We couldn't find any partners matching "${searchTerm}" in ${activeLevelTab === 'ALL' ? 'any level' : `Level ${activeLevelTab}`}.`
                    : `Your network at ${activeLevelTab === 'ALL' ? 'all levels' : `Level ${activeLevelTab}`} is currently empty. Keep sharing your link to grow your community!`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Earnings History has been merged into Network Directory above */}

      {/* ─── 6. INTERACTIVE REFERRAL TREE MODAL ─── */}
      {selectedPartner && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden">
               <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                     <UserGroupIcon className="w-5 h-5 text-indigo-500" />
                     Network Structure
                  </h3>
                  <button onClick={() => setSelectedPartner(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               </div>
               <div className="p-6">
                  {/* Tree Visualizer */}
                  <div className="flex flex-col items-center">
                     {/* YOU Node */}
                     <div className="w-full bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 flex flex-col items-center">
                         <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-1">Your Account</span>
                         <span className="text-sm font-bold text-foreground">You</span>
                     </div>

                     {/* Lines and Nodes depending on level */}
                     {/* If level >= 2, we show L1 referrer */}
                     {selectedPartner.level >= 2 && (selectedPartner.level === 3 ? selectedPartner.supervisorId : selectedPartner.advisorId) && (
                         <>
                             <div className="w-0.5 h-6 bg-border" />
                             <div className="w-full max-w-[90%] bg-muted border border-border rounded-xl p-3 flex flex-col items-center">
                                 <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Level 1 (Direct)</span>
                                 <span className="text-sm font-bold text-foreground truncate w-full text-center">{referralTree.find((n: any) => n.id === (selectedPartner.level === 3 ? selectedPartner.supervisorId : selectedPartner.advisorId))?.name || "Anonymous Partner"}</span>
                             </div>
                         </>
                     )}

                     {/* If level === 3, we show L2 referrer */}
                     {selectedPartner.level === 3 && selectedPartner.advisorId && (
                         <>
                             <div className="w-0.5 h-6 bg-border" />
                             <div className="w-full max-w-[80%] bg-muted border border-border rounded-xl p-3 flex flex-col items-center">
                                 <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Level 2 (Indirect)</span>
                                 <span className="text-sm font-bold text-foreground truncate w-full text-center">{referralTree.find((n: any) => n.id === selectedPartner.advisorId)?.name || "Anonymous Partner"}</span>
                             </div>
                         </>
                     )}

                     <div className="w-0.5 h-6 bg-indigo-500/50" />
                     
                     {/* Clicked Partner Node */}
                     <div className="w-full bg-background border-2 border-indigo-500 rounded-xl p-4 flex flex-col items-center shadow-md shadow-indigo-500/10 relative mt-1">
                         <div className="absolute -top-3 px-2 py-0.5 bg-indigo-500 text-[10px] font-black text-white rounded-full uppercase tracking-widest">Partner Data</div>
                         <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1 mb-1">Level {selectedPartner.level}</span>
                         <span className="text-base font-black text-foreground max-w-full truncate">{selectedPartner.name || "Anonymous Partner"}</span>
                         <div className="mt-3 flex items-center gap-4 text-xs font-medium text-muted-foreground bg-muted p-2 rounded-lg w-full justify-center">
                             <div className="flex flex-col items-center">
                                 <span className="text-[9px] uppercase tracking-wider">Commission</span>
                                 <span className="font-bold text-foreground">{levelRate(selectedPartner.level)}%</span>
                             </div>
                             <div className="w-px h-6 bg-border" />
                             <div className="flex flex-col items-center">
                                 <span className="text-[9px] uppercase tracking-wider">Earned</span>
                                 <span className="font-bold text-emerald-500">${commissions.filter((c: any) => c.sourceUser?.id === selectedPartner.id).reduce((sum: number, c: any) => sum + c.amount, 0).toFixed(2)}</span>
                             </div>
                         </div>
                     </div>

                  </div>
               </div>
            </div>
         </div>
      )}

    </div>
  )
}
