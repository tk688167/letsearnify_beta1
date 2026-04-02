"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  GiftIcon,
  SparklesIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  RocketLaunchIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline"
import InlineBackButton from "@/app/components/ui/InlineBackButton"

export default function AchievementPoolContent({ percentage, balance }: { percentage: number, balance: number }) {
  return (
    <div className="max-w-5xl mx-auto pb-24 px-4 sm:px-6 lg:px-8 mt-6">
      <InlineBackButton className="mb-6 inline-flex" />

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden mb-8"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <GiftIcon className="w-64 h-64 text-amber-500" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider rounded-lg mb-6 shadow-sm">
            <TrophyIcon className="w-4 h-4" />
            <span>Milestone Rewards Engine</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight mb-4">
            Achievement Pool
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed font-medium mb-8 max-w-2xl mx-auto">
            The Achievement Pool is fundamentally designed to instantly reward your growth. It is autonomously funded by dedicating exactly <strong>{percentage}%</strong> of every $1 account unlock across the entire global network.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 bg-background/50 border border-border/50 rounded-2xl p-6 shadow-inner">
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Live Global Treasury</p>
              <p className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                ${balance.toFixed(2)}
              </p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-border/50"></div>
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Funding Velocity</p>
              <p className="text-xl font-bold text-foreground">
                <span className="text-emerald-500">+{percentage}%</span> per User Activation
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid Features */}
      <h2 className="text-2xl font-bold text-foreground mb-6">How the Protocol Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 border border-border/50 rounded-3xl p-8"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
            <CurrencyDollarIcon className="w-6 h-6 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3">Community Funding</h3>
          <p className="text-muted-foreground leading-relaxed text-sm">
            Whenever any new user signs up and activates their account by paying the $1 activation fee, exactly {percentage}% of that fee is immediately locked into this Achievement Treasury smart-contract.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 border border-border/50 rounded-3xl p-8"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
            <RocketLaunchIcon className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3">Tier Progression</h3>
          <p className="text-muted-foreground leading-relaxed text-sm">
            You start as a Newbie. By actively participating, depositing, and building your network, you upgrade naturally. The moment you hit a new tier (like transitioning from Newbie to Bronze), you trigger the system.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card/50 border border-border/50 rounded-3xl p-8"
        >
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center mb-6">
            <SparklesIcon className="w-6 h-6 text-fuchsia-500" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3">Instant Surprise Reward</h3>
          <p className="text-muted-foreground leading-relaxed text-sm">
            Upon upgrade, the protocol assesses the global treasury and releases a Special Surprise Reward. This could be direct ARN Tokens, exclusive digital perks, or physical gift hampers sent to your door.
          </p>
        </motion.div>
      </div>

      {/* Yield Fluctuation Notice (Same as Daily Earning for consistency) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-8 sm:p-10 relative overflow-hidden mb-8"
      >
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
            <ExclamationTriangleIcon className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-amber-600 dark:text-amber-500 mb-2 uppercase tracking-wide">
              Yield Fluctuation Notice
            </h3>
            <p className="text-base text-foreground/80 leading-relaxed font-medium">
              Because the Achievement Pool is directly correlated to the global volume of platform activations and user activity, the available payouts are dynamic.
            </p>
            <div className="mt-4 p-4 bg-background/50 rounded-2xl border border-border/50 shadow-inner">
              <p className="text-sm text-muted-foreground leading-relaxed">
                As a result, your cumulative rewards may occasionally reach equivalents of <strong>up to 30% monthly profit</strong> under high-traffic intervals, but sometimes they may be significantly less depending on new user acquisition. The system mathematically scales tier reward sizes to ensure the pool never runs out of liquidity.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <div className="flex justify-center mt-12">
        <Link 
          href="/dashboard/tiers"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-indigo-500/20 hover:scale-105"
        >
          <TrophyIcon className="w-5 h-5" />
          Track Your Next Tier
        </Link>
      </div>

    </div>
  )
}
