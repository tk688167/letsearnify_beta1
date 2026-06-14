"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/app/components/ui/Logo";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

/* ── Helpers ── */
function getStrength(p: string) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 4);
}
const strengthMeta = [
  { label: "", color: "" },
  { label: "Weak", color: "#ef4444" },
  { label: "Weak", color: "#ef4444" },
  { label: "Fair", color: "#f59e0b" },
  { label: "Strong", color: "#10b981" },
];

const inputBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  color: "#f8fafc",
  height: "40px",
  borderRadius: "10px",
  outline: "none",
  width: "100%",
  padding: "0 12px",
  fontSize: "13px",
  transition: "border-color 0.15s, box-shadow 0.15s",
};
const fOn = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "rgba(99,130,246,0.55)";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
};
const fOff = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
  e.currentTarget.style.boxShadow = "none";
};

/* ── Step dots ── */
function Steps({ current }: { current: number }) {
  const labels = ["Email", "Verify", "Done"];
  return (
    <div className="flex items-center justify-center gap-0 mb-5">
      {labels.map((label, i) => {
        const n = i + 1;
        const done = current > n;
        const active = current === n;
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300"
                style={{
                  background: done ? "#10b981" : active ? "linear-gradient(135deg,#2563eb,#4f46e5)" : "rgba(255,255,255,0.06)",
                  color: done || active ? "#fff" : "#475569",
                  boxShadow: active ? "0 0 0 3px rgba(59,130,246,0.18)" : "none",
                }}>
                {done ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : n}
              </div>
              <span className="text-[10px] font-medium" style={{ color: done ? "#10b981" : active ? "#60a5fa" : "#475569" }}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className="w-10 h-px mx-1.5 mb-4 transition-colors duration-300"
                style={{ background: current > n + 1 ? "#10b981" : "rgba(255,255,255,0.07)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Resend timer ── */
function ResendTimer({ onResend }: { onResend: () => void }) {
  const [t, setT] = useState(60);
  const [can, setCan] = useState(false);
  useEffect(() => {
    if (t > 0) { const id = setTimeout(() => setT(x => x - 1), 1000); return () => clearTimeout(id); }
    else setCan(true);
  }, [t]);
  return (
    <p className="text-center text-xs text-slate-500 mt-2">
      {can ? (
        <button onClick={() => { setT(60); setCan(false); onResend(); }}
          className="text-blue-400 hover:text-blue-300 font-semibold transition-colors hover:underline">
          Resend code
        </button>
      ) : <>Resend in <span className="text-slate-300 font-semibold">{t}s</span></>}
    </p>
  );
}

/* ── Main ── */
export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => { if (step === 2) { setOtp(""); setNewPwd(""); setConfirm(""); } }, [step]);

  const strength = getStrength(newPwd);
  const match = confirm.length > 0 && newPwd === confirm;
  const mismatch = confirm.length > 0 && newPwd !== confirm;

  const labelClass = "text-[10px] font-semibold text-slate-400 tracking-wider uppercase block mb-1.5";

  const requestOtp = async () => {
    setLoading(true); setMsg(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setMsg({ text: "Code sent! Check your inbox.", ok: true });
      setStep(2);
    } catch (err: any) { setMsg({ text: err.message, ok: false }); }
    finally { setLoading(false); }
  };

  const resetPassword = async () => {
    if (mismatch) { setMsg({ text: "Passwords do not match", ok: false }); return; }
    setLoading(true); setMsg(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: newPwd, confirmPassword: confirm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      setStep(3); setOtp(""); setNewPwd(""); setConfirm("");
    } catch (err: any) { setMsg({ text: err.message, ok: false }); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-[#050816] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(139,92,246,0.13) 0%, transparent 60%)" }} />
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)", filter: "blur(50px)" }} />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <filter id="fn"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
          <rect width="100%" height="100%" filter="url(#fn)" />
        </svg>
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-[390px] mx-4"
        style={{ background: "rgba(8,14,38,0.78)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", boxShadow: "0 0 0 1px rgba(59,130,246,0.08), 0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)" }}
      >
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-40 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(99,130,246,0.8), transparent)" }} />

        <div className="p-7 sm:p-8">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <Logo size="md" />
          </div>

          {step < 3 && <Steps current={step} />}

          {/* Title */}
          <div className="text-center mb-5">
            <h1 className="text-lg font-bold text-white tracking-tight">
              {step === 1 && "Reset password"}
              {step === 2 && "Set new password"}
              {step === 3 && "Password changed!"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 1 && "We'll email you a 6-digit verification code."}
              {step === 2 && `Code sent to ${email}`}
              {step === 3 && "You can now sign in with your new credentials."}
            </p>
          </div>

          {/* Message */}
          {msg && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2.5 text-xs font-medium rounded-xl"
              style={{
                background: msg.ok ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${msg.ok ? "rgba(16,185,129,0.18)" : "rgba(239,68,68,0.18)"}`,
                color: msg.ok ? "#6ee7b7" : "#fca5a5",
              }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: msg.ok ? "#10b981" : "#ef4444" }} />
              {msg.text}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" style={inputBase} onFocus={fOn} onBlur={fOff} />
              </div>
              <button onClick={requestOtp} disabled={loading || !email}
                className="h-10 w-full flex items-center justify-center text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#2563eb 0%,#4f46e5 100%)", boxShadow: "0 4px 20px rgba(37,99,235,0.4),inset 0 1px 0 rgba(255,255,255,0.12)" }}>
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Send Code"}
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="flex flex-col gap-3.5 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* OTP */}
              <div>
                <label className={labelClass}>Verification Code</label>
                <input type="text" required value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000" maxLength={6} autoComplete="off"
                  style={{ ...inputBase, letterSpacing: "0.25em", fontFamily: "monospace", fontSize: "16px" }}
                  onFocus={fOn} onBlur={fOff} />
              </div>
              {/* New password */}
              <div>
                <label className={labelClass}>New Password</label>
                <div className="relative">
                  <input type={showNew ? "text" : "password"} required value={newPwd}
                    onChange={e => setNewPwd(e.target.value)} placeholder="Min. 8 chars" autoComplete="new-password"
                    style={{ ...inputBase, paddingRight: "34px" }} onFocus={fOn} onBlur={fOff} />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                    {showNew ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                {newPwd.length > 0 && (
                  <div className="mt-1.5 flex gap-0.5">
                    {[1,2,3,4].map((l: any) => (
                      <div key={l} className="h-0.5 flex-1 rounded-full transition-all duration-300"
                        style={{ background: strength >= l ? strengthMeta[strength].color : "rgba(255,255,255,0.08)" }} />
                    ))}
                  </div>
                )}
              </div>
              {/* Confirm password */}
              <div>
                <label className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <input type={showConfirm ? "text" : "password"} required value={confirm}
                    onChange={e => setConfirm(e.target.value)} placeholder="Re-enter" autoComplete="new-password"
                    style={{
                      ...inputBase, paddingRight: "34px",
                      borderColor: mismatch ? "rgba(239,68,68,0.5)" : match ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.09)",
                    }}
                    onFocus={fOn} onBlur={fOff} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                    {showConfirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                {mismatch && <p className="mt-1 text-[10px] text-red-400 font-medium">Passwords don't match</p>}
              </div>
              <button onClick={resetPassword} disabled={loading || otp.length < 6 || !newPwd || !confirm || mismatch}
                className="h-10 w-full flex items-center justify-center text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#2563eb 0%,#4f46e5 100%)", boxShadow: "0 4px 20px rgba(37,99,235,0.4),inset 0 1px 0 rgba(255,255,255,0.12)" }}>
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Reset Password"}
              </button>
              <ResendTimer onResend={requestOtp} />
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="text-center animate-in zoom-in-95 duration-300">
              <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-slate-400 mb-5 max-w-xs mx-auto">
                Your password has been updated. Sign in now with your new credentials.
              </p>
              <Link href="/login"
                className="h-10 w-full flex items-center justify-center text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#2563eb 0%,#4f46e5 100%)", boxShadow: "0 4px 20px rgba(37,99,235,0.4),inset 0 1px 0 rgba(255,255,255,0.12)" }}>
                Sign In Now
              </Link>
            </div>
          )}

          {/* Back link */}
          {step !== 3 && (
            <div className="flex justify-center mt-5">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors">
                <ArrowLeftIcon className="w-3 h-3" /> Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
