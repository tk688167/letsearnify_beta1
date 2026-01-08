"use client"

import React from "react"
import { motion } from "framer-motion"
import { RocketLaunchIcon, GlobeAltIcon, CpuChipIcon, SparklesIcon } from "@heroicons/react/24/outline"

export default function FutureProjectsSection() {
  return (
    <section className="py-24 bg-black text-white relative overflow-hidden">
       {/* Tech Grid Background */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
       
       <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="flex flex-col md:flex-row gap-16">
              
              {/* Left: Vision */}
              <div className="md:w-1/3">
                 <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                 >
                    <div className="inline-flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-xs mb-6">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                        Innovation Hub
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
                        Building the <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Future of Work</span>
                    </h2>
                    <p className="text-gray-400 leading-relaxed mb-8">
                        LetsEarnify is evolving beyond a simple earning platform. We are constructing a comprehensive digital economy.
                    </p>
                    
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <SparklesIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Strategic Vision</h4>
                                <p className="text-xs text-gray-400">Q3 2026 Objectives</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-300">
                            Our roadmap prioritizes sustainable growth, integrating AI-driven task matching and decentralized gaming assets.
                        </p>
                    </div>
                 </motion.div>
              </div>

              {/* Right: Roadmap Timeline */}
              <div className="md:w-2/3">
                 <div className="space-y-8 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:to-transparent before:opacity-30">
                    
                    <RoadmapCard 
                       icon={<RocketLaunchIcon className="w-6 h-6"/>}
                       title="Play-to-Earn Gaming"
                       date="Q3 2026"
                       desc="Launch of our proprietary gaming titles. Earn crypto rewards through skill-based tournaments and asset trading."
                       active
                    />
                    
                    <RoadmapCard 
                       icon={<GlobeAltIcon className="w-6 h-6"/>}
                       title="Global Merchant API"
                       date="Q4 2026"
                       desc="Open API for local merchants to integrate LetsEarnify payments directly into their POS systems."
                    />

                    <RoadmapCard 
                       icon={<CpuChipIcon className="w-6 h-6"/>}
                       title="AI Task Matching"
                       date="2027"
                       desc="Machine learning algorithms to automatically pair high-value tasks with your specific skill profile."
                    />

                 </div>
              </div>

          </div>

       </div>
    </section>
  )
}

function RoadmapCard({ icon, title, date, desc, active }: any) {
  return (
    <motion.div 
       initial={{ opacity: 0, y: 20 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true }}
       className={`relative pl-12 md:pl-24 pr-8 py-6 rounded-2xl border transition-all hover:bg-white/5 ${active ? "bg-indigo-900/10 border-indigo-500/30" : "border-white/5"}`}
    >
       {/* Timeline Node */}
       <div className={`absolute left-2 md:left-5 top-8 w-6 h-6 rounded-full border-4 border-black z-10 flex items-center justify-center ${active ? "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "bg-gray-700"}`}></div>
       
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h3 className={`text-xl font-bold ${active ? "text-white" : "text-gray-300"}`}>{title}</h3>
          <span className={`text-xs font-bold uppercase tracking-wider py-1 px-2 rounded-lg ${active ? "bg-indigo-500/20 text-indigo-300" : "bg-gray-800 text-gray-500"}`}>{date}</span>
       </div>
       <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </motion.div>
  )
}
