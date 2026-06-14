"use client"

import { useState, useEffect } from "react"
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  GlobeAltIcon, 
  TrophyIcon,
  CheckBadgeIcon,
  BoltIcon
} from "@heroicons/react/24/solid"

type StatsData = {
  totalUsers: string
  totalDeposited: string
  totalWithdrawn: string
  totalRewards: string
  serviceStatus: string
  partnersCount: string
}

const FALLBACK_STATS = [
  { label: "Active Earners", value: "10K+", icon: UserGroupIcon, color: "text-blue-400" },
  { label: "Tasks Completed", value: "1.2M+", icon: CheckBadgeIcon, color: "text-emerald-400" },
  { label: "Global Reach", value: "150+", icon: GlobeAltIcon, color: "text-purple-400" },
  { label: "Total Paid Out", value: "$2.4M+", icon: CurrencyDollarIcon, color: "text-green-400" },
  { label: "Rewards Given", value: "500K+", icon: TrophyIcon, color: "text-amber-400" },
  { label: "Uptime", value: "99.9%", icon: BoltIcon, color: "text-cyan-400" },
]

export default function PlatformStatsCarousel() {
  const [stats, setStats] = useState<StatsData | null>(null)

  useEffect(() => {
    fetch("/api/platform-stats")
      .then(res => res.json())
      .then(data => { if (!data.error) setStats(data) })
      .catch(() => {})
  }, [])

  const slides = stats ? [
    { label: "Active Earners", value: stats.totalUsers, icon: UserGroupIcon, color: "text-blue-400" },
    { label: "Total Deposited", value: stats.totalDeposited, icon: CurrencyDollarIcon, color: "text-green-400" },
    { label: "Rewards Given", value: stats.totalRewards, icon: TrophyIcon, color: "text-amber-400" },
    { label: "Global Partners", value: stats.partnersCount, icon: GlobeAltIcon, color: "text-purple-400" },
    { label: "Total Withdrawn", value: stats.totalWithdrawn, icon: CurrencyDollarIcon, color: "text-emerald-400" },
    { label: "Platform Status", value: stats.serviceStatus || "Live", icon: BoltIcon, color: "text-cyan-400" },
  ] : FALLBACK_STATS

  // Double the slides for seamless infinite scroll
  const allSlides = [...slides, ...slides]

  return (
    <div className="w-full py-6 sm:py-10 overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      {/* Scrolling ticker */}
      <div className="flex animate-scroll-left hover:[animation-play-state:paused]">
        {allSlides.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="flex-shrink-0 px-4 sm:px-6 md:px-8">
              <div className="flex items-center gap-3 sm:gap-4 group cursor-default">
                <div className={"w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-white/10 " + stat.color}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-none">
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-[0.15em] mt-0.5">
                    {stat.label}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-left {
          animation: scroll-left 25s linear infinite;
          width: max-content;
        }
      `}</style>
    </div>
  )
}