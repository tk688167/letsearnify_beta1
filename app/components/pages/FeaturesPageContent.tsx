"use client";

import { motion } from "framer-motion";
import LandingHeader from "@/app/components/LandingHeader";
import Footer from "@/app/components/layout/Footer";
import {
  UserGroupIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  WalletIcon,
  BriefcaseIcon,
  SparklesIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

export default function FeaturesPageContent() {
  const features = [
    {
      title: "Worldwide Referral System",
      description: "Unlock the power of networking with our global referral system. You can create your own network that reaches up to 15 levels deep, allowing you to earn commissions not just from your direct sign-ups, but from the entire network that grows beneath you. Every new member who joins through your unique link puts money directly in your pocket—instantly. As your network expands across the world, your residual income grows automatically, requiring minimal effort to maintain.",
      icon: UserGroupIcon,
      accentColor: "from-blue-500 to-cyan-400",
    },
    {
      title: "Micro Task Bounties",
      description: "Maximize your daily earnings by completing quick, easy tasks—whether that's watching videos, testing new products, or engaging on social media. These micro bounties are designed to fit seamlessly into your routine, take just minutes, and are always available in abundance. Best of all, you can claim your rewards every single day, turning spare moments into real income.",
      icon: CheckBadgeIcon,
      accentColor: "from-emerald-500 to-teal-400",
    },
    {
      title: "Mudaraba Earning Pools",
      description: "Join our Mudaraba Earning Pools to grow your savings in a way that's fully halal and ethical. Simply deposit your funds, and you'll receive a daily share of the platform's collective earnings—always free from Riba (interest). It's a transparent, community-driven approach to earning that lets you watch your balance grow while staying true to your values.",
      icon: BanknotesIcon,
      accentColor: "from-amber-500 to-orange-400",
    },
    {
      title: "Spin to Win Gifts",
      description: "Add a little excitement to your day with our Spin to Win feature. Every day, you get a chance to spin our digital reward wheel and walk away with instant prizes—ranging from free cash and exclusive account upgrades to powerful bonuses that can boost your earnings by multiples. It's a fun, risk-free way to make every login rewarding.",
      icon: SparklesIcon,
      accentColor: "from-fuchsia-500 to-pink-400",
    },
    {
      title: "Freelancing Hub",
      description: "Tap into our vibrant Freelancing Hub, where you can offer your skills or find talented professionals to help with your next project. Whether you need a standout logo, compelling content, or any other service, our marketplace connects you with a supportive community ready to buy and sell expertise. The possibilities are endless, and every transaction helps you build your reputation and income.",
      icon: BriefcaseIcon,
      accentColor: "from-indigo-500 to-purple-400",
    },
    {
      title: "Auto Crypto Wallet",
      description: "With our Auto Crypto Wallet, managing your earnings couldn't be easier. Every reward you earn is instantly deposited into your personal smart wallet, ready for you to use at your convenience. Withdraw your funds quickly to local services like EasyPaisa and JazzCash, or convert them to popular international options such as USDT and Payeer. Enjoy fast access, minimal fees, and a hassle-free experience every step of the way.",
      icon: WalletIcon,
      accentColor: "from-rose-500 to-red-400",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060e25] transition-colors duration-300">
      <LandingHeader />

      <main className="pt-28 pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-20">
           
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
              Platform Features
            </h1>
            
            <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Let'sEarnify was created with one goal in mind: to give you a simple, reliable, and rewarding way to earn money online. Our platform brings together six powerful features, each designed to help you build steady, long-term earnings.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-8 rounded-3xl  bg-slate-50 dark:bg-[#060e27] border border-slate-200 dark:border-white/5 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.accentColor} flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20`}>
                  <feature.icon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}