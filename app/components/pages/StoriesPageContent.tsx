"use client"

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  StarIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowRightIcon
} from "@heroicons/react/24/solid"

import LandingHeader from "../LandingHeader"
import Footer from "../layout/Footer"
import InlineBackButton from "../ui/InlineBackButton"

// Stats Data
const platformStats = [
  {
    label: "Active Earners",
    value: "50,000+",
    icon: <UsersIcon className="w-6 h-6 text-indigo-500" />
  },
  {
    label: "Global Reach",
    value: "120+ Countries",
    icon: <GlobeAltIcon className="w-6 h-6 text-teal-500" />
  },
  {
    label: "Total Paid Out",
    value: "$2M+",
    icon: <CurrencyDollarIcon className="w-6 h-6 text-emerald-500" />
  }
]

// Success Stories Data
const stories = [
  {
    name: "Sarah Jenkins",
    role: "Freelancer",
    content: "LetsEarnify has completely changed how I manage my side income. The $1 accessibility model is brilliant. I started with simple tasks and now earn consistently every week. The payouts are incredibly fast too!",
    rating: 5,
    location: "United Kingdom",
    earnings: "$1,250",
    initial: "S",
    gradient: "from-pink-500 to-rose-400"
  },
  {
    name: "Michael Chen",
    role: "Student",
    content: "I started using this platform to pay for my textbooks. Now it covers my rent! The referral program is generous, transparent, and unlike anything I've seen. Building a unilevel network actually works here.",
    rating: 5,
    location: "Canada",
    earnings: "$840",
    initial: "M",
    gradient: "from-blue-500 to-cyan-400"
  },
  {
    name: "Amara Okeke",
    role: "Digital Nomad",
    content: "Best earning platform I've found. No hidden fees, no impossible thresholds. Just honest work for honest pay. The Mudaraba pool is a phenomenal addition for passive growth.",
    rating: 5,
    location: "Nigeria",
    earnings: "$2,100",
    initial: "A",
    gradient: "from-amber-500 to-orange-400"
  },
  {
    name: "David Silva",
    role: "Part-time Earner",
    content: "The transparency is what hooked me. I can see exactly where my earnings are coming from. The daily micro-tasks combined with the Spin & Win feature makes it genuinely fun to log in every day.",
    rating: 5,
    location: "Brazil",
    earnings: "$430",
    initial: "D",
    gradient: "from-emerald-500 to-teal-400"
  },
  {
    name: "Elena Rostova",
    role: "Community Leader",
    content: "I've built a team of over 200 people using my referral link. The dashboard analytics help me track my network's progress clearly. It's empowering to help others achieve financial independence.",
    rating: 5,
    location: "Russia",
    earnings: "$3,400",
    initial: "E",
    gradient: "from-purple-500 to-fuchsia-400"
  },
  {
    name: "James Wilson",
    role: "Online Entrepreneur",
    content: "I've tried dozens of platforms, but this one stands out. The $1 model removes the barrier to entry, allowing anyone to start earning immediately. The UI is sleek, professional, and trustworthy.",
    rating: 5,
    location: "Australia",
    earnings: "$1,890",
    initial: "J",
    gradient: "from-indigo-500 to-blue-500"
  }
]

export default function StoriesPageContent() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      <LandingHeader />

      <main className="flex-1 pt-24 pb-24 overflow-hidden relative">
        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] opacity-30 dark:opacity-20 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-indigo-500/30 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        {/* Back Navigation */}
        <div className="max-w-7xl mx-auto px-6 relative z-10 mb-8 mt-4">
           <InlineBackButton />
        </div>

        {/* Hero Section */}
        <section className="px-6 text-center relative z-10 mb-16">
           <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-semibold mb-6">
                  <StarIcon className="w-4 h-4" />
                  Real People, Real Earnings
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-foreground mb-6">
                  Transforming Lives with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">Global Opportunities</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                  Discover how our accessible $1 model is empowering individuals worldwide to achieve financial freedom through transparent, ethical earning.
                </p>
              </motion.div>
           </div>
        </section>

        {/* Impact Stats */}
        <section className="px-6 relative z-10 mb-20">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-card/60 backdrop-blur-xl border border-border rounded-[2rem] p-8 shadow-xl"
            >
              {platformStats.map((stat, i) => (
                <div key={i} className="flex items-center justify-center md:justify-start gap-4 p-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center border border-border/50 shadow-inner">
                    {stat.icon}
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Stories Grid */}
        <section className="max-w-7xl mx-auto px-6 relative z-10 mb-24">
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {stories.map((story, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="bg-card border border-border rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col h-full group"
                >
                   {/* Header User Details */}
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br ${story.gradient} shadow-md`}>
                            {story.initial}
                         </div>
                         <div>
                            <h3 className="font-bold text-foreground text-lg leading-tight">{story.name}</h3>
                            <div className="text-xs font-medium text-muted-foreground">{story.role} • {story.location}</div>
                         </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Earned</span>
                         <span className="text-lg font-bold text-emerald-500 tracking-tight">{story.earnings}</span>
                      </div>
                   </div>

                   {/* Rating */}
                   <div className="flex gap-1 mb-4">
                     {[...Array(story.rating)].map((_, i) => (
                       <StarIcon key={i} className="w-4 h-4 text-amber-400 drop-shadow-sm" />
                     ))}
                   </div>

                   {/* Content */}
                   <div className="flex-1">
                      <p className="text-muted-foreground leading-relaxed italic text-sm md:text-base relative z-10">
                        "{story.content}"
                      </p>
                   </div>
                   
                   {/* Bottom Accent Line */}
                   <div className="h-1 w-0 bg-gradient-to-r from-primary to-indigo-500 mt-6 rounded-full group-hover:w-full transition-all duration-500 ease-out" />
                </motion.div>
              ))}
           </div>
        </section>

        {/* Call to Action Layer */}
        <section className="px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 via-background to-indigo-500/10 border border-primary/20 rounded-[2.5rem] p-10 md:p-16 text-center overflow-hidden relative shadow-2xl"
          >
            {/* Background Glows for CTA */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -ml-32 -mb-32" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 shadow-sm">
                Ready to Write Your Own Story?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg leading-relaxed">
                Join thousands of others building sustainable income. Start today with just $1 and let your journey begin.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Get Started For $1
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="w-full sm:w-auto px-8 py-3.5 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl font-bold border border-border shadow-sm transition-all flex items-center justify-center"
                >
                  See How It Works
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
