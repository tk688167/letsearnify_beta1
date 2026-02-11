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
  SparklesIcon
} from "@heroicons/react/24/outline"
import { formatCurrency, formatUserId, cn } from "@/lib/utils"
import { CompanyPools } from "./CompanyPools"
import { TierProgress } from "./TierProgress"
import { CopyableText } from "./copyable-text"
import { SpinWheel } from "./SpinWheel"

// Feature Configuration (Can be moved to DB/Env later)
const FEATURE_FLAGS = {
    TASKS: true,      // Set to true when ready to go Live
    MARKETPLACE: false, // Set to true when ready to go Live
    POOLS: false       // Set to true when ready to go Live
}

export default function DashboardClient({ user, pools, stats }: { user: any, pools: any[], stats: any }) {
  const isUnlocked = user.isActiveMember || (user.totalDeposit ?? 0) >= 1.00

  // Helper to determine status: 'LOCKED' | 'DEV' | 'LIVE'
  const getFeatureStatus = (featureKey: keyof typeof FEATURE_FLAGS) => {
      if (!isUnlocked) return "LOCKED"
      return FEATURE_FLAGS[featureKey] ? "LIVE" : "DEV"
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 pb-24">
      
      {/* 1. HERO SECTION */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
        >
           <div className="flex items-center gap-3 mb-2">
             <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border shadow-sm",
                 user.tier === 'DIAMOND' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                 user.tier === 'PLATINUM' ? 'bg-slate-50 text-slate-700 border-slate-100' :
                 user.tier === 'GOLD' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                 'bg-white text-gray-700 border-gray-100'
             )}>
                <span className={cn("w-2 h-2 rounded-full animate-pulse", 
                    user.tier === 'DIAMOND' ? 'bg-blue-500' :
                    user.tier === 'PLATINUM' ? 'bg-slate-500' :
                    user.tier === 'GOLD' ? 'bg-amber-500' : 'bg-green-500'
                )}></span>
                {user.tier} Member
             </div>
             <div className="px-3 py-1 rounded-full bg-white border border-gray-100 text-[10px] font-bold text-gray-500 flex items-center gap-1.5 shadow-sm">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500"/>
                Network Live
             </div>
           </div>
           <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">
             Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user.name?.split(' ')[0] || 'Partner'}</span>
           </h1>
           <p className="text-gray-500 mt-1 text-sm md:text-base">Here is your financial command center.</p>
        </motion.div>

        {/* Desktop Quick Actions (Optional, or can keep strictly in grid below) */}
      </header>

      {/* 2. STATS OVERVIEW GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard 
             title="Total ARN" 
             value={(user.arnBalance || 0).toFixed(0)} 
             sub={`≈ ${formatCurrency((user.arnBalance || 0) / 10)} USD`} 
             icon={StarIcon} 
             color="blue"
             delay={0.1}
          />
          <StatCard 
             title="Total Deposited" 
             value={formatCurrency(user.totalDeposit || 0)} 
             sub="Lifetime Investment" 
             icon={BanknotesIcon} 
             color="amber"
             delay={0.2}
          />
          <StatCard 
             title="Active Team" 
             value={user.activeMembers.toString()} 
             sub="Verified Referrals" 
             icon={UserGroupIcon} 
             color="indigo"
             delay={0.3}
          />
          <StatCard 
             title="Current Tier" 
             value={user.tier} 
             sub="Member Status" 
             icon={ShieldCheckIcon} 
             color="emerald"
             delay={0.4}
          />
      </div>

      {/* 2.5 DAILY SPIN (New) */}
      {isUnlocked && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <SpinWheel onComplete={() => window.location.reload()} />
            </div>
            {/* Quick Tips or Ad Placeholder can go here */}
             <div className="md:col-span-2 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white flex flex-col justify-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold font-serif mb-2">Boost Your Earnings</h3>
                    <p className="text-blue-100 mb-4">Complete daily tasks to multiply your spin rewards. Higher tiers = Bigger payouts.</p>
                     <Link href="/dashboard/tasks" className="inline-flex items-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/10 w-fit">
                        Go to Tasks <ArrowUpTrayIcon className="w-4 h-4 rotate-90"/>
                     </Link>
                </div>
             </div>
        </div>
      )}

      {/* 3. ACTION HUB */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
              <h2 className="text-2xl font-bold text-gray-900 font-serif">Community Pools</h2>

          </div>
          
          <div className="relative">
              <CompanyPools pools={pools} isLocked={getFeatureStatus("POOLS") === "LOCKED"} userTier={user.tier} />
          </div>
      </div>

      <TierProgress 
         currentTier={user.tier} 
         points={user.arnBalance} 
         activeMembers={user.activeMembers} 
         tierRules={user.tierRules} 
         referralCode={user.referralCode}
      />

    </div>
  )
}

function StatCard({ title, value, sub, icon: Icon, color, delay }: any) {
    const colors: any = {
        blue: "text-blue-600 bg-blue-50",
        amber: "text-amber-600 bg-amber-50",
        indigo: "text-indigo-600 bg-indigo-50",
        emerald: "text-emerald-600 bg-emerald-50",
    }
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay, duration: 0.4 }}
            className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", colors[color])}>
                    <Icon className="w-6 h-6"/>
                </div>
            </div>
            <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 font-serif">{value}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</div>
            </div>
        </motion.div>
    )
}

function ActionTile({ href, icon: Icon, label, sub, color, delay, status = "LIVE" }: any) {
    const isLive = status === "LIVE"
    const isLocked = status === "LOCKED"
    
    // Base colors
    const hoverColors: any = {
        blue: "group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50",
        purple: "group-hover:text-purple-600 group-hover:border-purple-200 group-hover:bg-purple-50",
        emerald: "group-hover:text-emerald-600 group-hover:border-emerald-200 group-hover:bg-emerald-50",
        orange: "group-hover:text-orange-600 group-hover:border-orange-200 group-hover:bg-orange-50",
    }
    const iconColors: any = {
        blue: "text-blue-500 bg-blue-50",
        purple: "text-purple-500 bg-purple-50",
        emerald: "text-emerald-500 bg-emerald-50",
        orange: "text-orange-500 bg-orange-50",
    }

    // Locked/Dev State UI Overrides
    const content = (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay, duration: 0.4 }}
            className={cn(
                "h-full p-5 rounded-2xl border shadow-sm transition-all duration-300 relative overflow-hidden",
                isLive ? cn("bg-white border-gray-100 cursor-pointer", hoverColors[color]) : "bg-gray-50 border-gray-200 cursor-not-allowed opacity-90"
            )}
        >
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors", 
                isLive ? cn(iconColors[color], "group-hover:bg-white") : "bg-gray-200 text-gray-400"
            )}>
                {isLocked ? <LockClosedIcon className="w-5 h-5"/> : isLive ? <Icon className="w-5 h-5"/> : <WrenchScrewdriverIcon className="w-5 h-5"/>}
            </div>
            
            <h3 className={cn("font-bold text-sm md:text-base transition-colors", isLive ? "text-gray-900 group-hover:text-inherit" : "text-gray-500")}>
                {label}
            </h3>
            <p className={cn("text-xs transition-colors", isLive ? "text-gray-400 group-hover:text-inherit/70" : "text-gray-400")}>
                {sub}
            </p>

            {/* Status Overlay Badge */}
            {!isLive && (
                <div className="absolute top-4 right-4">
                     {isLocked ? (
                         <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                             <LockClosedIcon className="w-3 h-3 text-gray-500"/>
                         </div>
                     ) : (
                         <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold uppercase rounded border border-amber-200">
                             Dev
                         </span>
                     )}
                </div>
            )}
        </motion.div>
    )

    // Always allow navigation so FeatureGuard can handle the "Deposit Required" or "Coming Soon" UI
    return <Link href={href} className="block group">{content}</Link>
}

function IdentityCard({ user }: any) {
    return (
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
             <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xl shadow-inner border border-white">
                    {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0 flex-1">
                   <h3 className="font-bold text-gray-900 font-serif text-lg">Identity Card</h3>
                   <p className="text-sm text-gray-500 mb-4">Your digital access keys.</p>
                   
                   <div className="space-y-3">
                      <div className="flex items-center gap-3 justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">User ID</span>
                         <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-gray-700">{formatUserId(user.memberId)}</span>
                            <CopyButton text={formatUserId(user.memberId)} />
                         </div>
                      </div>
                      <div className="flex items-center gap-3 justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Email</span>
                         <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-medium text-gray-700 truncate">{user.email}</span>
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
        <div className="p-6 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 flex flex-col justify-center shadow-sm relative overflow-hidden group">
             {/* Decor */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-200/50 transition-colors"></div>
             
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                   <div>
                       <h3 className="font-bold text-indigo-900 font-serif text-lg">Partner Program</h3>
                       <p className="text-sm text-indigo-600/80">Share your link to earn lifelong commissions.</p>
                   </div>
                   <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-500">
                       <UserGroupIcon className="w-6 h-6"/>
                   </div>
                </div>

                {user.referralCode ? (
                    <div className="space-y-3">
                        {/* 1. Referral Link (Primary) */}
                        <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                            <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1 block">Your Personal Link</label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 overflow-hidden">
                                     <p className="text-sm font-medium text-indigo-900 truncate bg-indigo-50/50 px-2 py-1.5 rounded-lg border border-indigo-100/50">
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
                                <span className="font-mono font-bold text-indigo-700">{user.referralCode}</span>
                                <CopyButton text={user.referralCode} />
                             </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">Referral code generating...</div>
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
                   : color === "indigo" ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200" : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
           )}
        >
            {copied ? <CheckIcon className="w-4 h-4"/> : <DocumentDuplicateIcon className="w-4 h-4"/>}
        </button>
    )
}
