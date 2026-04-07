"use client"

import { motion } from "framer-motion"
import { LockClosedIcon, ArrowRightIcon } from "@heroicons/react/24/solid"

export default function PremiumLockedOverlay() {
  return (
    <div className="absolute inset-0 z-40 bg-white/20 dark:bg-slate-950/20 backdrop-blur-[12px] flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden rounded-[3.5rem]">
      {/* Animated Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_70%)] animate-pulse" />
      
      <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] max-w-md w-full border border-white/50 dark:border-white/10 text-center ring-1 ring-black/5 dark:ring-white/5"
      >
          {/* Icon with Ring Animation */}
          <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-amber-500/20 rounded-[2rem] animate-ping opacity-30" />
              <div className="relative w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 rounded-[2rem] flex items-center justify-center shadow-lg shadow-amber-500/30 ring-4 ring-amber-500/20">
                  <LockClosedIcon className="w-10 h-10 text-white drop-shadow-md" />
              </div>
          </div>

          <div className="space-y-4 mb-10">
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">
                  This is <span className="text-amber-500">locked</span>
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                  All these features are currently locked. Activate your account with a <span className="text-slate-900 dark:text-white font-black underline decoration-amber-500 underline-offset-4">$1.00 deposit</span> to start spinning.
              </p>
          </div>

          <div className="flex flex-col gap-3">
              <a 
                href="/dashboard/wallet?tab=deposit" 
                className="group relative inline-flex items-center justify-center w-full px-8 py-5 bg-slate-950 dark:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-2xl shadow-xl shadow-black/10 dark:shadow-white/10 overflow-hidden"
              >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 text-white dark:text-black group-hover:text-white font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                      Activate Elite Membership <ArrowRightIcon className="w-4 h-4" />
                  </span>
              </a>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Instant Access • $1 Activation • Lifetime Value
              </p>
          </div>
      </motion.div>
    </div>
  )
}
