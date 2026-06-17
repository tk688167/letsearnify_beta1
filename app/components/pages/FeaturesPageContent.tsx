"use client"

import { motion } from "framer-motion"
import LandingHeader from "@/app/components/LandingHeader"
import Footer from "@/app/components/layout/Footer"
import InlineBackButton from "@/app/components/ui/InlineBackButton"
import { 
  UserGroupIcon, 
  CheckBadgeIcon, 
  BanknotesIcon, 
  WalletIcon, 
  BriefcaseIcon,
  SparklesIcon
} from "@heroicons/react/24/outline"

export default function FeaturesPageContent() {

  const features = [
    {
      title: "Worldwide Referral System",
      description: "Build your own 15-level deep referring system. Get paid commissions immediately for every person who signs up using your unique link. Grow your residual income worldwide as your network multiplies with little maintenance work from you.",
      icon: UserGroupIcon,
      accentColor: "text-blue-500",
      bgHover: "hover:border-blue-500/30"
    },
    {
      title: "Micro Task Bounties",
      description: "Complete small tasks everyday like watching videos, beta testing, and social media activities. They're simple tasks that take little time and are available in high volume. Claim your earnings daily.",
      icon: CheckBadgeIcon,
      accentColor: "text-emerald-500",
      bgHover: "hover:border-emerald-500/30"
    },
    {
      title: "Mudaraba Earning Pools",
      description: "Participate in our halal earning pools. Deposit your funds and earn a daily cut of the overall platform earnings. No Riba (interest) involved.",
      icon: BanknotesIcon,
      accentColor: "text-amber-500",
      bgHover: "hover:border-amber-500/30"
    },
    {
      title: "Spin to Win Gifts",
      description: "Spin our reward wheel once every day to win free cash, account upgrades, and highMultiplier bonuses that can exponentially grow your earnings.",
      icon: SparklesIcon,
      accentColor: "text-fuchsia-500",
      bgHover: "hover:border-fuchsia-500/30"
    },
    {
      title: "Freelancing Hub",
      description: "Sell your services or buy services from others in the community. Need logo design? How about content writing? We have it all. Buy and sell services with anyone else in the community.",
      icon: BriefcaseIcon,
      accentColor: "text-indigo-500",
      bgHover: "hover:border-indigo-500/30"
    },
    {
      title: "Auto Crypto Wallet",
      description: "All funds you earn are automatically deposited into our smart wallet. Cashout fast to local accounts such as EasyPaisa and JazzCash, or exchange for international accounts like USDT and Payeer. Low fees. Less nonsense.",
      icon: WalletIcon,
      accentColor: "text-rose-500",
      bgHover: "hover:border-rose-500/30"
    }
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col font-sans selection:bg-primary/30">
      
      {/* Ambient Animated Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-fuchsia-500/10 blur-[120px] mix-blend-screen animate-pulse-slow object-right" style={{ animationDelay: '2s' }}></div>
      </div>

      <LandingHeader />

      <main className="flex-grow pt-24 pb-20 px-4 md:px-6 z-10 w-full">
        <div className="max-w-7xl mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/40 backdrop-blur-xl border border-border/80 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-10 md:p-16 relative overflow-hidden"
          >
            {/* Header Area */}
            <div className="mb-10 sm:mb-16">
              <InlineBackButton className="mb-6 inline-flex" />
              <div className="text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
                  Platform Features
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0 leading-relaxed font-medium">
                 Let'sEarnify is designed to be an all-in-one solution to earn money online. These are the 6 key features that combine to provide you with sustainable and dependable earnings.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`group bg-background/50 backdrop-blur-md border border-border/50 rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${feature.bgHover} relative overflow-hidden flex flex-col`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-card border border-border/50 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <feature.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${feature.accentColor}`} />
                  </div>
                  
                  <div className="relative z-10 flex-grow">
                    <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground/90 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

          </motion.div>
        
        </div>
      </main>

      <Footer />
    </div>
  )
}
