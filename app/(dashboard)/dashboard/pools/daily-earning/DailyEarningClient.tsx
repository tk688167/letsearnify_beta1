"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  ChartBarIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  ClockIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline"
import InlineBackButton from "@/app/components/ui/InlineBackButton"

export default function DailyEarningPoolContent() {
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
          <ChartBarIcon className="w-64 h-64 text-indigo-500" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-bold uppercase tracking-wider rounded-lg mb-6 shadow-sm">
              <BoltIcon className="w-4 h-4" />
              <span>Yield Generation Protocol</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight mb-4">
              Daily Earning Pool
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed font-medium mb-8">
              The Daily Earning Pool is a secure, automated smart-contract designed to generate steady, compound yields. By committing capital to the platform's liquidity pool, you earn daily returns directly proportional to the company's continuous growth.
            </p>
            
            <Link 
              href="/dashboard/daily-earning"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-indigo-500/20 hover:scale-105"
            >
              Access Pool Dashboard <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 border border-border/50 rounded-3xl p-8"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
            <ClockIcon className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3">30-Day Lock Cycle</h3>
          <p className="text-muted-foreground leading-relaxed text-sm">
            When you initialize a Daily Pool, your designated capital is securely locked into the protocol for exactly 30 calendar days. During this period, the funds cannot be manually withdrawn, ensuring stable liquidity for the overarching ecosystem. Upon maturity, the smart-contract automatically releases both your initial principal and all accumulated yields back into your Daily Wallet.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 border border-border/50 rounded-3xl p-8"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
            <DocumentTextIcon className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3">Automated Distribution</h3>
          <p className="text-muted-foreground leading-relaxed text-sm">
            Distributions occur automatically every 24 hours. There is no need to manually claim or interact with the system daily. The pool protocol automatically snapshots your allocation size, applies the daily interest multiplier, and securely logs the accumulated profit onto your active contract.
          </p>
        </motion.div>
      </div>

      {/* Important Disclaimer Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-8 sm:p-10 relative overflow-hidden"
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
              While the Daily Earning Pool is structured to provide high yields, the daily return rate is not permanently fixed. Rate distributions run synchronously alongside total company revenue and global engagement. 
            </p>
            <div className="mt-4 p-4 bg-background/50 rounded-2xl border border-border/50 shadow-inner">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Therefore, users may experience months where they accumulate <strong>up to 30% monthly profit</strong> under optimal market conditions, whereas other periods may result in significantly lower percentage returns to maintain internal ecosystem stability and robust financial health. Overall system sustainability dictates the final daily multipliers.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  )
}
