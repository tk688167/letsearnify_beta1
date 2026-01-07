"use client"

import { useMemo, memo } from "react"

const SLIDER_DATA = [
    { text: "Emergency Pool activated: 5% Safety Net", icon: "🛡️", bg: "bg-blue-50", textCol: "text-blue-600" },
    { text: "User ID 48291 deposited $1,000", icon: "💰", bg: "bg-amber-50", textCol: "text-amber-600" },
    { text: "New user joined from UAE", icon: "🌍", bg: "bg-emerald-50", textCol: "text-emerald-600" },
    { text: "CBSP Pool distributed $12,500", icon: "huawei", bg: "bg-purple-50", textCol: "text-purple-600" }, // specific icon fix later if needed, using text for now
    { text: "Rewards paid: $45,000 today", icon: "🎁", bg: "bg-rose-50", textCol: "text-rose-600" },
    { text: "User ID 93012 upgraded to Platinum", icon: "⭐", bg: "bg-yellow-50", textCol: "text-yellow-600" },
]

function WelcomeSlider() {
    
    // Duplicate for seamless loop
    const displayItems = useMemo(() => {
        return [...SLIDER_DATA, ...SLIDER_DATA, ...SLIDER_DATA, ...SLIDER_DATA]
    }, [])

    return (
        <div className="w-full bg-white/50 backdrop-blur-sm border-y border-gray-100 overflow-hidden relative group h-16 flex items-center transform-gpu">
            
            {/* Gradient Fade Masks */}
            <div className="absolute top-0 left-0 w-24 md:w-48 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-24 md:w-48 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

            <div className="flex items-center gap-8 md:gap-12 whitespace-nowrap animate-marquee group-hover:paused will-change-transform">
                {displayItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 select-none">
                        
                        {/* Icon Bubble */}
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${item.bg} flex items-center justify-center shadow-sm`}>
                             {item.icon === "huawei" ? (
                                 <span className="text-lg md:text-xl">🏦</span>
                             ) : (
                                 <span className="text-sm md:text-base">{item.icon}</span>
                             )}
                        </div>
                        
                        {/* Text */}
                        <span className="text-xs md:text-sm font-semibold text-gray-700 font-sans tracking-wide">
                            {item.text}
                        </span>

                        {/* Separator Dot */}
                        <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-indigo-200 ml-4 md:ml-8 opacity-50"></div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-50%, 0, 0); }
                }
                .animate-marquee {
                    animation: marquee 60s linear infinite; /* Slightly faster for energy */
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
