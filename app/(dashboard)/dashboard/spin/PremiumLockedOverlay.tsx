"use client"

import { motion } from "framer-motion"
import { LockClosedIcon } from "@heroicons/react/24/solid"

export default function PremiumLockedOverlay() {
  return (
    <div className="absolute inset-0 z-40 bg-background/5 backdrop-blur-[16px] flex flex-col items-center justify-center p-6 transition-all rounded-[2rem] sm:rounded-[3.5rem]">
      
      <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-card border border-amber-500/20 rounded-2xl p-5 sm:p-6 flex flex-col items-center gap-4 shadow-2xl shadow-amber-500/5 max-w-xs w-full text-center"
      >
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 shadow-inner">
              <LockClosedIcon className="w-5 h-5" />
          </div>

          <div className="space-y-1">
              <h3 className="text-sm font-black text-foreground tracking-tight uppercase italic">
                  Unlock Premium Spin
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                  Access Elite Rewards
              </p>
          </div>

          <a 
            href="/dashboard/wallet?tab=deposit" 
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-600/20 active:scale-95"
          >
              Unlock
          </a>
      </motion.div>
    </div>
  )
}
