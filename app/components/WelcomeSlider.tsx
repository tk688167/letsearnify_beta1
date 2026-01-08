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
        <div className="w-full bg-white border-y border-gray-100/50 relative group h-14 flex items-center overflow-hidden">
            
            {/* Live Badge (Static) */}
            <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pl-4 pr-6 bg-gradient-to-r from-white via-white to-transparent">
                <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-md border border-red-100 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[10px] font-bold tracking-wider uppercase">Live Updates</span>
                </div>
            </div>

            {/* Gradient Fade Mask Right */}
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-20 pointer-events-none"></div>

            {/* Marquee Container */}
            <div className="flex items-center gap-12 whitespace-nowrap animate-marquee group-hover:paused will-change-transform pl-[120px] md:pl-48">
                {displayItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 select-none">
                        
                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                             <item.icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        
                        {/* Text Content */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${item.color} opacity-80`}>
                                {item.category}
                            </span>
                            <span className="w-0.5 h-3 bg-gray-200 rounded-full"></span>
                            <span className="font-medium text-gray-700">
                                {item.text}
                            </span>
                            {item.amount && (
                                <span className="font-mono font-bold text-gray-900 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 text-xs">
                                    {item.amount}
                                </span>
                            )}
                        </div>

                        {/* Separator */}
                        <div className="w-1 h-1 rounded-full bg-gray-300 ml-8 opacity-40"></div>
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
