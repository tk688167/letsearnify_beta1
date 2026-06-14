"use client"

import React from "react"
import { motion } from "framer-motion"
import { ShieldCheckIcon } from "@heroicons/react/24/solid"
import { ArrowRightIcon } from "@heroicons/react/24/outline"

export default function WelcomeHero({ user }: { user: any }) {
  const userName = user?.name || "Partner";
  const joinDate = new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <section className="relative py-12 md:py-24 overflow-hidden bg-white">
       {/* Subtle Grid Background */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

       <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              
              {/* Text Content */}
              <div className="flex-1 text-center md:text-left">
                  <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6 }}
                  >
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900 text-white text-xs font-bold uppercase rounded-md mb-6 shadow-lg shadow-gray-900/20">
                        <ShieldCheckIcon className="w-3.5 h-3.5" />
                        Verified Account
                     </div>
                     
                     <h1 className="text-4xl md:text-7xl font-serif font-bold text-gray-900 leading-[1.1] mb-6">
                        Welcome, <br/>
                        <span className="text-gray-500">{userName}</span>
                     </h1>
                     
                     <p className="text-base md:text-xl text-gray-500 font-light leading-relaxed max-w-lg mx-auto md:mx-0 mb-8">
                        Your financial command center is ready. You joined us in <span className="text-gray-900 font-medium">{joinDate}</span>—let's make today count.
                     </p>

                     <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                         <a href="#ecosystem" className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-xl flex items-center gap-2 w-full sm:w-auto justify-center">
                            Explore Ecosystem <ArrowRightIcon className="w-5 h-5" />
                         </a>
                         <div className="flex items-center gap-2 px-6 py-4 text-gray-500 font-medium bg-gray-50 rounded-xl border border-gray-100 w-full sm:w-auto justify-center">
                             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                             System Operational
                         </div>
                     </div>
                  </motion.div>
              </div>

              {/* Visual/Stats Abstract */}
              <div className="flex-1 w-full max-w-lg">
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: 0.2, duration: 0.8 }}
                     className="relative aspect-auto min-h-[300px] md:min-h-[350px] md:aspect-[4/3] bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl flex flex-col justify-between overflow-hidden"
                  >
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
                      
                      <div>
                          <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-2">Current Status</p>
                          <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Active Investor</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total Pools</p>
                              <p className="text-xl md:text-2xl font-bold text-gray-900">4</p>
                          </div>
                          <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Opportunities</p>
                              <p className="text-xl md:text-2xl font-bold text-emerald-600">Uncapped</p>
                          </div>
                      </div>
                  </motion.div>
              </div>

          </div>
       </div>
    </section>
  )
}
