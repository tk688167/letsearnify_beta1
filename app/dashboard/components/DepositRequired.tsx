"use client"

import Link from "next/link"
import { LockClosedIcon } from "@heroicons/react/24/solid"

export function DepositRequired() {
  return (
    <div className="w-full max-w-2xl mx-auto mt-10 p-8 md:p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-xl shadow-blue-900/5">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner animate-pulse">
            <LockClosedIcon className="w-10 h-10" />
        </div>
      </div>
      
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
        Deposit Required
      </h2>
      
      <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg leading-relaxed">
        To access this premium feature, you need to activate your account by making a minimum deposit of <span className="font-bold text-gray-900">$1.00</span>.
      </p>

      <div className="inline-block">
        <Link 
            href="/dashboard/wallet?tab=deposit" 
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
        >
            <span>Unlock Now</span>
            <span className="text-blue-200">→</span>
        </Link>
      </div>
      
      <p className="mt-6 text-xs text-gray-400">
         Secure payments via Crypto & Bank Transfer
      </p>
    </div>
  )
}
