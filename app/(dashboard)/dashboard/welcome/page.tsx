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
  
  // Fetch vital user data for context
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
        
        {/* --- 1. EXPLORER HEADER --- */}
        <div className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 transition-colors duration-300">
            <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">Explorer</h1>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <span>Welcome back, <span className="font-semibold text-foreground">{userName}</span></span>
                        {isVerified && <CheckBadgeIcon className="w-4 h-4 text-primary" />}
                    </div>
                </div>
                <div className="bg-muted px-3 py-1 rounded-full text-xs font-bold text-muted-foreground border border-border">
                    v1.0.0 Beta
                </div>
            </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">

            {/* --- 2. QUICK NAVIGATION GRID --- */}
            <section>
                <div className="grid grid-cols-4 gap-3">
                    <QuickNavLink href="/dashboard/tasks" icon={BriefcaseIcon} label="Tasks" color="text-indigo-600 dark:text-indigo-400" bg="bg-indigo-50 dark:bg-indigo-900/20" />
                    <QuickNavLink href="/dashboard/wallet" icon={BanknotesIcon} label="Wallet" color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/20" />
                    <QuickNavLink href="/dashboard/tiers" icon={TrophyIcon} label="Tiers" color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-900/20" />
                    <QuickNavLink href="/dashboard/profile" icon={UserGroupIcon} label="Team" color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-900/20" />
                </div>
            </section>

            {/* --- 3. FEATURE SECTIONS (Reordered) --- */}

            {/* TASK CENTER (Moved to Top) */}
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
            
            {/* TIER SYSTEM (Shortened) */}
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

            {/* PASSIVE INCOME POOLS (Condensed) */}
            <div className="space-y-3">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Passive Income</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* CBSP */}
                    <MiniFeatureCard 
                        href="/dashboard/profit/cbsp"
                        icon={GlobeAltIcon}
                        color="text-blue-600 dark:text-blue-400"
                        bg="bg-blue-50 dark:bg-blue-900/20"
                        title="CBSP Pool"
                        desc="Global profit sharing for active members."
                    />

                    {/* ROYALTY */}
                    <MiniFeatureCard 
                        href="/dashboard/profit/royalty"
                        icon={SparklesIcon}
                        color="text-purple-600 dark:text-purple-400"
                        bg="bg-purple-50 dark:bg-purple-900/20"
                        title="Royalty"
                        desc="Leadership bonuses for team builders."
                    />

                    {/* ACHIEVEMENTS */}
                    <MiniFeatureCard 
                        href="/dashboard/profit/achievements"
                        icon={TrophyIcon}
                        color="text-pink-600 dark:text-pink-400"
                        bg="bg-pink-50 dark:bg-pink-900/20"
                        title="Rewards"
                        desc="One-time milestones: cash, cars, trips."
                    />
                </div>
            </div>

             {/* IN DEVELOPMENT (Mudaraba + Marketplace) */}
            <div className="space-y-3 pt-2">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">In Development</h2>

                {/* MUDARABA (Moved Here) */}
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

                {/* MARKETPLACE */}
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

             {/* FUTURE PROJECTS (Updated List) */}
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

function MiniFeatureCard({ href, icon: Icon, color, bg, title, desc }: any) {
    return (
        <Link href={href} className="flex flex-col p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all group">
            <div className={`w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{title}</h4>
            <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{desc}</p>
        </Link>
    )
}
