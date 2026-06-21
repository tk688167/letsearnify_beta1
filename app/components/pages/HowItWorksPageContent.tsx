"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import LandingHeader from "@/app/components/LandingHeader";
import Footer from "@/app/components/layout/Footer";
import {
  UserPlusIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  SparklesIcon,
  BanknotesIcon,
  ArrowRightIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";

export default function HowItWorksPageContent() {
  const steps = [
    {
      id: "01",
      title: "Registration",
      description: "Getting started is simple and secure. Just sign up and select the membership tier that best fits your goals—whether you're aiming for maximum earnings or just exploring. Each tier comes with its own set of benefits, including higher earning multipliers and exclusive access to different income pools. Your journey begins the moment you join.",
      icon: UserPlusIcon,
      color: "blue",
      tags: ["Secure Verification", "Zero Hidden Fees", "Instant Access"],
    },
    {
      id: "02",
      title: "Funding & Activation",
      description: "Once registered, you can fund your personal wallet using a variety of trusted payment gateways. Every deposit you make is protected with advanced security measures, and you'll see your balance credited instantly. Behind the scenes, a portion of all deposits across the network is automatically set aside to power our Reward Pools—making sure there's always value being shared with the community.",
      icon: CurrencyDollarIcon,
      color: "emerald",
      tags: ["Multiple Gateways", "Transparent Fees", "Instant Crediting"],
    },
    {
      id: "03",
      title: "Active Earning",
      description: "With your account active, you're ready to start earning right away. Choose from a variety of opportunities: complete simple daily tasks for quick rewards, take on freelance gigs that match your skills, or grow your network using our Unilevel referral system. The more you participate, the more you earn—giving you full control over your income.",
      icon: BriefcaseIcon,
      color: "violet",
      tags: ["Daily Tasks", "Freelance Gigs", "Level 1-5 Referrals"],
    },
    {
      id: "04",
      title: "Automated Rewards",
      description: "As you stay active, you'll unlock access to multiple streams of passive income. Our intelligent system automatically distributes a share of the platform's revenue to you through a variety of reward pools—including CBSP, Royalty, Achievement, and Mudaraba. These automated distributions mean your earnings can keep growing, even when you're not actively online.",
      icon: SparklesIcon,
      color: "amber",
      tags: ["CBSP (Weekly)", "Royalty (Monthly)", "Instant Milestones"],
    },
    {
      id: "05",
      title: "Secure Withdrawals",
      description: "When you're ready to enjoy your earnings, withdrawing your funds is fast and straightforward. Choose from convenient local payment methods like JazzCash, EasyPaisa, or direct bank transfers—or opt for global options such as crypto wallets. Every withdrawal is processed promptly and with low, transparent fees, so you can access your money with complete peace of mind.",
      icon: BanknotesIcon,
      color: "rose",
      tags: ["24-48hr Processing", "Low Flat Fees", "Full Audit Logs"],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060e25]  transition-colors duration-300">
      <LandingHeader />

      <main className="pt-28 pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
              How It Works
            </h1>
            <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              We've designed our platform to seamlessly connect your everyday efforts with long-term, automated rewards. Here's how your journey unfolds, step by step.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 rounded-3xl bg-slate-50 dark:bg-[#060e27] border border-slate-200 dark:border-white/5 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getColorClasses(step.color).gradient} flex items-center justify-center mb-6 shadow-lg shadow-black/5`}>
                  <step.icon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>

                <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Step {step.id}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{step.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 flex-grow">{step.description}</p>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-white/5">
                  {step.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-slate-200/50 dark:bg-white/5 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

        
        </div>
      </main>

      <Footer />
    </div>
  );
}

function getColorClasses(color: string) {
  const map: Record<string, { gradient: string }> = {
    blue: { gradient: "from-blue-500 to-cyan-400" },
    emerald: { gradient: "from-emerald-500 to-teal-400" },
    violet: { gradient: "from-violet-500 to-purple-400" },
    amber: { gradient: "from-amber-500 to-orange-400" },
    rose: { gradient: "from-rose-500 to-red-400" },
  };
  return map[color] || map.blue;
}