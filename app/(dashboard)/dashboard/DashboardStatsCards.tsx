"use client"

import { useState, useEffect } from "react"
import { UserGroupIcon, TrophyIcon, ShieldCheckIcon } from "@heroicons/react/24/outline"

type StatsData = {
  totalUsers: string
  totalDeposited: string
  totalWithdrawn: string
  totalRewards: string
  serviceStatus: string
  partnersCount: string
}

export default function DashboardStatsCards() {
  const [stats, setStats] = useState<StatsData | null>(null)

  useEffect(() => {
    fetch("/api/platform-stats")
      .then(res => res.json())
      .then(data => {
         if (!data.error) setStats(data)
      })
      .catch(err => console.error("Failed to load stats", err))
  }, [])

  if (!stats) return null
  
  const formatNumber = (val: string) => {
      const num = Number(val.replace(/[^0-9.-]+/g,""))
      return isNaN(num) ? val : num.toLocaleString()
  }

  const formatCurrency = (val: string) => {
      const num = Number(val.replace(/[^0-9.-]+/g,""))
      return isNaN(num) ? val : "$" + num.toLocaleString()
  }

  return (
    <div className="flex flex-wrap items-center gap-4 md:gap-8 px-5 py-3 bg-card/50 backdrop-blur-sm border border-border rounded-full shadow-sm mb-8 w-fit mx-auto md:mx-0">
       
       <div className="flex items-center gap-2">
           <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
           </span>
           <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Live Network</span>
       </div>

       <div className="hidden md:block w-px h-3 bg-border"></div>

       <div className="flex items-center gap-2">
          <UserGroupIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span className="text-xs font-medium text-muted-foreground">
             <span className="font-bold text-foreground">{formatNumber(stats.totalUsers)}</span> Active Members
          </span>
       </div>

       <div className="hidden md:block w-px h-3 bg-border"></div>

       <div className="flex items-center gap-2">
          <TrophyIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span className="text-xs font-medium text-muted-foreground">
             <span className="font-bold text-foreground">{formatCurrency(stats.totalRewards)}</span> Distributed
          </span>
       </div>

       <div className="hidden md:block w-px h-3 bg-border"></div>

       <div className="flex items-center gap-2">
          <ShieldCheckIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
             {stats.serviceStatus}
          </span>
       </div>
    </div>
  )
}

