"use client"

import { useState } from "react"
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  TrophyIcon, 
  ClipboardDocumentCheckIcon,
  SparklesIcon,
  CheckCircleIcon,
  UsersIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline"
import { TIER_COMMISSIONS } from "@/lib/mlm"
import { format } from "date-fns"
import { TierProgress } from "../TierProgress"

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

// --- MAIN COMPONENT ---
export default function ReferralView({ user, stats, referralTree, commissions, tierConfig }: ReferralViewProps) {
  const [levelFilter, setLevelFilter] = useState<'all' | 1 | 2 | 3>('all')
  const [copied, setCopied] = useState(false)

  const currentTier = (user.tier || "NEWBIE") 

  const filteredTree = levelFilter === "all" 
    ? referralTree 
    : referralTree.filter(node => node.level === levelFilter)

  const levelRate = (level: 1 | 2 | 3) => {
    if (level === 1) return TIER_COMMISSIONS[currentTier]?.L1 ?? 5
    if (level === 2) return TIER_COMMISSIONS[currentTier]?.L2 ?? 3
    return TIER_COMMISSIONS[currentTier]?.L3 ?? 2
  }

  const earningsByUser = commissions.reduce<Record<string, { total: number; count: number; lastAt: Date | null }>>((acc, comm) => {
    if (!comm.sourceUserId) return acc
    if (!acc[comm.sourceUserId]) {
      acc[comm.sourceUserId] = { total: 0, count: 0, lastAt: null }
    }
    const bucket = acc[comm.sourceUserId]
    bucket.total += comm.amount || 0
    bucket.count += 1
    const currentDate = new Date(comm.createdAt)
    if (!bucket.lastAt || currentDate.getTime() > bucket.lastAt.getTime()) {
      bucket.lastAt = currentDate
    }
    return acc
  }, {})

  const unlockedCommissions = commissions.filter(
    (comm) => !!comm.sourceUser?.isActiveMember || !!comm.sourceUser?.lastUnlockAt
  )
  const unlockedReferrals = referralTree.filter(
    (node) => !!node.isActiveMember || !!node.lastUnlockAt
  )

  const copyCode = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">

      {/* ═══ PARTNERS BANNER ═══ */}
      <div className="relative overflow-hidden rounded-2xl text-white"
        style={{ background: "linear-gradient(135deg, #1e0a3c 0%, #3b0764 50%, #1e1b4b 100%)" }}>

        <div className="absolute -top-8 -right-8 w-36 h-36 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-500/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

        <div className="relative z-10 px-5 sm:px-8 py-4 sm:py-5 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 border border-white/15 mb-2.5">
            <UserGroupIcon className="w-4 h-4 text-violet-200" />
          </div>

          <div className="mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-[8px] font-bold uppercase tracking-[0.18em] text-violet-300/80">
              <span className="w-1 h-1 rounded-full bg-violet-300 animate-pulse" />
              Partner Network
            </span>
          </div>

          <h1 className="text-sm sm:text-base font-bold tracking-tight leading-tight mb-0.5">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-purple-100 to-fuchsia-200">
              Referral Network
            </span>
          </h1>
          <p className="text-violet-200/40 text-[10px] max-w-xs mx-auto mb-2.5">
            Build your team and earn commissions
          </p>

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/8 border border-white/10 text-[9px] font-semibold text-white/70">
            <UsersIcon className="w-3 h-3 text-violet-300" />
            {stats.teamSize} Partners
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </div>

      {/* ─── 1. HERO: Partner Identity + Referral Code + Stats ─── */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-[1.5rem] shadow-xl
        bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900
        dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950
        border border-indigo-500/30 dark:border-slate-800 text-white">

        <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6">

          {/* Top Row: User Identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/15 dark:bg-white/10 flex items-center justify-center shadow-lg ring-1 ring-white/25 shrink-0">
              <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-indigo-200 dark:text-indigo-400 uppercase tracking-widest">{currentTier} PARTNER</div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight leading-none text-white truncate">{user.name || "Member Account"}</h1>
            </div>
          </div>

          {/* Tier Progress */}
          <TierProgress 
            currentTier={currentTier}
            points={user.arnBalance}
            activeMembers={stats.teamSize}
            tierRules={tierConfig as any}
            inHero={true}
          />

          {/* Bottom Row: Referral Code + Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Referral Code Box */}
            <div className="flex flex-col gap-3 p-4 sm:p-5 bg-white/10 dark:bg-white/5 rounded-xl border border-white/15 dark:border-white/10">
              <div className="text-[10px] font-black text-indigo-200 dark:text-indigo-400 uppercase tracking-[0.18em]">Your Partner Code</div>
              <div className="text-base sm:text-lg font-mono font-black text-white py-2 px-3 bg-black/20 dark:bg-black/30 rounded-lg border border-white/10 truncate">
                {user.referralCode || "------"}
              </div>
              <button 
                onClick={copyCode}
                className={`w-full py-2.5 rounded-lg font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${
                  copied 
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30" 
                    : "bg-white text-slate-900 hover:bg-indigo-50"
                }`}
              >
                {copied ? (
                  <><CheckCircleIcon className="w-4 h-4"/> Copied!</>
                ) : (
                  <><ClipboardDocumentCheckIcon className="w-4 h-4"/> Copy Partner Code</>
                )}
              </button>
              <p className="text-[10px] text-indigo-200/70 dark:text-indigo-400/60 font-medium leading-relaxed text-center">
                Share to earn commissions from every partner you bring in.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-col gap-3">
              <div className="bg-white/10 dark:bg-white/5 border border-white/15 dark:border-white/10 p-4 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <BanknotesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] text-indigo-200/70 dark:text-indigo-400/60 font-bold uppercase tracking-wider">Total Earnings</div>
                  <div className="text-base sm:text-lg font-black text-white truncate">${stats.totalEarnings.toFixed(2)}</div>
                </div>
              </div>
              <div className="bg-white/10 dark:bg-white/5 border border-white/15 dark:border-white/10 p-4 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                  <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] text-indigo-200/70 dark:text-indigo-400/60 font-bold uppercase tracking-wider">Today&apos;s Growth</div>
                  <div className="text-base sm:text-lg font-black text-white truncate">
                    {stats.todayEarnings > 0 ? `+$${stats.todayEarnings.toFixed(2)}` : "$0.00"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. STRATEGY CENTER: How it Works + Commission Breakdown ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Step Guide */}
        <div className="lg:col-span-2 bg-card p-5 sm:p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="text-base sm:text-lg font-bold text-foreground mb-5 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-indigo-500" /> Partner Program Flow
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {[
              { step: "01", title: "Share Link", desc: "Invite your network and friends to join using your partner code." },
              { step: "02", title: "Build Team", desc: "Grow your network to unlock higher tiers and bigger rewards." },
              { step: "03", title: "3-Level Rewards", desc: "Earn commissions from Level 1, 2, and 3 partner activities." },
              { step: "04", title: "Elite Status", desc: "Reach Emerald tier for up to 40% total network commission." }
            ].map(item => (
              <div key={item.step} className="flex gap-3 items-start">
                <div className="text-xl font-black text-indigo-400 dark:text-indigo-500 mt-0.5 shrink-0 w-8">{item.step}</div>
                <div>
                  <div className="text-sm font-bold text-foreground mb-0.5">{item.title}</div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commission Breakdown */}
        <div className="bg-card p-4 sm:p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="text-sm sm:text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <TrophyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" /> Commission Rates
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {[
              { label: "Level 1 (Direct)", val: TIER_COMMISSIONS[currentTier]?.L1 || 0, bg: "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30", text: "text-blue-600 dark:text-blue-400", badge: "L1" },
              { label: "Level 2 (Indirect)", val: TIER_COMMISSIONS[currentTier]?.L2 || 0, bg: "bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30", text: "text-purple-600 dark:text-purple-400", badge: "L2" },
              { label: "Level 3 (Indirect)", val: TIER_COMMISSIONS[currentTier]?.L3 || 0, bg: "bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800/30", text: "text-pink-600 dark:text-pink-400", badge: "L3" }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-muted/40 border border-border">
                <div className="min-w-0">
                  <div className="text-[9px] uppercase font-bold text-muted-foreground mb-0.5 truncate">{item.label}</div>
                  <div className="text-sm sm:text-base font-black text-foreground">{item.val}% <span className="text-[9px] font-medium text-muted-foreground">Rate</span></div>
                </div>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${item.bg} flex items-center justify-center ${item.text} font-bold text-xs shrink-0`}>{item.badge}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 3. NETWORK TABLE ─── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 px-1">
            <UserGroupIcon className="w-5 h-5 text-blue-500" /> Network Structure
          </h3>

          {/* Filter Bar */}
          <div className="bg-secondary p-1 rounded-xl border border-border flex w-full sm:w-auto gap-1 overflow-hidden">
            {(["all", 1, 2, 3] as const).map(lvl => (
              <button 
                key={lvl} 
                onClick={() => setLevelFilter(lvl)}
                className={`flex-1 flex items-center justify-center gap-1 px-2 sm:px-4 py-2 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all whitespace-nowrap min-w-0 ${
                  levelFilter === lvl 
                  ? "bg-foreground text-background shadow-md" 
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                {lvl === 'all' ? (
                  <><UserGroupIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /><span>All</span></>
                ) : (
                  <><div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    lvl === 1 ? "bg-blue-500" : lvl === 2 ? "bg-purple-500" : "bg-pink-500"
                  }`} /><span>Lvl {lvl}</span></>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-muted/40 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">
              <tr>
                <th className="px-5 py-4 w-1/3">Partner Details</th>
                <th className="px-5 py-4 w-1/6">Tier Status</th>
                <th className="px-5 py-4 w-1/5">Network Depth</th>
                <th className="px-5 py-4 w-1/4">Earning History</th>
                <th className="px-5 py-4 w-1/6 text-right">Join Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredTree.map(node => {
                const userEarning = earningsByUser[node.id]
                return (
                <tr key={node.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center font-black text-indigo-500 border border-indigo-100 dark:border-indigo-500/20 shrink-0">
                        {node.name?.[0] || "U"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-foreground truncate">{node.name || "Partner"}</div>
                        <div className="text-[11px] text-muted-foreground font-medium truncate">{node.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 bg-muted rounded-md text-[9px] font-black uppercase text-muted-foreground tracking-widest ring-1 ring-border">{node.tier}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                      node.level === 1 ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-500/30" :
                      node.level === 2 ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-1 ring-purple-200 dark:ring-purple-500/30" : 
                      "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 ring-1 ring-pink-200 dark:ring-pink-500/30"
                    }`}>Level {node.level}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-[11px] font-bold text-foreground">
                      L{node.level} Rate: {levelRate(node.level)}%
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium">
                      {userEarning ? `Earned: +$${userEarning.total.toFixed(2)} (${userEarning.count} tx)` : "Earned: $0.00 (0 tx)"}
                    </div>
                    {userEarning?.lastAt && (
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
                        Last: {format(new Date(userEarning.lastAt), "MMM d, yyyy")}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right text-muted-foreground font-medium text-[11px]">
                    {format(new Date(node.createdAt), "MMM d, yyyy")}
                  </td>
                </tr>
              )})}
              {filteredTree.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground font-medium text-sm">No partners at this depth yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredTree.map(node => (
            <div key={node.id} className="bg-card p-4 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-lg font-black text-indigo-500 border border-indigo-100 dark:border-indigo-500/20 shrink-0">
                  {node.name?.[0] || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-black text-foreground truncate">{node.name || "Partner"}</div>
                  <div className="text-[10px] text-muted-foreground font-medium truncate">{node.email || "—"}</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${
                    node.level === 1 ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20" :
                    node.level === 2 ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20" : 
                    "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20"
                  }`}>Lvl {node.level}</span>
                  <span className="px-2 py-1 bg-muted rounded-md text-[8px] font-black text-muted-foreground uppercase tracking-widest ring-1 ring-border">
                    {node.tier}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-muted-foreground">
                  {format(new Date(node.createdAt), "MMM d, yy")}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-[10px] font-bold text-foreground">
                  Lvl {node.level} Rate: {levelRate(node.level)}%
                </div>
                <div className="text-[10px] text-muted-foreground font-medium">
                  {(() => {
                    const userEarning = earningsByUser[node.id]
                    return userEarning
                      ? `Earned: +$${userEarning.total.toFixed(2)} (${userEarning.count} tx)`
                      : "Earned: $0.00 (0 tx)"
                  })()}
                </div>
              </div>
            </div>
          ))}
          {filteredTree.length === 0 && (
            <div className="w-full text-center py-10 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border text-xs font-medium">
              No network partners found yet.
            </div>
          )}
        </div>
      </div>

      {/* ─── 4. COMMISSION FEED ─── */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
          <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <BanknotesIcon className="w-5 h-5 text-emerald-500" /> Recent Network Earnings
          </h3>
          <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Live Updates</span>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-3 sm:p-5 space-y-2 sm:space-y-3 scrollbar-hide">
          {unlockedCommissions.length > 0 ? unlockedCommissions.map(comm => (
            <div key={comm.id} className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-muted/40 border border-border hover:bg-card hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-100 dark:border-emerald-500/20">
                  <BanknotesIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-foreground text-xs sm:text-sm truncate">
                    {comm.sourceUser?.name || comm.sourceUser?.email || "Network Member"}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-muted-foreground font-medium">
                    Level {comm.level} | Earned +${comm.amount.toFixed(2)} | Withdrawn ${(
                      comm.sourceUserWithdrawn || 0
                    ).toFixed(2)}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-muted-foreground font-medium truncate">
                    {comm.txDescription || `L${comm.level} commission (${comm.percentage || levelRate(comm.level as 1 | 2 | 3)}%)`}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">+${comm.amount.toFixed(2)}</div>
                {(comm.txArnMinted || 0) > 0 && (
                  <div className="text-[9px] font-bold text-blue-500">+{(comm.txArnMinted || 0).toFixed(2)} ARN</div>
                )}
                <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5 hidden sm:block">
                  {format(new Date(comm.txCreatedAt || comm.createdAt), "MMM d, yyyy")}
                </div>
                <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5 hidden sm:block">
                  {comm.txStatus || "COMPLETED"}
                </div>
              </div>
            </div>
          )) : unlockedReferrals.length > 0 ? unlockedReferrals.map((node) => {
            const userEarning = earningsByUser[node.id]
            return (
              <div key={node.id} className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-muted/40 border border-border">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-100 dark:border-indigo-500/20 font-black">
                    {node.name?.[0] || "U"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-foreground text-xs sm:text-sm truncate">
                      {node.name || node.email || "Network Member"}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-muted-foreground font-medium">
                      Level {node.level} | Earned +${(userEarning?.total || 0).toFixed(2)} | Withdrawn ${(node.withdrawnTotal || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                    +${(userEarning?.total || 0).toFixed(2)}
                  </div>
                  <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5 hidden sm:block">
                    {format(new Date(node.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
            )
          }) : (
            <div className="text-center py-12 sm:py-16">
              <div className="w-14 h-14 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">No Unlock Earnings Yet</h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-1">History will appear when your referrals complete the $1 unlock.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
