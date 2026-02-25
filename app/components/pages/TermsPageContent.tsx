"use client"

import React from "react"
import { motion } from "framer-motion"
import LandingHeader from "../../components/LandingHeader"
import Footer from "../layout/Footer"
import InlineBackButton from "../ui/InlineBackButton"
import { 
  CurrencyDollarIcon, 
  UsersIcon, 
  SparklesIcon, 
  ShieldCheckIcon,
  TicketIcon,
  BanknotesIcon 
} from "@heroicons/react/24/outline"

export default function TermsPageContent() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      <LandingHeader />

      <main className="flex-1 pt-20 pb-20 sm:pt-24 sm:pb-24 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-[80px] sm:blur-[120px] mix-blend-normal dark:mix-blend-screen" />
          <div className="absolute top-[15%] right-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-fuchsia-500/10 dark:bg-fuchsia-500/10 rounded-full blur-[80px] sm:blur-[120px] mix-blend-normal dark:mix-blend-screen" />
        </div>

        {/* Back Navigation */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 mb-4 sm:mb-6">
           <InlineBackButton label="Back to Platform" />
        </div>

        {/* Page Header */}
        <section className="pt-4 pb-10 sm:pt-8 sm:pb-16 px-4 sm:px-6 text-center relative z-10">
           <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-card/60 dark:bg-card/40 backdrop-blur-md border border-border/50 dark:border-white/10 rounded-full mb-5 sm:mb-6 mx-auto shadow-sm"
              >
                <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                <span className="text-[10px] sm:text-xs font-bold text-foreground/80 tracking-[0.1em] uppercase">100% Clarity Promise</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-[2rem] leading-[1.1] sm:text-5xl md:text-6xl font-serif font-black text-foreground mb-3 sm:mb-6 tracking-tight flex flex-col sm:block"
              >
                <span>Transparent </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500">Disclosure.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-[13px] sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-1 sm:px-2"
              >
                 No hidden fees. No confusing jargon. We believe you have the absolute right to know exactly how our financial mechanics operate.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-6 sm:mt-8 inline-block px-4 py-1.5 rounded-lg bg-background/50 dark:bg-card/30 border border-border/50 text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest"
              >
                 Last Updated: Feb 2026
              </motion.div>
           </div>
        </section>

        {/* Content Area - Compressed & Responsive Grid */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 space-y-4 sm:space-y-6">
           
           {/* Section 1: The Activation Model */}
           <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card/80 dark:bg-card/40 backdrop-blur-md p-6 sm:p-10 rounded-[1.25rem] sm:rounded-[2rem] border border-border/60 dark:border-white/5 shadow-lg group hover:border-indigo-500/30 transition-colors"
           >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                 <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex-shrink-0">
                    <CurrencyDollarIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                 </div>
                 <h2 className="text-xl sm:text-3xl font-bold text-foreground tracking-tight">1. The <span className="text-primary">$1 Activation</span> Model</h2>
              </div>
              <div className="space-y-3 sm:space-y-4 text-[13.5px] sm:text-[15px] text-muted-foreground leading-relaxed">
                 <p>
                    LetsEarnify operates on a <strong className="text-foreground">Strict Active-User Model</strong>. To maintain the highest quality network and prevent automated bots from draining community pools, a one-time <strong className="text-primary">$1 Activation Fee</strong> is required.
                 </p>
                 <p>
                    <strong className="text-foreground">This is NOT an investment.</strong> It is an anti-abuse mechanism acting as a permanent license for your account. We do not provide fixed ROI (Return on Investment) or passive trading yields. Your earnings are strictly a reflection of your active participation, networking, and task engagement on the platform.
                 </p>
              </div>
           </motion.div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Section 2: 100% Community Distribution */}
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.1 }}
                 className="bg-card/80 dark:bg-card/40 backdrop-blur-md p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] border border-border/60 dark:border-white/5 shadow-lg group hover:border-emerald-500/30 transition-colors"
              >
                 <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                       <UsersIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">2. Pool Distribution</h2>
                 </div>
                 <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                    We strictly return <strong className="text-emerald-500">100% of activation fees</strong> back to the community ecosystem. The platform solely monetizes through merchant task integrations and external ad revenues.
                 </p>
                 <ul className="list-none space-y-2 text-[12px] sm:text-[14px] text-muted-foreground">
                    <li className="flex items-start gap-2">
                       <span className="text-emerald-500 mt-0.5">•</span>
                       <span><strong className="text-foreground">Direct Referrals:</strong> Immediate rewards for network expansion.</span>
                    </li>
                    <li className="flex items-start gap-2">
                       <span className="text-emerald-500 mt-0.5">•</span>
                       <span><strong className="text-foreground">CBSP (Mudaraba):</strong> Ethical profit-sharing based on Islamic financial principles.</span>
                    </li>
                    <li className="flex items-start gap-2">
                       <span className="text-emerald-500 mt-0.5">•</span>
                       <span><strong className="text-foreground">Royalty & Achievement:</strong> Dedicated pools honoring top performers and leaders.</span>
                    </li>
                 </ul>
              </motion.div>

              {/* Section 3: Gamified Mechanics */}
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2 }}
                 className="bg-card/80 dark:bg-card/40 backdrop-blur-md p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] border border-border/60 dark:border-white/5 shadow-lg group hover:border-fuchsia-500/30 transition-colors"
              >
                 <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                       <TicketIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">3. Gamified Mechanics</h2>
                 </div>
                 <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed">
                    Earnings generated through micro-tasks, surveys, tracking, or the <strong className="text-foreground">Spin Wheel</strong> are dynamic. 
                 </p>
                 <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed mt-2">
                    Variables such as global advertising fill rates, merchant budgets, and daily platform traffic dictate the actual fiat value of the rewards. <strong>These values will fluctuate naturally.</strong>
                 </p>
              </motion.div>
           </div>

           {/* Section 4: Security & Withdrawals */}
           <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-card/80 dark:bg-card/40 backdrop-blur-md p-6 sm:p-10 rounded-[1.25rem] sm:rounded-[2rem] border border-border/60 dark:border-white/5 shadow-lg group hover:border-amber-500/30 transition-colors"
           >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                 <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex-shrink-0">
                    <BanknotesIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                 </div>
                 <h2 className="text-xl sm:text-3xl font-bold text-foreground tracking-tight">4. Accurate <span className="text-amber-500">Withdrawals</span></h2>
              </div>
              <div className="space-y-3 sm:space-y-4 text-[13.5px] sm:text-[15px] text-muted-foreground leading-relaxed">
                 <p>
                    All withdrawals are processed securely through established gateway channels (e.g., EasyPaisa, JazzCash, USDT, Bank Transfers). 
                 </p>
                 <p>
                    <strong className="text-foreground">Platform Integrity:</strong> We strictly maintain the right to audit accounts prior to withdrawal approvals. The deployment of automated engagement scripts, multi-accounting manipulation, or VPN-based abuse constitutes a permanent breach of terms and will result in immediate ledger forfeiture. We keep the platform clean so honest earners thrive.
                 </p>
              </div>
           </motion.div>

           {/* Verification Disclaimer */}
           <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-6 sm:mt-10 bg-primary/5 dark:bg-primary/10 border border-primary/20 p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] text-center flex flex-col items-center justify-center gap-3"
           >
              <ShieldCheckIcon className="w-8 h-8 text-primary" />
              <h3 className="text-[15px] sm:text-lg font-bold text-foreground">Our Commitment to You</h3>
              <p className="text-[12px] sm:text-[14px] text-muted-foreground max-w-2xl">
                 LetsEarnify is built for the community. We provide the ethical tools, transparency, and systems—you provide the effort. If you ever have a dispute or clarification request, our team is always ready to assist transparently.
              </p>
           </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
