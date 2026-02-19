"use client"

import { useMemo, memo } from "react"
import { 
    BanknotesIcon, 
    UserPlusIcon, 
    ShieldCheckIcon, 
    GlobeAltIcon, 
    SparklesIcon, 
    ArrowTrendingUpIcon 
} from "@heroicons/react/24/solid"

const SLIDER_DATA = [
    { 
        category: "SYSTEM", 
        text: "Emergency Pool activated: 5% Safety Net", 
        amount: null,
        icon: ShieldCheckIcon, 
        color: "text-blue-500", 
        bg: "bg-blue-500/10" 
    },
    { 
        category: "DEPOSIT", 
        text: "User ID 48291 deposited", 
        amount: "$1,000.00",
        icon: BanknotesIcon, 
        color: "text-emerald-500", 
        bg: "bg-emerald-500/10" 
    },
    { 
        category: "COMMUNITY", 
        text: "New verified partner joined from UAE", 
        amount: null,
        icon: GlobeAltIcon, 
        color: "text-indigo-500", 
        bg: "bg-indigo-500/10" 
    },
    { 
        category: "PAYOUT", 
        text: "CBSP Pool distribution complete", 
        amount: "$12,500.00",
        icon: ArrowTrendingUpIcon, 
        color: "text-amber-500", 
        bg: "bg-amber-500/10" 
    }, 
    { 
        category: "REWARDS", 
        text: "Total rewards paid out today", 
        amount: "$45,000.00",
        icon: SparklesIcon, 
        color: "text-rose-500", 
        bg: "bg-rose-500/10" 
    },
    { 
        category: "RANK UP", 
        text: "User ID 93012 upgraded to Platinum", 
        amount: null,
        icon: UserPlusIcon, 
        color: "text-purple-500", 
        bg: "bg-purple-500/10" 
    },
]

function WelcomeSlider() {
    
    // Duplicate for seamless loop (x4 for smoothness on wide screens)
    const displayItems = useMemo(() => {
        return [...SLIDER_DATA, ...SLIDER_DATA, ...SLIDER_DATA, ...SLIDER_DATA]
    }, [])

    return (
        <div className="w-full bg-card border-y border-border relative group h-10 sm:h-12 md:h-14 flex items-center overflow-hidden">
            
            {/* Live Badge (Static) */}
            <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pl-2 sm:pl-4 pr-4 sm:pr-6 bg-gradient-to-r from-card via-card to-transparent">
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-md border border-red-500/20 shadow-sm">
                    <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[8px] sm:text-[10px] font-bold tracking-wider uppercase">Live</span>
                </div>
            </div>

            {/* Gradient Fade Mask Right */}
            <div className="absolute top-0 right-0 w-16 sm:w-32 h-full bg-gradient-to-l from-card to-transparent z-20 pointer-events-none"></div>

            {/* Marquee Container */}
            <div className="flex items-center gap-6 sm:gap-8 md:gap-12 whitespace-nowrap animate-marquee group-hover:paused will-change-transform pl-[80px] sm:pl-[120px] md:pl-48">
                {displayItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 sm:gap-3 select-none">
                        
                        {/* Icon */}
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                             <item.icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ${item.color}`} />
                        </div>
                        
                        {/* Text Content */}
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                            <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider ${item.color} opacity-80`}>
                                {item.category}
                            </span>
                            <span className="w-0.5 h-2 sm:h-3 bg-border rounded-full"></span>
                            <span className="font-medium text-foreground hidden sm:inline">
                                {item.text}
                            </span>
                            <span className="font-medium text-foreground sm:hidden text-[11px]">
                                {item.text.length > 25 ? item.text.substring(0, 25) + '...' : item.text}
                            </span>
                            {item.amount && (
                                <span className="font-mono font-bold text-foreground bg-muted px-1 sm:px-1.5 py-0.5 rounded border border-border text-[10px] sm:text-xs">
                                    {item.amount}
                                </span>
                            )}
                        </div>

                        {/* Separator */}
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/30 ml-4 sm:ml-6 md:ml-8"></div>
                    </div>
                ))}
            </div>

            {/* Animation Styles */}
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-50%, 0, 0); }
                }
                .animate-marquee {
                    animation: marquee 80s linear infinite;
                    width: max-content;
                }
                .group-hover\\:paused:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    )
}

export default memo(WelcomeSlider)
