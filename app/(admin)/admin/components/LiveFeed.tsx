"use client"

import { motion } from "framer-motion"

export function LiveFeed({ activities }: { activities: any[] }) {
  if (!activities || activities.length === 0) return null

  return (
    <div className="space-y-4 relative">
       {/* Connecting line */}
       <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gray-100 -z-10"></div>
       
       {activities.map((act, i) => (
          <motion.div 
             key={act.id}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.05 }}
             className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
          >
             <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-50 text-blue-500 flex items-center justify-center shrink-0 z-10 shadow-sm group-hover:border-blue-200 group-hover:scale-110 transition-all">
                {getIcon(act.device)}
             </div>
             <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                   <h4 className="text-sm font-bold text-gray-900 truncate">
                      {act.country === 'Unknown' ? 'Anonymous User' : `Visitor from ${act.country}`}
                   </h4>
                   <span className="text-xs text-gray-400 font-mono">{act.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                   Viewed <span className="font-medium text-blue-600">{act.path}</span> on {act.browser} ({act.os})
                </p>
             </div>
          </motion.div>
       ))}
    </div>
  )
}

function getIcon(device: string) {
    if (device === 'Mobile') return "📱"
    return "💻"
}
