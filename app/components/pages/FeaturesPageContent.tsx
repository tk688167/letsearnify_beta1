"use client"

import React from "react"
import { motion } from "framer-motion"
import LandingHeader from "../../components/LandingHeader"
import Link from "next/link"
import { CurrencyDollarIcon, UserGroupIcon, BriefcaseIcon, CheckBadgeIcon, ArrowRightIcon } from "@heroicons/react/24/outline"

export default function FeaturesPageContent() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <LandingHeader />

      <main className="flex-1 pt-24">
        {/* Header */}
        <section className="py-20 px-6 text-center bg-gray-50 border-b border-gray-100">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             className="max-w-4xl mx-auto"
           >
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
                 Explore <span className="text-indigo-600">LetsEarnify Features</span>
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                 A comprehensive ecosystem designed to maximize your earning potential through four distinct pillars.
              </p>
           </motion.div>
        </section>

        {/* Feature 1: Task Center */}
        <FeatureSection 
           id="tasks"
           title="Micro-Task Center"
           subtitle="Earn Online Rewards Instantly"
           desc="Turn your spare time into cash. Complete simple, verified tasks for advertisers—like watching videos, taking surveys, or testing apps—and get paid immediately upon approval."
           points={["Instant Payouts", "No Experience Needed", "High Volume of Tasks"]}
           icon={<CheckBadgeIcon className="w-8 h-8 text-white" />}
           color="bg-emerald-500"
           reversed={false}
           imgGradient="from-emerald-50 to-teal-50"
        />

        {/* Feature 2: Investment Pools */}
        <FeatureSection 
           id="pools"
           title="Mudaraba Investment Pools"
           subtitle="Ethical Passive Growth"
           desc="Participate in our profit-sharing pools based on the principles of Mudaraba. Your capital is professionally managed in real-world ventures, and profits are shared transparently."
           points={["Sharia-Compliant Model", "Weekly Profit Distribution", "Low Entry Barrier ($10)"]}
           icon={<CurrencyDollarIcon className="w-8 h-8 text-white" />}
           color="bg-amber-500"
           reversed={true}
           imgGradient="from-amber-50 to-orange-50"
        />

        {/* Feature 3: Freelance Marketplace */}
        <FeatureSection 
           id="freelance"
           title="Freelance Marketplace"
           subtitle="Monetize Your Professional Skills"
           desc="Offer your services to a global audience. Whether you are a designer, writer, or developer, our secure escrow marketplace ensures you get paid for your hard work."
           points={["Secure Escrow System", "Global Client Base", "Low Platform Fees"]}
           icon={<BriefcaseIcon className="w-8 h-8 text-white" />}
           color="bg-purple-500"
           reversed={false}
           imgGradient="from-purple-50 to-fuchsia-50"
        />

        {/* Feature 4: Referral Program */}
        <FeatureSection 
           id="referral"
           title="Referral Network"
           subtitle="Earn from Community Growth"
           desc="Build your team and earn commissions from their activity. Our sustainable multi-tier system rewards you for bringing active, valuable members to the platform."
           points={["Multi-Tier Commissions", "Recurring Revenue", "Marketing Tools Included"]}
           icon={<UserGroupIcon className="w-8 h-8 text-white" />}
           color="bg-blue-500"
           reversed={true}
           imgGradient="from-blue-50 to-indigo-50"
        />

        {/* CTA */}
        <section className="py-24 px-6 bg-gray-900 text-white text-center">
            <div className="max-w-3xl mx-auto">
               <h2 className="text-3xl font-bold mb-8">Ready to start earning?</h2>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <Link href="/signup">
                      <button className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:-translate-y-1">
                         Create Free Account
                      </button>
                   </Link>
                   <Link href="/proofs">
                      <button className="px-8 py-4 border border-gray-700 text-gray-300 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all">
                         See Proof of Payments
                      </button>
                   </Link>
               </div>
            </div>
        </section>

      </main>

      <footer className="bg-gray-50 py-12 text-center text-gray-400 text-sm border-t border-gray-200">
        <p>© {new Date().getFullYear()} LetsEarnify. All rights reserved.</p>
      </footer>
    </div>
  )
}

function FeatureSection({ id, title, subtitle, desc, points, icon, color, reversed, imgGradient }: any) {
    return (
        <section id={id} className={`py-20 px-6 ${reversed ? 'bg-gray-50' : 'bg-white'}`}>
           <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
              <motion.div 
                 initial={{ opacity: 0, x: reversed ? 30 : -30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
                 className={`${reversed ? 'md:order-2' : ''}`}
              >
                 <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mb-6 shadow-lg`}>
                    {icon}
                 </div>
                 <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">{title}</h2>
                 <p className="text-lg text-indigo-600 font-medium mb-6 uppercase tracking-wide text-xs">{subtitle}</p>
                 <p className="text-gray-500 text-lg leading-relaxed mb-8">
                    {desc}
                 </p>
                 <ul className="space-y-4">
                    {points.map((point: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                           <CheckCircleIcon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
                           {point}
                        </li>
                    ))}
                 </ul>
              </motion.div>
              
              <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
                 className={`relative h-[400px] rounded-[2.5rem] bg-gradient-to-br ${imgGradient} border border-gray-100 flex items-center justify-center overflow-hidden ${reversed ? 'md:order-1' : ''}`}
              >
                 <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
                 <div className="relative z-10 text-center p-8">
                    <span className="text-9xl opacity-20 filter blur-sm select-none grayscale transition-all hover:grayscale-0 hover:opacity-40 hover:blur-0 duration-700 cursor-default">
                        {title.charAt(0)}
                    </span>
                 </div>
              </motion.div>
           </div>
        </section>
    )
}

function CheckCircleIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}
