"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowTrendingUpIcon, ShieldCheckIcon, ArrowRightIcon } from "@heroicons/react/24/outline"

export default function SpecialPoolsSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-muted/30">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
           <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 sm:mb-6 tracking-tight">
             Diversified Risk-Reward <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Portfolios</span>
           </h2>
           <p className="text-base sm:text-lg md:text-xl text-black dark:text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
             From high-growth dynamic opportunities to rock-solid safety nets, our ecosystem is designed for every type of earner.
           </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          {/* Dynamic V-Pool Card */}
          <PoolCard 
             title="Dynamic V-Pool"
             subtitle="High-Yield Growth Strategy"
             desc="A variable-return liquidity pool driven by market volume. Designed for participants seeking maximum APY potential through active ecosystem participation."
             benefits={[
               "Volume-adjusted yield",
               "Daily compound potential",
               "Decentralized liquidity distribution"
             ]}
             icon={<ArrowTrendingUpIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />}
             gradient="from-fuchsia-600 to-purple-600"
             accent="bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400"
             buttonColor="bg-fuchsia-600 hover:bg-fuchsia-700 shadow-fuchsia-500/20"
             delay={0.1}
          />

          {/* Liquidity Reserve Card */}
          <PoolCard 
             title="Liquidity Reserve"
             subtitle="Capital Preservation Fund"
             desc="A secured reserve fund ensuring ecosystem stability. Allocated capital protects user balances and guarantees withdrawal liquidity during market fluctuations."
             benefits={[
               "Institutional-grade stability",
               "Guaranteed withdrawal liquidity",
               "Audited solvency backing"
             ]}
             icon={<ShieldCheckIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />}
             gradient="from-blue-600 to-cyan-600"
             accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
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
      className="bg-card rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-12 border border-border shadow-xl shadow-muted/20 flex flex-col h-full relative overflow-hidden group"
    >
       <div className={`absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br ${gradient} opacity-5 rounded-bl-[100%] transition-opacity group-hover:opacity-10`}></div>

       <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-6 sm:mb-8">
             <div>
                <div className={`inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full ${accent} text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4`}>
                   {subtitle}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">{title}</h3>
             </div>
             <div className={`w-14 h-14 sm:w-20 sm:h-20 shrink-0 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {icon}
             </div>
          </div>
          
          <p className="text-black dark:text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-10 flex-1 font-medium">
             {desc}
          </p>
          
          <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
             {benefits.map((benefit: string, i: number) => (
               <div key={i} className="flex items-center gap-3">
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${accent} flex items-center justify-center text-[10px] sm:text-xs`}>✓</div>
                  <span className="text-black dark:text-muted-foreground font-black text-xs sm:text-sm md:text-base">{benefit}</span>
               </div>
             ))}
          </div>

          <Link href="/signup" className="block mt-auto">
             <button className={`w-full py-3 sm:py-4 text-white rounded-xl font-bold text-base sm:text-lg shadow-xl ${buttonColor} transition-all flex items-center justify-center gap-2 group-hover:gap-4`}>
                Join Pool Now
                <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
             </button>
          </Link>
       </div>
    </motion.div>
  )
}
