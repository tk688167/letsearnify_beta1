"use client"

import SignupForm from "../../components/auth/SignupForm"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"
import Logo from "@/app/components/ui/Logo"
import { useTheme } from "next-themes"

function SignupPageContent() {
  const searchParams = useSearchParams()
  const refCode = searchParams.get("ref") || ""
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark")

  const cardStyle = useMemo<React.CSSProperties>(() => {
    if (isDark) {
      return {
        background: "rgba(8,14,38,0.75)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px",
        boxShadow: "0 0 0 1px rgba(139,92,246,0.08), 0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
      }
    }
    return {
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(18px)",
      border: "1px solid rgba(15,23,42,0.10)",
      borderRadius: "24px",
      boxShadow: "0 0 0 1px rgba(37,99,235,0.08), 0 24px 70px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
    }
  }, [isDark])

  return (
    <div className={`
      fixed inset-0 flex items-center justify-center overflow-hidden
      bg-background text-foreground
      ${isDark ? "bg-[#050816] text-white" : ""}
    `}>
      {/* ── Layered animated background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 60% -5%, rgba(139,92,246,0.16) 0%, transparent 65%), radial-gradient(ellipse 60% 50% at 10% 90%, rgba(59,130,246,0.13) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 90% 50%, rgba(14,165,233,0.09) 0%, transparent 55%)" }}
        />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.20) 0%, transparent 70%)", filter: "blur(50px)" }}
        />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)", filter: "blur(50px)" }}
        />
        {/* Noise texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <filter id="n2"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
          <rect width="100%" height="100%" filter="url(#n2)" />
        </svg>
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "48px 48px" }}
        />
      </div>

      {/* ── Card ── */}
      <div className="relative w-full max-w-[440px] mx-4 flex flex-col"
        style={cardStyle}
      >
        {/* Top glow accent */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-48 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.8), transparent)" }}
        />

        <div className="p-6 sm:p-7 flex flex-col gap-4">
          {/* Header */}
          <div className="text-center">
            <div className={isDark ? "flex justify-center mb-2.5 brightness-200" : "flex justify-center mb-2.5"}>
              <Logo size="md" variant={isDark ? "light" : "dark"} />
            </div>
            <h1 className={isDark ? "text-lg font-bold text-white tracking-tight" : "text-lg font-bold text-foreground tracking-tight"}>
              Create your account
            </h1>
            <p className={isDark ? "text-xs text-slate-500 mt-0.5" : "text-xs text-muted-foreground mt-0.5"}>
              Join thousands of earners — takes under a minute
            </p>
          </div>

          {/* Signup form */}
          <SignupForm referralCode={refCode} />
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-[#050816] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  )
}