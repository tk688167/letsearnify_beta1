"use client"

import Link from "next/link"
import React, { useEffect, useState, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { XMarkIcon, CheckCircleIcon, CurrencyDollarIcon, UserGroupIcon, StarIcon } from "@heroicons/react/24/outline"
import LandingHeader from "../components/LandingHeader"
import SignupForm from "../components/auth/SignupForm"

// Features Data
const features = [
  {
    title: "Micro-Tasks",
    desc: "Earn instantly by completing simple online tasks like surveys and app testing.",
    icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />
  },
  {
    title: "Mudaraba Pools",
    desc: "Join our ethical profit-sharing pools and let your earnings grow over time.",
    icon: <CurrencyDollarIcon className="w-6 h-6 text-indigo-500" />
  },
  {
    title: "Referral Rewards",
    desc: "Invite friends and earn up to 5% commissions on their activities.",
    icon: <UserGroupIcon className="w-6 h-6 text-purple-500" />
  }
]

function PublicWelcomeContent({ initialRef }: { initialRef?: string }) {
  const searchParams = useSearchParams()
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  
  // Requirement 1: Handle Referral Links dynamically. Default to "COMPANY123"
  // Priority: Prop > URL Param > Default
  const rawRef = initialRef || searchParams.get("ref")
  const refCode = rawRef || "COMPANY123"

   // Requirement 2: Auto-open Sign Up section
  useEffect(() => {
     // Small delay for better UX (let page load first)
     const timer = setTimeout(() => {
        setIsSignupOpen(true)
     }, 1500)
     return () => clearTimeout(timer)
  }, [])

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LetsEarnify",
    "url": "https://www.letsearnify.com",
    "logo": "https://www.letsearnify.com/logo.png",
    "sameAs": [
       "https://facebook.com/letsearnify",
       "https://instagram.com/letsearnify",
       "https://linkedin.com/company/letsearnify"
    ]
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <script
         type="application/ld+json"
         dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingHeader />

      <main className="flex-1 pt-20">
        
        {/* HERO SECTION */}
        <section className="relative py-20 px-6 text-center overflow-hidden bg-gray-900 text-white">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 to-purple-900/80 -z-10"></div>
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 -z-10"></div>
           
           <div className="max-w-4xl mx-auto py-12">
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
             >
                {rawRef ? (
                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-200 text-sm font-bold mb-8">
                      <StarIcon className="w-4 h-4 text-yellow-400" />
                      Special Invite from <span className="text-white font-mono tracking-wider">{refCode}</span>
                   </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-200 text-sm font-bold mb-8">
                      Welcome to the Community
                   </div>
                )}

                <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                  Start Earning <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Real Money</span> <br/>
                  Online Today.
                </h1>
                
                <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                   Join LetsEarnify and discover the easiest way to earn online rewards through tasks, freelancing, and our trusted referral program.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                   <button 
                      onClick={() => setIsSignupOpen(true)}
                      className="px-8 py-4 bg-white text-indigo-900 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto"
                   >
                      Create Free Account
                   </button>
                   <Link href="/features" className="w-full sm:w-auto">
                      <button className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all w-full sm:w-auto">
                        Learn More
                      </button>
                   </Link>
                </div>
             </motion.div>
           </div>
        </section>

        {/* FEATURES TEASER */}
        <section className="py-20 px-6 bg-white">
           <div className="max-w-6xl mx-auto">
             <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-gray-900">Why Choose LetsEarnify?</h2>
               <p className="text-gray-500 mt-4">We offer multiple ways to diversify your online income.</p>
             </div>
             
             <div className="grid md:grid-cols-3 gap-8">
               {features.map((feat, idx) => (
                 <div key={idx} className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                       {feat.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feat.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
                 </div>
               ))}
             </div>
           </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="py-20 px-6 bg-gray-50 border-t border-gray-100 text-center">
            <div className="max-w-4xl mx-auto">
               <h2 className="text-2xl font-bold text-gray-900 mb-8">Trusted by 15,000+ Members</h2>
               <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                  {/* Mock Logos */}
                  <span className="text-xl font-black text-gray-800">TRUSTPILOT</span>
                  <span className="text-xl font-black text-gray-800">ProductHunt</span>
                  <span className="text-xl font-black text-gray-800">IndieHackers</span>
                  <span className="text-xl font-black text-gray-800">HackerNews</span>
               </div>
            </div>
        </section>

        {/* PROMISE SECTION */}
        <section className="py-24 px-6 bg-white">
           <div className="max-w-5xl mx-auto bg-indigo-600 rounded-[2.5rem] p-10 md:p-16 text-center text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
               
               <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 relative z-10">Start Earning Instantly</h2>
               <p className="text-indigo-100 text-lg mb-4 max-w-2xl mx-auto relative z-10 font-medium">
                  Safe, Trusted, Transparent.
               </p>
               <p className="text-indigo-200 text-base mb-10 max-w-2xl mx-auto relative z-10">
                  Join with invite code <span className="font-mono bg-white/20 px-2 py-1 rounded text-white">{refCode}</span>: Your Referral, Your Rewards.
               </p>
               <button 
                 onClick={() => setIsSignupOpen(true)}
                 className="px-10 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-xl relative z-10"
               >
                  Get Started Now
               </button>
           </div>
        </section>

      </main>

      <footer className="py-12 bg-white text-center text-sm text-gray-400 border-t border-gray-100">
         <div className="flex justify-center gap-6 mb-8 font-medium text-gray-500">
            <Link href="/about" className="hover:text-indigo-600 transition-colors">About Us</Link>
            <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link>
         </div>
         <p>© {new Date().getFullYear()} LetsEarnify. All rights reserved.</p>
      </footer>

      {/* AUTO-OPEN SIGNUP MODAL */}
      <AnimatePresence>
         {isSignupOpen && (
            <>
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                  onClick={() => setIsSignupOpen(false)}
               />
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
               >
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                     <h3 className="text-lg font-bold text-gray-900">Create Account</h3>
                     <button 
                        onClick={() => setIsSignupOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                     >
                        <XMarkIcon className="w-5 h-5 text-gray-500" />
                     </button>
                  </div>
                  
                  <div className="p-6">
                     <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
                        <StarIcon className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                           <p className="text-sm font-bold text-indigo-900">Referral Applied!</p>
                           <p className="text-xs text-indigo-700 mt-1">
                              You are joining with code <span className="font-mono font-bold">{refCode}</span>.
                           </p>
                        </div>
                     </div>
                     
                     {/* Reused Signup Form */}
                     <SignupForm referralCode={refCode} isModal={true} />
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>
    </div>
  )
}

// Wrapper for Suspense (required for useSearchParams)
export default function PublicWelcome({ initialRef }: { initialRef?: string }) {
   return (
      <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
         <PublicWelcomeContent initialRef={initialRef} />
      </Suspense>
   )
}
