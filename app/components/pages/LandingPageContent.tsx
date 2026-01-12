"use client"

import Link from "next/link"
import React, { useState, useEffect } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useSearchParams } from "next/navigation"
import SpecialPoolsSection from "../../components/landing/SpecialPoolsSection"
import LandingHeader from "../../components/LandingHeader"
import SmartPoolsSection from "../../components/landing/SmartPoolsSection"
import { ArrowRightIcon, XMarkIcon, StarIcon } from "@heroicons/react/24/outline"
import SignupForm from "../../components/auth/SignupForm"
import SocialProofStats from "../ui/SocialProofStats"
import PayoutsCarousel from "../ui/PayoutsCarousel"

export default function LandingPageContent({ initialStats, initialProofs }: { initialStats?: any, initialProofs?: any[] }) {
  const searchParams = useSearchParams()
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const refCode = searchParams.get("ref")

  // Auto-open logic if ref exists
  useEffect(() => {
    if (refCode) {
        // Small delay to ensure smooth loading
        const timer = setTimeout(() => setIsSignupOpen(true), 1000)
        return () => clearTimeout(timer)
    }
  }, [refCode])

  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar */}
      <LandingHeader />
      
      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
             <motion.div 
               animate={{ 
                 x: [0, 50, 0], 
                 y: [0, 30, 0],
                 scale: [1, 1.1, 1]
               }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               style={{ willChange: 'transform' }}
               className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/4 transform-gpu" 
             />
             <motion.div 
               animate={{ 
                 x: [0, -30, 0], 
                 y: [0, 50, 0],
                 scale: [1, 1.2, 1]              
               }}
               transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
               style={{ willChange: 'transform' }}
               className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/4 transform-gpu" 
             />
          </div>

          <motion.div 
            style={{ opacity, scale }}
            className="max-w-6xl mx-auto text-center relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 shadow-sm mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-sm font-semibold text-indigo-900 tracking-wide uppercase">The Future of Digital Earning</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-8xl font-serif font-bold text-gray-900 mb-8 leading-[1.1] tracking-tight"
            >
              The Smartest Way to <br />
              <HeroTextSlider />
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
            >
              Join the ecosystem where Micro-Tasks meet Ethical Investing. 
              <span className="block mt-2 text-indigo-600 font-bold flex items-center justify-center gap-2">
                Start with $1. Scale to <ScaleToSlider />
              </span>
            </motion.p>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.6 }}
               className="flex flex-col sm:flex-row gap-5 justify-center items-center"
            >
              <Link href="/signup" className="group relative w-full sm:w-auto">
                 <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                 <button className="relative w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 group-hover:bg-gray-800 transition-all transform group-hover:-translate-y-1">
                    Start Earning Now
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </button>
              </Link>
              <Link href="#features">
                 <button className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-100 text-gray-600 rounded-xl font-bold text-lg hover:border-indigo-100 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all shadow-sm">
                    Explore Features
                 </button>
              </Link>
            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-16 md:mt-20 w-full px-2 md:px-4"
            >
                <div className="bg-white/60 backdrop-blur-xl border border-indigo-100/50 rounded-2xl md:rounded-[2rem] py-6 md:py-10 shadow-xl md:shadow-2xl shadow-indigo-500/10 max-w-5xl mx-auto overflow-hidden relative hover:shadow-indigo-500/20 transition-all duration-500 group">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent opacity-50"></div>
                    
                    <p className="text-[10px] md:text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-4 md:mb-8 text-center group-hover:text-indigo-500 transition-colors">Trusted Payment Partners</p>
                    
                    <div className="relative w-full overflow-hidden mask-gradient-x">
                         <div className="flex gap-8 md:gap-24 w-max animate-marquee items-center will-change-transform">
                             {["USDT (TRC20)", "Binance Pay", "Stripe", "Bank Transfer", "PayPal", "Wise"].map((method, i) => (
                                 <span key={i} className="text-lg md:text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent mx-2 md:mx-4 whitespace-nowrap hover:scale-110 transition-transform duration-300 cursor-default shadow-sm filter drop-shadow-sm">{method}</span>
                             ))}
                             {["USDT (TRC20)", "Binance Pay", "Stripe", "Bank Transfer", "PayPal", "Wise"].map((method, i) => (
                                 <span key={`dup-${i}`} className="text-lg md:text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent mx-2 md:mx-4 whitespace-nowrap hover:scale-110 transition-transform duration-300 cursor-default shadow-sm filter drop-shadow-sm">{method}</span>
                             ))}
                         </div>
                    </div>
                </div>
            </motion.div>
          </motion.div>
        </section>

        {/* --- STATS SECTION (Reusable) --- */}
        <SocialProofStats stats={initialStats} />

        {/* --- PAYOUT PROOFS SECTION (Reusable) --- */}
        <PayoutsCarousel proofs={initialProofs || []} />

        {/* Features Grid */}
        <section id="features" className="py-24 md:py-32 bg-white relative">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn>
              <div className="text-center mb-20">
                 <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm mb-6 border border-indigo-100">
                    ECOSYSTEM OVERVIEW
                 </div>
                 <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-gray-900">One Account. <span className="text-indigo-600">Four Income Streams.</span></h2>
                 <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                    Stop relying on a single source of income. Build a diversified portfolio with zero technical skills.
                 </p>
              </div>
            </FadeIn>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                title="Referral Empire" 
                desc="Turn your network into net worth. Earn massive commissions from our deep multi-tier referral system."
                icon="👑" // Changed icon
                gradient="from-blue-500 to-indigo-600"
                delay={0}
                badge="Passive Income"
              />
              <FeatureCard 
                title="Micro-Task Hub" 
                desc="Get paid for your spare time. engaging tasks that pay instantly upon completion."
                icon="⚡" // Changed icon
                gradient="from-emerald-500 to-teal-600"
                delay={0.1}
                badge="Instant Pay"
              />
              <FeatureCard 
                title="Mudaraba Vaults" 
                desc="Ethical, profit-sharing investment pools. Let your money work for you in verified real-world businesses."
                icon="🏦" // Changed icon
                gradient="from-amber-400 to-orange-500"
                delay={0.2}
                badge="High Yield"
              />
              <FeatureCard 
                title="Professional Market" 
                desc="Sell your digital services to a global audience. Freelancing, simpler and fairer than ever."
                icon="💼" // Changed icon
                gradient="from-pink-500 to-rose-600"
                delay={0.3}
                badge="No Fees"
              />
            </div>
          </div>
        </section>

        {/* Special Pools Section */}
        <SpecialPoolsSection />

        {/* Smart Pools Section (Existing Component Wrapper) */}
        <div className="bg-gray-50">
             <SmartPoolsSection />
        </div>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 relative overflow-hidden bg-white">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-indigo-50/50 to-transparent rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
           
           <div className="max-w-7xl mx-auto px-6">
              <FadeIn>
                <div className="text-center mb-20">
                   <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">How It Works</h2>
                   <p className="text-gray-500 max-w-2xl mx-auto text-lg">Start your earning journey in four simple steps.</p>
                </div>
              </FadeIn>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                 {/* Connecting Line (Desktop) */}
                 <div className="hidden md:block absolute top-[60px] left-0 w-full h-0.5 bg-gray-100 -z-10"></div>
                 
                 {[
                    { number: "01", title: "Create Account", desc: "Sign up with your email & country in under 60 seconds.", color: "text-blue-500", bg: "bg-blue-50", border: "hover:border-blue-200", gradient: "from-blue-50 to-white" },
                    { number: "02", title: "Activate", desc: "Unlock full platform access with a minimal $1 deposit.", color: "text-purple-500", bg: "bg-purple-50", border: "hover:border-purple-200", gradient: "from-purple-50 to-white" },
                    { number: "03", title: "Choose Earning", desc: "Engage in Tasks, Referrals, Marketplace, or Investment pools.", color: "text-emerald-500", bg: "bg-emerald-50", border: "hover:border-emerald-200", gradient: "from-emerald-50 to-white" },
                    { number: "04", title: "Withdraw", desc: "Track earnings in real-time and withdraw securely.", color: "text-orange-500", bg: "bg-orange-50", border: "hover:border-orange-200", gradient: "from-orange-50 to-white" }
                 ].map((step, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        viewport={{ once: true }}
                        className={`relative p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 ${step.border} bg-gradient-to-br ${step.gradient}`}
                    >
                       <div className={`text-5xl font-black mb-6 transition-colors absolute top-4 right-4 opacity-10 group-hover:opacity-20 ${step.color}`}>{step.number}</div>
                       <div className={`w-14 h-14 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center font-bold text-xl mb-6 shadow-sm relative z-10 group-hover:scale-110 transition-transform`}>
                          {idx + 1}
                       </div>
                       <h3 className="font-serif font-bold text-xl mb-3 text-gray-900 relative z-10">{step.title}</h3>
                       <p className="text-gray-500 text-sm leading-relaxed relative z-10 font-medium">{step.desc}</p>
                    </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* Why Users Trust Us Section */}
        <section className="py-24 bg-gray-50 relative">
           <div className="max-w-7xl mx-auto px-6">
              <FadeIn>
                <div className="text-center mb-16">
                   <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Why Users Trust Let'$Earnify</h2>
                   <p className="text-gray-500 max-w-2xl mx-auto text-lg">Built on transparency, security, and ethical financial principles.</p>
                </div>
              </FadeIn>

              <div className="grid md:grid-cols-3 gap-8">
                 <TrustCard 
                    title="Secure Infrastructure"
                    desc="Enterprise-grade security measures to protect your wallet and personal data."
                    icon="🛡️"
                    color="bg-blue-50 text-blue-600"
                    hoverBorder="hover:border-blue-200"
                    delay={0}
                 />
                 <TrustCard 
                    title="Ethical Profit-Sharing"
                    desc="Our Mudaraba model ensures fair, compliant, and transparent profit distribution."
                    icon="⚖️"
                    color="bg-emerald-50 text-emerald-600"
                    hoverBorder="hover:border-emerald-200"
                    delay={0.1}
                 />
                 <TrustCard 
                    title="Real-Time Tracking"
                    desc="Monitor every cent of your earnings, commissions, and deposits instantly."
                    icon="💳"
                    color="bg-amber-50 text-amber-600"
                    hoverBorder="hover:border-amber-200"
                    delay={0.2}
                 />
              </div>
           </div>
        </section>

        {/* Customer Support Section */}
        <section className="py-24 px-6 relative bg-white">
             <FadeIn>
               <div className="max-w-6xl mx-auto bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-[2.5rem] p-8 md:p-16 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10 opacity-50"></div>
                  
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
                          💬 We're Here To Help
                       </div>
                       <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900">Dedicated Support & Resources</h2>
                       <p className="text-gray-500 text-lg leading-relaxed">
                          Your success is our priority. We provide multiple channels to ensure you never feel stuck or alone on your journey.
                       </p>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <a href="mailto:LetsEarnify@gmail.com" className="flex flex-col gap-2 p-5 bg-white border border-gray-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg transition-all group cursor-pointer">
                             <div className="flex items-center gap-3">
                                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg text-xl group-hover:scale-110 transition-transform">📧</span>
                                <span className="font-bold text-gray-900 text-sm">Email Support</span>
                             </div>
                             <span className="text-xs text-gray-400 pl-11">Opens default mail app</span>
                          </a>
                          
                          <div className="flex items-center gap-3 p-5 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
                             <span className="p-2 bg-purple-50 text-purple-600 rounded-lg text-xl">🎫</span>
                             <span className="font-bold text-gray-900 text-sm">Ticket System</span>
                          </div>

                          <div className="flex items-center gap-3 p-5 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
                             <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-xl">📚</span>
                             <span className="font-bold text-gray-900 text-sm">Knowledge Base</span>
                          </div>

                          <div className="flex items-center gap-3 p-5 bg-white border border-gray-100 rounded-2xl opacity-80">
                             <span className="p-2 bg-gray-50 text-gray-600 rounded-lg text-xl">💬</span>
                             <div>
                                <span className="font-bold text-gray-900 text-sm block">Live Chat</span>
                                <span className="inline-block text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-0.5">Coming Soon</span>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="bg-gray-900 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                        <div className="relative z-10 text-center">
                            <div className="text-6xl mb-4">24/7</div>
                            <h3 className="text-2xl font-bold mb-2">System Monitoring</h3>
                            <p className="text-gray-400 mb-8">Our platform runs around the clock so you can earn anytime.</p>
                            <Link href="/support" className="inline-block w-full py-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                                Visit Help Center
                            </Link>
                        </div>
                    </div>
                  </div>
               </div>
             </FadeIn>
        </section>

        {/* Premium Access / One-Time Fee Section */}
        <section className="py-24 px-6 md:px-12 bg-gray-50">
           <div className="max-w-7xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-gray-900 text-white rounded-[3rem] p-8 md:p-20 relative overflow-hidden shadow-2xl"
              >
                 {/* Decorative Background Elements */}
                 <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-indigo-600/20 to-transparent rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 user-select-none pointer-events-none"></div>
                 <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 user-select-none pointer-events-none"></div>

                 <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left: Value Proposition */}
                    <div className="text-center lg:text-left space-y-8">
                       <span className="inline-block py-1.5 px-4 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs uppercase tracking-wider border border-indigo-500/30">
                          One-Time Activation
                       </span>
                       
                       <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
                          Unlock Your <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300">Financial Passport</span>
                       </h2>
                       
                       <p className="text-lg text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                          We believe in accessible opportunity. For the price of a coffee, you get lifetime access to a complete digital earning ecosystem. No hidden subscriptions.
                       </p>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                          {[
                             { title: "Lifetime Access", desc: "Pay once, earn forever." },
                             { title: "All Features", desc: "Tasks, Pools, Freelancing." },
                             { title: "Instant Status", desc: "Start earning immediately." },
                             { title: "Zero Monthly Fees", desc: "Keep 100% of your profits." }
                          ].map((feat, i) => (
                             <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-left">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                                   <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]"></div>
                                </div>
                                <div>
                                   <div className="font-bold text-white text-sm">{feat.title}</div>
                                   <div className="text-xs text-gray-500 mt-0.5">{feat.desc}</div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                    
                    {/* Right: The "Card" Visual */}
                    <div className="relative mx-auto lg:mx-0">
                       {/* Glowing Backdrop */}
                       <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-[2.5rem] blur-xl opacity-40 animate-pulse"></div>
                       
                       <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2.5rem] border border-white/10 p-10 md:p-14 text-center shadow-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                          {/* Shine Effect */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                          
                          <div className="mb-2 text-sm font-bold text-gray-400 uppercase tracking-widest">Entry Fee</div>
                          <div className="flex items-start justify-center gap-1 mb-4">
                             <span className="text-4xl font-bold text-gray-500 mt-2">$</span>
                             <span className="text-8xl font-black text-white tracking-tighter">1</span>
                          </div>
                          
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full mb-10 border border-green-500/20">
                             <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                             Standard Global Rate
                          </div>

                          <Link href="/signup" className="w-full block py-5 rounded-xl bg-white text-gray-900 font-bold text-lg hover:bg-gray-100 transition-all shadow-lg shadow-white/10 active:scale-95">
                             Get Started Now
                          </Link>
                          
                          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-6 opacity-60">
                             <div className="text-[10px] uppercase font-bold text-gray-500">Secure</div>
                             <div className="text-[10px] uppercase font-bold text-gray-500">Instant</div>
                             <div className="text-[10px] uppercase font-bold text-gray-500">Global</div>
                          </div>
                       </div>
                    </div>

                 </div>
              </motion.div>
           </div>
        </section>
        
        {/* Final Emotional CTA Section */}
        <section className="py-32 text-center px-6 bg-white">
           <FadeIn>
             <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-8">Ready to start your journey?</h2>
                <p className="text-xl md:text-2xl text-gray-500 mb-12 font-light">
                   Your financial freedom journey doesn't need a fortune to begin. 
                   Consistency is the key to unlocking digital opportunities.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <Link 
                     href="/signup" 
                     className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                   >
                     Create Free Account
                   </Link>
                   <Link 
                     href="/signup" 
                     className="px-10 py-5 bg-gray-50 border border-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-colors"
                   >
                     Start with $1
                   </Link>
                </div>
             </div>
           </FadeIn>
        </section>

      </main>

      <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-1">
                 <Link href="/" className="text-2xl font-serif font-bold bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent mb-6 inline-block">
                    Let'$Earnify
                 </Link>
                 <p className="text-gray-500 text-sm leading-relaxed mt-4">
                    The ultimate platform for financial freedom. Join thousands of users growing their wealth today.
                 </p>
              </div>
              <div>
                 <h4 className="font-bold mb-6 text-gray-900">Platform</h4>
                 <ul className="space-y-4 text-sm text-gray-500">
                    <li><Link href="/#features" className="hover:text-indigo-600 transition-colors">Features</Link></li>
                    <li><Link href="/security" className="hover:text-indigo-600 transition-colors">Security & Trust</Link></li>
                    <li><Link href="/about#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</Link></li>
                 </ul>
              </div>
              <div>
                 <h4 className="font-bold mb-6 text-gray-900">Company</h4>
                 <ul className="space-y-4 text-sm text-gray-500">
                    <li><Link href="/about" className="hover:text-indigo-600 transition-colors">About Us</Link></li>
                    <li><Link href="/stories" className="hover:text-indigo-600 transition-colors">Success Stories</Link></li>
                    <li><Link href="/support" className="hover:text-indigo-600 transition-colors">Contact</Link></li>
                 </ul>
              </div>
              <div>
                 <h4 className="font-bold mb-6 text-gray-900">Legal</h4>
                 <ul className="space-y-4 text-sm text-gray-500">
                    <li><Link href="/security" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
                    <li><Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
                    <li><Link href="/terms#risk-disclosure" className="hover:text-indigo-600 transition-colors">Risk Disclosure</Link></li>
                 </ul>
              </div>
           </div>
           <div className="text-center text-sm text-gray-400 border-t border-gray-100 pt-10">
              © {new Date().getFullYear()} Let'$Earnify. All rights reserved.
           </div>
        </div>
      </footer>

      {/* AUTO-OPEN SIGNUP MODAL */}
      <AnimatePresence>
         {isSignupOpen && (
            <>
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
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
                     {refCode && (
                       <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
                          <StarIcon className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                             <p className="text-sm font-bold text-indigo-900">Referral Applied!</p>
                             <p className="text-xs text-indigo-700 mt-1">
                                You are joining with code <span className="font-mono font-bold">{refCode}</span>.
                             </p>
                          </div>
                       </div>
                     )}
                     
                     <SignupForm referralCode={refCode || ""} isModal={true} />
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>
    </div>
  )
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true, margin: "-100px" }}
    >
      {children}
    </motion.div>
  )
}

function FeatureCard({ title, desc, icon, gradient, delay, badge }: { title: string, desc: string, icon: string, gradient: string, delay: number, badge?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
      viewport={{ once: true }}
      className="p-8 bg-white rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-300 group cursor-default relative overflow-hidden"
    >
      {badge && (
          <div className="absolute top-6 right-6 px-3 py-1 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {badge}
          </div>
      )}
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl mb-8 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-4 text-gray-900 font-serif">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
    </motion.div>
  )
}

function TrustCard({ title, desc, icon, color, hoverBorder, delay }: { title: string, desc: string, icon: string, color: string, hoverBorder: string, delay: number }) {
  return (
     <motion.div 
       initial={{ opacity: 0, scale: 0.9 }}
       whileInView={{ opacity: 1, scale: 1 }}
       whileHover={{ scale: 1.02 }}
       transition={{ duration: 0.5, delay }}
       viewport={{ once: true }}
       className={`p-10 bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center ${hoverBorder} transition-colors group`}
     >
        <div className={`w-20 h-20 ${color.split(' ')[0]} rounded-full flex items-center justify-center text-3xl mb-8 ${color.split(' ')[1]} group-hover:scale-110 transition-transform`}>{icon}</div>
        <h3 className="font-bold text-xl mb-3">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
     </motion.div>
  )
}

function HeroTextSlider() {
  const words = ["Earn Online", "Invest Smart", "Unlock Wealth"];
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[1.1em] overflow-hidden inline-flex relative align-top">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-indigo-600 animate-gradient-x"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

function ScaleToSlider() {
  const words = ["Infinity", "Wealth", "Freedom", "Success"];
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="h-[1.2em] overflow-hidden inline-flex relative align-bottom min-w-[100px] md:min-w-[120px]">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={words[index]}
          initial={{ y: "100%", opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: "-100%", opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
          className="absolute inset-0 flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 font-extrabold"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
