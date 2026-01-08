"use client"

import React from "react"
import { motion } from "framer-motion"
import LandingHeader from "../../components/LandingHeader"
import Footer from "../../components/Footer"
import Link from "next/link"
import { LockClosedIcon, ShieldCheckIcon, ServerIcon, EyeSlashIcon, KeyIcon, CreditCardIcon } from "@heroicons/react/24/outline"

export default function SecurityPageContent() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <LandingHeader />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative py-20 px-6 text-center overflow-hidden bg-gray-900 text-white">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50"></div>
           {/* Animated Lock Glint */}
           <motion.div 
             animate={{ x: [0, 100, 0], opacity: [0, 0.5, 0] }}
             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
             className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
           />

           <div className="max-w-3xl mx-auto relative z-10">
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5 }}
               className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-8 border border-green-500/30"
             >
               <LockClosedIcon className="w-10 h-10 text-green-400" />
             </motion.div>
             <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               className="text-4xl md:text-6xl font-serif font-bold mb-6"
             >
               Your Security is <br/> <span className="text-green-400">Our Priority.</span>
             </motion.h1>
             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto"
             >
               We employ enterprise-grade security measures to protect your data, earnings, and identity.
             </motion.p>
           </div>
        </section>

        {/* Core Security Pillars */}
        <section className="py-24 px-6 bg-white">
           <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
              <SecurityCard 
                 icon={<ServerIcon className="w-8 h-8 text-indigo-600" />}
                 title="Secure Infrastructure"
                 desc="Our platform is hosted on verifiably secure cloud infrastructure (Vercel) with 24/7 uptime monitoring and DDoS protection."
                 delay={0}
              />
              <SecurityCard 
                 icon={<LockClosedIcon className="w-8 h-8 text-green-600" />}
                 title="HTTPS Encryption"
                 desc="All data transmitted between your device and our servers is encrypted using industry-standard TSL/SSL protocols."
                 delay={0.1}
              />
              <SecurityCard 
                 icon={<EyeSlashIcon className="w-8 h-8 text-purple-600" />}
                 title="Data Privacy"
                 desc="We never sell your personal data. Your information is strictly used for account verification and service delivery."
                 delay={0.2}
              />
           </div>
        </section>

        {/* Payment Security Detail */}
        <section className="py-24 px-6 bg-gray-50 border-t border-gray-100">
           <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                 <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                 >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-600 mb-6">
                       <CreditCardIcon className="w-4 h-4" />
                       Transaction Safety
                    </div>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Verified Payments</h2>
                    <p className="text-gray-500 text-lg leading-relaxed mb-8">
                       We utilize blockchain technology for transparent and verifiable financial interactions.
                    </p>
                    <ul className="space-y-6">
                       <li className="flex gap-4">
                          <div className="shrink-0 w-12 h-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-xl shadow-sm">⛓️</div>
                          <div>
                             <h3 className="font-bold text-gray-900">Blockchain Verified</h3>
                             <p className="text-sm text-gray-500">Deposits and withdrawals via TRC-20 are verified directly on the blockchain ledger, ensuring proof of transaction.</p>
                          </div>
                       </li>
                       <li className="flex gap-4">
                          <div className="shrink-0 w-12 h-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-xl shadow-sm">🚫</div>
                          <div>
                             <h3 className="font-bold text-gray-900">No Hidden Access</h3>
                             <p className="text-sm text-gray-500">We do not store your private keys or wallet passwords. You retain full control of your external crypto assets.</p>
                          </div>
                       </li>
                    </ul>
                 </motion.div>
                 
                 <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                    <h3 className="font-bold text-lg mb-6 text-center">Supported Security Standards</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-gray-50 rounded-xl flex flex-col items-center text-center gap-2 hover:bg-green-50 transition-colors cursor-default">
                          <LockClosedIcon className="w-8 h-8 text-green-600" />
                          <span className="font-bold text-sm text-gray-700">SSL Secure</span>
                       </div>
                       <div className="p-4 bg-gray-50 rounded-xl flex flex-col items-center text-center gap-2 hover:bg-blue-50 transition-colors cursor-default">
                          <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
                          <span className="font-bold text-sm text-gray-700">Fraud Protection</span>
                       </div>
                       <div className="p-4 bg-gray-50 rounded-xl flex flex-col items-center text-center gap-2 hover:bg-indigo-50 transition-colors cursor-default">
                          <KeyIcon className="w-8 h-8 text-indigo-600" />
                          <span className="font-bold text-sm text-gray-700">Encrypted Data</span>
                       </div>
                       <div className="p-4 bg-gray-50 rounded-xl flex flex-col items-center text-center gap-2 hover:bg-orange-50 transition-colors cursor-default">
                          <span className="text-2xl">⚡</span>
                          <span className="font-bold text-sm text-gray-700">Instant Alerts</span>
                       </div>
                    </div>
                 </motion.div>
              </div>
           </div>
        </section>

        {/* User Data Statement */}
        <section className="py-24 px-6 bg-white text-center">
           <div className="max-w-3xl mx-auto">
              <ShieldCheckIcon className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-6">Our Promise to You</h2>
              <p className="text-xl text-gray-500 leading-relaxed mb-10">
                 "We prioritize user safety and platform security above all else. We will never ask for your password via email, and we conduct regular audits to ensure our systems remain impenetrable."
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Link href="/privacy">
                    <button className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                       Privacy Policy
                    </button>
                 </Link>
                 <Link href="/support">
                    <button className="px-8 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors">
                       Contact Security Team
                    </button>
                 </Link>
              </div>
           </div>
        </section>

      </main>

      {/* Standard Footer */}
      <Footer />
    </div>
  )
}

function SecurityCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
   return (
      <motion.div 
         initial={{ opacity: 0, y: 30 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true }}
         transition={{ duration: 0.5, delay }}
         className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
         <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
            {icon}
         </div>
         <h3 className="font-bold text-xl mb-4 text-gray-900">{title}</h3>
         <p className="text-gray-500 leading-relaxed text-sm">
            {desc}
         </p>
      </motion.div>
   )
}
