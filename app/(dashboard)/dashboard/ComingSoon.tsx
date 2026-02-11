"use client"

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import { CommandLineIcon, WrenchScrewdriverIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import { CpuChipIcon, CurrencyDollarIcon, CheckBadgeIcon, BriefcaseIcon, UserGroupIcon, BellAlertIcon } from "@heroicons/react/24/solid"
import { joinWaitlist } from "@/app/actions/waitlist"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

const featureData: any = {
    tasks: {
        title: "Micro-Task Center",
        subtitle: "Earn Online Rewards",
        description: "Turn your spare time into cash. Complete simple, verified tasks like watching videos or taking surveys and get paid instantly.",
        benefits: ["Instant Payouts", "No Experience Needed", "High Volume of Tasks"],
        icon: CheckBadgeIcon,
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        accent: "emerald"
    },
    pools: {
        title: "Mudaraba Investment Pools",
        subtitle: "Ethical Passive Growth",
        description: "Participate in profit-sharing pools based on Mudaraba principles. Your capital is professionally managed in real-world ventures.",
        benefits: ["Sharia-Compliant Model", "Weekly Profit Distribution", "Low Entry Barrier ($10)"],
        icon: CurrencyDollarIcon,
        color: "text-amber-600 bg-amber-50 border-amber-100",
        accent: "amber"
    },
    marketplace: {
        title: "Freelance Marketplace",
        subtitle: "Monetize Your Skills",
        description: "Offer your services to a global audience. Whether you are a designer, writer, or developer, our secure escrow system ensures you get paid.",
        benefits: ["Secure Escrow System", "Global Client Base", "Low Platform Fees"],
        icon: BriefcaseIcon,
        color: "text-purple-600 bg-purple-50 border-purple-100",
        accent: "purple"
    },
    default: {
        title: "Feature In Development",
        subtitle: "Under Construction",
        description: "Our engineers are currently building this feature. Expect a secure, automated, and high-yield experience.",
        benefits: ["Enhanced Security", "Automated Workflows", "Premium Support"],
        icon: WrenchScrewdriverIcon,
        color: "text-gray-600 bg-gray-50 border-gray-100",
        accent: "gray"
    }
}

export function ComingSoon({ feature = 'default', config }: { feature?: string, config?: any }) {
  const content = featureData[feature] || featureData['default']
  const Icon = content.icon
  const [isPending, startTransition] = useTransition()
  const [joined, setJoined] = useState(false)

  const handleJoinWaitlist = () => {
      startTransition(async () => {
          const result = await joinWaitlist(content.title)
          if (result.success) {
              setJoined(true)
              toast.success("You're on the list! Check your email.")
          } else {
              toast.error(result.error || "Something went wrong.")
          }
      })
  }

  // Define dynamic styles based on accent color
  const accentStyles: any = {
      emerald: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      amber: "from-amber-500/20 via-amber-500/5 to-transparent",
      purple: "from-purple-500/20 via-purple-500/5 to-transparent",
      gray: "from-gray-500/20 via-gray-500/5 to-transparent",
  }
  
  const textStyles: any = {
      emerald: "text-emerald-600",
      amber: "text-amber-600",
      purple: "text-purple-600",
      gray: "text-gray-600",
  }

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center p-4 md:p-8 bg-white overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm group">
       
       {/* Modern Animated Gradient Background */}
       <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 transition-all duration-1000", accentStyles[content.accent])}></div>
       <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]"></div>

       {/* Floating Orbs */}
       <div className={cn("absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60", 
           content.accent === 'emerald' ? 'bg-emerald-100' : 
           content.accent === 'amber' ? 'bg-amber-100' : 
           content.accent === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
       )}></div>
       <div className={cn("absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60",
           content.accent === 'emerald' ? 'bg-teal-100' : 
           content.accent === 'amber' ? 'bg-orange-100' : 
           content.accent === 'purple' ? 'bg-fuchsia-100' : 'bg-slate-100'
       )}></div>

       <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.6, ease: "easeOut" }}
         className="relative z-10 max-w-2xl w-full text-center"
       >
           {/* Icon & Status */}
           <div className="flex flex-col items-center mb-6 md:mb-8">
               <div className={cn("w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center mb-6 shadow-xl border-4 border-white backdrop-blur-xl bg-white/50 ring-1 ring-gray-100 transform transition-transform group-hover:scale-105 duration-500", textStyles[content.accent])}>
                   <Icon className="w-10 h-10 md:w-12 md:h-12" />
               </div>
               
               <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-gray-900/95 backdrop-blur text-white rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-xl border border-white/10 group-hover:scale-105 transition-transform">
                   <WrenchScrewdriverIcon className="w-3.5 h-3.5 text-amber-400" />
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-100">
                       In Development
                   </span>
               </div>
           </div>

           {/* Content */}
           <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-3 tracking-tight">
               {content.title}
           </h2>
           <p className={cn("text-xs md:text-sm font-bold uppercase tracking-widest mb-6", textStyles[content.accent])}>
               {content.subtitle}
           </p>
           
           <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-8 md:mb-10 max-w-lg mx-auto px-4 md:px-0">
               {content.description}
           </p>

           {/* Mobile-Responsive Benefits Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10 text-left px-2 md:px-0">
               {content.benefits.map((benefit: string, i: number) => (
                   <div key={i} className="p-3 md:p-4 bg-white/60 backdrop-blur-md rounded-xl border border-white/50 shadow-sm hover:shadow-md transition-all flex flex-row sm:flex-col items-center sm:text-center gap-3">
                       <div className={cn("p-1.5 md:p-2 rounded-full bg-white shadow-sm shrink-0", textStyles[content.accent])}>
                            <CheckCircleIcon className="w-4 h-4 md:w-5 md:h-5"/>
                       </div>
                       <span className="text-sm font-bold text-gray-700">{benefit}</span>
                   </div>
               ))}
           </div>

           {/* Notify Action */}
           <div className="max-w-xs mx-auto px-4 md:px-0">
                <button 
                    onClick={handleJoinWaitlist}
                    disabled={isPending || joined}
                    className={cn(
                        "w-full py-3.5 md:py-4 rounded-xl text-sm md:text-base font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5",
                        joined 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default" 
                            : "bg-gray-900 text-white hover:bg-black hover:scale-[1.02] border border-gray-800"
                    )}
                >
                    {isPending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : joined ? (
                        <>
                            <CheckCircleIcon className="w-5 h-5"/>
                            Waitlist Joined!
                        </>
                    ) : (
                        <>
                            <BellAlertIcon className="w-5 h-5 text-orange-400 group-hover:animate-swing"/>
                            Notify Me When Live
                        </>
                    )}
                </button>
                {joined && (
                    <p className="mt-3 text-xs text-gray-400 animate-in fade-in slide-in-from-top-1">
                        Confirmation email sent to your inbox.
                    </p>
                )}
           </div>

       </motion.div>
    </div>
  )
}

