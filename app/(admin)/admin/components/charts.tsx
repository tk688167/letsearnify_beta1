"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { motion } from "framer-motion"

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
const ACCENT_COLORS = ['#ec4899', '#f472b6', '#fbcfe8'];

export function MainTrafficChart({ data }: { data: any[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="h-[350px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#64748b', fontSize: 12}} 
            dx={-10}
          />
          <Tooltip 
            contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                backdropFilter: 'blur(8px)',
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                padding: '12px 16px'
            }}
            itemStyle={{ color: '#1e293b', fontWeight: 600 }}
            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area 
            type="monotone" 
            dataKey="visits" 
            stroke="#2563eb" 
            strokeWidth={4} 
            fillOpacity={1} 
            fill="url(#colorVisits)" 
            activeDot={{ r: 8, strokeWidth: 0, fill: '#2563eb' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export function DistributionChart({ data, title }: { data: any[], title: string }) {
    if (!data || data.length === 0) return (
        <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm font-medium italic bg-gray-50/50 rounded-2xl">
            No data available for {title}
        </div>
    )

    return (
      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
         className="h-[250px] relative"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={8}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="text-2xl font-bold text-gray-900">{data.reduce((a, b) => a + b.value, 0)}</div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total</div>
        </div>
      </motion.div>
    )
}

export function BarListChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return (
         <div className="h-[200px] flex items-center justify-center text-gray-400">No data</div>
    )

    const maxVal = Math.max(...data.map(d => d.value))

    return (
        <div className="space-y-4 pt-2">
            {data.map((item, i) => (
                <motion.div 
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.1 }}
                    className="group"
                >
                    <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-gray-700 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                             {item.name}
                        </span>
                        <span className="font-bold text-gray-900">{item.value}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${(item.value / maxVal) * 100}%` }}
                           transition={{ duration: 1, ease: "easeOut" }}
                           className="h-full bg-blue-500 rounded-full group-hover:bg-blue-600 transition-colors"
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
