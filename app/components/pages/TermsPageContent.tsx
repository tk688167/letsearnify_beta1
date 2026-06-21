"use client";

import React from "react";
import { motion } from "framer-motion";
import LandingHeader from "../../components/LandingHeader";
import Footer from "../layout/Footer";
import {
  CurrencyDollarIcon,
  UsersIcon,
  SparklesIcon,
  ShieldCheckIcon,
  TicketIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

export default function TermsPageContent() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#060e25] text-foreground font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      <LandingHeader />

      <main className="flex-1 pt-20 pb-20 sm:pt-24 sm:pb-24 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-[80px] sm:blur-[120px] mix-blend-normal dark:mix-blend-screen" />
          <div className="absolute top-[15%] right-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-fuchsia-500/10 dark:bg-fuchsia-500/10 rounded-full blur-[80px] sm:blur-[120px] mix-blend-normal dark:mix-blend-screen" />
        </div>

        {/* Page Header */}
        <section className="pt-4 pb-10 sm:pt-8 sm:pb-16 px-4 sm:px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[2rem] leading-[1.1] sm:text-5xl md:text-6xl font-serif font-black text-foreground mb-3 sm:mb-6 tracking-tight flex flex-col sm:block"
            >
              <span>Our Commitment to </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500">
                Transparent Disclosure.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-[13px] sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-1 sm:px-2"
            >
              We believe in absolute clarity. There are no hidden fees, no
              fine print, and certainly no confusing jargon. Our commitment
              is to ensure you understand—down to the last detail—how our
              financial processes work and how every part of the platform
              benefits you.
            </motion.p>

            {/* Last updated */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs sm:text-sm text-muted-foreground/60 mt-4"
            >
              Last updated: February 2026
            </motion.p>
          </div>
        </section>

        {/* Content Area */}
        <div className="max-w-5xl mx-auto px-4  sm:px-6 relative z-10 space-y-4 sm:space-y-6">
          {/* Section 1: The $1 Activation Model */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-50 dark:bg-[#060e28] p-6 sm:p-10 rounded-[1rem] border border-border/60 dark:border-white/5 group shadow-sm hover:border-indigo-500/30 transition-colors"
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex-shrink-0">
                <CurrencyDollarIcon className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-foreground tracking-tight">
                1. The <span className="text-primary">$1 Activation</span> Model
              </h2>
            </div>
            <div className="space-y-3 sm:space-y-4 text-[13.5px] sm:text-[15px] text-muted-foreground leading-relaxed">
              <p>
                LetsEarnify thrives on the genuine participation of active
                users. To safeguard our community and protect against
                automated bots or fraudulent accounts, we require a one-time
                $1 activation fee. This simple step helps maintain a
                high-quality network where real people can truly benefit.
              </p>
              <p>
                It's important to understand: LetsEarnify is not an
                investment scheme. There are no guaranteed returns or
                promises of passive income. Your earnings depend entirely on
                your personal effort—whether that's completing tasks,
                referring friends, or actively engaging within our
                ecosystem. The more you contribute, the more you can earn.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Section 2: Pool Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-slate-50 dark:bg-[#060e28] p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] border border-border/60 dark:border-white/5 shadow-sm group hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <UsersIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                  2. Pool Distribution
                </h2>
              </div>
              <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                Every dollar from activation fees is funneled directly back
                into the community ecosystem—nothing is withheld.
                LetsEarnify sustains itself solely through partnerships with
                merchants and carefully selected advertising, ensuring that
                the community remains the primary beneficiary.
              </p>
              <ul className="list-none space-y-2 text-[12px] sm:text-[14px] text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span>
                    <strong className="text-foreground">Direct Referrals:</strong>{" "}
                    Earn instant rewards when you bring new members into the
                    network, helping our community grow stronger.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span>
                    <strong className="text-foreground">CBSP (Mudaraba):</strong>{" "}
                    Participate in an ethical profit-sharing system inspired
                    by Islamic financial principles, ensuring fairness and
                    transparency for all.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span>
                    <strong className="text-foreground">Royalty &amp; Achievement Pools:</strong>{" "}
                    Special rewards set aside to recognize outstanding
                    contributors and leaders within the LetsEarnify community.
                  </span>
                </li>
              </ul>
            </motion.div>

            {/* Section 3: Gamified Mechanics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-slate-50 dark:bg-[#060e28] p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] border border-border/60 dark:border-white/5 shadow-sm group hover:border-fuchsia-500/30 transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <TicketIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                  3. Gamified Mechanics
                </h2>
              </div>
              <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed">
                Earnings from activities—such as completing micro-tasks,
                tracking progress, or trying your luck on the Spin Wheel—are
                flexible and change with the platform's real-time
                environment.
              </p>
              <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed mt-2">
                Several factors influence the real-world value of your
                rewards, including global advertising demand, merchant
                budgets, and the daily activity of LetsEarnify's user base.
                Because of this, reward values may rise or fall over time,
                reflecting the natural ebb and flow of our ecosystem.
              </p>
            </motion.div>
          </div>

          {/* Section 4: Accurate Withdrawals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-slate-50 dark:bg-[#060e28] p-6 sm:p-10 rounded-[1.25rem] sm:rounded-[2rem] border border-border/60 dark:border-white/5 shadow-lg group hover:border-amber-500/30 transition-colors"
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex-shrink-0">
                <BanknotesIcon className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-foreground tracking-tight">
                4. Accurate <span className="text-amber-500">Withdrawals</span>
              </h2>
            </div>
            <div className="space-y-3 sm:space-y-4 text-[13.5px] sm:text-[15px] text-muted-foreground leading-relaxed">
              <p>
                Withdrawals are processed securely through trusted channels
                such as EasyPaisa, JazzCash, USDT, and direct bank transfers.
                We prioritize both speed and security, so you can access your
                earnings with confidence.
              </p>
              <p>
                <strong className="text-foreground">
                  Maintaining platform integrity is non-negotiable.
                </strong>{" "}
                To protect our honest users, we reserve the right to audit
                accounts before processing withdrawals. Any use of automated
                scripts, multiple accounts, or VPN-based manipulation is
                strictly prohibited and will result in permanent loss of
                earnings. Our priority is to keep LetsEarnify a fair, clean,
                and rewarding space for genuine participants.
              </p>
            </div>
          </motion.div>

          {/* Closing Commitment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-6 sm:mt-10 bg-primary/5 dark:bg-primary/10 border border-primary/20 p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] text-center flex flex-col items-center justify-center gap-3"
          >
            <ShieldCheckIcon className="w-8 h-8 text-primary" />
            <h3 className="text-[15px] sm:text-lg font-bold text-foreground">
              What You Can Expect From Us
            </h3>
            <p className="text-[12px] sm:text-[14px] text-muted-foreground max-w-2xl">
              LetsEarnify exists to serve its community. We're committed to
              providing ethical tools, full transparency, and reliable
              systems—you bring the drive and initiative. If you ever have a
              question, concern, or dispute, our support team is here to help
              promptly and transparently every step of the way.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}