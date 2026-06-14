"use client"

/**
 * MarketplaceDevScreen — displayed when the marketplace is in development mode.
 * Refactored to be professional, simple, and mobile-responsive.
 */

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import { 
  BriefcaseIcon, 
  BellAlertIcon, 
  CheckCircleIcon, 
  RocketLaunchIcon 
} from "@heroicons/react/24/solid"
import { joinWaitlist } from "@/app/actions/waitlist"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

export default function MarketplaceDevScreen() {
  const [isPending, startTransition] = useTransition()
  const [joined, setJoined] = useState(false)

  const handleNotifyMe = () => {
    startTransition(async () => {
      const result = await joinWaitlist("Freelance Marketplace")
      if (result.success) {
        setJoined(true)
        toast.success("Successfully joined the notification list!")
      } else {
        toast.error(result.error || "Failed to join notification list.")
      }
    })
  }

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center p-4 md:p-8 overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 shadow-xl transition-colors duration-300 group">
      
      {/* Decorative Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-50 transition-all duration-1000"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 dark:bg-indigo-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 dark:bg-purple-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-2xl w-full text-center space-y-8"
      >
        {/* Icon & Badge */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20 transform transition-transform group-hover:scale-105 duration-500">
            <BriefcaseIcon className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/50 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-serif font-black text-gray-900 dark:text-white tracking-tight">
            Marketplace Coming Soon
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
            Our Freelance Marketplace is under active development. We're building a secure, premium hub for freelancers and clients to connect, collaborate, and grow.
          </p>
        </div>

        {/* Action / Notification Form */}
        <div className="max-w-md mx-auto pt-4">
          <div className="p-1.5 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-inner flex flex-col sm:flex-row gap-2 transition-all">
            <div className="flex-1 px-4 py-3 text-left">
              <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-widest leading-none mb-1">Status</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">Launching in Q2 2026</p>
            </div>
            
            <button 
              onClick={handleNotifyMe}
              disabled={isPending || joined}
              className={cn(
                "px-6 py-3.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2",
                joined 
                  ? "bg-emerald-500 text-white cursor-default" 
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 active:scale-95"
              )}
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : joined ? (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  Notified!
                </>
              ) : (
                <>
                  <BellAlertIcon className="w-4 h-4" />
                  Notify Me
                </>
              )}
            </button>
          </div>
          
          {joined && (
            <p className="mt-3 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-top-1">
               Perfect! You'll be the first to know when we're live.
            </p>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="pt-8 flex items-center justify-center gap-6 opacity-40">
           <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
             <RocketLaunchIcon className="w-3.5 h-3.5" />
             Stay Tuned
           </div>
        </div>
      </motion.div>
    </div>
  )
}
