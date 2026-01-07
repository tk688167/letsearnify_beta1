"use client"

import Link from "next/link"
import { 
  BanknotesIcon, 
  TrophyIcon, 
  SparklesIcon, 
  ShieldCheckIcon 
} from "@heroicons/react/24/outline"

export default function SmartPoolsSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white text-gray-900 relative overflow-hidden animate-in fade-in duration-700 slide-in-from-bottom-8">
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
            Profit Sharing Ecosystem
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-gray-900">
            Start Earning Pools
          </h2>
          <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Our automated pools distribute profits transparently. Join with just $1 and start earning weekly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* CBSPool */}
          <PoolCard 
            title="CBSPool"
            subtitle="Core Benefit Sharing"
            desc="The core earning engine where active participants receive weekly profit shares from platform activities."
            motivation="Deposit just $1 and start receiving 3% weekly profit shares."
            icon={<BanknotesIcon className="w-7 h-7 text-white" />}
            gradient="from-blue-500 to-cyan-500"
            delay="delay-0"
          />

          {/* RewardPool */}
          <PoolCard 
            title="RewardPool"
            subtitle="Performance Incentives"
            desc="Designed to reward active engagement. Consistent users unlock extra rewards on top of regular earnings."
            motivation="Stay active and unlock additional rewards every week."
            icon={<TrophyIcon className="w-7 h-7 text-white" />}
            gradient="from-purple-500 to-pink-500"
            delay="delay-100"
          />

          {/* RoyaltyPool */}
          <PoolCard 
            title="RoyaltyPool"
            subtitle="Loyalty Program"
            desc="A dedicated pool for our long-term supporters. A portion of revenue is reserved for loyal members."
            motivation="Earn royalties for being an early and loyal supporter."
            icon={<SparklesIcon className="w-7 h-7 text-white" />}
            gradient="from-amber-400 to-orange-500"
            delay="delay-200"
          />

          {/* EmergencyFund */}
          <PoolCard 
            title="EmergencyFund"
            subtitle="Safety & Protection"
            desc="Ensures platform stability and user protection. Used to handle unexpected situations and safe operations."
            motivation="A safety fund built to protect the ecosystem and users."
            icon={<ShieldCheckIcon className="w-7 h-7 text-white" />}
            gradient="from-emerald-500 to-teal-500"
            delay="delay-300"
          />
        </div>

        <div className="text-center">
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-2 px-10 py-4 bg-primary hover:bg-blue-700 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-105"
          >
            Start with $1 Today <span aria-hidden="true">&rarr;</span>
          </Link>
          <p className="mt-4 text-sm text-gray-400">Secure & Transparent • Automated Distribution</p>
        </div>
      </div>
    </section>
  )
}

function PoolCard({ title, subtitle, desc, motivation, icon, gradient, delay }: any) {
  return (
    <div className={`p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col ${delay} animate-in fade-in slide-in-from-bottom-4`}>
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-1 font-serif group-hover:text-blue-600 transition-colors">{title}</h3>
      <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{subtitle}</div>
      <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
        {desc}
      </p>
      <div className="pt-6 border-t border-gray-50 mt-auto">
        <p className="text-sm font-medium text-blue-600 italic">
          "{motivation}"
        </p>
      </div>
    </div>
  )
}
