// ============================================================
// FILE: app/(auth)/login/page.tsx  (REPLACE)
// CHANGES:
//   1. ?verified=true → green success banner
//   2. EMAIL_NOT_VERIFIED error → redirect to /verify-email
// ALL other logic is 100% identical to your original
// ============================================================

"use client"

import { signIn, getSession } from "next-auth/react"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import Logo from "@/app/components/ui/Logo"

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const signupSuccess = searchParams.get("signup") === "success"
  const emailVerified = searchParams.get("verified") === "true"

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    try {
      const res = await signIn("credentials", { redirect: false, email, password })
      if (res?.error) {
        // ── NEW: if email not verified, redirect to verify page ──
        if (res.error === "EMAIL_NOT_VERIFIED") {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`)
          return
        }
        setError(res.error === "DATABASE_UNAVAILABLE"
          ? "Database is currently unreachable. Try a different network."
          : "Invalid email or password.")
        setLoading(false)
      } else {
        const session = await getSession()
        const role = (session?.user as any)?.role
        router.push(role === "ADMIN" ? "/admin" : "/dashboard")
        router.refresh()
      }
    } catch {
      setError("An unexpected error occurred.")
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setIsGoogleLoading(true)
    try { await signIn("google", { callbackUrl: "/dashboard" }) }
    catch { setError("Google sign-in failed. Try again."); setIsGoogleLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-[#050816] flex items-center justify-center overflow-hidden">
      {/* ── Layered animated background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(139,92,246,0.13) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 10% 70%, rgba(14,165,233,0.10) 0%, transparent 55%)" }}
        />
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)", filter: "blur(40px)" }}
        />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)", filter: "blur(50px)" }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "48px 48px" }}
        />
      </div>

      {/* ── Card ── */}
      <div className="relative w-full max-w-[390px] mx-4 flex flex-col"
        style={{ background: "rgba(8,14,38,0.75)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", boxShadow: "0 0 0 1px rgba(59,130,246,0.08), 0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)" }}
      >
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-48 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(99,130,246,0.8), transparent)" }}
        />

        <div className="p-7 sm:p-8 flex flex-col gap-5">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Logo size="md" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Welcome back</h1>
            <p className="text-xs text-slate-500 mt-0.5">Sign in to access your earnings</p>
          </div>

          {/* Banners */}
          {signupSuccess && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-emerald-300 rounded-xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              Account created! Please sign in.
            </div>
          )}
          {emailVerified && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-emerald-300 rounded-xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              Email verified! Please sign in to continue.
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-red-300 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Email</label>
              <input
                id="email" name="email" type="email" autoComplete="email" required
                placeholder="you@example.com"
                className="h-10 px-3.5 text-sm text-white rounded-xl outline-none w-full transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#f8fafc" }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(99,130,246,0.55)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)" }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.boxShadow = "none" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Password</label>
                <Link href="/forgot-password" className="text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <input
                  id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required
                  placeholder="••••••••"
                  className="h-10 px-3.5 pr-10 text-sm text-white rounded-xl outline-none w-full transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#f8fafc" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(99,130,246,0.55)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)" }}
                  onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.boxShadow = "none" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || isGoogleLoading}
              className="h-10 mt-0.5 w-full flex items-center justify-center text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)", boxShadow: "0 4px 20px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.12)" }}
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : "Sign In"}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-[11px] text-slate-600 font-medium">or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          <button type="button" onClick={handleGoogle} disabled={loading || isGoogleLoading}
            className="h-10 w-full flex items-center justify-center gap-2.5 text-sm font-semibold text-slate-200 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-85 active:scale-[0.98]"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
          >
            {isGoogleLoading
              ? <div className="w-4 h-4 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
              : <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="w-4 h-4" />}
            Continue with Google
          </button>

          <p className="text-center text-xs text-slate-600">
            New here?{" "}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Create a free account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-[#050816] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}