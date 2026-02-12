"use client"

import { ClipboardDocumentIcon, StarIcon, TrophyIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline"
import { SparklesIcon } from "@heroicons/react/24/solid"

type TierRule = {
    points: number;
    members: number;
}

type TierRules = Record<string, TierRule>;

interface TierProgressProps {
    currentTier: string;
    points: number;
    activeMembers: number;
    tierRules: TierRules;
    referralCode?: string | null;
}

const TIER_ORDER = ["NEWBIE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "EMERALD"];

// Refined Professional Themes (Subtle Accents)
const TIER_STYLES: Record<string, { badge: string, border: string, text: string, icon: string, bg: string, ring: string }> = {
    NEWBIE: { badge: "bg-gray-100 text-gray-700", border: "border-gray-200", text: "text-gray-900", icon: "🚀", bg: "from-gray-50 to-white", ring: "ring-gray-100" },
    BRONZE: { badge: "bg-orange-50 text-orange-800", border: "border-orange-200", text: "text-orange-900", icon: "🥉", bg: "from-orange-50/50 to-white", ring: "ring-orange-100" },
    SILVER: { badge: "bg-slate-100 text-slate-700", border: "border-slate-200", text: "text-slate-900", icon: "🥈", bg: "from-slate-50 to-white", ring: "ring-slate-100" },
    GOLD:   { badge: "bg-yellow-50 text-yellow-800", border: "border-yellow-200", text: "text-yellow-900", icon: "🥇", bg: "from-yellow-50/50 to-white", ring: "ring-yellow-100" },
    PLATINUM: { badge: "bg-slate-50 text-slate-800", border: "border-slate-300", text: "text-slate-900", icon: "💎", bg: "from-slate-100/50 to-white", ring: "ring-slate-200" },
    DIAMOND: { badge: "bg-blue-50 text-blue-800", border: "border-blue-200", text: "text-blue-900", icon: "💠", bg: "from-blue-50/50 to-white", ring: "ring-blue-100" },
    EMERALD: { badge: "bg-emerald-50 text-emerald-800", border: "border-emerald-200", text: "text-emerald-900", icon: "✳️", bg: "from-emerald-50/50 to-white", ring: "ring-emerald-100" },
}

export function TierProgress({ currentTier, points, activeMembers, tierRules, referralCode }: TierProgressProps) {
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

    const currentConfig = tierRules[currentTierName] || { points: 0, members: 0 };

    if (nextTier && tierRules[nextTier]) {
        nextTierName = nextTier;
        const nextConfig = tierRules[nextTier];
        
        targetPoints = nextConfig.points;
        targetMembers = nextConfig.members;

        // Delta Calculation
        // Step 1: Baseline is the *Current* Tier's requirement (since we passed it)
        const baselinePoints = currentConfig.points;
        const baselineMembers = currentConfig.members;

        // Step 2: Calculate Delta Adjustments
        displayPoints = Math.max(0, points - baselinePoints);
        displayTargetPoints = Math.max(0, targetPoints - baselinePoints);
        
        displayMembers = Math.max(0, activeMembers - baselineMembers);
        displayTargetMembers = Math.max(0, targetMembers - baselineMembers);

        // Step 3: Calculate Percentages based on Delta
        // Prevent division by zero if delta is 0
        const pointPercent = displayTargetPoints > 0 ? Math.min(displayPoints / displayTargetPoints, 1) : 1;
        const memberPercent = displayTargetMembers > 0 ? Math.min(displayMembers / displayTargetMembers, 1) : 1;
        
        progress = Math.round(((pointPercent + memberPercent) / 2) * 100);
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
        <div className={`relative overflow-hidden rounded-[2rem] border ${style.border} bg-gradient-to-br ${style.bg} shadow-xl shadow-gray-200/50 col-span-full`}>
            
            {/* Top Pattern Decoration */}
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none select-none text-9xl">
                {style.icon}
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row">
                
                {/* LEFT: Identity Section */}
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-center space-y-6">
                    <div>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${style.badge} border ${style.border}`}>
                            <SparklesIcon className="w-3.5 h-3.5" />
                            Current Status
                        </span>
                        <h2 className={`text-4xl md:text-5xl font-bold tracking-tight ${style.text} flex items-center gap-3`}>
                            {currentTierName}
                            <span className="text-4xl filter drop-shadow-sm">{style.icon}</span>
                        </h2>
                        <p className="text-gray-500 mt-3 max-w-md text-sm md:text-base leading-relaxed">
                            You&apos;re currently earning at the <strong className={style.text}>{currentTierName}</strong> level. 
                            {nextTier ? ` Upgrade to ${nextTierName} to unlock higher rewards.` : " You have reached the pinnacle of success!"}
                        </p>
                    </div>

                    {/* Referral Box (Styled) */}
                    {referralCode && (
                        <div className="w-full max-w-md">
                             <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Referral Code</span>
                             </div>
                             <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md group">
                                 <div className="flex-1 px-3 py-1 text-lg font-mono font-bold text-gray-800 tracking-wider">
                                     {referralCode}
                                 </div>
                                 <button 
                                    onClick={copyToClipboard}
                                    className="px-4 py-2 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wide border border-gray-200 transition-colors"
                                 >
                                     Copy
                                 </button>
                             </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: Progress Section (Desktop Split) */}
                {nextTier && (
                    <div className="lg:w-[400px] bg-white/50 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-gray-100 p-8 md:p-10 flex flex-col justify-center gap-6">
                       
                       <div className="flex items-center justify-between">
                           <div>
                               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Next Milestone</h3>
                               <div className="text-2xl font-bold text-gray-900">{nextTierName}</div>
                           </div>
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white border border-gray-100 shadow-sm text-2xl`}>
                               <ArrowTrendingUpIcon className="w-6 h-6 text-gray-400" />
                           </div>
                       </div>

                       {/* Progress Bar */}
                       <div className="space-y-2">
                           <div className="flex justify-between text-xs font-bold text-gray-500">
                               <span>Progress</span>
                               <span>{progress}%</span>
                           </div>
                           <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                               <div 
                                   className={`h-full rounded-full transition-all duration-1000 ${style.badge.replace('text-', 'bg-').split(' ')[0]}`} 
                                   style={{ width: `${progress}%` }}
                               ></div>
                           </div>
                       </div>

                       {/* Requirements Grid */}
                       <div className="grid grid-cols-2 gap-4 pt-2">
                           <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                               <div className="text-xs text-gray-400 uppercase font-bold mb-1">ARN Tokens</div>
                               <div className="text-lg font-bold text-gray-900">
                                   {points} <span className="text-gray-400 text-xs font-normal">/ {targetPoints}</span>
                               </div>
                           </div>
                           <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                               <div className="text-xs text-gray-400 uppercase font-bold mb-1">Members</div>
                               <div className="text-lg font-bold text-gray-900">
                                   {activeMembers} <span className="text-gray-400 text-xs font-normal">/ {targetMembers}</span>
                               </div>
                           </div>
                       </div>

                    </div>
                )}
            </div>
        </div>
    )
}
