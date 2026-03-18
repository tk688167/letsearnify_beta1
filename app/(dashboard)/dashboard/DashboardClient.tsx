"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  BanknotesIcon, 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon, 
  BriefcaseIcon, 
  ShoppingBagIcon, 
  UserGroupIcon, 
  StarIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  LockClosedIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  WalletIcon,
  ClockIcon
} from "@heroicons/react/24/outline"
import { formatCurrency, formatUserId, cn } from "@/lib/utils"
import { CompanyPools } from "./CompanyPools"
import { TierProgress } from "./TierProgress"
import { DailyEarningWidget } from "@/app/components/dashboard/DailyEarningWidget"

// Feature Configuration (Can be moved to DB/Env later)
const FEATURE_FLAGS = {
    TASKS: true,      // Set to true when ready to go Live
    PLAY_EARN: false    // Set to true when ready to go Live
}

export default function DashboardClient({ user, pools, stats, isMarketplaceLive = false, isMudarabahLive = false }: { user: any, pools: any[], stats: any, isMarketplaceLive?: boolean, isMudarabahLive?: boolean }) {
  // Use strictly isActiveMember for Unlock state, ignore deposit total
  const [isUnlocked, setIsUnlocked] = useState(() => user.isActiveMember || false);
  const [balance, setBalance] = useState(() => user.balance || 0);

  // Unlock Modal State
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  const handleUnlock = async () => {
      setUnlockError("");
      setIsUnlocking(true);
      try {
          const res = await fetch("/api/user/unlock", { method: "POST" });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to unlock");
          
          setIsUnlocked(true);
          setBalance((prev: number) => prev - 1.0);
          setShowUnlockModal(false);
      } catch (e: any) {
          setUnlockError(e.message);
      } finally {
          setIsUnlocking(false);
      }
  };

  // Helper to determine status: 'LOCKED' | 'DEV' | 'LIVE'
  const getFeatureStatus = (featureKey: "TASKS" | "PLAY_EARN" | "MARKETPLACE" | "MUDARABA" | "POOLS") => {
      if (!isUnlocked) return "LOCKED"
      if (featureKey === "MARKETPLACE") return isMarketplaceLive ? "LIVE" : "DEV";
      if (featureKey === "MUDARABA" || featureKey === "POOLS") return isMudarabahLive ? "LIVE" : "DEV";
      return FEATURE_FLAGS[featureKey as keyof typeof FEATURE_FLAGS] ? "LIVE" : "DEV";
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 pb-24">
      
      {/* ═══ DASHBOARD HERO HEADER ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl text-white"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #0f172a 100%)" }}
      >
        {/* Subtle glow orbs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Dot texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

        <div className="relative z-10 px-5 sm:px-10 py-6 sm:py-10 text-center">

          {/* Top: live badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/8 border border-white/10 text-[9px] sm:text-xs font-bold uppercase tracking-[0.18em] text-blue-300/80 mb-3 sm:mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Dashboard · Active
          </div>

          {/* Greeting line */}
          <p className="text-white/40 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-1 sm:mb-2">
            Welcome back
          </p>

          {/* Name — full name, gradient styled */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4 sm:mb-5">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-blue-300">
              {user.name || "Partner"}
            </span>
          </h1>

          {/* Divider */}
          <div className="w-12 h-px bg-white/10 mx-auto mb-4" />

          {/* Status badges row */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <div className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold border",
              user.tier === 'DIAMOND' ? 'bg-blue-500/15 border-blue-400/25 text-blue-300' :
              user.tier === 'PLATINUM' ? 'bg-slate-400/15 border-slate-300/25 text-slate-300' :
              user.tier === 'GOLD' ? 'bg-amber-500/15 border-amber-400/25 text-amber-300' :
              user.tier === 'EMERALD' ? 'bg-emerald-500/15 border-emerald-400/25 text-emerald-300' :
              'bg-white/8 border-white/10 text-white/60'
            )}>
              <span className={cn("w-1 h-1 rounded-full",
                user.tier === 'DIAMOND' ? 'bg-blue-400' :
                user.tier === 'PLATINUM' ? 'bg-slate-300' :
                user.tier === 'GOLD' ? 'bg-amber-400' :
                user.tier === 'EMERALD' ? 'bg-emerald-400' : 'bg-white/50'
              )} />
              {user.tier}
            </div>
            
            {isUnlocked ? (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold bg-emerald-500/12 border border-emerald-400/20 text-emerald-300">
                  <ShieldCheckIcon className="w-2.5 h-2.5" />
                  Unlocked
                </div>
            ) : (
                <button 
                  onClick={() => setShowUnlockModal(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold bg-amber-500/12 border border-amber-400/20 text-amber-300 hover:bg-amber-500/20 transition-colors"
                >
                  <LockClosedIcon className="w-2.5 h-2.5" />
                  Activate for $1
                </button>
            )}
            
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </motion.div>


      {/* 2. STATS OVERVIEW GRID (Desktop) */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard 
             title="Wallet Balance" 
             value={formatCurrency(balance)} 
             sub="Available USD"
             icon={WalletIcon} 
             color="emerald"
             delay={0.1}
          />
          <StatCard 
             title="Total ARN" 
             value={(balance * 10).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
             icon={StarIcon} 
             color="blue"
             delay={0.2}
          />
          <StatCard 
             title="Task Earnings" 
             value={formatCurrency(user.taskEarnings || 0)} 
             sub="From Activity" 
             icon={BriefcaseIcon} 
             color="indigo"
             delay={0.3}
          />
          <StatCard 
             title="Referral Earnings" 
             value={formatCurrency(user.referralEarnings || 0)} 
             sub="Team Commissions" 
             icon={UserGroupIcon} 
             color="purple"
             delay={0.4}
          />
          <StatCard 
             title="Total Deposited" 
             value={formatCurrency(user.totalDeposit || 0)} 
             sub="Lifetime Investment" 
             icon={ArrowDownTrayIcon} 
             color="amber"
             delay={0.5}
          />
          <StatCard 
             title="Pending Deposit" 
             value={formatCurrency(user.pendingDeposit || 0)} 
             sub="Processing" 
             icon={ClockIcon} 
             color="blue"
             delay={0.6}
          />
          <StatCard 
             title="Total Withdrawn" 
             value={formatCurrency(user.totalWithdrawal || 0)} 
             sub="Successful Payouts" 
             icon={CheckIcon} 
             color="emerald"
             delay={0.7}
          />
          <StatCard 
             title="Pending Withdrawal" 
             value={formatCurrency(user.pendingWithdrawal || 0)} 
             sub="Processing" 
             icon={ArrowUpTrayIcon} 
             color="orange"
             delay={0.8}
          />
      </div>

      {/* 2b. STATS OVERVIEW (Mobile Redesign) - Fixed Hydration */}
      <div className="md:hidden space-y-3">
          {/* Main ARN Card (Wallet Style) - Compact */}
          <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900 p-4 text-white shadow-lg shadow-blue-500/20"
          >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-10 -translate-y-10 pointer-events-none"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                  <div>
                      <h3 className="text-blue-200 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                          <StarIcon className="w-3 h-3"/> Total ARN Balance
                      </h3>
                      <div className="text-3xl font-bold font-serif tracking-tight leading-none mb-1">
                          {((user.balance || 0) * 10).toFixed(2)} <span className="text-sm text-blue-200 font-sans">ARN</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded-lg border border-white/10 backdrop-blur-sm">
                          <span className="text-[10px] font-bold text-blue-100">≈ {formatCurrency(user.balance || 0)} USD</span>
                      </div>
                  </div>
                  <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                      <SparklesIcon className="w-4 h-4 text-yellow-300"/>
                  </div>
              </div>
          </motion.div>

          {/* Compact 3-Grid changed to 2-Column Responsive Grid for Wallet Overview */}
          <div className="grid grid-cols-2 gap-2">
              <MobileStatCard title="Wallet Balance" value={formatCurrency(user.balance || 0)} icon={WalletIcon} color="emerald" delay={0.1} />
              <MobileStatCard title="Total Deposited" value={formatCurrency(user.totalDeposit || 0)} icon={ArrowDownTrayIcon} color="amber" delay={0.2} />
              <MobileStatCard title="Task Earnings" value={formatCurrency(user.taskEarnings || 0)} icon={BriefcaseIcon} color="indigo" delay={0.3} />
              <MobileStatCard title="Ref. Earnings" value={formatCurrency(user.referralEarnings || 0)} icon={UserGroupIcon} color="purple" delay={0.4} />
              <MobileStatCard title="Total Withdrawn" value={formatCurrency(user.totalWithdrawal || 0)} icon={CheckIcon} color="emerald" delay={0.5} />
              <MobileStatCard title="Pending Withdraw" value={formatCurrency(user.pendingWithdrawal || 0)} icon={ArrowUpTrayIcon} color="orange" delay={0.6} />
              <MobileStatCard title="Pending Deposit" value={formatCurrency(user.pendingDeposit || 0)} icon={ClockIcon} color="blue" delay={0.7} />
              <MobileStatCard title="Team / Tier" value={`${user.activeMembers} / ${user.tier.charAt(0)}`} icon={UserGroupIcon} color="amber" delay={0.8} />
          </div>
      </div>

      {/* 3. ACTION HUB */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <ActionTile 
              href="/dashboard/wallet?tab=deposit" 
              icon={ArrowDownTrayIcon} 
              label="Add Funds" 
              sub="Deposit Crypto" 
              color="blue" 
              delay={0.1} 
          />
          <ActionTile 
              href="/dashboard/wallet?tab=withdraw" 
              icon={ArrowUpTrayIcon} 
              label="Withdraw" 
              sub="Cash Out" 
              color="purple" 
              delay={0.2} 
          />
          <ActionTile 
              href="/dashboard/tasks" 
              icon={BriefcaseIcon} 
              label="Task Center" 
              sub="Earn Cash" 
              color="emerald" 
              delay={0.3}
              status={getFeatureStatus("TASKS")}
          />
          <ActionTile 
              href="/dashboard/marketplace" 
              icon={ShoppingBagIcon} 
              label="Marketplace" 
              sub="Buy & Sell" 
              color="orange" 
              delay={0.4}
              status={getFeatureStatus("MARKETPLACE")}
          />
          <ActionTile 
              href="/dashboard/mudaraba" 
              icon={ChartBarIcon} 
              label="Mudaraba" 
              sub="Investment" 
              color="indigo" 
              delay={0.5}
              status={getFeatureStatus("MUDARABA")}
          />
          <ActionTile 
              href="/dashboard/games" 
              icon={SparklesIcon} 
              label="Play & Earn" 
              sub="Web3 Games" 
              color="fuchsia" 
              delay={0.6}
              status={getFeatureStatus("PLAY_EARN")}
          />
      </div>

      {/* 5. DAILY EARNING WIDGET (30-DAY LOCKS) */}
      <div className="pt-8">
          <DailyEarningWidget />
      </div>

      {/* 4. IDENTITY & SECURITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IdentityCard user={user} />
          <ReferralCard user={user} />
      </div>

      {/* 6. UNLOCK BANNER (If Locked) */}
      {!isUnlocked && (
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-900 to-indigo-900 p-8 md:p-12 text-white shadow-2xl shadow-blue-900/20 group"
          >
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-1000"></div>
             
             <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold mb-6 border border-white/10 text-blue-200">
                   <LockClosedIcon className="w-3.5 h-3.5"/> Account Limited
                </div>
                <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight">Unlock Your <br/>Full Earnings Potential</h3>
                <p className="text-blue-100/80 mb-8 leading-relaxed text-lg max-w-lg">
                   Activate your account by depositing just <span className="text-white font-bold">$1.00</span>. This instantly unlocks the Task Center, Marketplace, and all withdrawal features. Plus, even $1 can be withdrawn anytime.
                </p>
                <div className="flex flex-wrap gap-4">
                   <Link href="/dashboard/wallet?tab=deposit" className="px-8 py-4 bg-white text-blue-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm md:text-base">
                      Deposit $1.00 Now
                   </Link>
                   <Link href="/dashboard/how-it-works" className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-sm md:text-base">
                      Learn More
                   </Link>
                </div>
             </div>
          </motion.div>
      )}

      {/* 7. POOLS SECTION */}
      <div className="pt-8 relative">
          <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl font-bold text-foreground font-serif">Community Pools</h2>
          </div>
          
          <div className="relative">
              <CompanyPools pools={pools} isLocked={getFeatureStatus("POOLS") === "LOCKED"} userTier={user.tier} />
          </div>
      </div>

      <TierProgress 
         currentTier={user.tier} 
         points={balance * 10} 
         activeMembers={user.activeMembers || 0} 
         tierRules={user.tierRules} 
         referralCode={user.referralCode}
      />

      {/* 8. UNLOCK CONFIRMATION MODAL */}
      {showUnlockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative border border-gray-100 dark:border-slate-800">
                  <div className="mb-6 text-center">
                      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <LockClosedIcon className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unlock Account</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                          Activating your account costs <span className="font-bold text-gray-900 dark:text-white">$1.00</span> from your wallet balance.
                      </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider mb-3">Unlocks Access To:</h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-emerald-500" /> Premium Tasks</li>
                          <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-emerald-500" /> Marketplace Platform</li>
                          <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-emerald-500" /> Mudarabah Pools</li>
                          <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-emerald-500" /> Partner Commissions</li>
                      </ul>
                  </div>

                  {unlockError && <div className="text-sm text-red-500 text-center mb-4 font-medium">{unlockError}</div>}

                  <div className="flex gap-3">
                      <button 
                          onClick={() => setShowUnlockModal(false)}
                          disabled={isUnlocking}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleUnlock}
                          disabled={isUnlocking}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm hover:bg-black dark:hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                          {isUnlocking ? "Processing..." : "Pay $1.00"}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  )
}

function StatCard({ title, value, sub, icon: Icon, color, delay }: any) {
    const colors: any = {
        emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10",
        blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10",
        amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10",
        indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10",
        purple: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10",
        orange: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10",
    }
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay, duration: 0.4 }}
            className="p-5 bg-card rounded-2xl border border-border shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all group shrink-0"
        >
            <div className="flex justify-between items-start mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", colors[color])}>
                    <Icon className="w-5 h-5"/>
                </div>
            </div>
            <div className="space-y-0.5">
                <div className="text-lg xl:text-xl font-bold text-foreground font-serif truncate">{value}</div>
                <div className="text-[10px] xl:text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</div>
            </div>
        </motion.div>
    )
}

function MobileStatCard({ title, value, icon: Icon, color, delay }: any) {
    const iconColors: any = {
        emerald: "text-emerald-500",
        blue: "text-blue-500",
        amber: "text-amber-500",
        indigo: "text-indigo-500",
        purple: "text-purple-500",
        orange: "text-orange-500",
    }
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className="bg-card p-2 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center text-center py-3.5 overflow-hidden"
        >
            <Icon className={cn("w-5 h-5 mb-1.5", iconColors[color] || "text-foreground")}/>
            <div className="font-bold text-foreground text-xs leading-tight truncate w-full px-1">{value}</div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5 truncate w-full">{title}</div>
        </motion.div>
    )
}

function ActionTile({ href, icon: Icon, label, sub, color, delay, status = "LIVE" }: any) {
    const isLive = status === "LIVE"
    const isLocked = status === "LOCKED"
    const isDev = status === "DEV"
    
    // Base colors
    const hoverColors: any = {
        blue: "group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-200 dark:group-hover:border-blue-800/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10",
        purple: "group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:border-purple-200 dark:group-hover:border-purple-800/50 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/10",
        emerald: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:border-emerald-200 dark:group-hover:border-emerald-800/50 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/10",
        orange: "group-hover:text-orange-600 dark:group-hover:text-orange-400 group-hover:border-orange-200 dark:group-hover:border-orange-800/50 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/10",
        indigo: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-200 dark:group-hover:border-indigo-800/50 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/10",
        fuchsia: "group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 group-hover:border-fuchsia-200 dark:group-hover:border-fuchsia-800/50 group-hover:bg-fuchsia-50 dark:group-hover:bg-fuchsia-900/10",
    }
    const iconColors: any = {
        blue: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
        purple: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
        emerald: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
        orange: "text-orange-500 bg-orange-50 dark:bg-orange-900/20",
        indigo: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20",
        fuchsia: "text-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20",
    }

    // Locked/Dev State UI Overrides
    const content = (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay, duration: 0.4 }}
            className={cn(
                "h-full p-4 md:p-5 rounded-2xl border shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col items-start",
                isLive ? cn("bg-card border-border cursor-pointer", hoverColors[color]) :
                isDev ? "bg-card border-border cursor-pointer hover:border-indigo-200/50 dark:hover:border-indigo-800/50" : 
                "bg-muted/50 border-border cursor-not-allowed opacity-90"
            )}
        >
            {/* Top Row: Icon and Badge */}
            <div className="flex justify-between items-start w-full mb-3 relative z-10">
                <div className={cn("w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors shrink-0", 
                    isLive ? cn(iconColors[color], "group-hover:bg-white dark:group-hover:bg-gray-800") : 
                    isDev ? cn(iconColors[color], "bg-indigo-50 dark:bg-indigo-900/20") :
                    "bg-muted text-muted-foreground"
                )}>
                    {isLocked ? <LockClosedIcon className="w-4 h-4 md:w-5 md:h-5"/> : isDev ? <WrenchScrewdriverIcon className="w-4 h-4 md:w-5 md:h-5 text-indigo-500"/> : <Icon className="w-4 h-4 md:w-5 md:h-5"/>}
                </div>

                {/* Status Badge */}
                {!isLive && (
                    <div className="shrink-0 ml-2 mt-0.5">
                         {isLocked ? (
                             <div className="w-5 h-5 bg-muted/80 rounded-full flex items-center justify-center">
                                 <LockClosedIcon className="w-3 h-3 text-muted-foreground"/>
                             </div>
                         ) : (
                             <span className="flex items-center gap-1.5 px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[6.5px] md:text-[7.5px] font-bold uppercase tracking-wider rounded-full border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                                 {/* The Blinking Dot */}
                                 <span className="relative flex h-1 w-1 md:h-1.5 md:w-1.5 align-middle">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-1 w-1 md:h-1.5 md:w-1.5 bg-indigo-500"></span>
                                 </span>
                                 Built Soon
                             </span>
                         )}
                    </div>
                )}
            </div>
            
            <div className="relative z-10 w-full min-w-0 pr-1">
                <h3 className={cn("font-bold text-xs md:text-sm lg:text-base transition-colors truncate", 
                     isLive ? "text-foreground group-hover:text-inherit" : 
                     isDev ? "text-foreground" : 
                     "text-muted-foreground"
                )}>
                    {label}
                </h3>
                <p className={cn("text-[10px] md:text-[11px] lg:text-xs transition-colors truncate mt-0.5", 
                     isLive ? "text-muted-foreground group-hover:text-inherit/70" : 
                     isDev ? "text-muted-foreground" : 
                     "text-muted-foreground/70"
                )}>
                    {sub}
                </p>
            </div>
        </motion.div>
    )

    // Always allow navigation so FeatureGuard can handle the "Deposit Required" or "Coming Soon" UI
    return <Link href={href} className="block group">{content}</Link>
}

function IdentityCard({ user }: any) {
    return (
        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm flex flex-col justify-center transition-colors">
             <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <div className="w-16 h-16 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xl shadow-inner border border-white dark:border-gray-700 shrink-0">
                    {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0 flex-1 w-full">
                   <h3 className="font-bold text-foreground font-serif text-lg">Identity Card</h3>
                   <p className="text-sm text-muted-foreground mb-6 sm:mb-4">Your digital access keys.</p>
                   
                   <div className="space-y-4 sm:space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-between p-3 sm:p-2 bg-muted/30 rounded-lg border border-border">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1 self-start sm:self-center">User ID</span>
                         <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                            <span className="font-mono text-sm font-bold text-foreground break-all">{formatUserId(user.memberId)}</span>
                            <CopyButton text={formatUserId(user.memberId)} />
                         </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-between p-3 sm:p-2 bg-muted/30 rounded-lg border border-border">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1 self-start sm:self-center">Email</span>
                         <div className="flex items-center justify-between w-full sm:w-auto gap-3 min-w-0">
                            <span className="text-sm font-medium text-foreground truncate">{user.email}</span>
                            <CopyButton text={user.email} />
                         </div>
                      </div>
                   </div>
                </div>
             </div>
        </div>
    )
}

function ReferralCard({ user }: any) {
    const [origin, setOrigin] = useState("")

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin)
        }
    }, [])

    const referralLink = origin ? `${origin}/?ref=${user.referralCode}` : "Loading..."

    return (
        <div className="p-6 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 rounded-2xl border border-indigo-100 dark:border-slate-800 flex flex-col justify-center shadow-sm relative overflow-hidden group transition-colors">
             {/* Decor */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-200/50 dark:group-hover:bg-indigo-900/30 transition-colors"></div>
             
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                   <div>
                       <h3 className="font-bold text-indigo-900 dark:text-indigo-400 font-serif text-lg">Partner Program</h3>
                       <p className="text-sm text-indigo-600/80 dark:text-indigo-300/80">Share your link to earn lifelong commissions.</p>
                   </div>
                   <div className="p-2 bg-white dark:bg-indigo-900/20 rounded-lg shadow-sm text-indigo-500">
                       <UserGroupIcon className="w-6 h-6"/>
                   </div>
                </div>

                {user.referralCode ? (
                    <div className="space-y-3">
                        {/* 1. Referral Link (Primary) */}
                        <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-indigo-100 dark:border-slate-700 shadow-sm">
                            <label className="text-[10px] font-bold text-indigo-400 dark:text-indigo-300 uppercase tracking-wider mb-1 block">Your Personal Link</label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 overflow-hidden">
                                     <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100 truncate bg-indigo-50/50 dark:bg-slate-800/50 px-2 py-1.5 rounded-lg border border-indigo-100/50 dark:border-slate-600">
                                        {referralLink}
                                     </p>
                                </div>
                                <CopyButton text={referralLink} color="indigo" />
                            </div>
                        </div>

                        {/* 2. Code Only (Secondary) */}
                        <div className="flex items-center justify-between gap-3 px-1">
                             <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Referral Code:</span>
                             <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">{user.referralCode}</span>
                                <CopyButton text={user.referralCode} />
                             </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">Referral code generating...</div>
                )}
             </div>
        </div>
    )
}

function CopyButton({ text, color = "gray" }: { text: string, color?: string }) {
    const [copied, setCopied] = useState(false)
    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button 
           onClick={handleCopy}
           className={cn("p-2 rounded-lg transition-all", 
               copied 
                   ? "bg-green-100 text-green-700 scale-110" 
                   : color === "indigo" ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200"
           )}
        >
            {copied ? <CheckIcon className="w-4 h-4"/> : <DocumentDuplicateIcon className="w-4 h-4"/>}
        </button>
    )
}
