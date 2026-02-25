"use client"

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import LandingHeader from "../../components/LandingHeader"
import Footer from "../layout/Footer"
import { 
  ArrowLeftIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  BriefcaseIcon,
  TicketIcon,
  CurrencyDollarIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline"

export default function AboutPageContent() {
  const earningStreams = [
    {
      title: "1. Referral Matrix",
      description: "Build your active network and earn instant, compounding commissions up to 10 levels deep from every activation.",
      icon: <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-indigo-500",
      bgHover: "hover:border-indigo-500/50 hover:bg-indigo-500/5"
    },
    {
      title: "2. Micro-Tasks",
      description: "Perform simple digital actions like watching ads, testing apps, or taking surveys for immediate daily income.",
      icon: <BriefcaseIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-emerald-500",
      bgHover: "hover:border-emerald-500/50 hover:bg-emerald-500/5"
    },
    {
      title: "3. Mudaraba Pools",
      description: "Participate in Shariah-compliant, ethically derived weekly passive yield investments with profit-sharing.",
      icon: <ArrowTrendingUpIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-fuchsia-500",
      bgHover: "hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5"
    },
    {
      title: "4. Freelance Market",
      description: "Offer your digital skills to a global audience and secure payments seamlessly through our built-in escrow.",
      icon: <GlobeAltIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-amber-500",
      bgHover: "hover:border-amber-500/50 hover:bg-amber-500/5"
    },
    {
      title: "5. Spin & Win",
      description: "Log in daily to spin the gamified reward wheel for random bonuses, cash prizes, and platform multipliers.",
      icon: <TicketIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-rose-500",
      bgHover: "hover:border-rose-500/50 hover:bg-rose-500/5"
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary relative overflow-x-hidden">
      <LandingHeader />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-fuchsia-500/10 rounded-full blur-[120px]" />
      </div>

      <main className="flex-1 relative z-10 pt-24 md:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Main Glassmorphism Container Box */}
          <div className="bg-card/40 backdrop-blur-xl border border-border/80 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-10 md:p-16 relative overflow-hidden">
            
            {/* Subtle Back Button inside the box */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
               <Link 
                 href="/" 
                 className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-lg transition-colors"
               >
                 <ArrowLeftIcon className="w-3.5 h-3.5" />
                 <span className="hidden sm:inline">Back</span>
               </Link>
            </div>

            {/* Decorative Inner Glow */}
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10"></div>
            
            {/* Header Section */}
            <div className="text-center mb-12 sm:mb-16 relative z-10 px-2 mt-6 sm:mt-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-5 shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse relative"></span>
                Official Guide
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl font-serif font-black mb-4 tracking-tight"
              >
                Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500">Mechanics</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground/90 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
              >
                Let'sEarnify is engineered on simple, transparent logic. We eliminate hidden fees and empty promises to deliver a secure ecosystem built entirely around value creation and fair rewards.
              </motion.p>
            </div>

            {/* Section 1: The $1 Ecosystem */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-14 sm:mb-20"
            >
              <div className="flex flex-col lg:flex-row gap-6 sm:gap-10 items-center bg-background/50 border border-border/50 rounded-3xl p-6 sm:p-10 relative overflow-hidden group hover:border-primary/40 transition-colors shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 bg-card rounded-2xl sm:rounded-3xl flex items-center justify-center border border-border shadow-inner relative z-10 transition-transform duration-500 group-hover:scale-105">
                  <CurrencyDollarIcon className="w-8 h-8 sm:w-12 sm:h-12 text-primary drop-shadow-md" />
                </div>
                
                <div className="relative z-10 text-center lg:text-left flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 whitespace-nowrap">The $1 Foundation</h2>
                  <p className="text-sm sm:text-base text-muted-foreground/90 font-medium mb-5 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                    We replaced expensive subscriptions with a strict, one-time $1 activation fee. This micro-transaction serves three critical architectural functions:
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    <div className="bg-card/40 border border-border/40 p-4 rounded-xl">
                      <h4 className="font-bold text-foreground text-sm mb-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Lifetime Access
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Permanently unlocks all 5 income streams with zero recurring or hidden monthly charges.</p>
                    </div>
                    
                    <div className="bg-card/40 border border-border/40 p-4 rounded-xl">
                      <h4 className="font-bold text-foreground text-sm mb-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Quality Control
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Acts as a mandatory financial firewall, instantly restricting bots, spammers, and malicious accounts.</p>
                    </div>

                    <div className="bg-card/40 border border-border/40 p-4 rounded-xl">
                      <h4 className="font-bold text-foreground text-sm mb-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Initial Liquidity
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Funds the internal reward pools, fueling Instant Referral Commissions and Spin & Win prizes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Section 2: The 5 Income Streams */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 sm:mb-20"
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">The 5 Growth Pillars</h2>
                <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                  By diversifying your efforts across active networking, task completion, and passive investments, the ecosystem ensures total stability.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {earningStreams.map((stream, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col p-5 sm:p-6 rounded-2xl border border-border/50 bg-background/40 backdrop-blur-sm transition-all duration-300 hover:shadow-md ${stream.bgHover}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-card shadow-sm border border-border/50 mb-4 ${stream.color}`}>
                      {stream.icon}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">{stream.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {stream.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Section 3: Values & Mission */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                <div className="p-6 sm:p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/20">
                  <h3 className="text-lg sm:text-xl font-bold text-indigo-400 mb-3 flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5" />
                    Absolute Transparency
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    We maintain open policies without hidden clauses. From clearly defined Mudaraba profit-sharing ratios to zero platform withdrawal fees—you keep exactly what you rightfully earn.
                  </p>
                </div>
                
                <div className="p-6 sm:p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20">
                  <h3 className="text-lg sm:text-xl font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <GlobeAltIcon className="w-5 h-5" />
                    Global Accessibility
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Financial empowerment shouldn't be restricted by geography. Our global payment gateways ensure that whether you use Crypto or Local banks, you have identical earning potential.
                  </p>
                </div>
              </div>
            </motion.section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
