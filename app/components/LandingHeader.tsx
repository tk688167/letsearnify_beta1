"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
} from "@heroicons/react/24/outline";
import Logo from "@/app/components/ui/Logo";
import ThemeToggle from "@/app/components/ui/ThemeToggle";

export default function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent scrolling when mobile menu is open
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

  return (
    <>
      <header className="fixed top-4 left-0 right-0 z-50 px-4">
        <div className="max-w-6xl mx-auto rounded-2xl glass-panel border border-border/40 bg-background/70 backdrop-blur-xl shadow-lg shadow-black/5">
          <div className="flex justify-between items-center h-16 px-4 md:px-6">
            {/* Mobile: Hamburger */}
            {/* <div className="lg:hidden flex-1">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-foreground hover:bg-secondary rounded-lg transition-all"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div> */}

            {/* Logo */}
            <div className="flex-1 flex justify-center lg:justify-start">
              <Logo size="md" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { name: "Features", href: "/features" },
                { name: "How it Works", href: "/how-it-works" },
                { name: "Pools", href: "/pools" },
                { name: "Support", href: "/support" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex-1 flex justify-end items-center gap-3">
              <ThemeToggle />

              {/* Auth Buttons */}
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold hover:text-primary transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2 bg-foreground text-background rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay Backdrop — hidden at lg+ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer — hidden at lg+ */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[85%] max-w-[320px] bg-background/95 backdrop-blur-2xl border-r border-border/50 transform transition-transform duration-300 ease-in-out shadow-2xl lg:hidden flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 md:h-20 px-6 flex items-center justify-between border-b border-border/30 shrink-0">
          <Logo size="md" />
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          {/* Main Navigation */}
          <div>
            <p className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Platform Navigation
            </p>
            <nav className="flex flex-col space-y-1">
              <Link
                href="/features"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary text-foreground font-medium transition-colors"
              >
                <SparklesIcon className="w-5 h-5 text-indigo-500" />
                Features
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary text-foreground font-medium transition-colors"
              >
                <HomeIcon className="w-5 h-5 text-emerald-500" />
                How it Works
              </Link>
              <Link
                href="/pools"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary text-foreground font-medium transition-colors"
              >
                <TicketIcon className="w-5 h-5 text-amber-500" />
                Reward Pools
              </Link>
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary text-foreground font-medium transition-colors"
              >
                <InformationCircleIcon className="w-5 h-5 text-fuchsia-500" />
                Official Guide
              </Link>
            </nav>
          </div>

          {/* Resources & Help */}
          <div>
            <p className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Help & Resources
            </p>
            <nav className="flex flex-col space-y-1">
              <Link
                href="/faq"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary text-foreground font-medium transition-colors"
              >
                <QuestionMarkCircleIcon className="w-5 h-5 text-rose-500" />
                FAQ Center
              </Link>
              <Link
                href="/support"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary text-foreground font-medium transition-colors"
              >
                <LifebuoyIcon className="w-5 h-5 text-cyan-500" />
                Customer Support
              </Link>
              <Link
                href="/terms"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary text-foreground font-medium transition-colors"
              >
                <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                Terms & Disclosures
              </Link>
            </nav>
          </div>
        </div>

        {/* Sidebar Actions (Bottom Fixed) */}
        <div className="p-5 sm:p-6 border-t border-border/30 bg-background/50 backdrop-blur-xl shrink-0 space-y-3">
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="group flex items-center justify-center gap-2 w-full py-3.5 text-sm uppercase tracking-wide border border-border/50 text-foreground bg-secondary/30 hover:bg-secondary/80 rounded-xl font-bold transition-all"
          >
            Sign In to Account
          </Link>
          <Link
            href="/signup"
            onClick={() => setIsOpen(false)}
            className="group flex items-center justify-center gap-2 w-full py-3.5 text-sm uppercase tracking-wide text-white bg-gradient-to-r from-indigo-500 via-primary to-fuchsia-500 hover:from-indigo-600 hover:via-primary/90 hover:to-fuchsia-600 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 hover:-translate-y-0.5"
          >
            <span>Get Started Now</span>
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}
