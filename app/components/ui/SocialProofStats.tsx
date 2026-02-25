"use client"
import React from "react"
import { motion } from "framer-motion"

interface SocialProofStatsProps {
  stats: {
    totalPaid?: number
    activeUsers?: number
    tasksCompleted?: number
    countries?: number
  } | null
}

export default function SocialProofStats({ stats }: SocialProofStatsProps) {
  // Use user-provided stats or default fallbacks
  const data = [
    { label: "Total Paid Out", value: stats?.totalPaid ? `$${stats.totalPaid.toLocaleString()}` : "$2.4M+", icon: "💰" },
    { label: "Active Earners", value: stats?.activeUsers ? stats.activeUsers.toLocaleString() : "50k+", icon: "👥" },
    { label: "Tasks Completed", value: stats?.tasksCompleted ? stats.tasksCompleted.toLocaleString() : "1.2M+", icon: "✅" },
    { label: "Global Reach", value: stats?.countries ? `${stats.countries} Countries` : "150+", icon: "🌍" },
  ]

  // Duplicate data to create a seamless infinite loop (4 copies for smooth -25% translation)
  const marqueeItems = [...data, ...data, ...data, ...data]

  return (
    <section className="py-4 sm:py-5 border-y border-border/40 bg-card/10 backdrop-blur-md overflow-hidden relative shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
        {/* Fade Gradients for smooth entrance/exit */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 md:w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 md:w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none"></div>
        
        <div className="flex overflow-hidden items-center group py-2">
             <motion.div
                className="flex whitespace-nowrap items-center"
                animate={{ x: ["0%", "-25%"] }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 35 // Slower, smoother, more professional
                }}
                style={{ willChange: 'transform' }}
             >
                {marqueeItems.map((item, index) => (
                    <div 
                        key={index}
                        className="flex items-center gap-2 sm:gap-4 px-3 sm:px-10 md:px-16 min-w-max cursor-default transition-opacity duration-500 hover:!opacity-100 group-hover:opacity-40"
                    >
                        <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-muted/50 border border-border/80 flex items-center justify-center shadow-sm">
                            <span className="text-[10px] sm:text-base">{item.icon}</span>
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-sm sm:text-xl md:text-2xl font-black text-foreground tracking-tight drop-shadow-sm">
                                {item.value}
                            </span>
                            <span className="text-[8px] sm:text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">
                                {item.label}
                            </span>
                        </div>
                        {/* Divider */}
                        <div className="w-px h-6 sm:h-10 bg-border/40 ml-3 sm:ml-10 md:ml-16"></div>
                    </div>
                ))}
             </motion.div>
        </div>
    </section>
  )
}
