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
    question: "How does the 'Mudaraba' profit-sharing work?",
    answer: "Our Mudaraba pools are based on ethical partnership principles. Capital deposited into these pools is deployed into verified low-risk digital ventures (e.g., ad arbitrage, liquidity provision). Profits generated are then shared between you (the investor) and the platform at a pre-agreed ratio, ensuring transparency and alignment of interests."
  },
  {
    question: "Why is there a $1 subscription fee?",
    answer: "The $1 fee is a one-time activation cost. It serves two purposes: verify user identity to prevent bots/spam accounts, and cover the initial KYC (Know Your Customer) and wallet setup costs. This ensures a high-quality, trusted community for all members."
  },
  {
    question: "Can I withdraw my earnings instantly?",
    answer: "Yes. Once you meet the minimum withdrawal threshold (which varies by method to cover network fees), requests are processed automatically. For security, larger amounts may require a manual review which is typically completed within 24 hours."
  },
  {
    question: "Is my personal data safe?",
    answer: "Absolutely. We employ enterprise-grade encryption for all data transmission and storage. We never sell your personal data to third parties. Our business model relies on transaction volume and service fees, not data monetization."
  }
]

export default function FAQSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <p className="text-gray-500 text-lg">Clear answers to your most common questions.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQItem({ faq }: { faq: { question: string, answer: string } }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-indigo-100 transition-colors">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="font-bold text-lg text-gray-900">{faq.question}</span>
        <ChevronDownIcon 
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-50 mt-2 pt-4">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
