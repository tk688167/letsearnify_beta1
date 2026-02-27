"use client"

import { motion } from "framer-motion"

export function StatsCard({ title, value, icon, color, trend, compact }: any) {
  const iconBg: any = {
    blue:    "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
    purple:  "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber:   "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  }

  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-slate-900 p-3.5 md:p-5 rounded-2xl border border-gray-100 dark:border-slate-800/60 shadow-sm hover:shadow transition-all relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-50 dark:from-slate-800/40 to-transparent rounded-bl-full opacity-50" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-2">
            <div className={`p-2 rounded-xl ${iconBg[color]} shadow-sm`}>
              {icon}
            </div>
            {trend && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400">
                {trend}
              </span>
            )}
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white font-serif tracking-tight mt-1">
            {value}
          </div>
          <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400 mt-0.5">{title}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 dark:from-slate-800/40 to-transparent rounded-bl-full opacity-50 transition-transform group-hover:scale-110" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-3 rounded-2xl ${iconBg[color]} shadow-sm`}>
            {icon}
          </div>
          {trend && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center gap-1">
              {trend}
            </span>
          )}
        </div>

        <h3 className="text-3xl font-bold text-gray-900 dark:text-white font-serif mb-1 tracking-tight">
          {value}
        </h3>
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</p>
      </div>
    </motion.div>
  )
}
