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
    <section className="py-24 bg-gradient-to-b from-muted to-background text-foreground relative overflow-hidden animate-in fade-in duration-700 slide-in-from-bottom-8">
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            Profit Sharing Ecosystem
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-foreground">
            Core Income Allocations
          </h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full mb-6"></div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            Automated Mudaraba distribution channels. Transparent profit routing based on active participation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* CBSPool */}
          <PoolCard 
            title="Core Yield (CBSP)"
            subtitle="Base Profit Share"
            desc="The fundamental profit-sharing layer. All active participants receive proportional dividends from this pool."
            motivation="Deposit $1. Activate recurring weekly dividends."
            icon={<BanknotesIcon className="w-7 h-7 text-white" />}
            gradient="from-blue-500 to-cyan-500"
            delay="delay-0"
          />

          {/* RewardPool */}
          <PoolCard 
            title="Incentive Pool"
            subtitle="Performance Allocation"
            desc="Variable rewards based on individual task throughput and referral volume."
            motivation="Higher activity equals higher allocation share."
            icon={<TrophyIcon className="w-7 h-7 text-white" />}
            gradient="from-purple-500 to-pink-500"
            delay="delay-100"
          />

          {/* RoyaltyPool */}
          <PoolCard 
            title="Premium Yield"
            subtitle="Loyalty Dividends"
            desc="Exclusive profit share for long-term holders and key ecosystem partners."
            motivation="Compound your tenure into higher yield brackets."
            icon={<SparklesIcon className="w-7 h-7 text-white" />}
            gradient="from-amber-400 to-orange-500"
            delay="delay-200"
          />

          {/* EmergencyFund */}
          <PoolCard 
            title="Strategic Reserve"
            subtitle="Risk Management"
            desc="Non-distributable assets held to ensure platform solvency and operational continuity."
            motivation="Ensuring the longevity of the entire ecosystem."
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
          <p className="mt-4 text-sm text-muted-foreground">Secure & Transparent • Automated Distribution</p>
        </div>
      </div>
    </section>
  )
}

function PoolCard({ title, subtitle, desc, motivation, icon, gradient, delay }: any) {
  return (
    <div className={`p-8 bg-card rounded-3xl shadow-sm border border-border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col ${delay} animate-in fade-in slide-in-from-bottom-4`}>
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-1 font-serif group-hover:text-primary transition-colors">{title}</h3>
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{subtitle}</div>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
        {desc}
      </p>
      <div className="pt-6 border-t border-border mt-auto">
        <p className="text-sm font-medium text-primary italic">
          "{motivation}"
        </p>
      </div>
    </div>
  )
}
