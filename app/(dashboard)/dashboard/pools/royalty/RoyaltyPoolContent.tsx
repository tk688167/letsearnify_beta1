"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  TrophyIcon,
  CheckCircleIcon,
  ClockIcon,
  BanknotesIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  CalculatorIcon,
  UserGroupIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"

export default function RoyaltyPoolContent() {
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
        className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-12 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-5"></div>
        
        <div className="relative z-10">
          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
              <TrophyIcon className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-1 sm:mb-2">Royalty Pool</h1>
              <p className="text-amber-100 text-sm sm:text-base md:text-lg font-medium">Top Performer Rewards</p>
            </div>
          </div>
          <p className="text-amber-50 leading-relaxed max-w-3xl text-sm sm:text-base md:text-lg">
            Monthly rewards exclusively for our top-tier members in Platinum, Diamond, and Emerald tiers who demonstrate exceptional performance and network building.
          </p>
        </div>
      </motion.div>

      {/* Three Core Sections */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">How the Royalty Pool Works</h2>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 sm:mb-8">
          The Royalty Pool rewards our most successful members through a simple three-step process: <strong className="text-gray-900">Accumulation</strong>, <strong className="text-gray-900">Monthly Distribution</strong>, and <strong className="text-gray-900">Tier Eligibility</strong>.
        </p>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* How Funds Are Added */}
          <div className="bg-white rounded-lg md:rounded-xl p-5 sm:p-6 border-2 border-amber-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-600 text-white rounded-lg flex items-center justify-center font-bold text-lg sm:text-xl mb-3 sm:mb-4">
              1
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Fund Accumulation</h3>
            <div className="mb-3 sm:mb-4">
              <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-600 text-white font-bold text-2xl sm:text-3xl rounded-lg shadow-sm">
                5%
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Whenever <strong className="text-gray-900">any user deposits funds</strong>, 5% of that deposit goes directly into the Royalty Pool. These contributions grow the pool continuously.
            </p>
          </div>

          {/* Monthly Distribution */}
          <div className="bg-white rounded-xl p-6 border-2 border-amber-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-600 text-white rounded-lg flex items-center justify-center font-bold text-xl mb-4">
              2
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Monthly Distribution</h3>
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-amber-600 text-white font-bold text-3xl rounded-lg shadow-sm">
                1%
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              On the <strong className="text-gray-900">first Monday of each month</strong>, 1% of the total Royalty Pool balance is distributed among eligible members.
            </p>
          </div>

          {/* Eligible Tiers */}
          <div className="bg-white rounded-xl p-6 border-2 border-amber-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-600 text-white rounded-lg flex items-center justify-center font-bold text-xl mb-4">
              3
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Tier Eligibility</h3>
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-amber-600 text-white font-bold text-xl rounded-lg shadow-sm">
                Top 3
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Only <strong className="text-gray-900">Platinum, Diamond, and Emerald</strong> tier members are eligible to receive Royalty Pool distributions.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Breakdown */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg md:rounded-xl p-5 sm:p-6 md:p-8 border border-blue-100">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
          <ArrowPathIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
          The Complete Monthly Cycle
        </h3>
        
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 border border-blue-200">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-base sm:text-lg">
              <span className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">1</span>
              How Funds Are Added
            </h4>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed pl-8 sm:pl-9">
              Throughout the month, as members make deposits, 5% from each deposit is automatically added to the Royalty Pool. For example, if members deposit a total of $10,000 during the month, the Royalty Pool receives 5% = $500.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-blue-200">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-lg">
              <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Monthly Distribution Logic
            </h4>
            <p className="text-gray-700 leading-relaxed pl-9">
              On the first Monday of each month, the system calculates 1% of the total Royalty Pool balance. This 1% is then distributed among eligible Platinum, Diamond, and Emerald tier members based on their performance metrics (team volume, active referrals, and tier level).
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-blue-200">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-lg">
              <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Pool Retention & Growth
            </h4>
            <p className="text-gray-700 leading-relaxed pl-9">
              After distributing 1%, the remaining 99% stays in the pool, ensuring continuous growth. The pool keeps accumulating new 5% contributions from deposits, creating larger rewards over time.
            </p>
          </div>
        </div>
      </section>

      {/* Example Calculation */}
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
           <div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
                 <CalculatorIcon className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 dark:text-amber-500" />
                 Distribution Example
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl text-sm sm:text-base">
                 See exactly how monthly rewards are calculated and securely distributed. <em className="opacity-80">(Figures are for illustration purposes only)</em>
              </p>
           </div>
        </div>

        <div className="relative rounded-[2rem] p-6 sm:p-8 md:p-10 text-white shadow-2xl overflow-hidden group">
          {/* Glassmorphic Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-red-800"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-15 mix-blend-overlay"></div>
          
          {/* Animated Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-300/40 transition-colors duration-700"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-orange-500/30 transition-colors duration-700"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                 <CalculatorIcon className="w-5 h-5 text-amber-100" />
              </div>
              <h4 className="font-bold text-lg sm:text-xl tracking-wide">Monthly Calculation Breakdown</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {/* Pool Balance */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 relative overflow-hidden group/card shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-300/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                   <p className="text-amber-100/90 text-xs sm:text-sm mb-2 font-bold uppercase tracking-widest">Pool Balance</p>
                   <div className="flex items-baseline gap-1">
                      <span className="text-amber-300/80 text-xl font-bold">$</span>
                      <p className="text-white font-bold text-3xl sm:text-4xl font-mono tracking-tight">5,000</p>
                   </div>
                </div>
              </div>
              
              {/* Rate */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 relative overflow-hidden group/card shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-300/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                   <p className="text-amber-100/90 text-xs sm:text-sm mb-2 font-bold uppercase tracking-widest">Monthly Rate</p>
                   <div className="flex items-baseline gap-1">
                      <p className="text-white font-bold text-3xl sm:text-4xl font-mono tracking-tight">1</p>
                      <span className="text-amber-300/80 text-xl sm:text-2xl font-bold">%</span>
                   </div>
                </div>
              </div>

              {/* Distributed */}
              <div className="bg-gradient-to-br from-emerald-500/30 to-teal-500/20 backdrop-blur-xl rounded-2xl p-6 border border-emerald-400/40 hover:bg-emerald-500/40 transition-all duration-300 relative overflow-hidden group/card shadow-[0_8px_16px_rgba(0,0,0,0.1)] shadow-emerald-900/10 hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                   <p className="text-emerald-100/90 text-xs sm:text-sm mb-2 font-bold uppercase tracking-widest">Distributed to VIPs</p>
                   <div className="flex items-baseline gap-1">
                      <span className="text-emerald-300/80 text-xl font-bold">$</span>
                      <p className="text-emerald-50 font-bold text-3xl sm:text-4xl font-mono tracking-tight">50</p>
                   </div>
                </div>
              </div>

              {/* Remaining */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 relative overflow-hidden group/card shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                   <p className="text-amber-100/90 text-xs sm:text-sm mb-2 font-bold uppercase tracking-widest">Retained Growth</p>
                   <div className="flex items-baseline gap-1">
                      <span className="text-amber-300/80 text-xl font-bold">$</span>
                      <p className="text-white font-bold text-3xl sm:text-4xl font-mono tracking-tight">4,950</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 flex items-start sm:items-center gap-4 shadow-sm">
              <div className="p-2 sm:p-2.5 bg-amber-500/30 rounded-lg text-amber-200 shrink-0 border border-amber-400/30">
                 <InformationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
              </div>
              <p className="text-amber-50/95 text-sm leading-relaxed max-w-4xl">
                <strong className="text-white font-bold">Simple Verification:</strong> If the Royalty Pool has $5,000, we distribute 1% ($50) monthly to eligible top-tier members. The remaining 99% ($4,950) securely stays in the pool, compounding with new 5% contributions to ensure ever-growing rewards for our top earners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Eligibility Requirements</h3>
        
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg md:rounded-xl p-5 sm:p-6 md:p-8 border-2 border-emerald-200">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircleIcon className="w-7 h-7 text-emerald-600" />
              <h4 className="font-bold text-emerald-900 text-xl">Eligible Tiers</h4>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 font-bold text-lg flex-shrink-0">✓</span>
                <div>
                  <strong className="text-gray-900 block">Platinum Tier</strong>
                  <span className="text-gray-600 text-sm">Basic eligibility for Royalty Pool</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 font-bold text-lg flex-shrink-0">✓</span>
                <div>
                  <strong className="text-gray-900 block">Diamond Tier</strong>
                  <span className="text-gray-600 text-sm">Enhanced rewards with higher allocation</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 font-bold text-lg flex-shrink-0">✓</span>
                <div>
                  <strong className="text-gray-900 block">Emerald Tier</strong>
                  <span className="text-gray-600 text-sm">Maximum rewards at top tier level</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-6">
              <ChartBarIcon className="w-7 h-7 text-blue-600" />
              <h4 className="font-bold text-blue-900 text-xl">Upgrade Your Tier</h4>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              Build your network and increase your deposits to reach <strong className="text-gray-900">Platinum tier</strong> or above and unlock Royalty Pool eligibility!
            </p>
            <Link 
              href="/dashboard/tiers" 
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg"
            >
              <ChartBarIcon className="w-5 h-5" />
              View Tier Progress
            </Link>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Distribution Allocation Formula</h3>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6">
          The monthly 1% distribution among eligible members is calculated based on three performance metrics:
        </p>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg md:rounded-xl p-5 sm:p-6 border-2 border-blue-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-gray-900">Team Volume</h4>
            </div>
            <div className="mb-2 sm:mb-3">
              <span className="inline-block px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-600 text-white font-bold text-lg sm:text-xl rounded-lg">
                50%
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Based on your total network's deposit volume
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-blue-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-gray-900">Active Referrals</h4>
            </div>
            <div className="mb-3">
              <span className="inline-block px-3 py-1.5 bg-blue-600 text-white font-bold text-xl rounded-lg">
                30%
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Number of active referrals in your network
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-blue-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrophyIcon className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-gray-900">Personal Tier</h4>
            </div>
            <div className="mb-3">
              <span className="inline-block px-3 py-1.5 bg-blue-600 text-white font-bold text-xl rounded-lg">
                20%
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your current tier level (Platinum/Diamond/Emerald)
            </p>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 bg-amber-50 rounded-lg md:rounded-xl p-4 sm:p-5 md:p-6 border border-amber-200">
          <div className="flex items-start gap-2 sm:gap-3">
            <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900 mb-1">Automatic Monthly Distribution</p>
              <p className="text-gray-700 leading-relaxed">
                Distributions happen automatically on the <strong>first Monday of each month</strong>. Your reward is instantly credited to your ARN balance based on your performance metrics!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
