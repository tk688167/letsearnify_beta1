"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import LandingHeader from "../LandingHeader"
import Footer from "../layout/Footer"
import InlineBackButton from "../ui/InlineBackButton"
import { 
  ShieldCheckIcon, LockClosedIcon, ServerIcon, KeyIcon, 
  DocumentTextIcon, EyeSlashIcon, DocumentCheckIcon, UserGroupIcon 
} from "@heroicons/react/24/outline"

export default function SecurityPageContent() {
  const [activeTab, setActiveTab] = useState<'security' | 'privacy'>('security')

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      <LandingHeader />

      <main className="flex-1 pt-20 pb-20 sm:pt-24 sm:pb-24 relative overflow-hidden">
        {/* Background Accents (Optimized for Dark Mode) */}
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
                <ShieldCheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                <span className="text-[10px] sm:text-xs font-bold text-foreground/80 tracking-[0.1em] uppercase">Trust & Safety Core</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-[2rem] leading-[1.1] sm:text-5xl md:text-6xl font-serif font-black text-foreground mb-3 sm:mb-6 tracking-tight flex flex-col sm:block"
              >
                <span>Security & </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500">Privacy</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-[13px] sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-1 sm:px-2"
              >
                 Your data, privacy, and financial assets are protected by enterprise-grade infrastructure and transparent policies.
              </motion.p>
           </div>
        </section>

        {/* Tab Navigation */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8 sm:mb-16 relative z-10">
          <div className="flex p-1.5 bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border/60 dark:border-border/80 rounded-2xl w-full max-w-md mx-auto relative shadow-md">
            <button 
              onClick={() => setActiveTab('security')}
              className={`relative flex-1 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold transition-all z-10 flex items-center justify-center gap-2 ${activeTab === 'security' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Security Center
            </button>
            <button 
              onClick={() => setActiveTab('privacy')}
              className={`relative flex-1 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold transition-all z-10 flex items-center justify-center gap-2 ${activeTab === 'privacy' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Privacy Policy
            </button>
            {/* Sliding Active Tab Background */}
            <div 
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primary/10 border border-primary/20 rounded-xl transition-transform duration-300 ease-in-out"
              style={{ transform: activeTab === 'privacy' ? 'translateX(calc(100% + 12px))' : 'translateX(0)' }}
            />
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <AnimatePresence mode="wait">
            
            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6"
              >
                {[
                  { title: "Account Protection", icon: ShieldCheckIcon, desc: "We use robust authentication and real-time login monitoring to prevent unauthorized access. All sensitive actions require verification.", color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
                  { title: "Data Encryption", icon: LockClosedIcon, desc: "Your personal data is encrypted at rest and in transit using military-grade AES-256 encryption. We never store plain-text passwords.", color: "text-fuchsia-500", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20" },
                  { title: "Secure Infrastructure", icon: ServerIcon, desc: "Hosted in resilient data centers with 24/7 endpoint monitoring, DDoS protection, and automated backups to ensure reliable 99.9% uptime.", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                  { title: "Financial Security", icon: KeyIcon, desc: "Funds are kept in cold storage environments. Our internal transaction workflows employ strict manual and automated checks to prevent fraud.", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" }
                ].map((item, idx) => {
                  const Icon = item.icon
                  return (
                  <div key={idx} className="bg-card/80 dark:bg-card/40 backdrop-blur-md p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] border border-border/60 dark:border-white/5 shadow-lg hover:border-primary/40 dark:hover:border-primary/40 hover:-translate-y-1 transition-all group">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-6">
                        <div className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl ${item.bg} ${item.color} border ${item.border} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 h-5 sm:w-8 sm:h-8" />
                        </div>
                        <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">{item.title}</h2>
                    </div>
                    <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed">
                        {item.desc}
                    </p>
                  </div>
                )})}
              </motion.div>
            )}

            {/* PRIVACY TAB */}
            {activeTab === 'privacy' && (
              <motion.div 
                key="privacy"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.4 }}
                className="bg-card/80 dark:bg-card/40 backdrop-blur-2xl border border-border/80 dark:border-white/5 rounded-[1.5rem] sm:rounded-[3rem] p-5 sm:p-12 shadow-2xl relative overflow-hidden"
              >
                {/* Decorative fade for privacy box */}
                <div className="absolute top-0 right-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-primary/5 rounded-full blur-[60px] sm:blur-[100px] -translate-x-1/4 -translate-y-1/4 pointer-events-none" />

                <div className="mb-8 sm:mb-14 text-center relative z-10 px-1 sm:px-0">
                  <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    Strict Privacy Standard
                  </div>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black text-foreground mb-3 sm:mb-4 tracking-tight">You Own Your Data.</h2>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed px-2 sm:px-0">
                    Transparency is the foundation of trust. We only collect what is strictly necessary to run the platform, and <strong className="text-foreground">we never sell your personal information.</strong>
                  </p>
                </div>

                {/* Compressed 3-Column Policy Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 relative z-10">
                  
                  {/* Item 1 */}
                  <div className="bg-background/80 dark:bg-background/50 border border-border/60 p-4 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] hover:border-blue-500/30 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <EyeSlashIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground mb-1.5 sm:mb-2">Minimal Data</h3>
                    <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                      We collect just your email, country, encrypted password, and ledger history. No external tracking.
                    </p>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-background/80 dark:bg-background/50 border border-border/60 p-4 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] hover:border-emerald-500/30 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <DocumentCheckIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground mb-1.5 sm:mb-2">Platform Use Only</h3>
                    <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                      Your data is exclusively used to secure your account, process legitimate withdrawals, and notify you of alerts.
                    </p>
                  </div>

                  {/* Item 3 */}
                  <div className="bg-background/80 dark:bg-background/50 border border-border/60 p-4 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] hover:border-amber-500/30 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <UserGroupIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground mb-1.5 sm:mb-2">Zero Selling</h3>
                    <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                      We temporarily share vital data with payment gateways strictly via encrypted APIs. We never sell your data.
                    </p>
                  </div>

                </div>

                {/* Contact & Footer Snippet */}
                <div className="mt-6 sm:mt-12 pt-5 sm:pt-8 border-t border-border/60 text-center relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 flex-wrap">
                  <p className="text-[11px] sm:text-[13px] text-muted-foreground text-center sm:text-left w-full sm:w-auto">
                    Questions about our privacy? Email <a href="mailto:privacy@letsearnify.com" className="text-primary font-bold hover:underline">privacy@letsearnify.com</a>
                  </p>
                  <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] bg-background/80 dark:bg-background/50 px-3 py-1.5 rounded-lg border border-border/50">
                    Effective: Jan 1, 2026
                  </span>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  )
}
