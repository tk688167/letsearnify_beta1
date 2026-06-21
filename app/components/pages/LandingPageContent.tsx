"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import Footer from "../layout/Footer";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import LandingHeader from "../../components/LandingHeader";
import {
  ArrowRightIcon,
  XMarkIcon,
  StarIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import SignupForm from "../../components/auth/SignupForm";
import SocialProofStats from "../ui/SocialProofStats";
import PayoutsCarousel from "../ui/PayoutsCarousel";
import TestimonialsSection from "../../components/landing/TestimonialsSection";
import FAQSection from "../../components/landing/FAQSection";

export default function LandingPageContent({ initialStats, initialProofs }: { initialStats?: any, initialProofs?: any[] }) {
  const searchParams = useSearchParams();
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const refCode = searchParams.get("ref");

  useEffect(() => {
    if (refCode) {
      const timer = setTimeout(() => setIsSignupOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [refCode]);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#060e25] text-foreground overflow-x-hidden font-sans selection:bg-primary/20 selection:text-primary">
      <LandingHeader />

      <main className="flex-1">

        {/* ═══════════════════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════════════════ */}
        <section className="relative pt-25 pb-5 md:pt-34 md:pb-5  overflow-hidden">
          <motion.div style={{ opacity, scale }} className="w-full max-w-7xl mx-auto text-center relative z-10 px-4 sm:px-6">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="font-serif font-black mb-6 leading-[1.05] md:leading-[1.1] tracking-tight">
              <span className="text-[2.2rem] sm:text-5xl md:text-6xl lg:text-7xl text-foreground block">
              Earn, Grow, and
              </span>
              <span className="text-[1.8rem] sm:text-4xl md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 block mt-1">
              Build Your Future
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8"
            >
              Complete tasks, refer friends, and earn rewards through genuine participation.
              A simple activation unlocks everything. just real opportunities to grow your digital income and with our global community, you're never alone on your journey to financial empowerment.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 max-w-2xl mx-auto"
            >
              <Link
                href="/signup"
                className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-indigo-500/25"
              >
                <span className="flex items-center justify-center gap-2">
                  Get Started Now
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                href="/login"
                className="px-8 py-4 border border-border hidden md:block hover:border-indigo-500/50 rounded-2xl font-bold text-lg transition-all duration-300 hover:bg-indigo-500/5"
              >
                Login Dashboard
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                Lifetime access
              </span>
              <span className="hidden sm:inline text-border/30">|</span>
              <span className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                Instant activation
              </span>
              <span className="hidden sm:inline text-border/30">|</span>
              <span className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                Global community
              </span>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FEATURE HIGHLIGHTS - 6 BOXES
        ═══════════════════════════════════════════════════════ */}
        <section className="py-12 md:py-16 bg-slate-100/50 dark:bg-[#060e28]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FadeIn>
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-3 text-foreground">
                  One Platform. Multiple Opportunities.
                </h2>
                <p className="text-sm text-muted-foreground">
                  Explore different ways to earn through genuine activity
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {[
                  { title: "Daily Tasks", icon: "⚡", desc: "Complete tasks & earn rewards" },
                  { title: "Referral Program", icon: "👥", desc: "Invite friends & earn" },
                  { title: "Community Pools", icon: "🏦", desc: "Share in platform growth" },
                  { title: "Skill Marketplace", icon: "🎯", desc: "Offer your services" },
                  { title: "Daily Rewards", icon: "🎁", desc: "Spin & win every day" },
                  { title: "No Subscription", icon: "💎", desc: "Pay once, earn forever" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-[#060e28] border border-border/50 rounded-2xl p-5 text-center hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                    <h3 className="font-bold text-sm text-foreground mb-1">{item.title}</h3>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SOCIAL PROOF STATS
        ═══════════════════════════════════════════════════════ */}
        <SocialProofStats stats={initialStats} />

        {/* ═══════════════════════════════════════════════════════
            ACTIVATION SECTION - NO $1 MENTION
        ═══════════════════════════════════════════════════════ */}
        <section className="py-15  bg-slate-50 dark:bg-[#060e25] relative overflow-hidden">
       

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <FadeIn>
              <div className="text-center max-w-3xl mx-auto mb-12">
              
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black mb-4 text-foreground">
                  One-Time Activation
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Instead of monthly fees, LetsEarnify uses a simple one-time activation.
                  This helps maintain a quality community and unlocks all earning opportunities.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
              <FadeIn>
                <div className="space-y-4">
                  {[
                    {
                      icon: "🔑",
                      title: "Access, Not a Barrier",
                      desc: "One-time activation. Pay once and access all platform activities.",
                    },
                    {
                      icon: "🛡️",
                      title: "Quality Community",
                      desc: "The activation fee helps maintain a community of genuine participants.",
                    },
                    {
                      icon: "♾️",
                      title: "Earn at Your Pace",
                      desc: "Your earnings are based on your activity and participation.",
                    },
                    {
                      icon: "💎",
                      title: "All Opportunities Unlocked",
                      desc: "Tasks, Referrals, Community Pools, Marketplace, and Spin — all included.",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="flex gap-4 p-4 bg-white dark:bg-[#060e28] border border-border rounded-2xl hover:border-primary/20 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="text-2xl shrink-0">{item.icon}</div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground mb-0.5">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-3xl blur-2xl opacity-20" />
                  <div className="relative bg-white dark:bg-[#060e28] rounded-3xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-2xl">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
                      One-Time Activation
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full mb-6 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Pay Once. Participate Forever.
                    </div>

                    <div className="space-y-2.5 text-left mb-8">
                      {[
                        "All earning opportunities",
                        "Referral rewards",
                        "Community pool distributions",
                        "Task rewards",
                        "Daily Spin rewards",
                        "Marketplace access",
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/signup"
                      className="block w-full py-4 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg"
                    >
                      Activate Now
                    </Link>

                    <div className="mt-4 text-xs text-muted-foreground">
                      Already a member?{" "}
                      <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                        Log In
                      </Link>
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
            EARNING OPPORTUNITIES - 5 CARDS
        ═══════════════════════════════════════════════════════ */}
        <section id="features" className="  bg-slate-100/50 dark:bg-[#060e28]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FadeIn>
              <div className="text-center mb-12 sm:mb-16">
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-3 text-foreground">
                  Earning Opportunities
                </h2>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                  Explore different ways to earn through genuine activity and community participation.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                title="Referral Program"
                desc="Invite others and earn rewards through our referral structure. Share the platform with your network."
                icon="👥"
                gradient="from-blue-500 to-indigo-600"
                delay={0}
                badge="Passive"
                stat="Multi-level rewards"
              />
              <FeatureCard
                title="Task Completion"
                desc="Complete verified digital tasks — content reviews, social engagements — and get paid upon completion."
                icon="⚡"
                gradient="from-emerald-500 to-teal-600"
                delay={0.05}
                badge="Active"
                stat="Paid upon verification"
              />
              <FeatureCard
                title="Community Pools"
                desc="Participate in our community profit-sharing pools. Your contributions support the ecosystem."
                icon="🏦"
                gradient="from-amber-500 to-orange-500"
                delay={0.1}
                badge="Community"
                stat="Weekly distributions"
              />
              <FeatureCard
                title="Skill Marketplace"
                desc="List your digital services — design, writing, tech — and connect with a global community."
                icon="🎯"
                gradient="from-pink-500 to-rose-600"
                delay={0.15}
                badge="Service"
                stat="Zero platform fees"
              />
              <FeatureCard
                title="Daily Rewards"
                desc="Daily gamified rewards. Check in every 24 hours for bonus opportunities and surprises."
                icon="🎁"
                gradient="from-purple-500 to-violet-600"
                delay={0.2}
                badge="Daily"
                stat="Every 24 hours"
              />
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                viewport={{ once: true }}
                className="p-8 bg-gradient-to-br from-indigo-600/10 to-fuchsia-600/10 border border-primary/20 rounded-2xl flex flex-col justify-between relative overflow-hidden group"
              >
                <div className="relative z-10">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="font-bold text-xl mb-2 font-serif">Ready to start?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    All opportunities. One simple activation. Join the community today.
                  </p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-bold text-sm hover:bg-foreground/90 transition-all"
                  >
                    Create Account
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

       

        {/* ═══════════════════════════════════════════════════════
            HOW IT WORKS - 4 STEPS
        ═══════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="pt-15 bg-slate-50 dark:bg-[#060e25] relative overflow-hidden">
         

          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <FadeIn>
              <div className="text-center mb-12 sm:mb-16">
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-3 tracking-tight">
                  Four Simple Steps
                </h2>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                  From signup to earning in under 5 minutes. No experience required.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {[
                { number: "01", title: "Create Account", desc: "Sign up with your email. Takes under 60 seconds.", color: "text-blue-500", iconBg: "from-blue-500 to-blue-600" },
                { number: "02", title: "Activate", desc: "Complete the one-time activation to unlock all opportunities.", color: "text-violet-500", iconBg: "from-violet-500 to-violet-600" },
                { number: "03", title: "Participate", desc: "Engage with Tasks, Referrals, Pools, Marketplace, or Spin.", color: "text-emerald-500", iconBg: "from-emerald-500 to-emerald-600" },
                { number: "04", title: "Withdraw", desc: "Track your earnings and withdraw securely to your preferred method.", color: "text-orange-500", iconBg: "from-orange-500 to-orange-600" },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="relative p-6 rounded-2xl border border-border bg-white dark:bg-[#060e28] hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 text-center"
                >
                  <div className={`text-5xl font-black absolute top-3 right-4 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity ${step.color} select-none`}>
                    {step.number}
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.iconBg} flex items-center justify-center font-black text-white text-lg mb-4 shadow-md mx-auto group-hover:scale-110 transition-transform`}>
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-base mb-2 text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>

         
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            TRUST & SECURITY - 3 CARDS
        ═══════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-24 bg-slate-100/50 dark:bg-[#060e28]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FadeIn>
              <div className="text-center mb-12 sm:mb-16">
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-3 tracking-tight">
                  Trust & Transparency
                </h2>
                <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                  Built on principles of security, transparency, and community.
                </p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-6">
              <TrustCard
                title="Secure Platform"
                desc="256-bit SSL encryption and multi-factor authentication protect every user account."
                icon="🛡️"
                color="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                hoverBorder="hover:border-blue-200 dark:hover:border-blue-800"
                delay={0}
              />
              <TrustCard
                title="Community-Driven"
                desc="Our platform is powered by genuine community participation and transparent distribution."
                icon="🤝"
                color="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                hoverBorder="hover:border-emerald-200 dark:hover:border-emerald-800"
                delay={0.1}
              />
              <TrustCard
                title="Real-Time Transparency"
                desc="Every earning, contribution, and withdrawal is logged in real-time. Your account is always transparent."
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
        <section className="py-12  px-4 sm:px-6 bg-slate-50 dark:bg-[#060e25]">
          <FadeIn>
            <div className="max-w-5xl mx-auto bg-white dark:bg-[#060e28] border border-border/60 rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-[45%] text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  24/7 Support
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-foreground mb-3">
                  Always Here To Help
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Quick solutions for onboarding, tasks, and withdrawals. Your journey is fully supported.
                </p>
                <Link
                  href="/support"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-bold text-sm hover:bg-foreground/90 transition-all"
                >
                  Visit Help Center
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>

              <div className="w-full md:w-[55%] grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href="mailto:LetsEarnify@gmail.com" className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#060e28]/50 border border-border/50 rounded-xl hover:border-primary/30 hover:bg-slate-100 dark:hover:bg-[#060e28] transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">📧</div>
                  <div>
                    <div className="font-bold text-sm text-foreground">Email Us</div>
                    <div className="text-xs text-muted-foreground truncate">LetsEarnify@gmail.com</div>
                  </div>
                </a>

                <Link href="/support/tickets" className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#060e28]/50 border border-border/50 rounded-xl hover:border-purple-500/30 hover:bg-slate-100 dark:hover:bg-[#060e28] transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">🎫</div>
                  <div>
                    <div className="font-bold text-sm text-foreground">Ticketing</div>
                    <div className="text-xs text-muted-foreground">Submit a request</div>
                  </div>
                </Link>

                <Link href="/support/knowledge-base" className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#060e28]/50 border border-border/50 rounded-xl hover:border-emerald-500/30 hover:bg-slate-100 dark:hover:bg-[#060e28] transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">📚</div>
                  <div>
                    <div className="font-bold text-sm text-foreground">Guides</div>
                    <div className="text-xs text-muted-foreground">Read tutorials</div>
                  </div>
                </Link>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#060e28]/50 border border-border/30 rounded-xl opacity-60 cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center text-lg shrink-0">💬</div>
                  <div>
                    <div className="font-bold text-sm text-foreground">Live Chat</div>
                    <div className="text-[9px] font-bold text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded w-max mt-0.5">Coming Soon</div>
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

      </main>

      {/* FOOTER */}
      <Footer />

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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-[#060e28] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#060e28] z-10">
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
  );
}

// HELPER COMPONENTS
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

function FeatureCard({
  title,
  desc,
  icon,
  gradient,
  delay,
  badge,
  stat,
}: {
  title: string;
  desc: string;
  icon: string;
  gradient: string;
  delay: number;
  badge?: string;
  stat?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      viewport={{ once: true }}
      className="p-6 bg-white dark:bg-[#060e28] rounded-2xl border border-border hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
    >
      {badge && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-foreground text-background text-[9px] font-bold uppercase tracking-widest rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {badge}
        </div>
      )}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl mb-4 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{desc}</p>
      {stat && (
        <div className="text-[10px] font-bold text-primary uppercase tracking-wider border-t border-border pt-3 mt-auto">
          {stat}
        </div>
      )}
    </motion.div>
  );
}

function TrustCard({
  title,
  desc,
  icon,
  color,
  hoverBorder,
  delay,
}: {
  title: string;
  desc: string;
  icon: string;
  color: string;
  hoverBorder: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4, delay }}
      viewport={{ once: true }}
      className={`p-8 bg-white dark:bg-[#060e28] rounded-2xl border border-border text-center ${hoverBorder} hover:shadow-lg transition-all group`}
    >
      <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center text-2xl mb-4 mx-auto group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}