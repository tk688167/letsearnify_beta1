"use client"

import React from "react"
import { motion } from "framer-motion"
import LandingHeader from "../../components/LandingHeader"
import Footer from "../layout/Footer"
import InlineBackButton from "../ui/InlineBackButton"
import { 
  ShieldCheckIcon, 
  ChartBarIcon, 
  AdjustmentsHorizontalIcon, 
  WrenchScrewdriverIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline"

export default function CookiesPageContent() {
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
                <DocumentTextIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                <span className="text-[10px] sm:text-xs font-bold text-foreground/80 tracking-[0.1em] uppercase">Tracking & Usage</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-[2rem] leading-[1.1] sm:text-5xl md:text-6xl font-serif font-black text-foreground mb-3 sm:mb-6 tracking-tight flex flex-col sm:block"
              >
                <span>Cookie </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500">Policy.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-[13px] sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-1 sm:px-2"
              >
                 Transparency is key in everything we do. Find out exactly how we use cookies and tracking technologies to power your experience and secure your account.
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

        {/* Content Area - Compressed & Responsive Grid */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 space-y-4 sm:space-y-6">
           
           {/* Section 1: What are Cookies */}
           <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card/80 dark:bg-card/40 backdrop-blur-md p-6 sm:p-10 rounded-[1.25rem] sm:rounded-[2rem] border border-border/60 dark:border-white/5 shadow-lg group hover:border-indigo-500/30 transition-colors"
           >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                 <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex-shrink-0">
                    <DocumentTextIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                 </div>
                 <h2 className="text-xl sm:text-3xl font-bold text-foreground tracking-tight">1. What Are <span className="text-primary">Cookies?</span></h2>
              </div>
              <div className="space-y-3 sm:space-y-4 text-[13.5px] sm:text-[15px] text-muted-foreground leading-relaxed">
                 <p>
                    Cookies are small text files placed on your computer or mobile device when you visit websites. They act as a memory for the website, allowing it to remember your device and preferences.
                 </p>
                 <p>
                    <strong className="text-foreground">We use cookies responsibly.</strong> LetsEarnify utilizes cookies strictly to keep sessions secure, ensure the proper functioning of the site, and collect analytical data to improve our services.
                 </p>
              </div>
           </motion.div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Section 2: Essential & Security Cookies */}
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.1 }}
                 className="bg-card/80 dark:bg-card/40 backdrop-blur-md p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] border border-border/60 dark:border-white/5 shadow-lg group hover:border-emerald-500/30 transition-colors"
              >
                 <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                       <ShieldCheckIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">2. Strictly Essential</h2>
                 </div>
                 <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed">
                    Some cookies are absolute requirements for the operation of our platform. They enable you to log into secure areas of our website, utilize a shopping cart or make use of e-billing services securely.
                 </p>
                 <p className="text-[13px] sm:text-base text-emerald-500 font-medium leading-relaxed mt-2">
                    Without these, the safety and performance of your $1 Activation cannot be authenticated.
                 </p>
              </motion.div>

              {/* Section 3: Analytical & Performance */}
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2 }}
                 className="bg-card/80 dark:bg-card/40 backdrop-blur-md p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] border border-border/60 dark:border-white/5 shadow-lg group hover:border-fuchsia-500/30 transition-colors"
              >
                 <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                       <ChartBarIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">3. Performance Tracking</h2>
                 </div>
                 <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed">
                    We utilize analytics cookies to recognize and count the number of visitors and see how visitors navigate around our website. 
                 </p>
                 <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed mt-2">
                    This helps us <strong className="text-foreground">eliminate slow pages and improve the user journey, ensuring a highly responsive and gamified experience without lag.</strong> All data is aggregated and anonymized.
                 </p>
              </motion.div>

              {/* Section 4: Preferences & Usage */}
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.3 }}
                 className="bg-card/80 dark:bg-card/40 backdrop-blur-md p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] border border-border/60 dark:border-white/5 shadow-lg group hover:border-amber-500/30 transition-colors"
              >
                 <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                       <AdjustmentsHorizontalIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">4. Functionality</h2>
                 </div>
                 <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed">
                    Used to recognize you when you return to our website. This permits us to tailor our content for you, greet you by name and memorize your preferences.
                 </p>
                 <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed mt-2">
                    Examples include respecting your <strong className="text-foreground">Light/Dark Mode toggle preferences</strong> across device reloads.
                 </p>
              </motion.div>

              {/* Section 5: Managing Cookies */}
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.4 }}
                 className="bg-card/80 dark:bg-card/40 backdrop-blur-md p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] border border-border/60 dark:border-white/5 shadow-lg group hover:border-cyan-500/30 transition-colors"
              >
                 <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                       <WrenchScrewdriverIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">5. Cookie Management</h2>
                 </div>
                 <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed">
                    You can actively manage cookies through your web browser network configurations or clear them from your system entirely.
                 </p>
                 <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed mt-2">
                    <strong className="text-foreground">Be advised:</strong> Blocking all cookies natively from your browser may severely impact the security and core login functionality of your LetsEarnify accounts.
                 </p>
              </motion.div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
