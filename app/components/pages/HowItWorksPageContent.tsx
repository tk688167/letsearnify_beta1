"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import LandingHeader from "@/app/components/LandingHeader"
import Footer from "@/app/components/layout/Footer"
import InlineBackButton from "@/app/components/ui/InlineBackButton"
import { 
  UserPlusIcon, 
  CurrencyDollarIcon, 
  BriefcaseIcon,
  SparklesIcon,
  BanknotesIcon,
  ArrowRightIcon,
  RocketLaunchIcon
} from "@heroicons/react/24/outline"

export default function HowItWorksPageContent() {
  
  const steps = [
    {
      id: "01",
      title: "Registration",
      description: "Sign up securely and choose your initial membership tier. Each tier dictates your earning multipliers and pool access.",
      icon: UserPlusIcon,
      color: "blue",
      tags: ["Secure Verification", "Zero Hidden Fees", "Instant Access"]
    },
    {
      id: "02",
      title: "Funding & Activation",
      description: "Deposit funds into your secure platform wallet. A strictly defined percentage of all network deposits is automatically allocated to fuel the Reward Pools.",
      icon: CurrencyDollarIcon,
      color: "emerald",
      tags: ["Multiple Gateways", "Transparent Fees", "Instant Crediting"]
    },
    {
      id: "03",
      title: "Active Earning",
      description: "Start generating direct income by completing micro-tasks, engaging in the freelance market, or expanding your network through our Unilevel referral system.",
      icon: BriefcaseIcon,
      color: "violet",
      tags: ["Daily Tasks", "Freelance Gigs", "Level 1-5 Referrals"]
    },
    {
      id: "04",
      title: "Automated Rewards",
      description: "Gain access to passive income streams. Our smart algorithms distribute platform revenue through the CBSP, Royalty, Achievement, and Mudaraba Pools.",
      icon: SparklesIcon,
      color: "amber",
      tags: ["CBSP (Weekly)", "Royalty (Monthly)", "Instant Milestones"]
    },
    {
      id: "05",
      title: "Secure Withdrawals",
      description: "Cash out your combined active and passive earnings via localized payment methods (JazzCash, EasyPaisa, Bank Transfer) or global crypto options.",
      icon: BanknotesIcon,
      color: "rose",
      tags: ["24-48hr Processing", "Low Flat Fees", "Full Audit Logs"]
    }
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col font-sans selection:bg-primary/30">
      
      {/* Ambient Animated Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-fuchsia-500/10 blur-[120px] mix-blend-screen animate-pulse-slow object-right" style={{ animationDelay: '2s' }}></div>
      </div>

      <LandingHeader />

      <main className="flex-grow pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 md:px-6 z-10 w-full flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/40 backdrop-blur-xl border border-border/80 rounded-3xl sm:rounded-[2.5rem] shadow-2xl p-5 sm:p-10 md:p-12 relative overflow-hidden flex flex-col h-full"
          >
            {/* Header Area */}
            <div className="mb-8 sm:mb-12 text-center flex-shrink-0">
              <div className="w-full flex justify-start mb-4">
                 <InlineBackButton />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg mb-4 shadow-sm mx-auto">
                <RocketLaunchIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span className="leading-none">Platform Ecosystem</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-3 sm:mb-4 tracking-tight leading-tight">
                How It Works
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                Our platform bridges active network expansion with automated passive distributions. Follow the journey below.
              </p>
            </div>

            {/* Steps Grid - Designed to fit neatly within a single page view */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 flex-grow items-stretch w-full">
              {steps.map((step, index) => {
                return (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group flex flex-col text-left"
                  >
                    
                    {/* Accent Glow Top Corner */}
                    <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40 pointer-events-none ${getColorClasses(step.color).glow}`}></div>

                    {/* Step Header */}
                    <div className="flex items-center gap-4 mb-4 relative z-10 border-b border-border/30 pb-4">
                      <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border shadow-sm group-hover:scale-105 transition-transform duration-300 ${getColorClasses(step.color).bgAccent}`}>
                        <step.icon className={`w-6 h-6 ${getColorClasses(step.color).iconText}`} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-0.5">Step {step.id}</div>
                        <h3 className="text-lg font-bold text-foreground leading-tight">{step.title}</h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-grow relative z-10">
                      {step.description}
                    </p>

                    {/* Tags Section */}
                    <div className="flex flex-wrap gap-2 mt-5 relative z-10 pt-4 border-t border-border/10">
                      {step.tags.map((tag, idx) => (
                        <span key={idx} className={`inline-flex items-center px-2 py-1 rounded border text-[10px] sm:text-[11px] font-semibold bg-background/50 backdrop-blur-md ${getColorClasses(step.color).tagBorder} ${getColorClasses(step.color).tagText}`}>
                          {tag}
                        </span>
                      ))}
                    </div>

                  </motion.div>
                )
              })}
            </div>

            {/* Bottom CTA (Compact) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 sm:mt-12 text-center"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link 
                  href="/register" 
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-primary-foreground text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none"
                >
                  Create Free Account
                </Link>
                <Link 
                  href="/login" 
                  className="w-full sm:w-auto px-6 py-2.5 bg-secondary/80 hover:bg-secondary text-secondary-foreground text-sm font-bold rounded-xl border border-border/50 hover:border-border transition-all flex items-center justify-center gap-2"
                >
                  Sign In 
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

          </motion.div>
        
        </div>
      </main>

      <Footer />
    </div>
  )
}

function getColorClasses(color: string) {
  const map: Record<string, any> = {
    blue: {
      bgAccent: "bg-blue-500/10 border-blue-500/20",
      iconText: "text-blue-500",
      glow: "bg-blue-500",
      tagText: "text-blue-600 dark:text-blue-400",
      tagBorder: "border-blue-500/20"
    },
    emerald: {
      bgAccent: "bg-emerald-500/10 border-emerald-500/20",
      iconText: "text-emerald-500",
      glow: "bg-emerald-500",
      tagText: "text-emerald-600 dark:text-emerald-400",
      tagBorder: "border-emerald-500/20"
    },
    violet: {
      bgAccent: "bg-violet-500/10 border-violet-500/20",
      iconText: "text-violet-500",
      glow: "bg-violet-500",
      tagText: "text-violet-600 dark:text-violet-400",
      tagBorder: "border-violet-500/20"
    },
    amber: {
      bgAccent: "bg-amber-500/10 border-amber-500/20",
      iconText: "text-amber-500",
      glow: "bg-amber-500",
      tagText: "text-amber-600 dark:text-amber-400",
      tagBorder: "border-amber-500/20"
    },
    rose: {
      bgAccent: "bg-rose-500/10 border-rose-500/20",
      iconText: "text-rose-500",
      glow: "bg-rose-500",
      tagText: "text-rose-600 dark:text-rose-400",
      tagBorder: "border-rose-500/20"
    }
  }
  return map[color] || map.blue
}
