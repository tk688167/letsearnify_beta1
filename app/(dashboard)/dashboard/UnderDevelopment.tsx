"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  WrenchScrewdriverIcon, 
  BellAlertIcon, 
  CheckCircleIcon,
  ArrowLeftIcon,
  SparklesIcon
} from "@heroicons/react/24/outline"

interface UnderDevelopmentPageProps {
  title: string
  description: string
  icon: string
  userEmail: string
}

export function UnderDevelopmentPage({ title, description, icon, userEmail }: UnderDevelopmentPageProps) {
  const [notifyEmail, setNotifyEmail] = useState(userEmail)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleNotify = async () => {
    if (!notifyEmail) return
    setLoading(true)
    // Save to localStorage for now (can be moved to DB later)
    try {
      const existing = JSON.parse(localStorage.getItem('letsearnify_notify_subs') || '{}')
      existing[title] = { email: notifyEmail, subscribedAt: new Date().toISOString() }
      localStorage.setItem('letsearnify_notify_subs', JSON.stringify(existing))
      setSubscribed(true)
    } catch {
      setSubscribed(true)
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      {/* Back Button */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium mb-8 transition-colors">
        <ArrowLeftIcon className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 sm:p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTIwIDBMMCA0MHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"/>
          <div className="relative z-10">
            <div className="text-5xl sm:text-6xl mb-4">{icon}</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{title}</h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold text-white/90 border border-white/20">
              <WrenchScrewdriverIcon className="w-4 h-4" />
              Under Development
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-10 space-y-8">
          <p className="text-base text-muted-foreground leading-relaxed text-center max-w-lg mx-auto">{description}</p>

          {/* What to expect */}
          <div className="bg-muted/30 rounded-2xl p-5 sm:p-6 border border-border">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-amber-500" />
              What to expect
            </h3>
            <ul className="space-y-3">
              {[
                "Early access for activated members",
                "Passive income opportunities",
                "Community-driven rewards",
                "Transparent profit sharing"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Notify Me Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
            {subscribed ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircleIcon className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">You&apos;re on the list!</h3>
                <p className="text-sm text-muted-foreground">We&apos;ll notify you at <strong className="text-foreground">{notifyEmail}</strong> when {title} goes live.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                    <BellAlertIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Get Notified When Live</h3>
                    <p className="text-xs text-muted-foreground">Be the first to know when this feature launches</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={(e: any) => setNotifyEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    onClick={handleNotify}
                    disabled={loading || !notifyEmail}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 shrink-0 shadow-sm shadow-blue-500/20"
                  >
                    {loading ? "..." : "Notify Me"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Back to dashboard */}
          <div className="text-center">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
              ← Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
export default UnderDevelopmentPage