"use client"

import { RocketLaunchIcon, LockClosedIcon, ClockIcon, WrenchScrewdriverIcon, BriefcaseIcon, BanknotesIcon, ShoppingBagIcon, CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
// import { SectionWatermark } from "./SectionWatermark" // Assuming this doesn't exist or is optional, removing to be safe or defining inline if needed. Wait, it was imported before. I should check if it exists. 
// Actually, looking at previous file view, it was imported. I should keep it.
import { SectionWatermark } from "./SectionWatermark"
import { ComingSoonConfig, SectionConfig } from "@/app/actions/admin/settings"
// import { motion } from "framer-motion" // Removing unused motion import if not used, or keeping if I add animations. The previous code had style tag animations.

interface ComingSoonProps {
    title?: string;
    feature?: 'tasks' | 'pools' | 'marketplace' | 'default';
    config?: ComingSoonConfig;
}

export function ComingSoon({ title, feature = 'default', config }: ComingSoonProps) {
  const router = useRouter()
  
  // Feature-Specific Theming
  const themeMap = {
      default: {
          gradientFrom: "from-blue-600",
          gradientTo: "to-indigo-900",
          accent: "text-blue-500",
          bgBadge: "bg-blue-500/10 border-blue-500/20 text-blue-200",
          icon: <RocketLaunchIcon className="w-10 h-10 text-white" />,
          benefits: [
              "Early Access soon",
              "Premium features unlocking",
              "Enhanced earning potential"
          ],
          description: "In Development – Coming Soon. This feature will be available in the near future. Stay tuned!",
          watermark: "COMING SOON"
      },
      tasks: {
          gradientFrom: "from-emerald-500",
          gradientTo: "to-teal-900",
          accent: "text-emerald-400",
          bgBadge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-200",
          icon: <BriefcaseIcon className="w-10 h-10 text-white" />,
          benefits: [
              "High-Value Daily Tasks",
              "Instant Verification System",
              "Advertiser & Publisher Portal"
          ],
          description: "Our comprehensive Task Center is being built to provide you with a stream of verified earning opportunities. Get ready to monetize your time like never before.",
          watermark: "TASKS"
      },
      pools: {
          gradientFrom: "from-amber-500",
          gradientTo: "to-yellow-900", 
          accent: "text-amber-400",
          bgBadge: "bg-amber-500/10 border-amber-500/20 text-amber-200",
          icon: <BanknotesIcon className="w-10 h-10 text-white" />,
          benefits: [
              "Sharia-Compliant Profit Sharing",
              "Real-time Portfolio Tracking",
              "Automated Re-investing"
          ],
          description: "The Mudaraba Investment Pool represents an ethical, transparent way to grow your wealth. We are finalizing the smart contracts and profit distribution logic.",
          watermark: "MUDARABA"
      },
      marketplace: {
          gradientFrom: "from-rose-500",
          gradientTo: "to-orange-900",
          accent: "text-rose-400",
          bgBadge: "bg-rose-500/10 border-rose-500/20 text-rose-200",
          icon: <ShoppingBagIcon className="w-10 h-10 text-white" />,
          benefits: [
              "Peer-to-Peer Digital Asset Trading",
              "Freelance Service Gigs",
              "Secure Escrow Payments"
          ],
          description: "A vibrant ecosystem for buying and selling services and digital goods. The Marketplace will be the central hub for local commerce within Let'$Earnify.",
          watermark: "MARKET"
      }
  }

  const theme = themeMap[feature] || themeMap.default

  // Overrides from Props/Config
  const displayTitle = title || "Coming Soon"
  
  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-700">
       
       {/* Main Card Container */}
       <div className="w-full max-w-6xl bg-[#09090b] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl relative flex flex-col lg:flex-row min-h-[500px]">
           
           {/* Global Glow Effects (Themed) */}
           <div className={cn("absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 pointer-events-none translate-x-1/2 -translate-y-1/2 bg-gradient-to-br", theme.gradientFrom, theme.gradientTo)}></div>
           <div className={cn("absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[150px] opacity-10 pointer-events-none -translate-x-1/2 translate-y-1/2 bg-gradient-to-tr", theme.gradientFrom, theme.gradientTo)}></div>


           {/* Left Column: Content */}
           <div className="relative z-10 flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center items-start space-y-8 overflow-hidden">
               
               {/* Watermark - Huge Background Text */}
               <h1 className="hidden md:block absolute top-1/2 left-0 -translate-y-1/2 text-[100px] lg:text-[150px] leading-none font-black text-white/[0.03] select-none pointer-events-none whitespace-nowrap z-0">
                   {theme.watermark}
               </h1>

               {/* Badge */}
               <div className={cn("relative z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider", theme.bgBadge)}>
                   <SparklesIcon className="w-4 h-4" />
                   <span>In Development</span>
               </div>

               {/* Typography */}
               <div className="relative z-10 space-y-4">
                   <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-xl">
                       {displayTitle}
                   </h2>
                   <p className="text-gray-400 text-lg leading-relaxed max-w-lg font-medium">
                       {theme.description}
                   </p>
               </div>

               {/* Benefits List */}
               <ul className="space-y-4 relative z-10">
                   {theme.benefits.map((item, i) => (
                       <li key={i} className="flex items-center gap-3 text-gray-300 font-medium text-sm md:text-base">
                           <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br shadow-sm", theme.gradientFrom, theme.gradientTo)}>
                               <CheckCircleIcon className="w-4 h-4 text-white" />
                           </div>
                           {item}
                       </li>
                   ))}
               </ul>

               {/* CTA Link */}
               <button 
                  onClick={() => router.back()}
                  className={cn("relative z-10 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 bg-gradient-to-r", theme.gradientFrom, theme.gradientTo)}
               >
                   <span>Notify Me</span>
                   <ClockIcon className="w-4 h-4 text-white/70" />
               </button>
           </div>


           {/* Right Column: Visuals (Themed) */}
           <div className="relative flex-1 min-h-[300px] lg:min-h-0 bg-white/[0.02] flex items-center justify-center overflow-hidden py-12 lg:py-0 border-l border-white/5">
               
               {/* Center Glow behind cards */}
               <div className={cn("absolute w-64 h-64 rounded-full blur-[80px] opacity-40 animate-pulse bg-gradient-to-tr", theme.gradientFrom, theme.gradientTo)}></div>

               {/* 3D Cards Simulation */}
               <div className="relative w-full max-w-xs md:max-w-sm h-64 transform perspective-1000 lg:rotate-y-12 lg:rotate-x-6 scale-90 md:scale-100">
                    
                    {/* Back Card */}
                    <div className={cn("absolute top-0 right-0 w-[260px] md:w-[280px] h-[160px] md:h-[180px] rounded-2xl border border-white/10 shadow-2xl transform translate-x-4 md:translate-x-12 -translate-y-8 flex items-center justify-center bg-gray-900/80 backdrop-blur-xl")}>
                        <div className="text-center opacity-50">
                            <div className="w-12 h-12 border-2 border-white/20 rotate-45 mx-auto mb-2 rounded-lg"></div>
                        </div>
                    </div>

                    {/* Front Card */}
                    <div className={cn("absolute bottom-0 left-0 w-[280px] md:w-[320px] h-[180px] md:h-[200px] rounded-2xl shadow-2xl transform md:-translate-x-4 translate-y-4 flex flex-col items-center justify-center z-10 border border-white/20 bg-gradient-to-br backdrop-blur-md p-6 text-center", theme.gradientFrom.replace('from-', 'from-gray-900/90'), theme.gradientTo.replace('to-', 'to-gray-900/90'))}>
                        
                        {/* Icon */}
                        <div className={cn("mb-4 transform transition-transform duration-500 p-4 rounded-2xl bg-gradient-to-br shadow-inner ring-1 ring-white/20", theme.gradientFrom, theme.gradientTo)}>
                            {theme.icon}
                        </div>
                        
                        <h3 className="text-xl font-bold text-white tracking-widest uppercase drop-shadow-md">
                            COMING SOON
                        </h3>
                    </div>

               </div>
           </div>

       </div>
    </div>
  )
}
