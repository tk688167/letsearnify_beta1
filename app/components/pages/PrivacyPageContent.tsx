"use client"

import React from "react"
import { motion } from "framer-motion"
import LandingHeader from "../../components/LandingHeader"
import Footer from "../layout/Footer"
import InlineBackButton from "../ui/InlineBackButton"
import { LockClosedIcon, EyeIcon, CircleStackIcon, ServerIcon } from "@heroicons/react/24/outline"

export default function PrivacyPageContent() {
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
           <InlineBackButton />
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
                <LockClosedIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                <span className="text-[10px] sm:text-xs font-bold text-foreground/80 tracking-[0.1em] uppercase">Data Integrity Standard</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-[2rem] leading-[1.1] sm:text-5xl md:text-6xl font-serif font-black text-foreground mb-3 sm:mb-6 tracking-tight"
              >
                Privacy Is <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500">Not an Option.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-[13px] sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-1 sm:px-2"
              >
                 It's a fundamental right. We collect only what is strictly necessary and never sell your personal data.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-6 sm:mt-8 inline-block px-4 py-1.5 rounded-lg bg-background/50 dark:bg-card/30 border border-border/50 text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest"
              >
                 Effective: Jan 1, 2026
              </motion.div>
           </div>
        </section>

        {/* Content Area - Compressed & Responsive */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Item 1 */}
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="bg-card/80 dark:bg-card/40 backdrop-blur-md p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] border border-border/60 dark:border-white/5 shadow-lg group hover:border-indigo-500/30 transition-colors"
              >
                 <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-6">
                    <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                       <LockClosedIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">1. Data Collection</h2>
                 </div>
                 <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed">
                    We collect minimal identity and financial data strictly required to process legitimate transactions and handle compliance. <strong className="text-foreground">We never store plaintext passwords or credit details.</strong>
                 </p>
              </motion.div>

              {/* Item 2 */}
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.1 }}
                 className="bg-card/80 dark:bg-card/40 backdrop-blur-md p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] border border-border/60 dark:border-white/5 shadow-lg group hover:border-fuchsia-500/30 transition-colors"
              >
                 <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-6">
                    <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                       <EyeIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">2. Zero Selling</h2>
                 </div>
                 <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed">
                    Your data is exclusively used to secure your account and send essential alerts. <strong className="text-foreground">We explicitly promise to never sell your personal data</strong> to advertisers or third-party networks.
                 </p>
              </motion.div>

              {/* Item 3 */}
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2 }}
                 className="bg-card/80 dark:bg-card/40 backdrop-blur-md p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] border border-border/60 dark:border-white/5 shadow-lg group hover:border-emerald-500/30 transition-colors"
              >
                 <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-6">
                    <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                       <CircleStackIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">3. Data Security</h2>
                 </div>
                 <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed">
                    Sensitive data is encrypted end-to-end using AES-256 protocols, both at rest and in transit. Strict internal checks and automated backups prevent unauthorized breaches.
                 </p>
              </motion.div>

              {/* Item 4 */}
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.3 }}
                 className="bg-card/80 dark:bg-card/40 backdrop-blur-md p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] border border-border/60 dark:border-white/5 shadow-lg group hover:border-amber-500/30 transition-colors"
              >
                 <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-6">
                    <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                       <ServerIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">4. Your Data Rights</h2>
                 </div>
                 <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed">
                    You exercise full control over your digital footprint. You have the total right to access, correct, or request the permanent deletion of your account and its ledger associations.
                 </p>
              </motion.div>

           </div>

           {/* Contact Box */}
           <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-6 sm:mt-10 bg-primary/5 dark:bg-primary/10 border border-primary/20 p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] text-center"
           >
              <h3 className="text-[15px] sm:text-lg font-bold text-foreground mb-2">Have specific data questions?</h3>
              <p className="text-[12px] sm:text-[14px] text-muted-foreground">
                 Contact our Data Protection Officer directly at <br className="sm:hidden" />
                 <a href="mailto:privacy@letsearnify.com" className="text-primary font-extrabold hover:underline mt-1 inline-block">privacy@letsearnify.com</a>
              </p>
           </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
