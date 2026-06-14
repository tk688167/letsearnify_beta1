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
    <section className="py-2.5 border-y border-border/40 bg-card/5 backdrop-blur-xl overflow-hidden relative">
        <div className="flex overflow-hidden items-center group py-1">
             <motion.div
                className="flex whitespace-nowrap items-center"
                animate={{ x: ["0%", "-25%"] }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 40 // Even smoother for the compact look
                }}
                style={{ willChange: 'transform' }}
             >
                {marqueeItems.map((item, index) => (
                    <div 
                        key={index}
                        className="flex items-center px-4 sm:px-8 min-w-max"
                    >
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all hover:bg-secondary/50 cursor-default group/pill shadow-sm">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-background flex items-center justify-center border border-border/60 shadow-inner">
                                <span className="text-[10px] sm:text-sm">{item.icon}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] sm:text-base font-black text-foreground tracking-tight leading-none mb-0.5">
                                    {item.value}
                                </span>
                                <span className="text-[7px] sm:text-[9px] font-bold text-black dark:text-muted-foreground uppercase tracking-widest leading-none">
                                    {item.label}
                                </span>
                            </div>
                        </div>
                        {/* Compact Dot Divider */}
                        <div className="w-1 h-1 rounded-full bg-border/40 mx-4 sm:mx-8"></div>
                    </div>
                ))}
             </motion.div>
        </div>
    </section>
  )
}
