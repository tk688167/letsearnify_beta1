"use client"
// MarketplaceDevScreen — shown to users when marketplace is in development mode

import Link from "next/link"
import Logo from "@/app/components/ui/Logo"
import ThemeToggle from "@/app/components/ui/ThemeToggle"

export default function MarketplaceDevScreen() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-slate-800/60">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors shadow-md shadow-blue-500/20"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-xl w-full text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30">
                <span className="text-4xl">🚧</span>
              </div>
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-3xl animate-ping bg-amber-400/20" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Under Development
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              Marketplace Coming Soon
            </h1>
            <p className="text-base text-gray-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              The LetsEarnify Freelance Marketplace is currently under active development. 
              We're building something great — check back soon or join the waitlist to get early access.
            </p>
          </div>

          {/* Features preview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            {[
              { emoji: "✅", title: "Verified Freelancers", desc: "Every profile manually verified" },
              { emoji: "🌍", title: "75+ Countries", desc: "Talent from around the world" },
              { emoji: "⚡", title: "Fast Response", desc: "Average reply under 2 hours" },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 rounded-2xl p-4"
              >
                <span className="text-2xl">{item.emoji}</span>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-2">{item.title}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20 text-sm"
            >
              Join Waitlist
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 dark:border-slate-800/60 py-5 text-center">
        <p className="text-xs text-gray-400 dark:text-slate-500">
          © {new Date().getFullYear()} LetsEarnify. Marketplace launching soon.
        </p>
      </footer>
    </div>
  )
}
