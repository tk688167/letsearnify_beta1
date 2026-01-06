"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowTrendingUpIcon, ShieldCheckIcon, ArrowRightIcon } from "@heroicons/react/24/outline"

export default function SpecialPoolsSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-gray-50/50">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
           <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 tracking-tight">
             Join Our Pools & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Secure Your Earnings</span> Today!
           </h2>
           <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
             From high-growth dynamic opportunities to rock-solid safety nets, our ecosystem is designed for every type of earner.
           </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Chaotic Pool Card */}
          <PoolCard 
             title="Chaotic Pool"
             subtitle="Dynamic Growth Engine"
             desc="A high-reward pool driven by community volatility and market activity. Participate in a decentralized, fluctuation-based earning model designed for those seeking accelerated growth."
             benefits={[
               "High APY potential based on volume",
               "Daily reward distribution",
               "Community-driven liquidity events"
             ]}
             icon={<ArrowTrendingUpIcon className="w-10 h-10 text-white" />}
             gradient="from-fuchsia-600 to-purple-600"
             accent="bg-fuchsia-50 text-fuchsia-700"
             buttonColor="bg-fuchsia-600 hover:bg-fuchsia-700 shadow-fuchsia-500/20"
             delay={0.1}
          />

          {/* Emergency Fund Card */}
          <PoolCard 
             title="Emergency Fund"
             subtitle="Safety & Stability Net"
             desc="Your financial safety net. A portion of platform revenue is secured here to guarantee liquidity, protect user assets during market downturns, and ensure instant withdrawals."
             benefits={[
               "Guarantees platform liquidity",
               "Instant withdrawal protection",
               "Audited reserve backing"
             ]}
             icon={<ShieldCheckIcon className="w-10 h-10 text-white" />}
             gradient="from-blue-600 to-cyan-600"
             accent="bg-blue-50 text-blue-700"
             buttonColor="bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
             delay={0.2}
          />
        </div>
      </div>
    </section>
  )
}

function PoolCard({ title, subtitle, desc, benefits, icon, gradient, accent, buttonColor, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col h-full relative overflow-hidden group"
    >
       <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${gradient} opacity-5 rounded-bl-[100%] transition-opacity group-hover:opacity-10`}></div>

       <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-8">
             <div>
                <div className={`inline-block px-4 py-1.5 rounded-full ${accent} text-xs font-bold uppercase tracking-wider mb-4`}>
                   {subtitle}
                </div>
                <h3 className="text-3xl font-bold font-serif text-gray-900">{title}</h3>
             </div>
             <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {icon}
             </div>
          </div>
          
          <p className="text-gray-500 text-lg leading-relaxed mb-10 flex-1">
             {desc}
          </p>
          
          <div className="space-y-4 mb-10">
             {benefits.map((benefit: string, i: number) => (
               <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full ${accent} flex items-center justify-center text-xs`}>✓</div>
                  <span className="text-gray-600 font-medium">{benefit}</span>
               </div>
             ))}
          </div>

          <Link href="/signup" className="block">
             <button className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-xl ${buttonColor} transition-all flex items-center justify-center gap-2 group-hover:gap-4`}>
                Join Pool Now
                <ArrowRightIcon className="w-5 h-5" />
             </button>
          </Link>
       </div>
    </motion.div>
  )
}
