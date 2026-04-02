"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import LandingHeader from "@/app/components/LandingHeader"
import Footer from "@/app/components/layout/Footer"
import InlineBackButton from "@/app/components/ui/InlineBackButton"
import { 
  CurrencyDollarIcon, 
  TrophyIcon, 
  GiftIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline"
import { LockClosedIcon } from "@heroicons/react/24/solid"

export default function PoolsPageContent({ isActiveMember = true }: { isActiveMember?: boolean }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  const getHref = (slug: string) => isDashboard ? `/dashboard/pools/${slug}` : "/login";

  const innerContent = (
    <>
      {/* Pool Cards Grid */}
      <h2 className="text-lg sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 text-center md:text-left">Choose a Pool to Learn More</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16">
        
        {/* Daily Earning Pool */}
        <PoolCard
          href={getHref("daily-earning")}
          icon={ChartBarIcon}
          title="Daily Earning Pool"
          subtitle="1% Daily Return"
          description="Lock funds for exactly 30 days and earn a guaranteed 1% compound profit every 24 hours."
          stats={[
            { label: "Funding Source", value: "Direct Wallet Transfer" },
            { label: "Distribution Rate", value: "Daily (1%)" },
            { label: "Lock Period", value: "30 Days" }
          ]}
          colorTheme="indigo"
          delay={0.05}
        />

        {/* CBSP Pool Card */}
        <PoolCard
          href={getHref("cbsp")}
          icon={CurrencyDollarIcon}
          title="CBSP Pool"
          subtitle="Weekly Profit Sharing"
          description="The Company-Based Sharing Pool automates weekly distributions to eligible members globally."
          stats={[
            { label: "Funding Source", value: "Deposit Fees (5%)" },
            { label: "Distribution Rate", value: "Weekly (3%)" },
            { label: "Eligibility", value: "All Active Tiers" }
          ]}
          colorTheme="blue"
          delay={0.1}
        />

        {/* Royalty Pool Card */}
        <PoolCard
          href={getHref("royalty")}
          icon={TrophyIcon}
          title="Royalty Pool"
          subtitle="Top Performer Rewards"
          description="Exclusive monthly bonuses dedicated to high achievers who reach leadership levels."
          stats={[
            { label: "Funding Source", value: "Deposit Fees (5%)" },
            { label: "Distribution Rate", value: "Monthly (1%)" },
            { label: "Eligibility", value: "Platinum & Above" }
          ]}
          colorTheme="amber"
          delay={0.2}
        />

        {/* Achievement Pool Card */}
        <PoolCard
          href={getHref("achievement")}
          icon={GiftIcon}
          title="Achievement Pool"
          subtitle="Milestone Bonuses"
          description="Instant algorithmic rewards triggered by completing network expansion milestones."
          stats={[
            { label: "Funding Source", value: "System Fees (1%)" },
            { label: "Distribution Rate", value: "Instant Payout" },
            { label: "Eligibility", value: "Milestone Criteria" }
          ]}
          colorTheme="fuchsia"
          delay={0.3}
        />
      </div>

      {/* Mechanics Section */}
      <div className="bg-background/50 backdrop-blur-md rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 border border-border/50">
        <h2 className="text-lg sm:text-2xl font-bold text-foreground mb-6 sm:mb-8 text-center md:text-left">How Pool Allocation Works</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="flex flex-col gap-3 sm:gap-4 bg-card/40 p-5 rounded-2xl border border-border/30">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <CurrencyDollarIcon className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base sm:text-lg mb-1 sm:mb-2">1. Continuous Funding</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                A strictly defined percentage of all network fees is automatically pipelined into securely locked smart-contracts representing each pool.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 bg-card/40 p-5 rounded-2xl border border-border/30">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <ChartBarIcon className="w-5 sm:w-6 h-5 sm:h-6 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base sm:text-lg mb-1 sm:mb-2">2. Exponential Growth</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                As the platform's global network expands, the pooled liquidity grows rapidly, increasing the potential payout sizes for eligible members.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 bg-card/40 p-5 rounded-2xl border border-border/30 sm:col-span-2 lg:col-span-1">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0">
              <SparklesIcon className="w-5 sm:w-6 h-5 sm:h-6 text-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base sm:text-lg mb-1 sm:mb-2">3. Automated Payouts</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Audited algorithms calculate user shares and execute distributions automatically (weekly, monthly, or instantly) directly to your withdrawal wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (isDashboard) {
    return (
      <div className="w-full">
        {innerContent}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col font-sans selection:bg-primary/30">
      
      {/* Ambient Animated Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-fuchsia-500/10 blur-[120px] mix-blend-screen animate-pulse-slow object-right" style={{ animationDelay: '2s' }}></div>
      </div>

      <LandingHeader />

      <main className="flex-grow pt-20 sm:pt-24 pb-16 sm:pb-20 px-3 sm:px-4 md:px-6 z-10 w-full">
        <div className="max-w-7xl mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/40 backdrop-blur-xl border border-border/80 rounded-3xl sm:rounded-[2.5rem] shadow-2xl p-5 sm:p-10 md:p-16 relative overflow-hidden"
          >
            {/* Header Area */}
            <div className="mb-8 sm:mb-16">
              <InlineBackButton className="mb-6 inline-flex" />
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg mb-4 shadow-sm">
                  <SparklesIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  <span className="leading-none">Transparent Revenue Distribution</span>
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-3 sm:mb-4 tracking-tight leading-tight">
                  Reward Pools
                </h1>
                <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0 leading-relaxed font-medium">
                  Explore our three automated reward systems. These pools distribute platform revenue fairly to all members based on activity, tenure, and tier levels.
                </p>
              </div>
            </div>

            {innerContent}
          </motion.div>
        
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Internal component for Pool Cards
function PoolCard({ href, icon: Icon, title, subtitle, description, stats, colorTheme, delay, isLocked }: any) {
  
  // Dynamic color mapping for Tailwind
  const colors: Record<string, { bgAccent: string; iconText: string; hoverBorder: string; statBg: string; textAccent: string }> = {
    blue: {
      bgAccent: "bg-blue-500/10 border-blue-500/20",
      iconText: "text-blue-500 absolute w-full h-full p-3 sm:p-3.5",
      hoverBorder: "hover:border-blue-500/40",
      statBg: "bg-blue-500/5 border-blue-500/10",
      textAccent: "text-blue-500"
    },
    amber: {
      bgAccent: "bg-amber-500/10 border-amber-500/20",
      iconText: "text-amber-500 absolute w-full h-full p-3 sm:p-3.5",
      hoverBorder: "hover:border-amber-500/40",
      statBg: "bg-amber-500/5 border-amber-500/10",
      textAccent: "text-amber-500"
    },
    fuchsia: {
      bgAccent: "bg-fuchsia-500/10 border-fuchsia-500/20",
      iconText: "text-fuchsia-500 absolute w-full h-full p-3 sm:p-3.5",
      hoverBorder: "hover:border-fuchsia-500/40",
      statBg: "bg-fuchsia-500/5 border-fuchsia-500/10",
      textAccent: "text-fuchsia-500"
    },
    indigo: {
      bgAccent: "bg-indigo-500/10 border-indigo-500/20",
      iconText: "text-indigo-500 absolute w-full h-full p-3 sm:p-3.5",
      hoverBorder: "hover:border-indigo-500/40",
      statBg: "bg-indigo-500/5 border-indigo-500/10",
      textAccent: "text-indigo-500"
    }
  }

  const theme = colors[colorTheme]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <Link href={href} className="flex flex-col h-full relative">
        <div className={`flex flex-col h-full bg-card/60 rounded-2xl sm:rounded-3xl border border-border/50 shadow-md ${theme.hoverBorder} transition-all duration-300 group hover:-translate-y-1 overflow-hidden relative ${isLocked ? 'grayscale-[0.3]' : ''}`}>
          
          {/* Locked Overlay */}
          {isLocked && (
            <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shadow-lg mb-3 animate-bounce">
                <LockClosedIcon className="w-6 h-6 text-black" />
              </div>
              <span className="text-white font-black text-xs uppercase tracking-[0.2em] mb-1">Premium Feature</span>
              <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">Active Members Only</span>
            </div>
          )}

          <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all z-20 hidden sm:block">
             <ArrowRightIcon className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          </div>

          <div className="p-5 sm:p-8 flex-grow flex flex-col relative z-10">
            {/* Header */}
            <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl ${theme.bgAccent} border mb-4 sm:mb-6 relative group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
              <Icon className={theme.iconText} />
            </div>

            {/* Content */}
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">{title}</h3>
            <p className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3 sm:mb-4">{subtitle}</p>
            <p className="text-xs sm:text-sm text-muted-foreground/90 leading-relaxed mb-6 sm:mb-8 flex-grow">{description}</p>

            {/* Stats Block */}
            <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 border ${theme.statBg} space-y-2 sm:space-y-3 mt-auto`}>
              {stats.map((stat: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">{stat.label}</span>
                  <span className="text-xs sm:text-sm font-bold text-foreground">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
