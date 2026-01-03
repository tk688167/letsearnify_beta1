"use client"

import { motion } from "framer-motion"

export function StatsCard({ title, value, icon, color, trend }: any) {
  const colors: any = {
    blue: "from-blue-500 to-indigo-600",
    purple: "from-purple-500 to-pink-600",
    emerald: "from-emerald-500 to-teal-600",
    amber: "from-amber-400 to-orange-500"
  }
  
  const bgStyles: any = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600"
  }

  return (
    <motion.div 
       whileHover={{ y: -4 }}
       className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-all relative overflow-hidden group"
    >
       <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
       
       <div className="relative z-10">
           <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl ${bgStyles[color]} shadow-sm`}>
                 {icon}
              </div>
              {trend && (
                 <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 flex items-center gap-1">
                    {trend}
                 </span>
              )}
           </div>
           
           <h3 className="text-3xl font-bold text-gray-900 font-serif mb-1 tracking-tight">{value}</h3>
           <p className="text-sm font-medium text-gray-500">{title}</p>
       </div>
    </motion.div>
  )
}
