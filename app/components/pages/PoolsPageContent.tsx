"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  CurrencyDollarIcon, 
  TrophyIcon, 
  GiftIcon,
  SparklesIcon,
  ArrowRightIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"

export default function PoolsPageContent() {
  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-6 sm:p-8 md:p-12">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-5"></div>
        
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg mb-4 sm:mb-6 shadow-sm">
            <SparklesIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span className="leading-none">Transparent Reward Distribution</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3 sm:mb-4 leading-tight">
            Reward Pools
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-blue-100 leading-relaxed max-w-3xl">
            Explore our three automated reward systems designed to distribute platform revenue fairly and transparently to all members based on activity and tier levels.
          </p>
        </div>
      </section>

      {/* Pool Cards Grid */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Choose a Pool to Learn More</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* CBSP Pool Card */}
          <PoolCard
            href="/dashboard/pools/cbsp"
            icon={CurrencyDollarIcon}
            title="CBSP Pool"
            subtitle="Weekly Profit Sharing"
            description="Automated weekly distribution to all eligible members based on tier levels."
            stats={[
              { label: "Deposit Fee", value: "5%" },
              { label: "Weekly Distribution", value: "3%" },
              { label: "Eligible Tiers", value: "All" }
            ]}
            color="blue"
            delay={0.1}
          />

          {/* Royalty Pool Card */}
          <PoolCard
            href="/dashboard/pools/royalty"
            icon={TrophyIcon}
            title="Royalty Pool"
            subtitle="Top Performer Rewards"
            description="Monthly bonuses for high achievers in Platinum, Diamond, and Emerald tiers."
            stats={[
              { label: "Deposit Fee", value: "5%" },
              { label: "Monthly Distribution", value: "1%" },
              { label: "Eligible Tiers", value: "Platinum+" }
            ]}
            color="amber"
            delay={0.2}
          />

          {/* Achievement Pool Card */}
          <PoolCard
            href="/dashboard/pools/achievement"
            icon={GiftIcon}
            title="Achievement Pool"
            subtitle="Milestone Bonuses"
            description="Instant rewards for completing achievements, tier upgrades, and milestones."
            stats={[
              { label: "Deposit Fee", value: "1%" },
              { label: "Distribution", value: "Instant" },
              { label: "Type", value: "Milestone" }
            ]}
            color="purple"
            delay={0.3}
          />
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-10 border border-blue-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">How Pool Allocation Works</h2>
        
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Every Deposit</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              When any user deposits, a small percentage is automatically allocated to each pool for future distributions.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Pool Growth</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Each pool accumulates funds continuously, creating a growing balance available for regular distributions.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Auto Distribution</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Distributions happen automatically—weekly, monthly, or instantly—depending on the pool type.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-5"></div>
        
        <div className="relative z-10">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white mb-3 sm:mb-4">
            Ready to Start Earning?
          </h3>
          <p className="text-base sm:text-lg text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
            Make your first deposit to unlock access to all reward pools and begin earning passive income today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
            <Link 
              href="/dashboard/wallet?tab=deposit" 
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm sm:text-base"
            >
              <CurrencyDollarIcon className="w-5 h-5" />
              Make a Deposit
            </Link>
            <Link 
              href="/dashboard/tiers" 
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all text-sm sm:text-base"
            >
              <ChartBarIcon className="w-5 h-5" />
              View Tier Progress
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// Pool Card Component
function PoolCard({ href, icon: Icon, title, subtitle, description, stats, color, delay }: any) {
  const colorStyles: any = {
    blue: {
      gradient: "from-blue-500 to-blue-600",
      hover: "hover:from-blue-600 hover:to-blue-700",
      border: "border-blue-200",
      bg: "bg-blue-50"
    },
    amber: {
      gradient: "from-amber-500 to-amber-600",
      hover: "hover:from-amber-600 hover:to-amber-700",
      border: "border-amber-200",
      bg: "bg-amber-50"
    },
    purple: {
      gradient: "from-purple-500 to-purple-600",
      hover: "hover:from-purple-600 hover:to-purple-700",
      border: "border-purple-200",
      bg: "bg-purple-50"
    }
  }

  const style = colorStyles[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Link href={href} className="block h-full">
        <div className={`h-full bg-white rounded-xl md:rounded-2xl border-2 ${style.border} shadow-sm hover:shadow-lg transition-all p-5 sm:p-6 group`}>
          
          {/* Header */}
          <div className={`flex items-center justify-between mb-3 sm:mb-4 pb-3 sm:pb-4 border-b ${style.border}`}>
            <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${style.gradient} ${style.hover} rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
              <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
          </div>

          {/* Content */}
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2 sm:mb-3">{subtitle}</p>
          <p className="text-gray-600 text-sm leading-relaxed mb-4 sm:mb-6">{description}</p>

          {/* Stats */}
          <div className={`${style.bg} rounded-lg p-3 sm:p-4 space-y-1.5 sm:space-y-2`}>
            {stats.map((stat: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs text-gray-600 font-medium">{stat.label}</span>
                <span className="text-sm font-bold text-gray-900">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
