"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
  UserGroupIcon, 
  BriefcaseIcon, 
  ChartBarIcon, 
  ShoppingBagIcon, 
  ArrowRightIcon 
} from "@heroicons/react/24/outline"

export default function EcosystemSection() {
  return (
    <section className="py-12 md:py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-3">Our Ecosystem</h2>
            <h3 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
              Four Pillars of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900">Wealth Generation</span>
            </h3>
          </div>
          <p className="text-gray-500 max-w-sm text-sm md:text-base leading-relaxed">
            A unified platform offering diverse income streams tailored to your skills and capital.
          </p>
        </div>
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto md:auto-rows-[300px]">
          
          {/* 1. Mudaraba (Large Feature) */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="md:col-span-2 relative group overflow-hidden rounded-[2.5rem] bg-gray-900 text-white p-8 md:p-10 flex flex-col justify-between min-h-[300px]"
          >
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
             <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 opacity-90 transition-opacity group-hover:opacity-100"></div>
             
             <div className="relative z-10 flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 text-amber-400">
                   <ChartBarIcon className="w-7 h-7" />
                </div>
                <div className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold uppercase rounded-full border border-amber-500/20">
                   Passive Income
                </div>
             </div>

             <div className="relative z-10">
                <h4 className="text-2xl md:text-3xl font-bold mb-3">Mudaraba Investment Pool</h4>
                <p className="text-gray-400 max-w-md mb-6">
                   Participate in ethical, community-driven investment pools. Let your capital work for you with transparent weekly profit sharing.
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-white group-hover:gap-4 transition-all">
                   Explore Pools <ArrowRightIcon className="w-4 h-4" />
                </div>
             </div>
          </motion.div>

          {/* 2. Tasks (Tall Feature) */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             viewport={{ once: true }}
             className="md:row-span-2 relative group overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all p-8 md:p-10 flex flex-col min-h-[300px]"
          >
             <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-auto">
                <BriefcaseIcon className="w-7 h-7" />
             </div>
             
             <div className="mt-8">
                <h4 className="text-2xl font-bold text-gray-900 mb-3">Task Center</h4>
                <p className="text-gray-500 leading-relaxed mb-6">
                   Monetize your spare time. Complete verified micro-tasks—from data entry to social engagement—and get paid instantly.
                </p>
                <ul className="space-y-3 mb-8">
                   <li className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Instant Verification
                   </li>
                   <li className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Zero Skill Required
                   </li>
                   <li className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Daily Payouts
                   </li>
                </ul>
                <button className="w-full py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold text-sm transition-colors">
                   Start Earning
                </button>
             </div>
          </motion.div>

          {/* 3. Marketplace (Standard) */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             viewport={{ once: true }}
             className="relative group overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all p-8 flex flex-col justify-between min-h-[300px]"
          >
             <div className="flex justify-between items-start">
                 <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
                    <ShoppingBagIcon className="w-6 h-6" />
                 </div>
             </div>
             <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Digital Marketplace</h4>
                <p className="text-sm text-gray-500">
                   Sell your professional services or digital assets to a global audience.
                </p>
             </div>
          </motion.div>

          {/* 4. Referral (Standard) */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             viewport={{ once: true }}
             className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 flex flex-col justify-between shadow-lg shadow-blue-900/20 min-h-[300px]"
          >
             <div className="absolute top-0 right-0 p-8 opacity-10">
                 <UserGroupIcon className="w-32 h-32 -rotate-12 translate-x-8 -translate-y-8" />
             </div>
             
             <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
                <UserGroupIcon className="w-6 h-6" />
             </div>
             <div className="relative z-10">
                <h4 className="text-xl font-bold mb-2">Partner Network</h4>
                <p className="text-sm text-blue-100">
                   Build your team. Earn lifelong commissions from our 7-tier affiliate system.
                </p>
             </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
