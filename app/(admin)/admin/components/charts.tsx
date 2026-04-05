"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { useMemo } from "react"

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#06b6d4', '#10b981']

export function MainTrafficChart({ data }: { data: any[] }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const gridColor = isDark ? '#1e293b' : '#f1f5f9'
  const tickColor = isDark ? '#64748b' : '#94a3b8'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="h-[300px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={isDark ? 0.25 : 0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12, fontWeight: 500 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} dx={-10} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
              boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.1)',
              padding: '10px 14px',
            }}
            itemStyle={{ color: isDark ? '#e2e8f0' : '#1e293b', fontWeight: 600 }}
            labelStyle={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
            cursor={{ stroke: isDark ? '#334155' : '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" activeDot={{ r: 7, strokeWidth: 0, fill: '#3b82f6' }} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export function DistributionChart({ data, title }: { data: any[], title: string }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (!data || data.length === 0) return (
    <div className="h-[220px] flex items-center justify-center text-gray-400 dark:text-slate-600 text-sm font-medium italic bg-gray-50/50 dark:bg-slate-800/30 rounded-2xl">
      No data available for {title}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
      className="h-[220px] relative"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={6}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? 'rgba(15,23,42,0.95)' : '#fff',
              borderRadius: '10px',
              border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
              boxShadow: isDark ? '0 8px 20px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {data.reduce((a: any, b: any) => a + b.value, 0)}
        </div>
        <div className="text-xs text-gray-400 dark:text-slate-500 font-medium uppercase tracking-wider">Total</div>
      </div>
    </motion.div>
  )
}

export function BarListChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return (
    <div className="h-[180px] flex items-center justify-center text-gray-400 dark:text-slate-600 text-sm">No data</div>
  )

  const maxVal = Math.max(...data.map((d: any) => d.value))

  return (
    <div className="space-y-3.5 pt-2">
      {data.map((item, i) => (
        <motion.div
          key={item.name}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="group"
        >
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {item.name}
            </span>
            <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / maxVal) * 100}%` }}
              transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.08 }}
              className="h-full bg-blue-500 dark:bg-blue-400 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-blue-300 transition-colors"
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
