"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { LockClosedIcon, ShieldCheckIcon, BanknotesIcon } from "@heroicons/react/24/solid"

export function DepositRequired() {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center p-6 overflow-hidden rounded-[2.5rem] bg-gray-900">
       
       {/* Background Effects */}
       <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center bg-fixed opacity-10"></div>
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]"></div>

       <motion.div 
         initial={{ scale: 0.9, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ duration: 0.5 }}
         className="relative z-10 w-full max-w-lg bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-black/50 overflow-hidden"
       >
          {/* Shimmer Effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>

          <div className="flex justify-center mb-8">
             <div className="relative">
                 <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-40 rounded-full"></div>
                 <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl border border-white/10 transform rotate-3">
                     <LockClosedIcon className="w-12 h-12 text-white" />
                 </div>
                 <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center border-2 border-gray-900 text-gray-900 font-bold shadow-lg">
                    <ShieldCheckIcon className="w-5 h-5"/>
                 </div>
             </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
             Exclusive Access <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">Locked</span>
          </h2>
          
          <p className="text-blue-100/80 mb-8 leading-relaxed">
             This feature is reserved for active partners. To ensure security and commitment, a nominal deposit is required to activate your vault.
          </p>

          <div className="bg-blue-950/50 rounded-xl p-4 border border-blue-500/20 mb-8 max-w-sm mx-auto">
             <div className="flex items-center justify-between text-sm">
                 <span className="text-gray-400 font-medium">Activation Fee</span>
                 <span className="text-white font-bold font-mono">$0.00</span>
             </div>
             <div className="w-full h-px bg-blue-800/50 my-2"></div>
             <div className="flex items-center justify-between text-sm">
                 <span className="text-gray-400 font-medium">Min Deposit</span>
                 <span className="text-emerald-400 font-bold font-mono">$1.00</span>
             </div>
          </div>

          <div className="flex flex-col gap-3">
             <Link href="/dashboard/wallet?tab=deposit" className="w-full py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg flex items-center justify-center gap-2 group">
                 <BanknotesIcon className="w-5 h-5 group-hover:scale-110 transition-transform"/>
                 Deposit $1.00 to Unlock
             </Link>
             <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">
                 Instant Activation • Secure Gateway
             </p>
          </div>
       </motion.div>
    </div>
  )
}
