"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import LandingHeader from "../LandingHeader";
import Footer from "../layout/Footer";
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

export default function SupportPageContent() {
  const supportChannels = [
    {
      title: "Knowledge Base",
      description:
        "Quickly access answers to frequently asked questions about your earnings, how the $1 activation works, and the withdrawal process.",
      icon: <QuestionMarkCircleIcon className="w-6 h-6 sm:w-8 sm:h-8" />,
      action: "Browse FAQs",
      href: "https://letsearnify.com/faq",
      color: "text-indigo-500",
      bgHover: "hover:border-indigo-500/50 hover:bg-indigo-500/5",
      delay: 0.1,
    },
    {
      title: "Live Chat Support",
      description:
        "For urgent issues or immediate troubleshooting, you can connect directly with our support agents through live chat. Get real-time assistance whenever you need it most.",
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6 sm:w-8 sm:h-8" />,
      action: "Start Chat",
      href: "https://letsearnify.com/support#",
      color: "text-emerald-500",
      bgHover: "hover:border-emerald-500/50 hover:bg-emerald-500/5",
      delay: 0.2,
    },
    {
      title: "Email Support",
      description:
        "Prefer to write things out? Email us a detailed message—this is ideal for submitting verification documents or resolving more complex account matters. Our team will review your inquiry thoroughly and respond as soon as possible.",
      icon: <EnvelopeIcon className="w-6 h-6 sm:w-8 sm:h-8" />,
      action: "Email Us",
      href: "mailto:support@letsearnify.com",
      color: "text-fuchsia-500",
      bgHover: "hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5",
      delay: 0.3,
    },
    {
      title: "Community Guides",
      description:
        "Discover proven strategies, helpful tips, and best practices shared by our most successful community members. Tap into their experience to boost your own success on the platform.",
      icon: <BookOpenIcon className="w-6 h-6 sm:w-8 sm:h-8" />,
      action: "Read Guides",
      href: "https://letsearnify.com/about",
      color: "text-amber-500",
      bgHover: "hover:border-amber-500/50 hover:bg-amber-500/5",
      delay: 0.4,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#060e25] text-foreground font-sans  relative overflow-x-hidden">
      <LandingHeader />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-fuchsia-500/10 rounded-full blur-[120px]" />
      </div>

      <main className="flex-1 relative z-10  md:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Main Glassmorphism Container */}
          <div className="p-6   relative overflow-hidden">
            {/* Header Section */}
            <div className="text-center mb-10 md:mb-16 relative z-10 px-2  sm:mt-0">
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
                If you need help with your account, earnings, or verification,
                our dedicated support team is ready to assist you every step
                of the way. We offer a range of resources designed to make
                your experience seamless and successful.
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
                  className={`group flex flex-col items-start p-6 sm:p-8 rounded-2xl  border border-border/60 bg-slate-50 dark:bg-[#060e28] transition-all duration-300 shadow-sm hover:shadow-lg ${channel.bgHover}`}
                >
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center bg-card shadow-inner border border-border/50 mb-5 sm:mb-6 ${channel.color} group-hover:scale-110 transition-transform duration-300`}
                  >
                    {channel.icon}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                    {channel.title}
                  </h2>

                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8 flex-1">
                    {channel.description}
                  </p>

                  <Link
                    href={channel.href}
                    className="mt-auto w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted group-hover:bg-foreground group-hover:text-background text-foreground rounded-xl font-bold text-sm transition-all shadow-sm"
                  >
                    {channel.action}
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
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
  );
}