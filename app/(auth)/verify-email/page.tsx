"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Logo from "@/app/components/ui/Logo"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const router = useRouter()

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  useEffect(() => {
    if (!email) router.push("/signup")
  }, [email, router])

  function handleChange(index: number, value: string) {
    if (value && !/^\d$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    setError("")
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
    if (value && index === 5 && next.every((d) => d !== "")) handleVerify(next.join(""))
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!pasted.length) return
    const next = [...otp]
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || ""
    setOtp(next)
    inputRefs.current[Math.min(pasted.length, 6) - 1]?.focus()
    if (pasted.length === 6) handleVerify(pasted)
  }

  function getCookie(name: string): string | null {
    const cookies = document.cookie.split(";")
    for (const c of cookies) {
      const trimmed = c.trim()
      if (trimmed.startsWith(name + "=")) {
        return decodeURIComponent(trimmed.substring(name.length + 1))
      }
    }
    return null
  }

  function deleteCookie(name: string) {
    document.cookie = name + "=; path=/; max-age=0"
  }

  async function handleVerify(code?: string) {
    const otpCode = code || otp.join("")
    if (otpCode.length !== 6) { setError("Please enter all 6 digits."); return }
    setLoading(true); setError(""); setSuccess("")
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Verification failed.")
        setLoading(false)
        setOtp(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
        return
      }

      // Success — try auto-login
      setSuccess("Email verified! Signing you in...")

      const savedPwd = getCookie("_signup_pwd")
      if (savedPwd) {
        deleteCookie("_signup_pwd")
        try {
          const loginRes = await signIn("credentials", {
            redirect: false,
            email: email,
            password: savedPwd,
          })
          if (loginRes?.ok) {
            router.push("/dashboard")
            router.refresh()
            return
          }
        } catch {
          // Auto-login failed, fall through to redirect
        }
      }

      // Fallback: redirect to login page
      setTimeout(() => {
        router.push("/login?verified=true")
      }, 1500)

    } catch {
      setError("An unexpected error occurred.")
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    setResendLoading(true); setError("")
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Failed to resend.") }
      else {
        setSuccess("New code sent! Check your inbox.")
        setResendCooldown(60)
        setOtp(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch { setError("Failed to resend code.") }
    finally { setResendLoading(false) }
  }

  if (!email) return null

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#050816] flex items-center justify-center overflow-hidden transition-colors">
      {/* Background — dark mode */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block">
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(139,92,246,0.13) 0%, transparent 60%)" }} />
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)", filter: "blur(50px)" }} />
      </div>
      {/* Background — light mode */}
      <div className="absolute inset-0 pointer-events-none dark:hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-violet-50" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-[420px] mx-4 flex flex-col
        bg-white dark:bg-[rgba(8,14,38,0.75)]
        border border-gray-200 dark:border-white/[0.08]
        rounded-3xl
        shadow-xl dark:shadow-[0_24px_80px_rgba(0,0,0,0.6)]
        dark:backdrop-blur-[24px]
        transition-colors"
      >
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-48 h-px hidden dark:block"
          style={{ background: "linear-gradient(90deg, transparent, rgba(99,130,246,0.8), transparent)" }} />

        <div className="p-7 sm:p-8 flex flex-col gap-5">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Logo size="md" />
            </div>
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center
                bg-blue-50 dark:bg-[linear-gradient(135deg,rgba(37,99,235,0.15),rgba(124,58,237,0.15))]
                border border-blue-100 dark:border-blue-500/20 transition-colors">
                <svg className="w-7 h-7 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
              Check your email
            </h1>
            <p className="text-xs text-black font-bold dark:text-slate-500 mt-1 leading-relaxed transition-colors">
              We sent a 6-digit code to{" "}
              <span className="text-blue-600 dark:text-slate-300 font-black">{email}</span>
            </p>
          </div>

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium
              text-emerald-700 dark:text-emerald-300 rounded-xl
              bg-emerald-50 dark:bg-emerald-500/[0.08]
              border border-emerald-200 dark:border-emerald-500/[0.18] transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
              {success}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium
              text-red-700 dark:text-red-300 rounded-xl
              bg-red-50 dark:bg-red-500/[0.08]
              border border-red-200 dark:border-red-500/[0.18] transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 shrink-0" />
              {error}
            </div>
          )}

          {/* OTP Inputs */}
          <div className="flex justify-center gap-2.5">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                disabled={loading}
                className={"w-11 h-12 text-center text-lg font-bold rounded-xl outline-none transition-all disabled:opacity-50 text-gray-900 dark:text-white bg-gray-50 dark:bg-white/[0.04] border " + (digit ? "border-blue-400 dark:border-blue-500/50" : "border-gray-200 dark:border-white/[0.09]") + " focus:border-blue-500 dark:focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/10"}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={loading || otp.some((d) => !d)}
            className="h-10 w-full flex items-center justify-center text-sm font-semibold text-white rounded-xl transition-all
              disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
              boxShadow: "0 4px 20px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : "Verify Email"}
          </button>

          {/* Resend / Back */}
          <div className="text-center space-y-2">
            <p className="text-xs text-black font-bold dark:text-slate-600 transition-colors">
              Didn&apos;t receive the code?{" "}
              <button
                onClick={handleResend}
                disabled={resendLoading || resendCooldown > 0}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed underline underline-offset-4"
              >
                {resendLoading
                  ? "Sending..."
                  : resendCooldown > 0
                  ? "Resend in " + resendCooldown + "s"
                  : "Resend code"}
              </button>
            </p>
            <p className="text-xs text-black font-bold dark:text-slate-600 transition-colors">
              Wrong email?{" "}
              <a href="/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 font-black transition-colors underline underline-offset-4">
                Go back to signup
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-white dark:bg-[#050816] flex items-center justify-center transition-colors">
        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}