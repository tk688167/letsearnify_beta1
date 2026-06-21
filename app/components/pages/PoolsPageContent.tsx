"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LandingHeader from "@/app/components/LandingHeader";
import Footer from "@/app/components/layout/Footer";
import {
  CurrencyDollarIcon,
  TrophyIcon,
  GiftIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowRightIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { LockClosedIcon } from "@heroicons/react/24/solid";

export default function PoolsPageContent({ isActiveMember = true }: { isActiveMember?: boolean }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  const getHref = (slug: string) => (isDashboard ? `/dashboard/pools/${slug}` : "/login");

  const innerContent = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3   gap-6 md:gap-8 mb-16 sm:mb-20">
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
            { label: "Lock Period", value: "30 Days" },
          ]}
          colorTheme="indigo"
          delay={0.05}
        />

        {/* CBSP Pool */}
        <PoolCard
          href={getHref("cbsp")}
          icon={CurrencyDollarIcon}
          title="CBSP Pool"
          subtitle="Weekly Profit Sharing"
          description="The Company-Based Sharing Pool automates weekly distributions to eligible members globally."
          stats={[
            { label: "Funding Source", value: "Deposit Fees (5%)" },
            { label: "Distribution Rate", value: "Weekly (3%)" },
            { label: "Eligibility", value: "All Active Tiers" },
          ]}
          colorTheme="blue"
          delay={0.1}
        />

        {/* Royalty Pool */}
        <PoolCard
          href={getHref("royalty")}
          icon={TrophyIcon}
          title="Royalty Pool"
          subtitle="Top Performer Rewards"
          description="Exclusive monthly bonuses dedicated to high achievers who reach leadership levels."
          stats={[
            { label: "Funding Source", value: "Deposit Fees (5%)" },
            { label: "Distribution Rate", value: "Monthly (1%)" },
            { label: "Eligibility", value: "Platinum & Above" },
          ]}
          colorTheme="amber"
          delay={0.2}
        />

        {/* Achievement Pool */}
        <PoolCard
          href={getHref("achievement")}
          icon={GiftIcon}
          title="Achievement Pool"
          subtitle="Milestone Bonuses"
          description="Instant algorithmic rewards triggered by completing network expansion milestones."
          stats={[
            { label: "Funding Source", value: "System Fees (1%)" },
            { label: "Distribution Rate", value: "Instant Payout" },
            { label: "Eligibility", value: "Milestone Criteria" },
          ]}
          colorTheme="fuchsia"
          delay={0.3}
        />
      </div>

      {/* --- MODERN MECHANICS SECTION --- */}
      <div className="relative">
        {/* decorative background accent */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-fuchsia-500/5 blur-3xl pointer-events-none" />

        <div className="relative bg-slate-50 dark:bg-[#060e28] rounded-2xl  p-6 sm:p-10 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg">
              <CubeIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              How Pool Allocation Works
            </h2>
          </div>

          {/* Intro paragraph */}
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-10 max-w-3xl">
            Understanding how rewards are distributed is key to making the most of
            your experience with our platform. Here's a clear, step-by-step
            overview of how our pool allocation system operates to ensure fairness,
            transparency, and meaningful growth for every member:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group relative bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-indigo-500/30 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg mb-4">
                  <CurrencyDollarIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">1. Continuous Funding</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  From the moment you and others participate in the network, a
                  clearly defined percentage of all collected fees is automatically
                  channeled into dedicated smart contracts for each pool. These
                  contracts are securely locked and meticulously managed, ensuring
                  that funds are protected and always available for distribution.
                  This ongoing allocation means that every transaction helps to
                  strengthen the collective pool, laying a stable foundation for
                  current and future rewards.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group relative bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg mb-4">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">2. Exponential Growth</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  As more people join and engage with the platform, the global
                  network expands—and so does the total liquidity in each pool.
                  This growth isn't just incremental; it has the power to
                  accelerate rapidly as the community flourishes. The result? More
                  robust reward pools and the opportunity for increasingly
                  substantial payouts for all eligible members. The system is
                  designed so that your potential earnings grow in step with the
                  platform's success.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group relative bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-rose-500/30 transition-all hover:-translate-y-1 hover:shadow-xl md:col-span-2 lg:col-span-1"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg mb-4">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">3. Automated Payouts</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  When it comes time to distribute rewards, our process is fully
                  automated and rigorously audited. Advanced algorithms calculate
                  each user's fair share based on their participation and
                  contributions. Payouts are executed automatically—whether weekly,
                  monthly, or instantly—so you never have to chase down your
                  earnings. Funds are delivered directly to your withdrawal wallet,
                  ensuring you have fast, reliable access to what you've earned.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Closing paragraph */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-rose-500/10 border border-white/10 backdrop-blur-sm"
          >
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed italic text-center">
              With this pool allocation model, your participation doesn't just
              benefit you—it helps power a thriving, continually growing ecosystem
              where everyone can share in the rewards. Transparency, security, and
              efficiency are at the heart of every step, giving you confidence that
              your contributions are recognized and rewarded in a fair, meaningful
              way.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );

  if (isDashboard) {
    return <div className="w-full">{innerContent}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060e25]  relative overflow-hidden flex flex-col font-sans selection:bg-primary/30">
      {/* Enhanced Ambient Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[30%] -left-[15%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[150px] mix-blend-screen animate-pulse-slow" />
        <div
          className="absolute top-[10%] -right-[15%] w-[50%] h-[70%] rounded-full bg-fuchsia-500/10 blur-[150px] mix-blend-screen animate-pulse-slow"
          style={{ animationDelay: "2.5s" }}
        />
        <div className="absolute bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: "4s" }} />
      </div>

      <LandingHeader />

      <main className="flex-grow pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 md:px-8 z-10 w-full">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header Area - Modern */}
            <div className="mb-12 sm:mb-16 text-center">
             
             <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground/70 mb-4 tracking-tight">
                Reward Pools
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
                Explore our three automated reward systems. These pools
                distribute platform revenue fairly to all members based on
                activity, tenure, and tier levels.
              </p>
            </div>

            {innerContent}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// --- MODERN PoolCard Component ---
function PoolCard({
  href,
  icon: Icon,
  title,
  subtitle,
  description,
  stats,
  colorTheme,
  delay,
  isLocked,
}: any) {
  const themeColors: Record<string, { from: string; to: string; border: string; shadow: string }> = {
    indigo: { from: "from-indigo-500", to: "to-fuchsia-500", border: "border-indigo-500/20", shadow: "shadow-indigo-500/20" },
    blue: { from: "from-blue-500", to: "to-cyan-400", border: "border-blue-500/20", shadow: "shadow-blue-500/20" },
    amber: { from: "from-amber-500", to: "to-orange-400", border: "border-amber-500/20", shadow: "shadow-amber-500/20" },
    fuchsia: { from: "from-fuchsia-500", to: "to-pink-400", border: "border-fuchsia-500/20", shadow: "shadow-fuchsia-500/20" },
  };

  const theme = themeColors[colorTheme] || themeColors.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <Link href={href} className="block h-full">
        <div
          className={`group relative flex flex-col h-full rounded-2xl  border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${theme.shadow} hover:border-transparent overflow-hidden`}
        >
          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-[#060e28] ${theme.from} ${theme.to} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

          {/* Icon with gradient background */}
          <div className="relative z-10 p-5 sm:p-8 pb-2">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.from} ${theme.to} p-0.5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
              <div className="w-full h-full rounded-2xl bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <div className="relative z-10 px-5 sm:px-8 flex-grow flex flex-col pb-5 sm:pb-8">
            <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-foreground group-hover:to-muted-foreground transition-all duration-300">
              {title}
            </h3>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-muted-foreground/80 mb-3">
              {subtitle}
            </p>
            <p className="text-sm text-muted-foreground/90 leading-relaxed mb-6 flex-grow">
              {description}
            </p>

            {/* Stats block with glass effect */}
            <div className="rounded-xl bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 p-3 sm:p-4 space-y-2">
              {stats.map((stat: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow on hover */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 z-20">
            <ArrowRightIcon className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          </div>

          {/* Lock overlay */}
          {isLocked && (
            <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shadow-lg mb-3 animate-bounce">
                <LockClosedIcon className="w-6 h-6 text-black" />
              </div>
              <span className="text-white font-black text-xs uppercase tracking-[0.2em] mb-1">
                Premium Feature
              </span>
              <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                Active Members Only
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}