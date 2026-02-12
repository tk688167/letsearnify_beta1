"use client"

import { motion } from "framer-motion"
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ArrowPathIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline"
import Link from "next/link"

export default function MudarabaContent() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-2xl p-6 text-white relative overflow-hidden text-center"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
           {/* Development Notice */}
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-4">
               <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
               Under Development
           </div>

           <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/10 text-amber-400 shadow-xl">
               <ChartBarIcon className="w-6 h-6" />
           </div>
           
           <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2">Mudaraba Investment Pool</h1>
           <p className="text-indigo-200 text-sm md:text-base font-medium">Ethical Passive Growth</p>
        </div>
      </motion.div>

      {/* Key Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                  <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <div>
                  <h3 className="font-bold text-gray-900 text-sm">Sharia-Compliant</h3>
                  <p className="text-[10px] text-gray-500">Ethical investment model</p>
              </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                  <CurrencyDollarIcon className="w-5 h-5" />
              </div>
              <div>
                  <h3 className="font-bold text-gray-900 text-sm">Min $1 Investment</h3>
                  <p className="text-[10px] text-gray-500">Start small, grow big</p>
              </div>
          </div>
      </div>

      {/* How it Works / Instruction Section */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <ArrowPathIcon className="w-5 h-5 text-indigo-600" />
              How Mudaraba Works
          </h2>
          
          <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 pl-3 before:content-[''] md:before:hidden md:pl-0">
              
              {/* Step 1 */}
              <div className="relative pl-8 md:pl-0 md:flex md:gap-4 items-start">
                  <div className="absolute left-0 top-0 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 md:relative z-10 border-2 border-white">1</div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 w-full mt-1.5 md:mt-0">
                      <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide mb-1">Pool Target Set</h3>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                          A specific investment goal is established (e.g., <strong className="text-gray-900">$10,000</strong>) for a verified business venture.
                      </p>
                  </div>
              </div>

              {/* Step 2 */}
              <div className="relative pl-8 md:pl-0 md:flex md:gap-4 items-start">
                  <div className="absolute left-0 top-0 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 md:relative z-10 border-2 border-white">2</div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 w-full mt-1.5 md:mt-0">
                      <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide mb-1">Collective Investment</h3>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                          Users collectively invest starting from <strong className="text-emerald-600">$1 or more</strong> until the pool reaches its target.
                      </p>
                  </div>
              </div>

              {/* Step 3 */}
              <div className="relative pl-8 md:pl-0 md:flex md:gap-4 items-start">
                   <div className="absolute left-0 top-0 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 md:relative z-10 border-2 border-white">3</div>
                   <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 w-full mt-1.5 md:mt-0">
                      <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide mb-1">Business Utilization</h3>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                          Once the target is achieved, the funds are utilized for profitable business activities.
                      </p>
                  </div>
              </div>

              {/* Step 4 */}
              <div className="relative pl-8 md:pl-0 md:flex md:gap-4 items-start">
                   <div className="absolute left-0 top-0 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 md:relative z-10 border-2 border-white">4</div>
                   <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 w-full mt-1.5 md:mt-0">
                      <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide mb-1">Profit Sharing</h3>
                      <p className="text-xs md:text-sm text-emerald-800 leading-relaxed">
                          After generating profit, capital + profit shares are returned to investors proportionally.
                      </p>
                  </div>
              </div>

          </div>
      </section>

      {/* Investment Action */}
      <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-6 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Ready to Invest?</h3>
              <p className="text-indigo-100 text-sm mb-6 max-w-sm mx-auto">
                  Browse active pools and start your ethical investment journey today.
              </p>
              <button className="bg-white/10 border border-white/20 text-white cursor-not-allowed font-bold py-2.5 px-6 rounded-lg text-sm w-full md:w-auto">
                  Coming Soon
              </button>
          </div>
      </div>

    </div>
  )
}
