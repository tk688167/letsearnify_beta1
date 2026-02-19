"use client"
import React from "react"
import { motion } from "framer-motion"

// Define the stats interface based on usage
interface SocialProofStatsProps {
  stats: {
    totalPaid?: number
    activeUsers?: number
    tasksCompleted?: number
    countries?: number
  } | null
}

export default function SocialProofStats({ stats }: SocialProofStatsProps) {
  // Default fallbacks if stats are missing
  const data = [
    { label: "Total Paid Out", value: stats?.totalPaid ? `$${stats.totalPaid.toLocaleString()}` : "$2.4M+", icon: "💰" },
    { label: "Active Earners", value: stats?.activeUsers ? stats.activeUsers.toLocaleString() : "50k+", icon: "👥" },
    { label: "Tasks Completed", value: stats?.tasksCompleted ? stats.tasksCompleted.toLocaleString() : "1.2M+", icon: "✅" },
    { label: "Global Reach", value: stats?.countries ? `${stats.countries} Countries` : "150+", icon: "🌍" },
  ]

  return (
    <section className="py-12 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {data.map((item, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <div className="text-3xl mb-2">{item.icon}</div>
                        <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{item.value}</div>
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{item.label}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
  )
}
