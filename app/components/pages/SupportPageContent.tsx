"use client"

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import LandingHeader from "../LandingHeader"
import Footer from "../layout/Footer"
import { 
  QuestionMarkCircleIcon, 
  ChatBubbleLeftRightIcon, 
  EnvelopeIcon, 
  BookOpenIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline"

export default function SupportPageContent() {
  const supportChannels = [
    {
      title: "Knowledge Base",
      description: "Find instant answers to common questions about earnings, the $1 activation, and withdrawals.",
      icon: <QuestionMarkCircleIcon className="w-6 h-6 sm:w-8 sm:h-8" />,
      action: "Browse FAQs",
      href: "/faq",
      color: "text-indigo-500",
      bgHover: "hover:border-indigo-500/50 hover:bg-indigo-500/5",
      delay: 0.1
    },
    {
      title: "Live Chat Support",
      description: "Connect instantly with our support agents for urgent inquiries and real-time troubleshooting.",
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6 sm:w-8 sm:h-8" />,
      action: "Start Chat",
      href: "#", // Placeholder for live chat widget
      color: "text-emerald-500",
      bgHover: "hover:border-emerald-500/50 hover:bg-emerald-500/5",
      delay: 0.2
    },
    {
      title: "Email Support",
      description: "Send us a detailed message. Perfect for verification documents or complex account issues.",
      icon: <EnvelopeIcon className="w-6 h-6 sm:w-8 sm:h-8" />,
      action: "Email Us",
      href: "mailto:support@letsearnify.com",
      color: "text-fuchsia-500",
      bgHover: "hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5",
      delay: 0.3
    },
    {
      title: "Community Guides",
      description: "Learn strategies, tips, and best practices directly from our top-earning community members.",
      icon: <BookOpenIcon className="w-6 h-6 sm:w-8 sm:h-8" />,
      action: "Read Guides",
      href: "/about", // Placeholder for community/blog
      color: "text-amber-500",
      bgHover: "hover:border-amber-500/50 hover:bg-amber-500/5",
      delay: 0.4
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary relative overflow-x-hidden">
      <LandingHeader />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-fuchsia-500/10 rounded-full blur-[120px]" />
      </div>

      <main className="flex-1 relative z-10 pt-24 md:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Main Glassmorphism Container Box */}
          <div className="bg-card/40 backdrop-blur-xl border border-border/80 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-10 md:p-14 relative overflow-hidden">
            
            {/* Subtle Back Button inside the box */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
               <Link 
                 href="/" 
                 className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-lg transition-colors"
               >
                 <ArrowLeftIcon className="w-3.5 h-3.5" />
                 <span className="hidden sm:inline">Back</span>
               </Link>
            </div>

            {/* Decorative Inner Glow */}
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10"></div>
            
            {/* Header Section */}
            <div className="text-center mb-10 md:mb-16 relative z-10 px-2 mt-8 sm:mt-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-5 shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse relative">
                  <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-50"></span>
                </span>
                24/7 Assistance
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl font-serif font-black mb-4 tracking-tight flex items-center justify-center gap-2 flex-wrap"
              >
                <span className="text-foreground">Help &</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500">
                  Support
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground/90 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
              >
                Need assistance with your account, earnings, or verification? Our dedicated team and extensive resources are here to ensure your success on the platform.
              </motion.p>
            </div>

            {/* Support Channels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 relative z-10">
              {supportChannels.map((channel, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: channel.delay }}
                  className={`group flex flex-col items-start p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-border/60 bg-background/50 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-lg ${channel.bgHover}`}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center bg-card shadow-inner border border-border/50 mb-5 sm:mb-6 ${channel.color} group-hover:scale-110 transition-transform duration-300`}>
                    {channel.icon}
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">{channel.title}</h2>
                  
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8 flex-1">
                    {channel.description}
                  </p>
                  
                  <Link 
                    href={channel.href}
                    className="mt-auto w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted group-hover:bg-foreground group-hover:text-background text-foreground rounded-xl font-bold text-sm transition-all shadow-sm"
                  >
                    {channel.action}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
