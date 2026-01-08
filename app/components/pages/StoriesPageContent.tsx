"use client"

import React from "react"
import { motion } from "framer-motion"
import LandingHeader from "../../components/LandingHeader"
import Footer from "../../components/Footer"
import Link from "next/link"
import { StarIcon, UserCircleIcon, GlobeAmericasIcon } from "@heroicons/react/24/solid"
import { CurrencyDollarIcon, ChatBubbleBottomCenterTextIcon, ShieldCheckIcon } from "@heroicons/react/24/outline"

export default function StoriesPageContent() {
  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Freelance Designer",
      country: "United Kingdom",
      quote: "I was skeptical at first, but the marketplace allowed me to connect with real clients looking for logo designs. It's become a reliable side income for me.",
      highlight: "Earned $450 last month",
      type: "Marketplace"
    },
    {
      name: "Ahmed Hassan",
      role: "Student",
      country: "Egypt",
      quote: "The micro-tasks are perfect for my schedule. I can log in between classes, complete a few surveys, and see my balance grow instantly.",
      highlight: "Completed 200+ Tasks",
      type: "Tasks"
    },
    {
      name: "Maria Rodriguez",
      role: "Digital Marketer",
      country: "Spain",
      quote: "The referral system is the most transparent I've seen. I built a team of 50 active members and the dashboard makes it easy to track commissions.",
      highlight: "Team Leader Level 2",
      type: "Referrals"
    },
    {
      name: "David Chen",
      role: "Software Engineer",
      country: "Singapore",
      quote: "I love the Mudaraba pools. It feels good to know my capital is being used in ethical ventures rather than just sitting in a bank account.",
      highlight: "Active Investor",
      type: "Investment"
    },
    {
      name: "Priya Patel",
      role: "Stay-at-home Mom",
      country: "India",
      quote: "LetsEarnify gave me a way to contribute to my family's finances without leaving the house. The withdrawals are always on time.",
      highlight: "verified_user",
      type: "General"
    },
    {
      name: "Michael O'Connor",
      role: "Part-time Worker",
      country: "Ireland",
      quote: "Customer support actually replies here. I had an issue with a deposit and they sorted it out within 3 hours. Trust is earned, and they earned mine.",
      highlight: "5-Star Support",
      type: "Support"
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <LandingHeader />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative py-20 px-6 text-center overflow-hidden">
           <div className="absolute inset-0 bg-gray-50 -z-10"></div>
           <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-indigo-100 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 opacity-50"></div>
           
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             className="max-w-3xl mx-auto relative z-10"
           >
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-6 shadow-sm">
               <StarIcon className="w-4 h-4 text-yellow-400" />
               Success Stories
             </div>
             <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
               Real People. <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">Real Results.</span>
             </h1>
             <p className="text-lg md:text-xl text-gray-500 leading-relaxed">
               Join thousands of users worldwide who are building their financial freedom with LetsEarnify. Here are some of their stories.
             </p>
           </motion.div>
        </section>

        {/* Testimonials Grid */}
        <section className="py-20 px-6 bg-white">
           <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((item, idx) => (
                 <motion.div
                   key={idx}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.5, delay: idx * 0.1 }}
                   className="flex flex-col h-full p-8 rounded-3xl border border-gray-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group"
                 >
                    <div className="absolute top-8 right-8 text-6xl font-serif text-indigo-50 opacity-50 group-hover:opacity-100 transition-opacity">"</div>
                    
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                          <UserCircleIcon className="w-7 h-7" />
                       </div>
                       <div>
                          <div className="font-bold text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                             <span>{item.role}</span> • <span>{item.country}</span>
                          </div>
                       </div>
                    </div>

                    {/* Quote */}
                    <blockquote className="text-gray-600 leading-relaxed mb-8 flex-1 relative z-10">
                       {item.quote}
                    </blockquote>

                    {/* Footer / Stats */}
                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                       <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wide">
                          {item.type}
                       </span>
                       {item.highlight !== "verified_user" && (
                          <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                             <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                             {item.highlight}
                          </span>
                       )}
                    </div>
                 </motion.div>
              ))}
           </div>
        </section>

        {/* Global Community Section */}
        <section className="py-24 px-6 bg-gray-900 text-white relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-purple-900/40"></div>
           <div className="max-w-5xl mx-auto text-center relative z-10">
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-16">A Global Community</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                 <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <ChatBubbleBottomCenterTextIcon className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
                    <div className="text-3xl font-bold mb-1">15K+</div>
                    <div className="text-gray-400 text-sm">Active Members</div>
                 </div>
                 <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <CurrencyDollarIcon className="w-10 h-10 text-green-400 mx-auto mb-4" />
                    <div className="text-3xl font-bold mb-1">$500K+</div>
                    <div className="text-gray-400 text-sm">Total Paid Out</div>
                 </div>
                 <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="text-4xl mb-4">🌍</div>
                    <div className="text-3xl font-bold mb-1">120+</div>
                    <div className="text-gray-400 text-sm">Countries Supported</div>
                 </div>
                 <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <StarIcon className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                    <div className="text-3xl font-bold mb-1">4.8/5</div>
                    <div className="text-gray-400 text-sm">User Satisfaction</div>
                 </div>
              </div>
           </div>
        </section>
        
        {/* Disclaimer & CTA */}
         <section className="py-20 px-6 bg-gray-50">
            <div className="max-w-3xl mx-auto text-center">
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-12">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                     Disclaimer
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                     Testimonials appearing on this site are received via text, audio, or video submission. They are individual experiences, reflecting real life experiences of those who have used our products/services. However, they are individual results and results do vary. We do not claim that they are typical results that consumers will generally achieve.
                  </p>
               </div>
 
               <h2 className="text-3xl font-bold mb-8">Ready to start your own story?</h2>
               <Link href="/signup">
                  <button className="px-10 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                     Join LetsEarnify Today
                  </button>
               </Link>
            </div>
         </section>

      </main>

      <Footer />
    </div>
  )
}
