
import { 
    BanknotesIcon, 
    SparklesIcon, 
    ShieldCheckIcon, 
    ChartBarIcon, 
    InformationCircleIcon,
    ArrowTrendingUpIcon,
    UsersIcon,
    GiftIcon,
    LockClosedIcon,
    WrenchScrewdriverIcon
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils";
import Link from "next/link";

export function CompanyPools({ pools, status = "LIVE", userTier, onLockedClick }: { pools: any[], status?: "LOCKED" | "DEV" | "LIVE", userTier?: string, onLockedClick?: () => void }) {
    
    // Helper to format currency
    const formatMoney = (amount: number) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const getPoolData = (key: string) => {
        const pool = pools.find((p: any) => p.name === key);
        return {
            balance: pool ? pool.balance : 0,
            formatted: pool ? formatMoney(pool.balance) : "$0.00"
        }
    }

    const poolConfig = [
        { 
            key: "CBSP", 
            name: "CBSP Pool",
            subtitle: "Weekly (3%)",
            icon: UsersIcon,
            theme: "blue",
            accent: "from-blue-500 to-indigo-600",
            bg: "bg-blue-50 dark:bg-blue-900/10",
            text: "text-blue-900 dark:text-blue-100",
            allocation: "5% of All Deposits",
            distribution: "Weekly (3%)",
            qualification: "Active Member",
            features: ["Auto-Distribution", "Community Funded"],
            data: getPoolData("CBSP")
        },
        { 
            key: "Royalty", 
            name: "Royalty Pool",
            subtitle: "Monthly (1%)",
            icon: SparklesIcon,
            theme: "purple",
            accent: "from-purple-500 to-fuchsia-600",
            bg: "bg-purple-50 dark:bg-purple-900/10",
            text: "text-purple-900 dark:text-purple-100",
            allocation: "Dynamic Allocation",
            distribution: "Monthly",
            qualification: "Gold Tier & Above",
            features: ["High-Yield", "Tier Multipliers"],
            data: getPoolData("Royalty")
        },
        {
            key: "REWARD",
            name: "Achievement Pool",
            subtitle: "On Tier Upgrade",
            icon: GiftIcon,
            theme: "amber",
            accent: "from-amber-400 to-orange-500",
            bg: "bg-amber-50 dark:bg-amber-900/10",
            text: "text-amber-900 dark:text-amber-100",
            allocation: "System Generated",
            distribution: "Instant",
            qualification: "Rank Upgrades",
            features: ["Instant Payout", "One-time Bonus"],
            data: getPoolData("REWARD")
        }
    ]

// Helper to check tier eligibility
    const isTierEligible = (poolKey: string, tier: string | undefined): boolean => {
        if (!tier) return false;
        if (poolKey === "Royalty") {
            const qualifyingTiers = ['GOLD', 'PLATINUM', 'DIAMOND', 'EMERALD'];
            return qualifyingTiers.includes(tier);
        }
        return true; 
    }

    return (

        <div className="flex flex-col gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {poolConfig.map((pool) => {
                const isPoolEligible = isTierEligible(pool.key, userTier);
                const isItemLocked = status === "LOCKED" || !isPoolEligible;
                const isItemDev = status === "DEV" && isPoolEligible && pool.key !== "REWARD";
                
                const cardContent = (
                <div 
                    className="group relative bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                    {/* Left Decorative Line */}
                    <div className={`absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b ${pool.accent}`}></div>

                    <div className="relative z-10 p-4 flex items-center gap-4 h-full">
                        
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${pool.accent} text-white shadow-sm shrink-0 ${isItemDev ? "opacity-70" : ""}`}>
                             {isItemDev ? <WrenchScrewdriverIcon className="w-5 h-5" /> : <pool.icon className="w-5 h-5" />}
                        </div>

                        {/* Title & Subtitle */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-bold text-foreground font-serif leading-tight group-hover:text-amber-500 transition-colors">{pool.name}</h2>
                            <h3 className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide truncate">{pool.subtitle}</h3>
                        </div>

                        {/* Amount & Lock */}
                        <div className="text-right shrink-0">
                             {isItemLocked ? (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                                    <LockClosedIcon className="w-3 h-3" />
                                    <span>Locked</span>
                                </div>
                             ) : isItemDev ? (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                                    <WrenchScrewdriverIcon className="w-3 h-3" />
                                    <span>Built Soon</span>
                                </div>
                             ) : (
                                <div className={`text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${pool.accent}`}>
                                    {pool.data.formatted}
                                </div>
                             )}
                        </div>

                    </div>
                </div>
                );

                if (isItemLocked) {
                    return <div key={pool.key} onClick={onLockedClick} className={onLockedClick ? "cursor-pointer" : ""}>{cardContent}</div>;
                }
                
                return (
                    <Link key={pool.key} href={`/dashboard/pools/${pool.key.toLowerCase()}`} className="block">
                        {cardContent}
                    </Link>
                );
            })}
        </div>
    )
}
