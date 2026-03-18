"use client"

import { ClipboardDocumentIcon, StarIcon, TrophyIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline"
import { SparklesIcon } from "@heroicons/react/24/solid"

type TierRule = {
    arn: number;
    directs: number;
}

type TierRules = Record<string, TierRule>;

interface TierProgressProps {
    currentTier: string;
    points: number;
    activeMembers: number;
    tierRules: TierRules;
    referralCode?: string | null;
    inHero?: boolean;
}

const TIER_ORDER = ["NEWBIE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "EMERALD"];

// Refined Professional Themes (Subtle Accents with Dark Mode Support)
const TIER_STYLES: Record<string, { badge: string, border: string, text: string, icon: string, bg: string, ring: string }> = {
    NEWBIE: { 
        badge: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300", 
        border: "border-gray-200 dark:border-gray-700", 
        text: "text-gray-900 dark:text-gray-400", 
        icon: "🚀", 
        bg: "from-gray-50 to-white dark:from-gray-900 dark:to-gray-800", 
        ring: "ring-gray-100 dark:ring-gray-800" 
    },
    BRONZE: { 
        badge: "bg-orange-50 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200", 
        border: "border-orange-200 dark:border-orange-800/50", 
        text: "text-orange-900 dark:text-orange-400", 
        icon: "🥉", 
        bg: "from-orange-50/50 to-white dark:from-orange-950/40 dark:to-slate-900", 
        ring: "ring-orange-100 dark:ring-orange-900/30" 
    },
    SILVER: { 
        badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300", 
        border: "border-slate-200 dark:border-slate-700", 
        text: "text-slate-900 dark:text-slate-400", 
        icon: "🥈", 
        bg: "from-slate-50 to-white dark:from-slate-900 dark:to-slate-950", 
        ring: "ring-slate-100 dark:ring-slate-800" 
    },
    GOLD: { 
        badge: "bg-yellow-50 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200", 
        border: "border-yellow-200 dark:border-yellow-800/50", 
        text: "text-yellow-900 dark:text-yellow-400", 
        icon: "🥇", 
        bg: "from-yellow-50/50 to-white dark:from-yellow-950/40 dark:to-slate-900", 
        ring: "ring-yellow-100 dark:ring-yellow-900/30" 
    },
    PLATINUM: { 
        badge: "bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-300", 
        border: "border-slate-300 dark:border-slate-600", 
        text: "text-slate-900 dark:text-slate-300", 
        icon: "💎", 
        bg: "from-slate-100/50 to-white dark:from-slate-800/50 dark:to-slate-900", 
        ring: "ring-slate-200 dark:ring-slate-800" 
    },
    DIAMOND: { 
        badge: "bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200", 
        border: "border-blue-200 dark:border-blue-800/50", 
        text: "text-blue-900 dark:text-blue-400", 
        icon: "💠", 
        bg: "from-blue-50/50 to-white dark:from-blue-950/40 dark:to-slate-900", 
        ring: "ring-blue-100 dark:ring-blue-900/30" 
    },
    EMERALD: { 
        badge: "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200", 
        border: "border-emerald-200 dark:border-emerald-800/50", 
        text: "text-emerald-900 dark:text-emerald-400", 
        icon: "✳️", 
        bg: "from-emerald-50/50 to-white dark:from-emerald-950/40 dark:to-slate-900", 
        ring: "ring-emerald-100 dark:ring-emerald-900/30" 
    },
}

export function TierProgress({ currentTier, points, activeMembers, tierRules, referralCode, inHero }: TierProgressProps) {
    const currentTierName = currentTier; 
    const currentIndex = TIER_ORDER.indexOf(currentTierName);
    const nextTier = TIER_ORDER[currentIndex + 1];

    let progress = 0;
    let nextTierName = "MAX LEVEL";
    let targetPoints = 0;
    let targetMembers = 0;
    
    // Adjusted values for display
    let displayPoints = 0;
    let displayTargetPoints = 0;
    let displayMembers = 0;
    let displayTargetMembers = 0;

    const currentConfig = tierRules[currentTierName] || { arn: 0, directs: 0 };

    if (nextTier && tierRules[nextTier]) {
        nextTierName = nextTier;
        const nextConfig = tierRules[nextTier];
        
        targetPoints = nextConfig.arn;
        targetMembers = nextConfig.directs;

        // Delta Calculation
        // Step 1: Baseline is the *Current* Tier's requirement (since we passed it)
        const baselinePoints = currentConfig.arn;
        const baselineMembers = currentConfig.directs;

        // Step 2: Calculate Delta Adjustments
        displayPoints = Math.max(0, points - baselinePoints);
        displayTargetPoints = Math.max(0, targetPoints - baselinePoints);
        
        displayMembers = Math.max(0, activeMembers - baselineMembers);
        displayTargetMembers = Math.max(0, targetMembers - baselineMembers);

        // Step 3: Calculate Percentages based on Delta
        // Prevent division by zero if delta is 0
        const pointPercent = displayTargetPoints > 0 ? Math.min(displayPoints / displayTargetPoints, 1) : 1;
        const memberPercent = displayTargetMembers > 0 ? Math.min(displayMembers / displayTargetMembers, 1) : 1;
        
        // Use the MINIMUM across all criteria — all conditions must be met to advance.
        // Averaging would mislead users by showing partial progress even when a critical
        // requirement (like team size) is 0, making it look like they are part-way there.
        progress = Math.round(Math.min(pointPercent, memberPercent) * 100);
    } else {
        progress = 100;
    }

    // Default formatting
    const style = TIER_STYLES[currentTierName] || TIER_STYLES["NEWBIE"];

    const copyToClipboard = () => {
        if (referralCode) {
            navigator.clipboard.writeText(referralCode);
            // Toast notification could be added here
        }
    }

    return (
        <div className={`relative overflow-hidden rounded-2xl shadow-sm col-span-full ${
            inHero 
                ? "bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10" 
                : `border ${style.border} bg-gradient-to-br ${style.bg}`
        }`}>
            
            <div className="relative z-10 p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                
                {/* Identity & Status */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="text-2xl sm:text-4xl filter drop-shadow-sm">{style.icon}</div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h2 className={`text-xl font-bold tracking-tight ${inHero ? "text-white" : style.text}`}>
                                {currentTierName}
                            </h2>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${inHero ? "bg-white/20 text-white border-white/20" : `${style.badge} border ${style.border}`}`}>
                                Current
                            </span>
                        </div>
                        <p className={`text-xs font-medium ${inHero ? "text-white/70" : "text-muted-foreground"}`}>
                            {nextTier ? " Keep climbing to unlock more rewards!" : "You have reached the top!"}
                        </p>
                    </div>
                </div>

                {/* Progress Section */}
                {nextTier && (
                    <div className={`w-full sm:max-w-xs rounded-xl border p-3 shadow-inner ${
                        inHero 
                            ? "bg-black/20 dark:bg-black/30 border-white/15" 
                            : "bg-card/70 border-border"
                    }`}>
                           <div className="flex justify-between items-center mb-2">
                               <span className={`text-xs font-bold uppercase tracking-wide ${inHero ? "text-white/60" : "text-muted-foreground"}`}>Next: <span className={inHero ? "text-white font-black" : style.text}>{nextTierName}</span></span>
                               <span className={`text-xs font-bold ${inHero ? "text-white" : "text-foreground"}`}>{progress}%</span>
                       </div>
                       
                       <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                           <div 
                               className={`h-full rounded-full transition-all duration-1000 ${style.badge.replace('text-', 'bg-').split(' ')[0]}`} 
                               style={{ width: `${progress}%` }}
                           ></div>
                       </div>
                    </div>
                )}

            </div>
        </div>
    )
}
