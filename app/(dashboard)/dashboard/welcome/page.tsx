export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
    CheckBadgeIcon, 
    ArrowRightIcon, 
    BanknotesIcon, 
    TrophyIcon, 
    UserGroupIcon, 
    BriefcaseIcon, 
    BuildingStorefrontIcon,
    ChartBarIcon,
    SparklesIcon,
    GlobeAltIcon,
    CpuChipIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export const metadata = {
  title: "Explorer - Let'sEarnify",
  description: "Explore the Let'sEarnify ecosystem: Tiers, Pools, and Earning opportunities.",
};

export default async function ExplorerPage() {
  const session = await auth();
  
  const user = session?.user ? await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
          name: true, 
          tier: true, 
          kycStatus: true 
      }
  }) : null;

  const userName = user?.name?.split(' ')[0] || "Partner";
  const isVerified = user?.kycStatus === 'VERIFIED';

  return (
    <main className="min-h-screen bg-background pb-20 transition-colors duration-300">

<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* ═══ EXPLORER PAGE BANNER ═══ */}
            <div className="relative overflow-hidden rounded-2xl text-white"
              style={{ background: "linear-gradient(135deg, #312e81 0%, #4c1d95 50%, #1e1b4b 100%)" }}>

              <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

              <div className="relative z-10 px-5 sm:px-8 py-4 sm:py-5 text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 border border-white/15 mb-2.5 shadow">
                  <GlobeAltIcon className="w-4 h-4 text-violet-200" />
                </div>

                <div className="block mb-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-[8px] font-bold uppercase tracking-[0.18em] text-violet-300/80">
                    <span className="w-1 h-1 rounded-full bg-violet-300 animate-pulse" />
                    Platform Explorer
                  </span>
                </div>

                <p className="text-white/30 text-[10px] font-medium tracking-widest uppercase mb-0.5">
                  Hello
                </p>

                <h1 className="text-sm sm:text-base font-bold leading-tight tracking-tight mb-0.5">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-white to-fuchsia-200">{userName}</span>
                  {isVerified && <CheckBadgeIcon className="inline w-3.5 h-3.5 text-violet-300 align-text-bottom ml-1" />}
                </h1>

                <p className="text-violet-200/40 text-[10px] max-w-xs mx-auto">
                  Explore your earning ecosystem
                </p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
            </div>

            {/* --- 2. QUICK NAVIGATION GRID --- */}
            <section>
                <div className="grid grid-cols-4 gap-3">
                    <QuickNavLink href="/dashboard/tasks" icon={BriefcaseIcon} label="Tasks" color="text-indigo-600 dark:text-indigo-400" bg="bg-indigo-50 dark:bg-indigo-900/20" />
                    <QuickNavLink href="/dashboard/wallet" icon={BanknotesIcon} label="Wallet" color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/20" />
                    <QuickNavLink href="/dashboard/tiers" icon={TrophyIcon} label="Tiers" color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-900/20" />
                    <QuickNavLink href="/dashboard/profile" icon={UserGroupIcon} label="Team" color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-900/20" />
                </div>
            </section>

            {/* --- 3. FEATURE SECTIONS --- */}

            {/* TASK CENTER */}
            <FeatureCard 
                href="/dashboard/tasks"
                icon={BriefcaseIcon}
                iconColor="text-indigo-600 dark:text-indigo-400"
                iconBg="bg-indigo-100 dark:bg-indigo-900/30"
                title="Task Center"
                subtitle="Active Earning"
                description="Complete digital tasks to earn ARN tokens instantly."
                tag="Daily Updates"
            />
            
            {/* TIER SYSTEM */}
            <FeatureCard 
                href="/dashboard/tiers"
                icon={TrophyIcon}
                iconColor="text-amber-600 dark:text-amber-400"
                iconBg="bg-amber-100 dark:bg-amber-900/30"
                title="Tier System"
                description="Climb ranks to unlock higher commissions and exclusive bonuses."
                stats={[
                    { label: "Current", value: user?.tier || "STARTER" },
                    { label: "Next", value: "+5% Direct" }
                ]}
            />

            {/* PASSIVE INCOME POOLS — Non-clickable Coming Soon cards */}
            <div className="space-y-3">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Passive Income</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <MiniFeatureCard 
                        icon={GlobeAltIcon}
                        color="text-blue-600 dark:text-blue-400"
                        bg="bg-blue-50 dark:bg-blue-900/20"
                        title="CBSP Pool"
                        desc="Global profit sharing for active members."
                    />

                    <MiniFeatureCard 
                        icon={SparklesIcon}
                        color="text-purple-600 dark:text-purple-400"
                        bg="bg-purple-50 dark:bg-purple-900/20"
                        title="Royalty"
                        desc="Leadership bonuses for team builders."
                    />

                    <MiniFeatureCard 
                        icon={TrophyIcon}
                        color="text-pink-600 dark:text-pink-400"
                        bg="bg-pink-50 dark:bg-pink-900/20"
                        title="Rewards"
                        desc="One-time milestones: cash, cars, trips."
                    />
                </div>
            </div>

             {/* IN DEVELOPMENT */}
            <div className="space-y-3 pt-2">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">In Development</h2>

                <FeatureCard 
                    href="/dashboard/investments"
                    icon={ChartBarIcon}
                    iconColor="text-emerald-600 dark:text-emerald-400"
                    iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                    title="Mudaraba Pool"
                    subtitle="Ethical Investing"
                    description="Profit-sharing investment strategies based on Islamic Finance principles."
                    status="Coming Soon"
                    statusColor="bg-muted text-muted-foreground"
                    isLocked={true}
                />

                <FeatureCard 
                    href="/dashboard/marketplace"
                    icon={BuildingStorefrontIcon}
                    iconColor="text-muted-foreground"
                    iconBg="bg-muted"
                    title="Digital Marketplace"
                    description="Peer-to-peer economy for digital assets and services."
                    status="Coming Soon"
                    statusColor="bg-muted text-muted-foreground"
                    isLocked={true}
                />
            </div>

             {/* FUTURE PROJECTS */}
             <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CpuChipIcon className="w-32 h-32" />
                </div>
                <h3 className="text-lg font-bold mb-1 relative z-10">Future Ecosystem</h3>
                <p className="text-indigo-200 text-xs mb-4 relative z-10">Roadmap 2026</p>
                <div className="flex flex-wrap justify-center gap-2 relative z-10">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm">Play-to-Earn Games</span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm">Crypto Exchange</span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm">Forex Broker</span>
                </div>
            </div>

        </div>
    </main>
  );
}

// --- HELPER COMPONENTS ---

function QuickNavLink({ href, icon: Icon, label, color, bg }: any) {
    return (
        <Link href={href} className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all active:scale-95 group">
            <div className={`p-2.5 rounded-full ${bg} ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-wide transition-colors">{label}</span>
        </Link>
    )
}

function FeatureCard({ href, icon: Icon, iconColor, iconBg, title, subtitle, description, tag, status, statusColor, stats, isLocked }: any) {
    return (
        <Link href={href} className={`block bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-sm hover:shadow-md transition-all group relative ${isLocked ? 'opacity-90' : ''}`}>
             <div className="flex items-start gap-3 sm:gap-4">
                 <div className={`p-2.5 sm:p-3 rounded-xl shrink-0 ${iconBg} ${iconColor} transition-transform group-hover:scale-110`}>
                     <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                 </div>
                 <div className="flex-1 min-w-0">
                     <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-1">
                         <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{title}</h3>
                         {tag && <span className="text-[10px] font-bold uppercase bg-foreground text-background dark:bg-primary dark:text-primary-foreground px-2 py-0.5 rounded-full shrink-0">{tag}</span>}
                         {status && <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${statusColor}`}>{status}</span>}
                     </div>
                     {subtitle && <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{subtitle}</p>}
                     <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">{description}</p>
                     
                     {stats && (
                         <div className="flex items-center gap-4 pt-3 border-t border-border">
                             {stats.map((stat: any, i: number) => (
                                 <div key={i}>
                                     <p className="text-[10px] uppercase text-muted-foreground/70 font-bold">{stat.label}</p>
                                     <p className="text-sm font-bold text-foreground">{stat.value}</p>
                                 </div>
                             ))}
                         </div>
                     )}

                     {!isLocked && (
                         <div className="mt-2 flex items-center text-xs font-bold text-primary group-hover:gap-2 transition-all">
                             Explore <ArrowRightIcon className="w-3 h-3 ml-1" />
                         </div>
                     )}
                 </div>
             </div>
        </Link>
    )
}

function MiniFeatureCard({ icon: Icon, color, bg, title, desc }: any) {
    return (
        <div className="flex flex-col p-4 bg-card rounded-xl border border-border shadow-sm opacity-80 cursor-default">
            <div className={`w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-foreground text-sm mb-1">{title}</h4>
            <p className="text-xs text-muted-foreground leading-snug line-clamp-2 mb-2">{desc}</p>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground self-start">Coming Soon</span>
        </div>
    )
}