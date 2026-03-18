"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { LockClosedIcon, ShieldCheckIcon, BanknotesIcon } from "@heroicons/react/24/solid"

export function DepositRequired() {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center p-6 overflow-hidden rounded-[2.5rem] bg-gray-950 isolate group">
       
       {/* Cinematic Background */}
       <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center bg-fixed opacity-[0.03]"></div>
       <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
       <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

       <motion.div 
         initial={{ scale: 0.95, opacity: 0, y: 20 }}
         animate={{ scale: 1, opacity: 1, y: 0 }}
         transition={{ duration: 0.8, ease: "easeOut" }}
         className="relative z-10 w-full max-w-xl bg-gray-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-14 text-center shadow-2xl shadow-black/80 overflow-hidden"
       >
          {/* Internal Shimmer */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
          
          <div className="relative mb-8 md:mb-10 inline-block group-hover:scale-105 transition-transform duration-700 ease-out">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse-slow"></div>
              <div className="relative w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-gray-800 to-gray-950 rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/5 ring-1 ring-white/10">
                  <LockClosedIcon className="w-8 h-8 md:w-12 md:h-12 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
              </div>
              <div className="absolute -top-3 -right-3 px-3 py-1 md:px-4 md:py-1.5 bg-gradient-to-r from-amber-200 to-yellow-400 rounded-full flex items-center justify-center border border-yellow-100/50 shadow-lg shadow-amber-900/20">
                 <ShieldCheckIcon className="w-3 h-3 md:w-4 md:h-4 text-amber-900 mr-1"/>
                 <span className="text-[9px] md:text-[10px] font-black text-amber-950 uppercase tracking-wider">Secure</span>
              </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight tracking-tight">
             <span className="text-gray-500 block text-xs md:text-lg font-sans font-bold uppercase tracking-widest mb-2">Restricted Area</span>
             Vault <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Locked</span>
          </h2>
          <p className="text-gray-400 mb-10 leading-relaxed text-lg max-w-md mx-auto">
             Access to the platform's core features requires a one-time activation. A $1.00 activation fee will unlock your account.
          </p>

          <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 rounded-2xl p-1 border border-white/5 mb-8 max-w-sm mx-auto shadow-inner">
             <div className="bg-gray-950/50 rounded-xl px-6 py-4 flex items-center justify-between">
                 <div className="text-left">
                     <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Fee</div>
                     <div className="text-gray-300 font-mono text-sm line-through decoration-red-500/50">$10.00</div>
                 </div>
                 <div className="h-8 w-px bg-gray-800"></div>
                 <div className="text-right">
                     <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">Activation Fee</div>
                     <div className="text-white font-mono text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">$1.00</div>
                 </div>
             </div>
          </div>

          <div className="flex flex-col gap-4">
             <Link href="/dashboard/wallet?tab=deposit" className="relative w-full py-5 bg-white text-gray-950 font-bold text-lg rounded-2xl hover:bg-gray-50 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 group/btn overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                 <BanknotesIcon className="w-6 h-6 text-gray-900 group-hover/btn:rotate-12 transition-transform duration-300"/>
                 Unlock Vault Access
             </Link>
             <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em] opacity-60 mb-1">
                 Instant Setup • Lifetime Access
             </p>
             <p className="text-xs text-emerald-400/90 font-medium max-w-sm mx-auto leading-relaxed italic">
                 "This one-time $1 activation fee unlocks the Task Center, Mudarabah Pool, Marketplace, and all other exclusive platform features."
             </p>
          </div>
       </motion.div>
    </div>
  )
}
