"use client"

import Link from "next/link"
import React, { useState, useEffect } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useSearchParams } from "next/navigation"
import SpecialPoolsSection from "../../components/landing/SpecialPoolsSection"
import LandingHeader from "../../components/LandingHeader"
import SmartPoolsSection from "../../components/landing/SmartPoolsSection"
import { ArrowRightIcon, XMarkIcon, StarIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import SignupForm from "../../components/auth/SignupForm"
import SocialProofStats from "../ui/SocialProofStats"
import PayoutsCarousel from "../ui/PayoutsCarousel"
import TestimonialsSection from "../../components/landing/TestimonialsSection"
import FAQSection from "../../components/landing/FAQSection"

export default function LandingPageContent({ initialStats, initialProofs }: { initialStats?: any, initialProofs?: any[] }) {
  const searchParams = useSearchParams()
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const refCode = searchParams.get("ref")

  useEffect(() => {
    if (refCode) {
      const timer = setTimeout(() => setIsSignupOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [refCode])

  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97])

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/20 selection:text-primary">
      <LandingHeader />

      <main className="flex-1">

        {/* ═══════════════════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════════════════ */}
        <section className="relative pt-20 pb-12 md:pt-28 md:pb-16 px-6 overflow-hidden">
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
            <motion.div
              animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
              style={{ willChange: 'transform' }}
              className="absolute top-0 right-0 w-[700px] h-[700px] bg-indigo-500/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/4 transform-gpu"
            />
            <motion.div
              animate={{ x: [0, -40, 0], y: [0, 60, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
              style={{ willChange: 'transform' }}
              className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/4 transform-gpu"
            />
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              style={{ willChange: 'transform' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[80px] transform-gpu"
            />
          </div>

          <motion.div
            style={{ opacity, scale }}
            className="w-full max-w-7xl mx-auto text-center relative z-10 px-4 sm:px-6"
          >
            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(34,197,94,0.1)] rounded-full mb-6 mx-auto"
            >
              <div className="relative flex h-1.5 w-1.5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
              </div>
              <span className="text-[8px] sm:text-[9px] font-black text-black dark:text-foreground/80 tracking-[0.15em] uppercase whitespace-nowrap">Platform Live <span className="text-muted-foreground/40 mx-1">|</span> Earning In Progress</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif font-black mb-8 leading-[1.05] md:leading-[1.1] tracking-tight drop-shadow-sm flex flex-col items-center justify-center text-center w-full"
            >
              <span className="text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-foreground">
                Scale Your Income.
              </span>
              <span className="text-[1.65rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1] text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 mt-1 sm:mt-2">
                Secure Your Future.
              </span>
            </motion.h1>

             {/* Minimal Activation Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center mb-10"
            >
              <div className="relative group cursor-default">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/40 to-orange-500/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative inline-flex items-center gap-2.5 px-5 py-2 bg-background/50 backdrop-blur-xl border border-amber-500/30 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                     <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-white font-black text-xs shadow-inner shadow-white/20">
                        $1
                     </div>
                     <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-amber-800 dark:text-amber-200/80">
                        One-Time Activation Required
                     </span>
                  </div>
              </div>
            </motion.div>

            {/* Sub-headline / Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-sm md:text-base font-medium text-black dark:text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed border-t border-border/40 pt-6"
            >
              <span className="text-foreground font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">One key unlocks infinite potential.</span> <br/>
              A single lifetime activation fee grants permanent access to all five income streams.
            </motion.p>

            {/* Primary CTAs (Redesigned) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 w-full max-w-2xl mx-auto px-4"
            >
              {/* Sign Up / Create Account */}
              <Link href="/signup" className="group relative w-full sm:w-1/2 overflow-hidden rounded-2xl h-16">
                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-primary to-emerald-500 group-hover:scale-110 transition-transform duration-500"></div>
                 <div className="absolute inset-[1px] bg-background/10 backdrop-blur-md rounded-[15px] group-hover:bg-background/0 transition-all duration-500"></div>
                 <button className="relative w-full h-full flex flex-col items-center justify-center gap-0.5 text-white">
                    <span className="flex items-center gap-2 font-black text-lg sm:text-xl uppercase tracking-tighter">
                       Get Started Now
                       <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-[10px] font-black opacity-80 uppercase tracking-widest leading-none">Lifetime Access • Only $1</span>
                 </button>
              </Link>

              {/* Login / Dashboard Access */}
              <Link href="/login" className="group relative w-full sm:w-1/2 overflow-hidden rounded-2xl h-16 border border-border/80 hover:border-indigo-500/50 transition-colors">
                 <div className="absolute inset-0 bg-secondary/50 backdrop-blur-xl group-hover:bg-indigo-500/5 transition-all"></div>
                 <button className="relative w-full h-full flex flex-col items-center justify-center gap-0.5 text-foreground group-hover:text-indigo-400 transition-colors">
                    <span className="font-bold text-lg sm:text-xl tracking-tight">Login Dashboard</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/90 dark:text-white/60">Existing Member Access</span>
                 </button>
              </Link>
            </motion.div>

            {/* Quick trust line — Minimal Fees Display */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[9px] sm:text-[11px] text-black/60 dark:text-muted-foreground/60 font-black uppercase tracking-[0.25em] mb-12 sm:mb-20"
            >
              {["No subscription fees", "Instant activation", "Withdraw anytime", "Global platform"].map((t, i) => (
                <React.Fragment key={i}>
                  <span className="hover:text-primary transition-colors cursor-default whitespace-nowrap">{t}</span>
                  {i < 3 && <span className="hidden sm:inline text-border/30">•</span>}
                </React.Fragment>
              ))}
            </motion.div>

            {/* Professional 6-Box Feature Section */}
            <section className="mt-16 mb-20 px-4 sm:px-6">
              <FadeIn>
                <div className="text-center mb-10">
                  <h2 className="text-2xl sm:text-3xl font-serif font-black mb-3 text-foreground tracking-tight">
                    One Ecosystem. Six Streams.
                  </h2>
                  <p className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-[0.2em] mb-8">
                    Unified opportunities to scale your digital future
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-5 max-w-2xl mx-auto">
                  {[
                    { title: "Non-Subscription", icon: "💎" },
                    { title: "Daily Tasks", icon: "⚡" },
                    { title: "Investments", icon: "🏦" },
                    { title: "Reel", icon: "🎬" },
                    { title: "Team Earning", icon: "🤝" },
                    { title: "Daily Online Cool", icon: "🌐" }
                  ].map((item, i) => (
                    <div 
                      key={i} 
                      className="group bg-card/30 backdrop-blur-xl border border-border/50 p-4 sm:p-6 rounded-2xl flex items-center gap-3 sm:gap-4 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-default"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-background flex items-center justify-center text-xl sm:text-2xl shadow-inner border border-border/40 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-black text-[9px] sm:text-[11px] text-foreground uppercase tracking-widest leading-tight group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <div className="h-0.5 w-4 bg-primary/20 mt-1 rounded-full group-hover:w-full transition-all duration-500"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </section>

            {/* Payment Partners Strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="w-full px-2 lg:px-4"
            >
              <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-xl py-4 shadow-md max-w-3xl mx-auto overflow-hidden relative">
                <p className="text-[9px] md:text-[10px] font-black text-black dark:text-muted-foreground/60 uppercase tracking-[0.2em] mb-3 text-center">
                  Accepted Payment Methods
                </p>
                <div className="relative w-full overflow-hidden mask-gradient-x">
                  <div className="flex gap-8 md:gap-20 w-max animate-marquee items-center will-change-transform">
                    {["USDT (TRC20)", "Binance Pay", "Stripe", "Bank Transfer", "EasyPaisa", "JazzCash", "PayPal", "Wise"].map((method, i) => (
                      <span key={i} className="text-base md:text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent whitespace-nowrap">{method}</span>
                    ))}
                    {["USDT (TRC20)", "Binance Pay", "Stripe", "Bank Transfer", "EasyPaisa", "JazzCash", "PayPal", "Wise"].map((method, i) => (
                      <span key={`d-${i}`} className="text-base md:text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent whitespace-nowrap">{method}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SOCIAL PROOF STATS
        ═══════════════════════════════════════════════════════ */}
        <SocialProofStats stats={initialStats} />

        {/* ═══════════════════════════════════════════════════════
            THE $1 MODEL — CORE CONCEPT EXPLANATION
        ═══════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-24 bg-background relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <FadeIn>
              <div className="flex justify-center mb-12 sm:mb-16">
                <div className="relative group inline-block w-full max-w-2xl p-[1px] rounded-[24px] bg-border/40 overflow-hidden shadow-2xl">
                  {/* Subtle RGB-style light smoothly moving along the edge */}
                  <div className="absolute inset-[-200%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_270deg,#3b82f6_300deg,#d946ef_330deg,#f59e0b_360deg)] opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Inner Container */}
                  <div className="relative bg-background dark:bg-card h-full w-full px-6 py-8 sm:px-10 sm:py-10 rounded-[23px] text-center flex flex-col items-center overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] sm:text-xs mb-4 border border-amber-500/20 uppercase tracking-wider shadow-sm relative z-10">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      The Core Concept
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black mb-4 text-foreground tracking-tight leading-tight relative z-10">
                      Driven by the <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-orange-600 inline-block transform hover:scale-105 transition-transform duration-300">$1</span> Activation Model
                    </h2>
                    
                    <p className="text-sm sm:text-base text-black dark:text-muted-foreground/90 max-w-lg mx-auto leading-relaxed relative z-10">
                      We believe earning shouldn't cost a fortune. Instead of charging monthly $20–$100 subscriptions, LetsEarnify operates on a <strong className="text-foreground border-b border-primary/30 pb-0.5">single, lifetime $1 activation fee</strong>. This deliberate design unlocks the entire ecosystem forever.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left: The concept breakdown */}
              <FadeIn>
                <div className="space-y-4 sm:space-y-6">
                  {[
                    {
                      icon: "🔑",
                      title: "A Key, Not a Barrier",
                      desc: "$1 is your activation key. It's not a subscription. It's not a recurring charge. You pay once, and the entire platform — every single feature — is permanently unlocked for your account.",
                      color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
                    },
                    {
                      icon: "🛡️",
                      title: "Commitment Filter",
                      desc: "The $1 fee filters out bots and fake accounts, ensuring you're part of a community of real, serious earners. This keeps the ecosystem healthy and the profit pools meaningful.",
                      color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                    },
                    {
                      icon: "♾️",
                      title: "Unlimited Upside",
                      desc: "Once activated, your earning potential has no ceiling. Whether you earn $10 or $10,000 — your activation fee stays fixed at $1. Forever. We only succeed when you succeed.",
                      color: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
                    },
                    {
                      icon: "💎",
                      title: "All 5 Income Streams Unlocked",
                      desc: "Tasks, Referral Matrix, Mudaraba Pools, Service Marketplace, and Spin Wheel — all included. No upsells. No premium tiers. No feature gates.",
                      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                    }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="flex gap-4 sm:gap-5 p-5 sm:p-6 bg-card border border-border rounded-2xl hover:border-primary/20 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${item.color} flex items-center justify-center text-xl sm:text-2xl shrink-0 group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-sm sm:text-base mb-1">{item.title}</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-[2rem] sm:rounded-[2.5rem] blur-2xl opacity-20 animate-pulse"></div>
                  <div className="relative bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 dark:border-white/10 p-6 sm:p-10 md:p-14 text-center shadow-2xl overflow-hidden group hover:scale-[1.01] transition-transform duration-500">
                    {/* Shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 dark:via-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                    <div className="text-[10px] sm:text-xs font-black text-black dark:text-gray-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-4">One-Time Activation Fee</div>
                    
                    <div className="flex items-start justify-center gap-1 mb-3">
                      <span className="text-[7rem] sm:text-[8rem] md:text-[9rem] font-black text-black dark:text-white leading-none tracking-tighter">$1</span>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-full mb-8 border border-green-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      Pay Once. Earn Forever.
                    </div>

                    <div className="space-y-3 text-left mb-10">
                      {[
                        "Access to all 5 income streams",
                        "Referral commissions — immediate",
                        "Weekly Mudaraba pool distributions",
                        "Micro-task earnings — paid instantly",
                        "Spin Wheel daily rewards",
                        "Freelance marketplace listing"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                          <div className="w-5 h-5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                            <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                          </div>
                          {item}
                        </div>
                      ))}
                    </div>

                    <Link href="/signup" className="block w-full py-5 rounded-xl bg-indigo-600 text-white dark:bg-white dark:text-gray-900 font-black text-lg hover:bg-indigo-700 dark:hover:bg-gray-100 transition-all shadow-lg shadow-indigo-200 dark:shadow-white/10 active:scale-95">
                      Activate for $1 Now
                    </Link>

                    <div className="mt-6 flex items-center justify-center gap-2">
                      <span className="text-xs text-gray-500">Already a member?</span>
                      <Link href="/login" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                        Log In &rarr;
                      </Link>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-white/5 pt-6 opacity-60">
                      <div className="text-[10px] uppercase font-black text-black/60 dark:text-gray-500">🔒 Secure</div>
                      <div className="text-[10px] uppercase font-black text-black/60 dark:text-gray-500">⚡ Instant</div>
                      <div className="text-[10px] uppercase font-black text-black/60 dark:text-gray-500">🌍 Global</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            PAYOUT PROOFS
        ═══════════════════════════════════════════════════════ */}
        <PayoutsCarousel proofs={initialProofs || []} />

        {/* ═══════════════════════════════════════════════════════
            5 INCOME STREAMS — FEATURES GRID
        ═══════════════════════════════════════════════════════ */}
        <section id="features" className="py-16 md:py-24 bg-muted/30 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FadeIn>
              <div className="text-center mb-12 sm:mb-20">
                <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] sm:text-xs mb-4 sm:mb-6 border border-primary/20 uppercase tracking-wider">
                  5 Streams. 1 Platform.
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 sm:mb-6 text-foreground tracking-tight">
                  Diversified Income Architecture
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-black dark:text-muted-foreground max-w-2xl mx-auto px-2">
                  Stop depending on one income source. Build a multi-stream portfolio with zero technical knowledge required.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <FeatureCard
                title="Referral Matrix"
                desc="Invite others and earn compounding commissions through our multi-level referral structure. Your network is your net worth."
                icon="👑"
                gradient="from-blue-500 to-indigo-600"
                delay={0}
                badge="Passive Income"
                stat="Multi-tier commissions"
              />
              <FeatureCard
                title="Micro-Task Engine"
                desc="Complete verified digital tasks — content reviews, social actions — and get paid instantly upon completion."
                icon="⚡"
                gradient="from-emerald-500 to-teal-600"
                delay={0.05}
                badge="Active Income"
                stat="Paid upon verification"
              />
              <FeatureCard
                title="Mudaraba Pools"
                desc="Ethical Islamic profit-sharing investment pools. Your capital is deployed in real-world commerce with transparent yield distribution."
                icon="🏦"
                gradient="from-amber-500 to-orange-500"
                delay={0.1}
                badge="Investment Yield"
                stat="Weekly distributions"
              />
              <FeatureCard
                title="Freelance Marketplace"
                desc="List your digital skills — design, writing, tech — and connect with a global client base with built-in escrow protection."
                icon="💼"
                gradient="from-pink-500 to-rose-600"
                delay={0.15}
                badge="Service Income"
                stat="Zero platform fees"
              />
              <FeatureCard
                title="Spin & Win"
                desc="Daily gamified reward system. Spin the wheel every 24 hours for bonus earnings, multipliers, and surprise jackpots."
                icon="🎰"
                gradient="from-purple-500 to-violet-600"
                delay={0.2}
                badge="Daily Rewards"
                stat="Every 24 hours"
              />
              {/* CTA Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                viewport={{ once: true }}
                className="p-6 sm:p-8 bg-gradient-to-br from-foreground to-foreground/80 rounded-[2rem] flex flex-col justify-between text-background relative overflow-hidden group cursor-default"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-fuchsia-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="text-3xl sm:text-4xl mb-4 sm:mb-6">🚀</div>
                  <h3 className="font-bold text-xl sm:text-2xl mb-2 sm:mb-3 font-serif">Ready to start?</h3>
                  <p className="text-background/70 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8">
                    All 5 streams. One $1 activation. Join the platform today.
                  </p>
                  <Link href="/signup" className="inline-flex items-center justify-center sm:justify-start gap-2 px-5 py-3 w-full sm:w-auto bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all">
                    Create Account
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SPECIAL POOLS SECTION
        ═══════════════════════════════════════════════════════ */}
        <SpecialPoolsSection />

        {/* ═══════════════════════════════════════════════════════
            SMART POOLS / CORE INCOME ALLOCATIONS
        ═══════════════════════════════════════════════════════ */}
        <div className="bg-muted/40">
          <SmartPoolsSection />
        </div>

        {/* ═══════════════════════════════════════════════════════
            HOW IT WORKS
        ═══════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-16 md:py-24 relative overflow-hidden bg-background">
          <div className="absolute top-0 right-0 w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <FadeIn>
              <div className="text-center mb-12 sm:mb-20">
                <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] sm:text-xs mb-4 sm:mb-6 border border-primary/20 uppercase tracking-wider">
                  Get Started in Minutes
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 sm:mb-6 tracking-tight">
                  Four Steps to Your First Earning
                </h2>
                <p className="text-black dark:text-muted-foreground max-w-lg mx-auto text-base sm:text-lg px-2">
                  From zero to earning in under 5 minutes. No experience required.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-[52px] left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-orange-500/30 -z-10"></div>

              {[
                { number: "01", title: "Create Account", desc: "Sign up for free with your email and country. Takes under 60 seconds. No credit card needed.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", iconBg: "from-blue-500 to-blue-600" },
                { number: "02", title: "Activate for $1", desc: "Make the one-time $1 deposit to permanently unlock all features. No subscriptions, ever.", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30", iconBg: "from-violet-500 to-violet-600" },
                { number: "03", title: "Choose Your Stream", desc: "Engage with Tasks, Referrals, Investment Pools, Marketplace, or Spin — all simultaneously.", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", iconBg: "from-emerald-500 to-emerald-600" },
                { number: "04", title: "Withdraw Freely", desc: "Track real-time earnings in your dashboard and withdraw securely to your preferred method.", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", iconBg: "from-orange-500 to-orange-600" }
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative p-5 sm:p-7 rounded-[2rem] border border-border bg-card hover:shadow-xl transition-all duration-300 group hover:-translate-y-2`}
                >
                  <div className={`text-5xl sm:text-7xl font-black mb-4 sm:mb-6 absolute top-3 sm:top-4 right-4 sm:right-5 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity ${step.color} select-none`}>{step.number}</div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${step.iconBg} flex items-center justify-center font-black text-white text-base sm:text-lg mb-4 sm:mb-5 shadow-md relative z-10 group-hover:scale-110 transition-transform`}>
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-2.5 text-foreground relative z-10 font-serif">{step.title}</h3>
                  <p className="text-black dark:text-muted-foreground text-xs sm:text-sm leading-relaxed relative z-10">{step.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA below How It Works */}
            <FadeIn delay={0.3}>
              <div className="text-center mt-14">
                <Link href="/signup" className="inline-flex items-center gap-3 px-10 py-5 bg-foreground text-background rounded-2xl font-bold text-lg hover:bg-foreground/90 transition-all shadow-xl hover:-translate-y-1">
                  Start Your Journey Today
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <p className="mt-4 text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            TRUST & SECURITY SECTION
        ═══════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-24 bg-muted/30 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FadeIn>
              <div className="text-center mb-12 sm:mb-16">
                <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] sm:text-xs mb-4 sm:mb-6 border border-emerald-500/20 uppercase tracking-wider">
                  Built to Last
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 sm:mb-6 tracking-tight">
                  Financial Trust. Engineering Quality.
                </h2>
                <p className="text-black dark:text-muted-foreground max-w-xl mx-auto text-base sm:text-lg px-2">
                  Built on principles of security, transparency, and ethical earning.
                </p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              <TrustCard
                title="Bank-Grade Security"
                desc="256-bit SSL encryption, secure cold storage protocols, and multi-factor authentication protect every user account and asset."
                icon="🛡️"
                color="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                hoverBorder="hover:border-blue-200 dark:hover:border-blue-800"
                delay={0}
              />
              <TrustCard
                title="Verified Profit Model"
                desc="Our Mudaraba pool yields are derived from audited real-world economic activity — not speculation. Fully transparent distribution."
                icon="⚖️"
                color="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                hoverBorder="hover:border-emerald-200 dark:hover:border-emerald-800"
                delay={0.1}
              />
              <TrustCard
                title="Real-Time Transparency"
                desc="Every earning, pool contribution, and withdrawal is logged in real-time. Your account ledger is always accessible, always auditable."
                icon="📊"
                color="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                hoverBorder="hover:border-amber-200 dark:hover:border-amber-800"
                delay={0.2}
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SUPPORT SECTION
        ═══════════════════════════════════════════════════════ */}
        <section className="py-12 md:py-16 px-4 sm:px-6 relative bg-background">
          <FadeIn>
            <div className="max-w-5xl mx-auto bg-card/60 backdrop-blur-xl border border-border/60 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6 sm:gap-8">
              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3"></div>
              
              {/* Left Content */}
              <div className="w-full md:w-[45%] text-center md:text-left flex flex-col items-center md:items-start">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  24/7 Support
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-foreground tracking-tight mb-3 leading-tight">
                  Always Here <br className="hidden md:block" /> To Help
                </h2>
                <p className="text-black dark:text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 max-w-sm">
                  Quick solutions for onboarding, daily tasks, and withdrawals. Your success journey is fully supported.
                </p>
                <Link href="/support" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-bold text-sm hover:bg-foreground/90 transition-all shadow-md group w-full sm:w-auto">
                  Visit Help Center
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Right Grid (Channels) */}
              <div className="w-full md:w-[55%] grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href="mailto:LetsEarnify@gmail.com" className="flex items-center gap-4 p-4 bg-background/80 border border-border/80 rounded-2xl hover:border-primary/30 hover:bg-card hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">📧</div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-foreground text-sm mb-0.5">Email Us</div>
                    <div className="text-xs text-muted-foreground truncate">LetsEarnify@gmail.com</div>
                  </div>
                </a>

                <Link href="/support/tickets" className="flex items-center gap-4 p-4 bg-background/80 border border-border/80 rounded-2xl hover:border-purple-500/30 hover:bg-card hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">🎫</div>
                  <div>
                    <div className="font-bold text-foreground text-sm mb-0.5">Ticketing</div>
                    <div className="text-xs text-muted-foreground">Submit a request</div>
                  </div>
                </Link>

                <Link href="/support/knowledge-base" className="flex items-center gap-4 p-4 bg-background/80 border border-border/80 rounded-2xl hover:border-emerald-500/30 hover:bg-card hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">�</div>
                  <div>
                    <div className="font-bold text-foreground text-sm mb-0.5">Guides</div>
                    <div className="text-xs text-muted-foreground">Read tutorials</div>
                  </div>
                </Link>

                <div className="flex items-center gap-4 p-4 bg-muted/30 border border-border/30 rounded-2xl opacity-70 cursor-default">
                  <div className="w-12 h-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center text-xl shrink-0">💬</div>
                  <div>
                    <div className="font-bold text-foreground text-sm mb-0.5">Live Chat</div>
                    <div className="text-[9px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-1.5 py-0.5 rounded-sm w-max mt-0.5">Coming Soon</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ═══════════════════════════════════════════════════════
            TESTIMONIALS
        ═══════════════════════════════════════════════════════ */}
        <TestimonialsSection />

        {/* ═══════════════════════════════════════════════════════
            FAQ SECTION
        ═══════════════════════════════════════════════════════ */}
        <FAQSection />

        {/* ═══════════════════════════════════════════════════════
            FINAL CTA — POWERFUL CLOSE
        ═══════════════════════════════════════════════════════ */}
        <section className="py-20 md:py-32 px-4 sm:px-6 bg-background relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[300px] bg-indigo-500/8 rounded-full blur-3xl"></div>
          </div>
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center relative z-10">
              <div className="inline-flex px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] sm:text-xs mb-6 sm:mb-8 border border-primary/20 uppercase tracking-wider items-center justify-center mx-auto">
                Your Journey Starts Here
              </div>
              <h2 className="text-[2.25rem] leading-[1.1] sm:text-5xl md:text-7xl font-serif font-black text-foreground mb-4 sm:mb-6 tracking-tight flex flex-col items-center">
                <span>One Dollar.</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 mt-1 pb-1">
                  Infinite Opportunity.
                </span>
              </h2>
              <p className="text-sm sm:text-lg md:text-xl text-black dark:text-muted-foreground mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto px-1 sm:px-0">
                Financial freedom doesn't need a fortune to start. LetsEarnify was built so that anyone —
                anywhere in the world — can build real, diversified digital income.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-[320px] sm:max-w-2xl mx-auto mb-10 px-4">
                <Link
                  href="/signup"
                  className="group relative w-full sm:w-1/2 overflow-hidden rounded-2xl h-16"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-primary to-emerald-500 group-hover:scale-110 transition-transform duration-500"></div>
                  <button className="relative w-full h-full flex items-center justify-center gap-2 text-white font-black text-sm sm:text-lg shadow-xl group-hover:-translate-y-0.5 transition-all">
                    Create Account — Only $1
                    <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link
                  href="/login"
                  className="group relative w-full sm:w-1/2 overflow-hidden rounded-2xl h-16 border border-border/80 hover:border-indigo-500/50 transition-colors"
                >
                  <div className="absolute inset-0 bg-secondary/30 backdrop-blur-xl group-hover:bg-indigo-500/5 transition-all"></div>
                  <button className="relative w-full h-full flex items-center justify-center gap-2 text-foreground font-bold text-sm sm:text-lg group-hover:text-indigo-400 transition-colors">
                    Sign In to Dashboard
                  </button>
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-6 text-[11px] sm:text-sm text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" /> No monthly fees</span>
                <span className="hidden sm:inline text-border/50">•</span>
                <span className="flex items-center gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" /> Cancel anytime</span>
                <span className="hidden sm:inline text-border/50">•</span>
                <span className="flex items-center gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" /> Globally accessible</span>
              </div>
            </div>
          </FadeIn>
        </section>

      </main>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════ */}
      <footer className="bg-card border-t border-border pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <Link href="/" className="text-2xl font-serif font-bold bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent mb-6 inline-block">
                Let'$Earnify
              </Link>
              <p className="text-black dark:text-muted-foreground text-sm leading-relaxed mt-4 font-medium">
                A structured digital earning platform where one $1 activation unlocks five income streams — permanently.
              </p>
              <div className="flex gap-3 mt-6">
                <Link href="/signup" className="px-4 py-2 bg-foreground text-background rounded-lg text-xs font-bold hover:bg-foreground/90 transition-colors">
                  Sign Up
                </Link>
                <Link href="/login" className="px-4 py-2 bg-card border border-border text-foreground rounded-lg text-xs font-bold hover:border-primary/40 transition-colors">
                  Log In
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-foreground">Platform</h4>
              <ul className="space-y-4 text-sm text-black/80 dark:text-muted-foreground font-medium">
                <li><Link href="/#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/security" className="hover:text-primary transition-colors">Security & Trust</Link></li>
                <li><Link href="/about#how-it-works" className="hover:text-primary transition-colors">How it Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-foreground">Company</h4>
              <ul className="space-y-4 text-sm text-black/80 dark:text-muted-foreground font-medium">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/stories" className="hover:text-primary transition-colors">Success Stories</Link></li>
                <li><Link href="/support" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-foreground">Legal</h4>
              <ul className="space-y-4 text-sm text-black/80 dark:text-muted-foreground font-medium">
                <li><Link href="/security" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/terms#risk-disclosure" className="hover:text-primary transition-colors">Risk Disclosure</Link></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-black/60 dark:text-muted-foreground border-t border-border pt-10 font-medium">
            © {new Date().getFullYear()} Let'$Earnify. All rights reserved.
          </div>
        </div>
      </footer>

      {/* AUTO-OPEN SIGNUP MODAL (for referral links) */}
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Account</h3>
                <button
                  onClick={() => setIsSignupOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                {refCode && (
                  <div className="mb-6 p-4 bg-indigo-100 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-start gap-3">
                    <StarIcon className="w-5 h-5 text-indigo-700 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Referral Applied!</p>
                      <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-1">
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

// ═══════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════

function FadeIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay, ease: "easeOut" }}
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  )
}

function FeatureCard({ title, desc, icon, gradient, delay, badge, stat }: {
  title: string, desc: string, icon: string, gradient: string, delay: number, badge?: string, stat?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      viewport={{ once: true }}
      className="p-8 bg-card rounded-[2rem] shadow-sm border border-border hover:shadow-xl transition-all duration-300 group cursor-default relative overflow-hidden"
    >
      {badge && (
        <div className="absolute top-6 right-6 px-3 py-1 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {badge}
        </div>
      )}
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-3 text-foreground font-serif">{title}</h3>
      <p className="text-black dark:text-muted-foreground leading-relaxed text-sm mb-4">{desc}</p>
      {stat && (
        <div className="text-[11px] font-bold text-primary uppercase tracking-wider border-t border-border pt-4 mt-auto">
          {stat}
        </div>
      )}
    </motion.div>
  )
}

function TrustCard({ title, desc, icon, color, hoverBorder, delay }: {
  title: string, desc: string, icon: string, color: string, hoverBorder: string, delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className={`p-10 bg-card rounded-[2rem] shadow-sm border border-border flex flex-col items-center text-center ${hoverBorder} hover:shadow-lg transition-all group`}
    >
      <div className={`w-20 h-20 ${color.split(' ')[0]} ${color.split(' ')[1]} rounded-full flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform`}>{icon}</div>
      <h3 className="font-bold text-xl mb-3 text-foreground">{title}</h3>
      <p className="text-black dark:text-muted-foreground text-sm leading-relaxed">{desc}</p>
    </motion.div>
  )
}
