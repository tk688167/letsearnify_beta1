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

// Mapping colors for a premium feel
const TIER_THEMES: Record<string, string> = {
    NEWBIE: "from-gray-800 to-gray-900 border-gray-700", // Dark sleek
    BRONZE: "from-[#CD7F32] to-[#8B4513] border-orange-900", // Bronze
    SILVER: "from-[#C0C0C0] to-[#708090] border-gray-500", // Silver
    GOLD: "from-[#FFD700] to-[#B8860B] border-yellow-600", // Gold
    PLATINUM: "from-[#E5E4E2] to-[#707070] border-slate-500", // Platinum
    DIAMOND: "from-[#00BFFF] to-[#00008B] border-blue-800", // Diamond
    EMERALD: "from-[#50C878] to-[#006400] border-green-800", // Emerald
}

export function TierProgress({ currentTier, points, activeMembers, tierRules, referralCode }: TierProgressProps) {
    const currentTierName = currentTier; 
    const currentIndex = TIER_ORDER.indexOf(currentTierName);
    const nextTier = TIER_ORDER[currentIndex + 1];

    let progress = 0;
    let nextTierName = "MAX LEVEL";
    let targetPoints = 0;
    let targetMembers = 0;

    if (nextTier && tierRules[nextTier]) {
        nextTierName = nextTier;
        targetPoints = tierRules[nextTier].points;
        targetMembers = tierRules[nextTier].members;

        const pointPercent = Math.min(points / targetPoints, 1);
        const memberPercent = Math.min(activeMembers / targetMembers, 1);
        
        progress = Math.round(((pointPercent + memberPercent) / 2) * 100);
    } else {
        progress = 100;
    }

    const theme = TIER_THEMES[currentTierName] || TIER_THEMES["NEWBIE"];

    const copyToClipboard = () => {
        if (referralCode) {
            navigator.clipboard.writeText(referralCode);
            // Could add toast here
        }
    }

    return (
        <div className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 text-white bg-gradient-to-br ${theme} shadow-2xl shadow-black/20 col-span-full border border-white/10`}>
            {/* Background Blurs */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row gap-10 justify-between items-center">
                {/* Left: Current Tier Section */}
                <div className="flex-1 space-y-6 w-full text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/20 shadow-lg mx-auto lg:mx-0">
                        <SparklesIcon className="w-4 h-4 text-yellow-300" />
                        Beta Partner Program
                    </div>
                    
                    <div>
                        <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-2 drop-shadow-sm leading-tight flex items-center justify-center lg:justify-start gap-4">
                            {currentTierName}
                            <span className="text-6xl animate-pulse">
                                {currentTierName === 'NEWBIE' ? '🚀' : 
                                 currentTierName === 'BRONZE' ? '🥉' : 
                                 currentTierName === 'SILVER' ? '🥈' : 
                                 currentTierName === 'GOLD' ? '🥇' : '💎'}
                            </span>
                        </h2>
                        <p className="text-lg text-white/90 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            You are performing exceptionally well. Continue expanding your network to unlock <span className="font-bold underline decoration-yellow-400 decoration-2 underline-offset-4">{nextTierName}</span> status.
                        </p>
                    </div>

                    {/* Referral Code Section */}
                    {referralCode && (
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-1 flex items-center gap-2 w-fit pr-4 shadow-inner mx-auto lg:mx-0">
                            <div className="bg-white text-gray-900 px-4 py-3 rounded-xl font-mono text-xl font-bold tracking-wider shadow-sm select-all">
                                {referralCode}
                            </div>
                            <div className="flex flex-col items-start px-2">
                                <span className="text-[10px] uppercase font-bold text-white/60 tracking-widest">Referral Code</span>
                                <span className="text-xs font-medium text-white">Share to earn</span>
                            </div>
                            <button 
                                onClick={copyToClipboard}
                                className="ml-2 p-2 hover:bg-white/20 rounded-lg transition-colors text-white active:scale-90" 
                                title="Copy Code"
                            >
                                <ClipboardDocumentIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Next Tier Preview Box */}
                {nextTier && (
                    <div className="flex-1 w-full lg:w-auto lg:max-w-sm space-y-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-inner relative overflow-hidden group">
                        {/* Shimmer on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

                        <div className="flex items-center justify-between pb-4 border-b border-white/10">
                            <h3 className="text-xl font-bold text-white/90 flex items-center gap-2">
                                Next Tier: {nextTierName}
                            </h3>
                            <ArrowTrendingUpIcon className="w-6 h-6 text-white/50" />
                        </div>
                        
                        <ul className="text-sm text-white/80 space-y-3">
                            <li className="flex justify-between items-center">
                                <span>Points Required</span>
                                <span className="font-bold bg-white/10 px-2 py-1 rounded">{targetPoints}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>Active Members</span>
                                <span className="font-bold bg-white/10 px-2 py-1 rounded">{targetMembers}</span>
                            </li>
                            <li className="pt-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span>Estimated Progress</span>
                                    <span className="font-bold">{progress}%</span>
                                </div>
                                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-white/90 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </li>
                        </ul>
                        
                        <p className="text-xs text-white/60 pt-2 text-center italic">
                            Keep building your network to unlock {nextTierName} tier!
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
