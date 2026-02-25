"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDownIcon } from "@heroicons/react/24/outline"

const faqs = [
  {
    question: "Is LetsEarnify a regulated financial institution?",
    answer: "LetsEarnify operates as a digital services and rewards platform. While we are not a bank, we adhere to strict internal financial controls and use regulated third-party payment processors (like Stripe and major crypto exchanges) to handle all user transactions securely."
  },
  {
    question: "Why does it only cost $1 to join?",
    answer: "Great question — this is central to our model. The $1 is a one-time platform activation fee, not a subscription. It serves two purposes: (1) it filters out bots and low-quality accounts to maintain a healthy, trustworthy community, and (2) it covers initial wallet setup and KYC infrastructure costs. Once you pay it, it's done — permanently. There are no monthly fees, no hidden upgrades, and no premium tiers. Every feature is immediately unlocked."
  },
  {
    question: "How does the 'Mudaraba' profit-sharing work?",
    answer: "Our Mudaraba pools are based on ethical Islamic partnership principles. Capital deposited is deployed into verified, low-risk digital ventures (e.g., ad arbitrage, liquidity provision). Profits generated are shared between you (the investor) and the platform at a pre-agreed ratio — ensuring full transparency and alignment of interests. All distributions occur on a weekly automated cycle."
  },
  {
    question: "Can I withdraw my earnings any time?",
    answer: "Yes. Once you meet the minimum withdrawal threshold (which varies by method to cover network fees), requests are processed automatically. For security, larger amounts may require a manual review which is typically completed within 24 hours. You can withdraw to USDT, Binance Pay, EasyPaisa, JazzCash, and other supported methods."
  },
  {
    question: "What are the 5 income streams?",
    answer: "After your $1 activation, you gain permanent access to: (1) Referral Matrix — earn tiered commissions for every person you introduce; (2) Micro-Task Engine — complete verified digital tasks for instant pay; (3) Mudaraba Investment Pools — earn weekly profit-sharing dividends; (4) Freelance Marketplace — offer your skills to a global client base with built-in escrow; (5) Spin & Win — daily gamified rewards with bonus earnings."
  },
  {
    question: "Is my personal data and account secure?",
    answer: "Absolutely. We employ enterprise-grade 256-bit SSL encryption for all data transmission and storage. Multi-factor authentication is available for every account. We never sell personal data to third parties — our business model relies on platform transaction volume, not data monetization."
  }
]

export default function FAQSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] sm:text-xs mb-4 sm:mb-6 border border-primary/20 uppercase tracking-wider">
            Got Questions?
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-3 sm:mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg px-2">
            Straight answers to the questions we hear most.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} faq={faq} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQItem({ faq, idx }: { faq: { question: string, answer: string }, idx: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: idx * 0.05 }}
      viewport={{ once: true }}
      className={`bg-card rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? "border-primary/30 shadow-md shadow-primary/5" : "border-border hover:border-primary/20"}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left gap-3 sm:gap-4"
      >
        <span className={`font-bold text-sm sm:text-base transition-colors ${isOpen ? "text-primary" : "text-foreground"}`}>
          {faq.question}
        </span>
        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-border flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? "bg-primary border-primary rotate-180" : "bg-card"}`}>
          <ChevronDownIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isOpen ? "text-white" : "text-muted-foreground"}`} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-muted-foreground leading-relaxed text-xs sm:text-sm border-t border-border/50 pt-4">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
