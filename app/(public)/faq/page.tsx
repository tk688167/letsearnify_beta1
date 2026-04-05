"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDownIcon, QuestionMarkCircleIcon, CurrencyDollarIcon, PresentationChartLineIcon, ShieldCheckIcon, ArrowLeftIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import LandingHeader from "../../components/LandingHeader"

const faqCategories = [
  {
    id: "general",
    name: "General & Activation",
    icon: <QuestionMarkCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
    faqs: [
      {
        q: "What is Let'sEarnify and how does it work?",
        a: (
          <div className="space-y-3">
            <p><strong>Let'sEarnify</strong> is a unified digital earning platform created to bridge the gap between active and passive income generation.</p>
            <p>Instead of relying on a single, isolated source of income, we combine <strong>5 distinct earning streams</strong> into one cohesive ecosystem. You activate your account once, and you get lifetime access to all features, eliminating the need to hustle across different websites.</p>
          </div>
        )
      },
      {
        q: "Is there really a single $1 fee? Are there hidden subscriptions?",
        a: (
          <div className="space-y-3">
            <p className="font-medium text-foreground">Yes. There are absolutely no monthly subscriptions, hidden fees, or premium tiers.</p>
            <p>Your one-time <strong>$1 activation fee</strong> serves a critical purpose:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-muted-foreground">
              <li>It permanently unlocks the entire platform.</li>
              <li>It acts as a filter to keep out bots and spammers.</li>
              <li>It ensures our community consists of real, dedicated earners, maximizing value for everyone.</li>
            </ul>
          </div>
        )
      },
      {
        q: "How fast can I start earning after activation?",
        a: (
          <div className="space-y-2">
            <p><strong>Immediately.</strong> As soon as your $1 transaction is confirmed by the network, your dashboard is fully unlocked.</p>
            <p>You can instantly begin completing daily micro-tasks, spinning the daily reward wheel, or inviting others to earn compounding commissions without any waiting periods.</p>
          </div>
        )
      }
    ]
  },
  {
    id: "streams",
    name: "Income Streams",
    icon: <PresentationChartLineIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
    faqs: [
      {
        q: "What are the 5 Income Streams?",
        a: (
          <div className="space-y-4">
            <p>Our platform offers a comprehensive multi-channel approach to earning. Once activated, you have access to the following 5 streams:</p>
            <div className="space-y-3 ml-2 border-l-2 border-primary/20 pl-4 py-1">
              <div>
                <span className="font-bold text-foreground">1. Referral Matrix</span>
                <p className="text-sm mt-1 mb-2 text-muted-foreground">Build your network and earn instant, compounding commissions up to 10 levels deep.</p>
              </div>
              <div>
                <span className="font-bold text-foreground">2. Micro-Tasks</span>
                <p className="text-sm mt-1 mb-2 text-muted-foreground">Perform simple digital actions (watching ads, testing apps, clicking reels) for immediate, active daily income.</p>
              </div>
              <div>
                <span className="font-bold text-foreground">3. Islamic Mudaraba Pools</span>
                <p className="text-sm mt-1 mb-2 text-muted-foreground">Participate in Shariah-compliant, ethically derived weekly passive yield investments.</p>
              </div>
              <div>
                <span className="font-bold text-foreground">4. Freelance Marketplace</span>
                <p className="text-sm mt-1 mb-2 text-muted-foreground">Offer your digital skills globally and connect with clients using our built-in secure escrow.</p>
              </div>
              <div>
                <span className="font-bold text-foreground">5. Spin & Win</span>
                <p className="text-sm mt-1 text-muted-foreground">Log in daily to spin the gamified reward wheel for random bonuses, multipliers, and cash prizes.</p>
              </div>
            </div>
          </div>
        )
      },
      {
        q: "How does the Mudaraba Investment Pool work?",
        a: (
          <div className="space-y-3">
            <p><strong>Mudaraba</strong> is an ethical, Islamic profit-sharing agreement. It operates entirely differently from fixed-interest (Riba) platforms.</p>
            <ul className="list-disc pl-5 space-y-2 mt-2 text-muted-foreground">
              <li>You provide the capital (acting as the <em>Rabb-ul-Mal</em>).</li>
              <li>We, or our audited institutional partners, deploy it into real-world, transparent economic activities (acting as the <em>Mudarib</em>).</li>
              <li>Profits generated from these activities are distributed weekly between you and the platform at a pre-agreed ratio.</li>
              <li>If there is a genuine loss, it is borne by the capital provider, ensuring true economic alignment and ethical compliance.</li>
            </ul>
          </div>
        )
      },
      {
        q: "What kind of Micro-Tasks will I be doing?",
        a: (
          <div className="space-y-2">
            <p>The Micro-Task engine is designed for absolute simplicity. Tasks generally take between 30 seconds to 3 minutes and include:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Watching short promotional videos or reels.</li>
              <li>Testing and reviewing new mobile applications.</li>
              <li>Engaging with verified social media content.</li>
            </ul>
            <p className="mt-2 text-primary font-medium text-sm">You are paid instantly to your Wallet upon automated task verification.</p>
          </div>
        )
      }
    ]
  },
  {
    id: "payments",
    name: "Payments & Withdrawals",
    icon: <CurrencyDollarIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
    faqs: [
      {
        q: "How do I withdraw my earnings?",
        a: (
          <div className="space-y-2">
            <p>Requesting a withdrawal is straightforward from your Wallet dashboard.</p>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>Ensure your active balance meets the minimum withdrawal threshold.</li>
              <li>Navigate to the "Withdraw" section in your Wallet.</li>
              <li>Select your preferred payout method and enter the amount.</li>
              <li>Confirm your credentials. Funds are processed securely and swiftly.</li>
            </ol>
          </div>
        )
      },
      {
        q: "What payment methods do you support?",
        a: (
          <div className="space-y-3">
            <p>We believe in global accessibility, so we support a wide range of secure payment gateways:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-muted-foreground">
              <li><strong className="text-foreground">Cryptocurrency:</strong> USDT (TRC20, BEP20), Binance Pay</li>
              <li><strong className="text-foreground">Global Fiat:</strong> Stripe, PayPal, Wise, Direct Bank Transfer</li>
              <li><strong className="text-foreground">Local Fiat (PK):</strong> EasyPaisa, JazzCash, Nayapay, Sadapay</li>
            </ul>
          </div>
        )
      },
      {
        q: "Are there any hidden fees for withdrawing?",
        a: (
          <div className="space-y-2">
            <p><strong>We charge ZERO platform fees on your withdrawals.</strong></p>
            <p className="text-muted-foreground">However, please note that standard network or processor fees applied by independent third parties (like TRC20 blockchain gas fees, or Bank Transfer processing fees) are outside of our control and may be deducted from the final amount by the provider.</p>
          </div>
        )
      }
    ]
  },
  {
    id: "security",
    name: "Trust & Security",
    icon: <ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
    faqs: [
      {
        q: "How secure is my personal and financial information?",
        a: (
          <div className="space-y-2">
            <p>Security is our absolute highest priority. We employ enterprise-level infrastructure:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Bank-grade 256-bit SSL encryption across all data streams.</li>
              <li>Secure cold storage for digital assets to prevent online exposure.</li>
              <li>Multi-factor authentication (MFA) to protect user accounts.</li>
              <li>Regular automated penetration testing and architecture audits.</li>
            </ul>
          </div>
        )
      },
      {
        q: "Is the platform compliant with Islamic Finance?",
        a: (
          <div className="space-y-3">
            <p className="font-medium text-emerald-600 dark:text-emerald-400">Yes, our investment architecture is strictly Shariah-compliant.</p>
            <p className="text-muted-foreground">Our investment pools operate purely on the Mudaraba (profit-sharing) model. We absolutely do not engage in fixed-interest (Riba) lending, speculative trading (Gharar), or any prohibited (Haram) economic activities.</p>
          </div>
        )
      }
    ]
  }
]

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("general")
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const activeCategoryData = faqCategories.find((c: any) => c.id === activeCategory)

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary pb-20 relative overflow-x-hidden">
      <LandingHeader />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-fuchsia-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 md:pt-32">
        
        {/* The Main Container Box */}
        <div className="bg-card/40 backdrop-blur-xl border border-border/80 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl p-4 sm:p-8 md:p-12 relative overflow-hidden">
          
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

          <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
          
          {/* Header Section */}
          <div className="text-center mb-8 md:mb-12 relative z-10 px-4 mt-8 sm:mt-0">            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-serif font-black mb-3 tracking-tight flex items-center justify-center gap-2 flex-wrap"
            >
              <span className="text-foreground">Frequently Asked</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500">
                Questions
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground/80 max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed"
            >
              Everything you need to know about the ecosystem, the $1 model, and maximizing your 5 streams.
            </motion.p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start relative z-10">
            {/* Categories Sidebar */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full md:w-1/3 flex flex-row md:flex-col gap-2.5 overflow-x-auto md:overflow-visible pb-3 md:pb-0 scrollbar-hide shrink-0 md:sticky md:top-28"
            >
              {faqCategories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id)
                      setOpenFaq(null)
                    }}
                    className={`flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 min-w-[110px] sm:min-w-[140px] md:min-w-0 border group relative overflow-hidden flex-1 md:flex-none text-center sm:text-left ${
                      isActive 
                        ? "bg-primary text-primary-foreground border-primary shadow-[0_4px_20px_rgb(99,102,241,0.2)] scale-[1.02]" 
                        : "bg-background/50 text-foreground/70 border-border/70 hover:border-primary/30 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                    )}
                    
                    <div className={`p-1.5 sm:p-2 rounded-lg transition-colors shrink-0 mx-auto sm:mx-0 ${isActive ? "bg-white/20" : "bg-card group-hover:bg-primary/10 group-hover:text-primary"}`}>
                      {cat.icon}
                    </div>
                    <span className="relative z-10 w-full">{cat.name}</span>
                  </button>
                )
              })}
            </motion.div>

            {/* FAQs Content */}
            <div className="w-full md:w-2/3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 sm:space-y-4"
                >
                  {activeCategoryData?.faqs.map((faq, idx) => {
                    const isOpen = openFaq === `${activeCategory}-${idx}`
                    return (
                      <motion.div 
                        key={idx}
                        className={`border rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 ${
                          isOpen 
                            ? "bg-background/80 border-primary/40 shadow-md ring-1 ring-primary/10" 
                            : "bg-background/40 border-border/60 hover:border-primary/20 hover:bg-background/60"
                        }`}
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : `${activeCategory}-${idx}`)}
                          className="w-full flex items-center justify-between p-4 sm:p-5 text-left group gap-4"
                        >
                          <span className={`font-bold text-sm sm:text-base leading-snug transition-colors ${isOpen ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"}`}>
                            {faq.q}
                          </span>
                          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${isOpen ? "bg-primary/10" : "bg-muted/60 group-hover:bg-primary/5"}`}>
                            <ChevronDownIcon 
                              className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 ${
                                isOpen ? "rotate-180 text-primary" : "text-muted-foreground group-hover:text-primary"
                              }`} 
                            />
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 sm:p-5 pt-0 text-muted-foreground/90 text-xs sm:text-sm leading-relaxed border-t border-border/30 mt-1">
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </AnimatePresence>
              
              {/* Bottom Support CTA inside Box */}
              <div className="mt-8 sm:mt-10 p-5 sm:p-6 bg-primary/5 border border-primary/10 rounded-xl sm:rounded-2xl text-center flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left text-sm sm:text-base font-semibold text-foreground/90">
                  Still have questions?
                  <p className="text-xs sm:text-sm font-normal text-muted-foreground mt-0.5">Our support is available 24/7.</p>
                </div>
                <Link 
                  href="/support" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-xl font-bold text-xs sm:text-sm hover:bg-foreground/90 shadow-sm transition-all group"
                >
                  Contact Support
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
