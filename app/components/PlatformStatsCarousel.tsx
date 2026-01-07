"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserGroupIcon, CurrencyDollarIcon, GlobeAltIcon, TrophyIcon } from "@heroicons/react/24/outline"

type StatsData = {
  totalUsers: string
  totalDeposited: string
  totalWithdrawn: string
  totalRewards: string
  serviceStatus: string
  partnersCount: string
}

export default function PlatformStatsCarousel() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Fetch stats
    fetch("/api/platform-stats")
      .then(res => res.json())
      .then(data => {
         if (!data.error) setStats(data)
      })
      .catch(err => console.error("Failed to load stats", err))
  }, [])

  useEffect(() => {
    if (!stats) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % 4) // Cycle through 4 main slides
    }, 5000)
    return () => clearInterval(interval)
  }, [stats])

  if (!stats) return null // Hide if loading or no data

  const slides = [
    {
       label: "Total Users",
       value: stats.totalUsers,
       icon: UserGroupIcon,
       color: "text-blue-500",
       bg: "bg-blue-50"
    },
    {
       label: "Total Deposited",
       value: stats.totalDeposited,
       icon: CurrencyDollarIcon,
       color: "text-green-500",
       bg: "bg-green-50"
    },
    {
       label: "Rewards Distributed",
       value: stats.totalRewards,
       icon: TrophyIcon,
       color: "text-amber-500",
       bg: "bg-amber-50"
    },
    {
       label: "Global Partners",
       value: stats.partnersCount,
       icon: GlobeAltIcon,
       color: "text-purple-500",
       bg: "bg-purple-50"
    }
  ]

  return (
    <div className="w-full py-8">
       <div className="relative h-32 overflow-hidden max-w-sm mx-auto">
          <AnimatePresence mode="wait">
             <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-4"
             >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${slides[currentIndex].bg} ${slides[currentIndex].color}`}>

                    {/* Hack to render icon dynamically */}
                    {(() => {
                        const Icon = slides[currentIndex].icon
                        return <Icon className="w-6 h-6" />
                    })()}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">
                   {slides[currentIndex].value}
                </h3>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">
                   {slides[currentIndex].label}
                </p>
             </motion.div>
          </AnimatePresence>
       </div>
       
       {/* Dots */}
       <div className="flex justify-center gap-2 mt-2">
          {slides.map((_, idx) => (
             <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-blue-600 w-6' : 'bg-gray-200'}`}
             />
          ))}
       </div>
    </div>
  )
}
