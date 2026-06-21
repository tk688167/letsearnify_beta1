"use client";

import React from "react";
import { motion } from "framer-motion";
import LandingHeader from "../../components/LandingHeader";
import Footer from "../layout/Footer";
import {
  ShieldCheckIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  BriefcaseIcon,
  TicketIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export default function AboutPageContent() {
  const earningStreams = [
    {
      title: "1. Referral Matrix",
      description: "Build your active network and earn instant, compounding commissions up to 10 levels deep from every activation.",
      icon: UserGroupIcon,
      accent: "from-indigo-500 to-blue-500",
    },
    {
      title: "2. Micro-Tasks",
      description: "Perform simple digital actions like watching ads, testing apps, or taking surveys for immediate daily income.",
      icon: BriefcaseIcon,
      accent: "from-emerald-500 to-teal-500",
    },
    {
      title: "3. Mudaraba Pools",
      description: "Participate in Shariah-compliant, ethically derived weekly passive yield investments with profit-sharing.",
      icon: ArrowTrendingUpIcon,
      accent: "from-fuchsia-500 to-purple-500",
    },
    {
      title: "4. Freelance Market",
      description: "Offer your digital skills to a global audience and secure payments seamlessly through our built-in escrow.",
      icon: GlobeAltIcon,
      accent: "from-amber-500 to-orange-500",
    },
    {
      title: "5. Spin & Win",
      description: "Log in daily to spin the gamified reward wheel for random bonuses, cash prizes, and platform multipliers.",
      icon: TicketIcon,
      accent: "from-rose-500 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060e25] transition-colors duration-300">
      <LandingHeader />

      <main className="pt-28 pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Main Container */}
          <div >
            
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
                Platform <span className="text-primary">Mechanics</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                Let'sEarnify is engineered on simple, transparent logic. We eliminate hidden fees and empty promises to deliver a secure ecosystem built entirely around value creation and fair rewards.
              </p>
            </div>

            {/* Section 1: Foundation */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 bg-slate-50 dark:bg-[#060e28]  border border-border/50 rounded-3xl p-8 md:p-10 shadow-sm"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1 text-center  md:text-left">
                  <h2 className="text-2xl font-bold text-foreground mb-4">The $1 Foundation</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    We replaced expensive subscriptions with a strict, one-time $1 activation fee. This micro-transaction serves as a firewall against bots while funding our reward pools.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {["Lifetime Access", "Quality Control", "Initial Liquidity"].map((item, i) => (
                      <div key={i} className="px-4 py-3 bg-slate-50 dark:bg-[#060e28]  rounded-xl border border-border/50 text-foreground/80 text-sm font-semibold">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Section 2: Streams Grid */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-10 text-center">The 5 Growth Pillars</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {earningStreams.map((stream, idx) => (
                  <div key={idx} className="p-6 rounded-3xl bg-slate-50 dark:bg-[#060e28] border border-border/50 hover:border-primary/50 transition-all duration-300">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stream.accent} flex items-center justify-center mb-6`}>
                      <stream.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3">{stream.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{stream.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Mission */}
            <section className="grid md:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10">
                <ShieldCheckIcon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Absolute Transparency</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We maintain open policies without hidden clauses. From profit-sharing ratios to zero withdrawal fees—you keep exactly what you earn.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                <GlobeAltIcon className="w-8 h-8 text-emerald-500 mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Global Accessibility</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Financial empowerment shouldn't be restricted. Our gateways ensure that whether you use Crypto or local banks, your potential remains equal.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}