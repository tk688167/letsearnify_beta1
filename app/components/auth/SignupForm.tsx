"use client"

import { registerUser } from "@/lib/register"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { signIn, signOut } from "next-auth/react"
import { useTheme } from "next-themes"

interface SignupFormProps {
  referralCode?: string
  isModal?: boolean
}

function getStrength(p: string) {
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return Math.min(s, 4)
}

const strengthMeta = [
  { label: "Weak", color: "#ef4444" },
  { label: "Weak", color: "#ef4444" },
  { label: "Fair", color: "#f59e0b" },
  { label: "Good", color: "#eab308" },
  { label: "Strong", color: "#10b981" },
]

export default function SignupForm({ referralCode = "", isModal = false }: SignupFormProps) {
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwd, setPwd] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark")

  const inputStyle = useMemo((): React.CSSProperties => {
    // Dark mode is already visually good. The bug is that light mode currently uses the same "dark" alpha colors.
    return {
      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.03)",
      border: isDark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(15,23,42,0.12)",
      color: isDark ? "#f8fafc" : "#0f172a",
      height: "38px",
      borderRadius: "10px",
      outline: "none",
      width: "100%",
      padding: "0 12px",
      fontSize: "13px",
      transition: "border-color 0.15s, box-shadow 0.15s",
    }
  }, [isDark])

  const focusOn = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "rgba(99,130,246,0.55)"
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"
  }

  const focusOff = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.09)" : "rgba(15,23,42,0.12)"
    e.currentTarget.style.boxShadow = "none"
  }

  const strength = useMemo(() => getStrength(pwd), [pwd])
  const match = confirm.length > 0 && pwd === confirm
  const mismatch = confirm.length > 0 && pwd !== confirm

  const labelClass = isDark
    ? "text-[10px] font-semibold text-slate-400 tracking-wider uppercase block mb-1"
    : "text-[10px] font-semibold text-slate-600 tracking-wider uppercase block mb-1"

  const selectOptionStyle = isDark
    ? { background: "#0f172a", color: "#94a3b8" }
    : { background: "#ffffff", color: "#334155" }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (mismatch) { setError("Passwords do not match."); return }
    setLoading(true); setError("")
    const formData = new FormData(e.currentTarget)
    try {
      const res = await registerUser(formData)
      if (res?.error) { setError(res.error); setLoading(false) }
      else {
        const userEmail = res?.email || formData.get("email") as string
        const pwdEncoded = encodeURIComponent(formData.get("password") as string)
        document.cookie = "_signup_pwd=" + pwdEncoded + "; path=/; max-age=300; SameSite=Strict"
        router.push("/verify-email?email=" + encodeURIComponent(userEmail))
      }
    } catch {
      setError("An unexpected error occurred.")
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      const ref = document.querySelector('input[name="referralCode"]') as HTMLInputElement
      if (ref?.value) document.cookie = "referral_code=" + ref.value + "; path=/; max-age=3600"
      
      // Clear any existing session first to prevent logging into referrer's account
      await signOut({ redirect: false })
      
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch {
      setError("Google sign-in failed.")
      setGoogleLoading(false)
    }
  }

  return (
    <div className={isModal ? "" : ""}>
      {error && (
        <div className="mb-3.5 flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-red-300 rounded-xl"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Row 1: Name + Email */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="name" className={labelClass}>Full Name</label>
            <input id="name" name="name" type="text" required placeholder="John Doe"
              style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com"
              style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
          </div>
        </div>

        {/* Row 2: Country */}
        <div>
          <label htmlFor="country" className={labelClass}>Country</label>
          <div className="relative">
            <select id="country" name="country" required
              style={{ ...inputStyle, appearance: "none", paddingRight: "32px" }}
              onFocus={focusOn} onBlur={focusOff}
            >
              <option value="" style={selectOptionStyle}>Select country</option>
              {[["AF","Afghanistan"],["AL","Albania"],["DZ","Algeria"],["AR","Argentina"],["AM","Armenia"],["AU","Australia"],["AT","Austria"],["AZ","Azerbaijan"],["BH","Bahrain"],["BD","Bangladesh"],["BE","Belgium"],["BR","Brazil"],["BG","Bulgaria"],["CA","Canada"],["CL","Chile"],["CN","China"],["CO","Colombia"],["HR","Croatia"],["CY","Cyprus"],["CZ","Czech Republic"],["DK","Denmark"],["EG","Egypt"],["FI","Finland"],["FR","France"],["DE","Germany"],["GR","Greece"],["HK","Hong Kong"],["HU","Hungary"],["IN","India"],["ID","Indonesia"],["IR","Iran"],["IQ","Iraq"],["IE","Ireland"],["IT","Italy"],["JP","Japan"],["JO","Jordan"],["KZ","Kazakhstan"],["KW","Kuwait"],["LB","Lebanon"],["MY","Malaysia"],["MX","Mexico"],["MA","Morocco"],["NL","Netherlands"],["NZ","New Zealand"],["NO","Norway"],["OM","Oman"],["PK","Pakistan"],["PS","Palestine"],["PH","Philippines"],["PL","Poland"],["PT","Portugal"],["QA","Qatar"],["RO","Romania"],["RU","Russia"],["SA","Saudi Arabia"],["SG","Singapore"],["ZA","South Africa"],["KR","South Korea"],["ES","Spain"],["LK","Sri Lanka"],["SE","Sweden"],["CH","Switzerland"],["TH","Thailand"],["TR","Turkey"],["UA","Ukraine"],["AE","United Arab Emirates"],["UK","United Kingdom"],["US","United States"],["VN","Vietnam"],["YE","Yemen"]]
                .map(([val, name]) => <option key={val} value={val} style={selectOptionStyle}>{name}</option>)}
            </select>
            <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Row 3: Password + Confirm */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="password" className={labelClass}>Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPwd ? "text" : "password"} autoComplete="new-password"
                required minLength={8} placeholder="Min. 8 chars"
                value={pwd} onChange={e => setPwd(e.target.value)}
                style={{ ...inputStyle, paddingRight: "32px" }}
                onFocus={focusOn} onBlur={focusOff}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                {showPwd ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
              </button>
            </div>
            {pwd.length > 0 && (
              <div className="mt-1.5">
                <div className="flex gap-0.5">
                  {[1,2,3,4].map(l => (
                    <div key={l} className="h-0.5 flex-1 rounded-full transition-all duration-300"
                      style={{ background: strength >= l ? strengthMeta[strength].color : "rgba(255,255,255,0.08)" }} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className={labelClass}>Confirm</label>
            <div className="relative">
              <input id="confirmPassword" name="confirmPassword" type={showConfirm ? "text" : "password"} autoComplete="new-password"
                required minLength={8} placeholder="Re-enter"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                style={{
                  ...inputStyle,
                  paddingRight: "32px",
                  borderColor: mismatch ? "rgba(239,68,68,0.5)" : match ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.09)",
                }}
                onFocus={focusOn} onBlur={focusOff}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                {showConfirm ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
              </button>
            </div>
            {mismatch && <p className="mt-1 text-[10px] text-red-400 font-medium">Doesn't match</p>}
          </div>
        </div>

        {/* Row 4: Referral */}
        <div>
          <label htmlFor="referralCode" className={labelClass}>
            Referral Code <span className="normal-case font-normal tracking-normal text-slate-600">(optional)</span>
          </label>
          <input id="referralCode" name="referralCode" type="text" defaultValue={referralCode}
            placeholder="Enter code"
            style={{ ...inputStyle, textTransform: "uppercase" }}
            onFocus={focusOn} onBlur={focusOff}
          />
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading || googleLoading || mismatch}
          className="h-10 w-full flex items-center justify-center text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98] mt-0.5"
          style={{ background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)", boxShadow: "0 4px 20px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.12)" }}
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <span className="flex items-center gap-1.5">Create Account <span className="text-blue-200 font-normal">· $1 Activation</span></span>}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-3.5">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
        <span className="text-[11px] text-slate-600 font-medium">or</span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* Google */}
      <button type="button" onClick={handleGoogle} disabled={loading || googleLoading}
        className="h-10 w-full flex items-center justify-center gap-2.5 text-sm font-semibold text-slate-200 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-85 active:scale-[0.98]"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
      >
        {googleLoading
          ? <div className="w-4 h-4 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
          : <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="w-4 h-4" />}
        Continue with Google
      </button>

      {!isModal && (
        <p className="text-center text-xs text-slate-600 mt-3.5">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Sign in</Link>
        </p>
      )}
    </div>
  )
}