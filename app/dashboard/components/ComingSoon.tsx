"use client"

import { RocketLaunchIcon, XMarkIcon, LockClosedIcon, ClockIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { SectionWatermark } from "./SectionWatermark"

import { ComingSoonConfig, SectionConfig } from "@/app/actions/admin/settings"

interface ComingSoonProps {
    title?: string;
    feature?: keyof ComingSoonConfig;
    config?: ComingSoonConfig;
}

export function ComingSoon({ title, feature = 'default', config }: ComingSoonProps) {
  const router = useRouter()
  
  // Select specific config or fallback to defaults
  const sectionConfig: SectionConfig | undefined = config ? config[feature] : undefined

  // Defaults
  const displayTitle = sectionConfig?.title || title || "Coming Soon"
  const description = sectionConfig?.description || "In Development – Coming Soon. This feature will be available in the near future. Stay tuned!"
  const showIcon = sectionConfig?.showIcon ?? true
  const iconType = sectionConfig?.iconType || "rocket"
  const gradientFrom = sectionConfig?.gradientFrom || "from-[#121212]"
  const gradientTo = sectionConfig?.gradientTo || "to-[#1E1E2F]"

  const renderIcon = () => {
    switch (iconType) {
      case "lock": return <LockClosedIcon className="w-10 h-10 text-white" />
      case "clock": return <ClockIcon className="w-10 h-10 text-white" />
      case "construction": return <WrenchScrewdriverIcon className="w-10 h-10 text-white" />
      default: return <RocketLaunchIcon className="w-10 h-10 text-white" />
    }
  }

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center p-4 md:p-8">
       
       {/* Main Card Container - Matches Reference "Dark Card" */}
       <div className="w-full max-w-6xl bg-[#09090b] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col lg:flex-row min-h-[500px]">
           
           {/* Global Glow Effects (Subtle) */}
           <div className={cn("absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 pointer-events-none translate-x-1/2 -translate-y-1/2", gradientFrom.replace('from-', 'bg-'))}></div>
           <div className={cn("absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[150px] opacity-10 pointer-events-none -translate-x-1/2 translate-y-1/2", gradientTo.replace('to-', 'bg-'))}></div>


           {/* Left Column: Content */}
           <div className="relative z-10 flex-1 p-6 md:p-12 lg:p-16 flex flex-col justify-center items-start space-y-6 md:space-y-8 overflow-hidden">
               
               {/* Watermark - Huge Background Text */}
               <h1 className="absolute top-1/2 left-0 -translate-y-1/2 text-[60px] md:text-[100px] lg:text-[150px] leading-none font-black text-white/[0.03] select-none pointer-events-none whitespace-nowrap z-0">
                   {sectionConfig?.watermarkText || "COMING SOON"}
               </h1>

               {/* Badge */}
               <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-blue-200/70">
                   <span>In-Development Feature</span>
                   <span className="cursor-help text-blue-200/50" title="Coming Soon">ⓘ</span>
               </div>

               {/* Typography */}
               <div className="relative z-10 space-y-4">
                   <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-xl">
                       {displayTitle}
                   </h2>
                   <p className="text-[#CCCCCC] text-base md:text-lg leading-relaxed max-w-md font-medium">
                       {description}
                   </p>
               </div>

               {/* Benefits List (FTMO Style) */}
               <ul className="space-y-3">
                   {[
                       "Early Access soon",
                       "Premium features unlocking",
                       "Enhanced earning potential"
                   ].map((item, i) => (
                       <li key={i} className="flex items-center gap-3 text-gray-300 font-medium text-sm md:text-base">
                           <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                               <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                           </div>
                           {item}
                       </li>
                   ))}
               </ul>

               {/* CTA Link */}
               <button 
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-blue-500 font-bold hover:text-blue-400 transition-colors group mt-2 text-sm md:text-base p-2 -ml-2 rounded-lg touch-manipulation"
               >
                   Go Back
                   <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
               </button>
           </div>


           {/* Right Column: Visuals (Glowing Cards) */}
           <div className="relative flex-1 min-h-[350px] lg:min-h-0 bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center overflow-hidden py-12 md:py-0">
               
               {/* Center Glow behind cards */}
               <div className={cn("absolute w-64 h-64 rounded-full blur-[100px] opacity-60 animate-pulse", gradientFrom.replace('from-', 'bg-'))}></div>

               {/* 3D Cards Simulation */}
               <div className="relative w-full max-w-xs md:max-w-sm h-64 transform perspective-1000 rotate-y-12 rotate-x-6 scale-90 md:scale-100">
                    
                    {/* Card 1 (Back/Right) */}
                    <div className={cn("absolute top-0 right-0 w-[240px] md:w-[280px] h-[150px] md:h-[180px] rounded-2xl border border-white/10 shadow-2xl transform translate-x-8 md:translate-x-12 -translate-y-8 flex items-center justify-center", gradientTo.replace('to-', 'bg-').replace('950','900'), "bg-opacity-50 backdrop-blur-xl")}>
                        <div className="text-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-white/20 rotate-45 mx-auto mb-2"></div>
                            <SectionWatermark section={
                                feature === 'tasks' ? "Task" : 
                                feature === 'pools' ? "Mudaraba" : 
                                feature === 'marketplace' ? "Marketplace" : 
                                "Prime"
                            } />
                        </div>
                    </div>

                    {/* Card 2 (Front/Left) - "Supreme" */}
                    <div className={cn("absolute bottom-0 left-0 w-[260px] md:w-[300px] h-[160px] md:h-[190px] rounded-2xl shadow-2xl transform -translate-x-2 md:-translate-x-4 translate-y-4 flex items-center justify-center z-10 border border-white/20", gradientFrom.replace('from-', 'bg-').replace('950','900'))}>
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 rounded-2xl"></div>
                        
                        <div className="text-center z-10 px-4">
                            {showIcon && (
                                <div className="mb-3 transform hover:scale-110 transition-transform duration-500 inline-block">
                                    {renderIcon()}
                                </div>
                            )}
                            <h3 className="text-xl md:text-2xl font-bold text-white tracking-widest uppercase drop-shadow-md animate-fadeIn">
                                COMING SOON
                            </h3>
                            <style>{`
                                @keyframes fadeIn {
                                0% { opacity: 0; transform: translateY(20px); }
                                100% { opacity: 1; transform: translateY(0); }
                                }

                                .animate-fadeIn {
                                animation: fadeIn 1s ease-out forwards;
                                }
                            `}</style>
                        </div>
                    </div>

               </div>
           </div>

       </div>
    </div>
  )
}
