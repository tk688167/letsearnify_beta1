"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  CurrencyDollarIcon, 
  CheckCircleIcon,
  ClockIcon,
  BanknotesIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  CalculatorIcon
} from "@heroicons/react/24/outline"

export default function CbspPoolContent() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      
      {/* Back Button */}
      <Link 
        href="/dashboard/pools" 
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Pools
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-12 text-white relative overflow-hidden shadow-lg"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-5"></div>
        
        <div className="relative z-10">
          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
              <CurrencyDollarIcon className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-1 sm:mb-2">CBSP Pool</h1>
              <p className="text-blue-100 text-sm sm:text-base md:text-lg font-medium">Community Benefit Sharing Program</p>
            </div>
          </div>
          <p className="text-blue-50 leading-relaxed max-w-3xl text-sm sm:text-base md:text-lg">
            A transparent, automated system that shares platform profits with all active members every week based on your tier level.
          </p>
        </div>
      </motion.div>

      {/* Three Core Principles */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">How the CBSP Pool Works</h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 sm:mb-8">
          The CBSP Pool operates on three simple principles that create a sustainable reward system: <strong className="text-foreground">Accumulation</strong>, <strong className="text-foreground">Distribution</strong>, and <strong className="text-foreground">Retention</strong>.
        </p>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Accumulation */}
          <div className="bg-card rounded-lg md:rounded-xl p-5 sm:p-6 border-2 border-blue-100 dark:border-blue-900/30 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-lg sm:text-xl mb-3 sm:mb-4">
              1
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">Accumulation</h3>
            <div className="mb-3 sm:mb-4">
              <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 dark:bg-blue-500 text-white font-bold text-2xl sm:text-3xl rounded-lg shadow-sm">
                5%
              </span>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Every time <strong className="text-foreground">any user deposits funds</strong>, 5% of that deposit is automatically added to the CBSP Pool. These contributions accumulate continuously.
            </p>
          </div>

          {/* Distribution */}
          <div className="bg-card rounded-xl p-6 border-2 border-blue-100 dark:border-blue-900/30 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-xl mb-4">
              2
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Distribution</h3>
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-bold text-3xl rounded-lg shadow-sm">
                3%
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Every Monday at 12:00 AM UTC, <strong className="text-foreground">3% of the total pool balance</strong> is distributed among eligible members based on tier percentages.
            </p>
          </div>

          {/* Retention */}
          <div className="bg-card rounded-xl p-6 border-2 border-blue-100 dark:border-blue-900/30 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-xl mb-4">
              3
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Retention</h3>
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-bold text-3xl rounded-lg shadow-sm">
                97%
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              After distribution, <strong className="text-foreground">97% of the pool balance stays</strong> in the pool, ensuring continuous growth for future rewards.
            </p>
          </div>
        </div>
      </section>

      {/* Step-by-Step Explanation */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg md:rounded-xl p-5 sm:p-6 md:p-8 border border-blue-100 dark:border-blue-900/30">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
          <ArrowPathIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
          The Complete Weekly Cycle
        </h3>
        
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-card rounded-lg p-4 sm:p-5 md:p-6 border border-blue-200 dark:border-blue-900/30">
            <h4 className="font-bold text-foreground mb-2 flex items-center gap-2 text-base sm:text-lg">
              <span className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">1</span>
              How Funds Are Added to the Pool
            </h4>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-8 sm:pl-9">
              Throughout the week, whenever any member makes a deposit, 5% of that deposit goes directly into the CBSP Pool. For example, if 10 users each deposit $100, the total deposits are $1,000, and the pool receives 10 × $5 = $50.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-blue-200 dark:border-blue-900/30">
            <h4 className="font-bold text-foreground mb-2 flex items-center gap-2 text-lg">
              <span className="w-7 h-7 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Weekly Distribution Calculation
            </h4>
            <p className="text-muted-foreground leading-relaxed pl-9">
              Every Monday at 12:00 AM UTC, the system automatically calculates 3% of the current total pool balance. This 3% is then divided among tiers (Emerald gets 25%, Diamond gets 20%, etc.), and within each tier, members share equally.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-blue-200 dark:border-blue-900/30">
            <h4 className="font-bold text-foreground mb-2 flex items-center gap-2 text-lg">
              <span className="w-7 h-7 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Pool Balance Retention
            </h4>
            <p className="text-muted-foreground leading-relaxed pl-9">
              After distributing 3%, the remaining 97% stays in the pool. This retained amount becomes the base for next week's distribution and continues growing as new deposits come in throughout the week.
            </p>
          </div>
        </div>
      </section>

      {/* Example Calculation */}
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
           <div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2 flex items-center gap-3">
                 <CalculatorIcon className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
                 Distribution Example
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-2xl text-sm sm:text-base">
                 See exactly how weekly rewards are calculated and securely distributed. <em className="text-muted-foreground/80">(Figures are for illustration purposes only)</em>
              </p>
           </div>
        </div>

        <div className="relative rounded-[2rem] p-6 sm:p-8 md:p-10 text-white shadow-2xl overflow-hidden group">
          {/* Glassmorphic Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 mix-blend-overlay"></div>
          
          {/* Animated Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-400/30 transition-colors duration-700"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-indigo-400/30 transition-colors duration-700"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                 <CalculatorIcon className="w-5 h-5 text-blue-200" />
              </div>
              <h4 className="font-bold text-lg sm:text-xl tracking-wide">Weekly Calculation Breakdown</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {/* Pool Balance */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 relative overflow-hidden group/card shadow-lg hover:shadow-xl hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                   <p className="text-blue-200/80 text-xs sm:text-sm mb-2 font-bold uppercase tracking-widest">Pool Balance</p>
                   <div className="flex items-baseline gap-1">
                      <span className="text-blue-400/80 text-xl font-bold">$</span>
                      <p className="text-white font-bold text-3xl sm:text-4xl font-mono tracking-tight">10,000</p>
                   </div>
                </div>
              </div>
              
              {/* Rate */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 relative overflow-hidden group/card shadow-lg hover:shadow-xl hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                   <p className="text-blue-200/80 text-xs sm:text-sm mb-2 font-bold uppercase tracking-widest">Weekly Rate</p>
                   <p className="text-white font-bold text-3xl sm:text-4xl font-mono tracking-tight">3<span className="text-blue-400/80 text-2xl">%</span></p>
                </div>
              </div>

              {/* Distributed */}
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all duration-300 relative overflow-hidden group/card shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                   <p className="text-emerald-200/80 text-xs sm:text-sm mb-2 font-bold uppercase tracking-widest">Distributed to Users</p>
                   <div className="flex items-baseline gap-1">
                      <span className="text-emerald-400/80 text-xl font-bold">$</span>
                      <p className="text-emerald-100 font-bold text-3xl sm:text-4xl font-mono tracking-tight">300</p>
                   </div>
                </div>
              </div>

              {/* Remaining */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 relative overflow-hidden group/card shadow-lg hover:shadow-xl hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                   <p className="text-blue-200/80 text-xs sm:text-sm mb-2 font-bold uppercase tracking-widest">Retained Growth</p>
                   <div className="flex items-baseline gap-1">
                      <span className="text-blue-400/80 text-xl font-bold">$</span>
                      <p className="text-white font-bold text-3xl sm:text-4xl font-mono tracking-tight">9,700</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 flex items-start sm:items-center gap-4 shadow-sm">
              <div className="p-2 sm:p-2.5 bg-blue-500/20 rounded-lg text-blue-300 shrink-0 border border-blue-400/20">
                 <InformationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
              </div>
              <p className="text-blue-50/90 text-sm leading-relaxed max-w-4xl">
                <strong className="text-white font-bold">Simple Verification:</strong> When the pool reaches $10,000, 3% ($300) is distributed fairly among eligible members. The remaining 97% ($9,700) safely rolls over to the next week, continuously compounding with new deposits to ensure sustainable reward growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section>
        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Who Can Receive CBSP Rewards?</h3>
        
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 rounded-lg md:rounded-xl p-5 sm:p-6 md:p-8 border-2 border-emerald-200 dark:border-emerald-900/30">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircleIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-emerald-900 dark:text-emerald-100 text-xl">You're Eligible If:</h4>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg flex-shrink-0">✓</span>
                <span className="text-muted-foreground">You've deposited at least <strong className="text-foreground">$1.00</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg flex-shrink-0">✓</span>
                <span className="text-muted-foreground">Your account is in <strong className="text-foreground">good standing</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg flex-shrink-0">✓</span>
                <span className="text-muted-foreground">You're <strong className="text-foreground">active</strong> during distribution week</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-8 border-2 border-blue-200 dark:border-blue-900/30">
            <div className="flex items-center gap-2 mb-6">
              <BanknotesIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              <h4 className="font-bold text-blue-900 dark:text-blue-100 text-xl">Quick Start</h4>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Simply deposit <strong className="text-foreground">$1.00 or more</strong> to become eligible for next Monday's CBSP distribution!
            </p>
            <Link 
              href="/dashboard/wallet?tab=deposit" 
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-blue-600 dark:bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg"
            >
              <BanknotesIcon className="w-5 h-5" />
              Deposit Now
            </Link>
          </div>
        </div>
      </section>

      {/* Tier Distribution Table */}
      <section>
        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">Tier-Based Distribution</h3>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6">
          The weekly 3% distribution is allocated to tiers by percentage. Within each tier, members share equally.
        </p>

        {/* Mobile Card Layout */}
        <div className="block md:hidden space-y-3">
          <TierCard tier="Emerald" percentage={25} amount={75.00} isTop />
          <TierCard tier="Diamond" percentage={20} amount={60.00} />
          <TierCard tier="Platinum" percentage={17} amount={51.00} />
          <TierCard tier="Gold" percentage={14} amount={42.00} />
          <TierCard tier="Silver" percentage={11} amount={33.00} />
          <TierCard tier="Bronze" percentage={8} amount={24.00} />
          <TierCard tier="Newbie" percentage={5} amount={15.00} />
          
          {/* Mobile Total Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-foreground text-lg">TOTAL</span>
              <span className="font-bold text-foreground text-lg">100%</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-xl">$300.00</span>
            </div>
          </div>
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block overflow-hidden rounded-xl border-2 border-blue-200 dark:border-blue-900/40 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Tier</th>
                <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Share %</th>
                <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider">Example Amount</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-blue-100 dark:divide-blue-900/30">
              <TierRow tier="Emerald" percentage={25} amount={75.00} isTop />
              <TierRow tier="Diamond" percentage={20} amount={60.00} />
              <TierRow tier="Platinum" percentage={17} amount={51.00} />
              <TierRow tier="Gold" percentage={14} amount={42.00} />
              <TierRow tier="Silver" percentage={11} amount={33.00} />
              <TierRow tier="Bronze" percentage={8} amount={24.00} />
              <TierRow tier="Newbie" percentage={5} amount={15.00} />
            </tbody>
            <tfoot>
              <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-300 dark:border-blue-900/50">
                <td className="px-6 py-4 font-bold text-foreground text-lg">TOTAL</td>
                <td className="px-6 py-4 text-center font-bold text-foreground text-lg">100%</td>
                <td className="px-6 py-4 text-right font-bold text-blue-600 dark:text-blue-400 font-mono text-xl">$300.00</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-4 sm:mt-6 bg-blue-50 dark:bg-blue-900/10 rounded-lg md:rounded-xl p-4 sm:p-5 md:p-6 border border-blue-200 dark:border-blue-900/30">
          <div className="flex items-start gap-2 sm:gap-3">
            <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground mb-1 text-sm sm:text-base">Automatic Distribution Schedule</p>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Distributions happen every <strong>Monday at 12:00 AM UTC</strong>. Your reward is instantly credited to your ARN balance—no action needed!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Tier Row Component (Desktop Table)
function TierRow({ tier, percentage, amount, isTop }: any) {
  return (
    <tr className={`${isTop ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-blue-50 dark:hover:bg-blue-900/10'} transition-colors`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-block px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-bold shadow-sm">
            {tier}
          </span>
          {isTop && (
            <span className="inline-block px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold rounded uppercase">
              Highest
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 rounded-lg font-bold">
          {percentage}%
        </span>
      </td>
      <td className="px-6 py-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400 text-lg">
        ${amount.toFixed(2)}
      </td>
    </tr>
  )
}

// Tier Card Component (Mobile)
function TierCard({ tier, percentage, amount, isTop }: any) {
  return (
    <div className={`${isTop ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-card'} border-2 border-blue-200 dark:border-blue-900/40 rounded-lg p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-bold text-sm shadow-sm">
            {tier}
          </span>
          {isTop && (
            <span className="inline-block px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold rounded uppercase">
              Highest
            </span>
          )}
        </div>
        <span className="inline-block px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 rounded-lg font-bold text-base">
          {percentage}%
        </span>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-blue-100 dark:border-blue-900/30">
        <span className="text-muted-foreground text-sm font-medium">Example Amount:</span>
        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-lg">
          ${amount.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
