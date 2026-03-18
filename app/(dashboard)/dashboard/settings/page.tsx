export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import SettingsTabs from "./settings-tabs"
import { Cog8ToothIcon } from "@heroicons/react/24/solid"
import { ShieldCheckIcon } from "@heroicons/react/24/outline"

export default async function SettingsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  let user;
  
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        paymentMethods: true
      }
    })
  } catch (error) {
    console.error("⚠️ Settings Page DB error:", error);
    user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      paymentMethods: []
    } as any;
  }


  if (!user) {
    redirect("/login")
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">

      {/* ═══ SETTINGS BANNER ═══ */}
      <div
        className="relative overflow-hidden rounded-2xl text-white mb-6 sm:mb-8"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}
      >
        {/* Glow orbs */}
        <div className="absolute -top-8 -right-8 w-36 h-36 bg-slate-500/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />

        <div className="relative z-10 px-5 sm:px-8 py-4 sm:py-5 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 border border-white/15 mb-2.5">
            <Cog8ToothIcon className="w-4 h-4 text-slate-200" />
          </div>

          {/* Eyebrow */}
          <div className="mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-[8px] font-bold uppercase tracking-[0.18em] text-slate-300/80">
              <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
              Account Settings
            </span>
          </div>

          {/* Title */}
          <h1 className="text-sm sm:text-base font-bold tracking-tight leading-tight mb-0.5 text-white">
            Manage Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-slate-200">
              Account
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400/60 text-[10px] max-w-xs mx-auto mb-2.5">
            Profile, payment methods, and preferences
          </p>

          {/* Badge */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/8 border border-white/10 text-[9px] font-semibold text-slate-300/70">
            <ShieldCheckIcon className="w-3 h-3 text-emerald-400" />
            Secure & Encrypted
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </div>

      <SettingsTabs user={user} />
    </div>
  )
}
