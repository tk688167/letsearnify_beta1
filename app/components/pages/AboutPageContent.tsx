"use client"

import React from "react"
import { motion } from "framer-motion"
import LandingHeader from "../../components/LandingHeader"
import Link from "next/link"
import InlineBackButton from "../ui/InlineBackButton"
import { ArrowRightIcon, CheckCircleIcon, TrophyIcon, UserGroupIcon, HeartIcon } from "@heroicons/react/24/outline"

export default function AboutPageContent() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <LandingHeader />

      <main className="flex-1 pt-24">
        {/* Back Navigation */}
        <div className="max-w-7xl mx-auto px-6 pb-4">
           <InlineBackButton />
        </div>

        {/* Hero Section */}
        <section className="relative py-16 md:py-32 px-6 overflow-hidden bg-gray-50">
           {/* Background Elements */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60"></div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold uppercase tracking-wider text-gray-500 mb-6 shadow-sm"
            >
              <span>Our Story</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-8 leading-tight"
            >
              Building a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">Transparent</span> Digital Economy
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto"
            >
              LetsEarnify was built on a simple premise: <span className="text-gray-900 font-medium">digital earning should be accessible, honest, and free from empty promises.</span>
            </motion.p>
          </div>
        </section>

        {/* The Problem & Solution */}
        <section className="py-20 px-6 md:px-12 bg-white">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6">
                  <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">The Origin</span>
                  <h2 className="text-3xl font-serif font-bold mt-2">Bridging the Trust Gap</h2>
                  <p className="text-gray-400 text-lg italic mt-2">"We didn't just build a platform; we engineered a solution to digital inequality."</p>
              </div>
              
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  The digital earning landscape has long been plagued by opacity, where users are often seen as commodities rather than partners. We observed a market saturated with empty promises, hidden fees, and unsustainable "get-rich-quick" schemes that prey on hope.
                </p>
                <p>
                  LetsEarnify was born from a desire to restore dignity to digital work. We engaged financial experts and ethical compliance advisors to design a system where every dollar is accounted for. By integrating the transparency of Mudaraba principles with the efficiency of modern gig-economy tech, we created a hybrid model that works for everyone.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-shadow duration-500"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-200 transition-colors"></div>
               <h3 className="text-2xl font-bold mb-2">The LetsEarnify Standard</h3>
               <p className="text-gray-500 mb-6 text-sm font-medium">Real value creation. Real rewards.</p>
               
               <ul className="space-y-4">
                 {[
                   "No exaggerated income claims",
                   "Sustainable revenue models",
                   "Transparent fee structures",
                   "Verifiable blockchain payouts"
                 ].map((item, i) => (
                   <li key={i} className="flex items-start gap-3">
                     <span className="mt-1 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">✓</span>
                     <span className="text-gray-700">{item}</span>
                   </li>
                 ))}
               </ul>
            </motion.div>
          </div>
        </section>

        {/* How It Works (High Level) */}
        <section className="py-24 px-6 bg-gray-900 text-white relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 pointer-events-none"></div>
           <div className="max-w-7xl mx-auto relative z-10">
             <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">The Ecosystem Engine</h2>
               <p className="text-gray-400 max-w-2xl mx-auto text-lg">No magic algorithms. Just robust math connecting value creators with rewards.</p>
             </div>

             <div className="grid md:grid-cols-3 gap-8">
               <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                 <div className="text-4xl mb-6">🤝</div>
                 <h3 className="text-xl font-bold mb-4">Community & Network</h3>
                 <p className="text-gray-400 leading-relaxed">
                   We built a structured referral network where growth benefits everyone. Active members earn commissions by helping the community expand, fostering a collaborative environment.
                 </p>
               </div>
               <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                 <div className="text-4xl mb-6">💼</div>
                 <h3 className="text-xl font-bold mb-4">Active Earnings</h3>
                 <p className="text-gray-400 leading-relaxed">
                   Users earn by completing verified micro-tasks or offering digital services in the marketplace. Advertisers get real engagement, and freelancers get paid fairly.
                 </p>
               </div>
               <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                 <div className="text-4xl mb-6">📈</div>
                 <h3 className="text-xl font-bold mb-4">Ethical Growth</h3>
                 <p className="text-gray-400 leading-relaxed">
                   Through our Mudaraba pools, users can participate in profit-sharing. Capital is deployed into real profitable ventures, and returns are distributed based on pre-agreed ratios.
                 </p>
               </div>
             </div>
           </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
             <div className="grid md:grid-cols-2 gap-12">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="p-10 rounded-[2rem] bg-indigo-50 border border-indigo-100"
               >
                 <span className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-2 block">Mission</span>
                 <h3 className="text-3xl font-serif font-bold text-gray-900 mb-6">Democratizing Earnings</h3>
                 <p className="text-gray-600 text-lg leading-relaxed">
                   To provide a secure, accessible, and diversified digital earning platform for anyone, anywhere—regardless of their starting capital or technical expertise.
                 </p>
               </motion.div>
               
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.1 }}
                 className="p-10 rounded-[2rem] bg-fuchsia-50 border border-fuchsia-100"
               >
                 <span className="text-fuchsia-600 font-bold uppercase tracking-widest text-sm mb-2 block">Vision</span>
                 <h3 className="text-3xl font-serif font-bold text-gray-900 mb-6">A Global Digital Hub</h3>
                 <p className="text-gray-600 text-lg leading-relaxed">
                   To become the world's most trusted ecosystem for micro-entrepreneurship, setting the standard for transparency and user-centric design in the fintech industry.
                 </p>
               </motion.div>
             </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-24 px-6 bg-gray-50 border-t border-gray-100">
           <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-16">Our Core Values</h2>
              <div className="grid md:grid-cols-3 gap-12">
                 <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl border border-gray-100">⚖️</div>
                    <h3 className="text-xl font-bold">Unwavering Fairness</h3>
                    <p className="text-gray-500">We believe in equal opportunity. Rules apply to everyone, and rewards are strictly based on contribution and performance.</p>
                 </div>
                 <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl border border-gray-100">🔍</div>
                    <h3 className="text-xl font-bold">Total Transparency</h3>
                    <p className="text-gray-500">Hidden fees and confusing terms destroy trust. We keep our processes, fees, and mechanisms open and clear.</p>
                 </div>
                 <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl border border-gray-100">🛡️</div>
                    <h3 className="text-xl font-bold">User-First Security</h3>
                    <p className="text-gray-500">Protecting your data and earnings is our top priority. We employ enterprise-grade security protocols.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-white text-center">
           <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Join a platform built on trust.</h2>
              <Link href="/signup">
                 <button className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 inline-flex items-center gap-2">
                    Start Your Journey
                    <ArrowRightIcon className="w-5 h-5" />
                 </button>
              </Link>
           </div>
        </section>
      </main>

      {/* Footer Reuse (Simplified for this page or just link back) */}
      <footer className="bg-gray-50 py-12 text-center text-gray-400 text-sm border-t border-gray-200">
        <p>© {new Date().getFullYear()} LetsEarnify. All rights reserved.</p>
      </footer>
    </div>
  )
}
