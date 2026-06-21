"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  SparklesIcon,
  InformationCircleIcon,
  TicketIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  LifebuoyIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Logo from "@/app/components/ui/Logo";
import ThemeToggle from "@/app/components/ui/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Detect scroll for dynamic header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { href: "/features", label: "Features", icon: SparklesIcon, iconColor: "text-indigo-400" },
    { href: "/how-it-works", label: "How it Works", icon: HomeIcon, iconColor: "text-emerald-400" },
    { href: "/about", label: "About", icon: InformationCircleIcon, iconColor: "text-fuchsia-400" },
    { href: "/pools", label: "Reward Pools", icon: TicketIcon, iconColor: "text-amber-400" },
    { href: "/terms", label: "Terms", icon: DocumentTextIcon, iconColor: "text-gray-400" },
    { href: "/support", label: "Support", icon: LifebuoyIcon, iconColor: "text-cyan-400" },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  return (
    <>
      <header
        className={`fixed top-0 left-0 bg-slate-50 dark:bg-[#060e28]  w-full z-40 transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-gray-300 dark:border-gray-700 shadow-2xl shadow-black/5"
            : "bg-background/30 backdrop-blur-md border-b border-transparent shadow-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex justify-between items-center relative">
          {/* Mobile Hamburger */}
          <div className="lg:hidden flex-1 flex justify-start z-50">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 text-foreground hover:bg-white/10 rounded-xl transition-all duration-300 shrink-0 outline-none focus:ring-2 focus:ring-primary/40"
              aria-label="Toggle menu"
            >
              <Bars3Icon className="w-6 h-6 sm:w-7 sm:h-7" />
            </motion.button>
          </div>

          {/* Logo */}
          <div className="z-50 absolute inset-0 flex items-center justify-center pointer-events-none lg:static lg:justify-start lg:inset-auto lg:pointer-events-auto lg:flex-1">
            <div className="pointer-events-auto translate-y-0.5 sm:translate-y-0">
              <Logo size="md" className="lg:scale-110 origin-left" />
            </div>
          </div>

          {/* Desktop Navigation - Pill Style */}
          <nav className="hidden lg:flex items-center justify-center gap-0.5 p-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full shadow-sm hover:border-white/20 transition-all duration-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isActive(link.href)
                    ? "bg-white/10 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex-1 flex justify-end items-center gap-2 sm:gap-3 z-50">
            <ThemeToggle />

            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-white/10">
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-bold text-foreground hover:text-primary transition-colors duration-200"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="relative px-7 py-2.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 text-white rounded-full text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 overflow-hidden group"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-[340px] bg-background/98 backdrop-blur-2xl border-r border-white/10 shadow-2xl lg:hidden flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="h-16 md:h-20 px-6 flex items-center justify-between border-b border-white/5 shrink-0">
              <Logo size="md" />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="p-2.5 text-muted-foreground hover:bg-white/10 hover:text-foreground rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto py-8 px-4 space-y-8">
              {/* Main Navigation */}
              <div>
                <p className="px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 mb-4">
                  Main Menu
                </p>
                <nav className="flex flex-col space-y-1">
                  {navLinks.map((link, idx) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                          isActive(link.href)
                            ? "bg-white/10 text-foreground"
                            : "text-foreground/80 hover:bg-white/5 hover:text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-3.5 font-medium">
                          <link.icon className={`w-5 h-5 ${link.iconColor}`} />
                          {link.label}
                        </span>
                        <ChevronRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* Quick Stats / Divider */}
              <div className="px-4">
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              {/* Help & Resources */}
              <div>
                <p className="px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 mb-4">
                  Help & Resources
                </p>
                <nav className="flex flex-col space-y-1">
                  <Link
                    href="/faq"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl hover:bg-white/5 text-foreground/80 hover:text-foreground font-medium transition-all duration-200"
                  >
                    <QuestionMarkCircleIcon className="w-5 h-5 text-rose-400" />
                    FAQ Center
                  </Link>
                  <Link
                    href="/support"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl hover:bg-white/5 text-foreground/80 hover:text-foreground font-medium transition-all duration-200"
                  >
                    <LifebuoyIcon className="w-5 h-5 text-cyan-400" />
                    Customer Support
                  </Link>
                  <Link
                    href="/terms"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl hover:bg-white/5 text-foreground/80 hover:text-foreground font-medium transition-all duration-200"
                  >
                    <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                    Terms & Disclosures
                  </Link>
                </nav>
              </div>
            </div>

            {/* Sidebar Footer Actions */}
            <div className="p-5 sm:p-6 border-t border-white/5 bg-background/50 backdrop-blur-xl shrink-0 space-y-3">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold border border-white/10 text-foreground bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 group"
              >
                <span>Get Started</span>
                <motion.svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  initial={{ x: 0 }}
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </motion.svg>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}