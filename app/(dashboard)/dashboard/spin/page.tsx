import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { executeSpin } from "@/app/actions/spin"
import { FREE_REWARDS, PREMIUM_REWARDS } from "@/lib/spin-config"
import SpinWheel from "./SpinWheel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { LockClosedIcon, StarIcon, SparklesIcon } from "@heroicons/react/24/solid"
import CountdownTimer from "./CountdownTimer"
import SpinHistory from "./SpinHistory"
import { ClockIcon } from "@heroicons/react/24/outline"

import { getSpinSettings } from "@/app/actions/admin/spin-rewards"
import { cookies } from "next/headers"
import { motion } from "framer-motion"

export default async function SpinPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold">Authentication Required</h2>
        <p className="text-slate-500">Please log in to access the daily spin.</p>
        <a href="/login" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Login</a>
      </div>
    )
  }

  try {
    // 1. Pre-fetch check for Environment Variables
    if (!process.env.DATABASE_URL) {
      throw new Error("Missing DATABASE_URL. Please check Vercel environment variables.");
    }

    // 2. Data Fetching with individualized error handling potential
    const [user, freeRewardsDB, premiumRewardsDB, spinSettings] = await Promise.all([
        prisma.user.findUnique({
            where: { id: session.user.id },
            select: { 
                id: true, 
                name: true,
                email: true,
                isActiveMember: true, 
                lastSpinTime: true,
                lastPremiumSpinTime: true,
                premiumBonusSpins: true
            }
        }).catch(e => { throw new Error(`User Fetch Failed: ${e.message}`) }),
        prisma.spinReward.findMany({ 
            where: { spinType: "FREE", isEnabled: true }, 
            orderBy: { order: "asc" } 
        }).catch(() => [] as any[]),
        prisma.spinReward.findMany({ 
            where: { spinType: "PREMIUM", isEnabled: true }, 
            orderBy: { order: "asc" } 
        }).catch(() => [] as any[]),
        getSpinSettings()
    ])
    
    const freeRewards = freeRewardsDB.length > 0 ? freeRewardsDB.map((r) => ({
        ...r, 
        type: r.type as any, 
        textColor: r.textColor || undefined
    })) : FREE_REWARDS

    const premiumRewards = premiumRewardsDB.length > 0 ? premiumRewardsDB.map((r) => ({
        ...r, 
        type: r.type as any, 
        textColor: r.textColor || undefined
    })) : PREMIUM_REWARDS

    let currentUser = user;

    if (!currentUser) {
        if (session.user.id === "super-admin-id") {
            const cookieStore = await cookies();
            const adminLastSpin = cookieStore.get("admin_lastSpinTime")?.value;
            const adminLastPremium = cookieStore.get("admin_lastPremiumSpinTime")?.value;

            currentUser = {
                id: "super-admin-id",
                name: "Super Admin",
                email: "admin@letsearnify.com",
                isActiveMember: true,
                lastSpinTime: adminLastSpin ? new Date(adminLastSpin) : null,
                lastPremiumSpinTime: adminLastPremium ? new Date(adminLastPremium) : null,
                premiumBonusSpins: 0
            } as any;
        } else {
            return (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <LockClosedIcon className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold">Account Registry Error</h2>
                <p className="text-slate-500">Your account was not found in the production database. Try logging out and back in.</p>
              </div>
            )
        }
    }

    if (!currentUser) return null;

    const now = new Date()

    // Calculate Free Spin Cooldown
    let freeCooldownDate: Date | null = null
    if (currentUser.lastSpinTime) {
        const diffMs = now.getTime() - currentUser.lastSpinTime.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)
        if (diffHours < spinSettings.freeSpinCooldownHours) {
            freeCooldownDate = new Date(currentUser.lastSpinTime.getTime() + (spinSettings.freeSpinCooldownHours * 60 * 60 * 1000))
        }
    }

    // Calculate Premium Spin Cooldown
    let premiumCooldownDate: Date | null = null
    const lastPremiumSpin = currentUser.lastPremiumSpinTime ? currentUser.lastPremiumSpinTime : null
    
    if (lastPremiumSpin) {
        const diffMs = now.getTime() - lastPremiumSpin.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)
        if (diffHours < spinSettings.premiumSpinCooldownHours) {
            if (currentUser.premiumBonusSpins <= 0) {
               premiumCooldownDate = new Date(lastPremiumSpin.getTime() + (spinSettings.premiumSpinCooldownHours * 60 * 60 * 1000))
            }
        }
    }

    return (
      <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-8 md:space-y-12 pb-32 select-none">
         {/* ═══ PREMIUM HEADER ═══ */}
         <div className="relative py-5 md:py-8 px-6 md:px-12 bg-slate-900 rounded-[2rem] text-white shadow-2xl overflow-hidden border border-white/5 mx-2 md:mx-0">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent animate-pulse" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.1),transparent_70%)]" />
            <div 
              className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")` }}
            />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-white/10 border border-white/10 text-amber-400">
                  <SparklesIcon className="w-3 h-3" />
                  Daily Portal
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter leading-none italic">
                  DAILY <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-100">FORTUNE</span>
                </h1>
                <p className="text-slate-400 text-[11px] md:text-sm max-w-lg font-medium leading-relaxed">
                  Win daily rewards every <span className="text-white font-bold">{spinSettings.freeSpinCooldownHours}h</span>.
                </p>
              </div>
              
              <div className="flex -space-x-3 opacity-60 md:opacity-100">
                  {[1, 2, 3].map((i) => (
                      <div key={i} className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center rotate-12">
                          <StarIcon className={`w-5 h-5 md:w-7 md:h-7 ${i === 2 ? 'text-amber-500' : 'text-slate-600'}`} />
                      </div>
                  ))}
              </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
             {/* ═══ MAIN WHEEL AREA ═══ */}
             <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-200/60 dark:border-slate-800/80 overflow-hidden flex flex-col relative transition-all hover:shadow-indigo-500/5">
                  <Tabs defaultValue="free" className="w-full flex-1 flex flex-col">
                      {/* Premium Styled Tabs Switcher */}
                      <div className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200/60 dark:border-slate-800/80 p-3 md:p-6 backdrop-blur-xl sticky top-0 z-20">
                          <TabsList className="grid w-full max-w-sm grid-cols-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl p-1 h-auto">
                              <TabsTrigger value="free" className="py-3 md:py-4 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-md font-black text-[11px] md:text-xs tracking-tight transition-all text-slate-500 uppercase">
                                  Standard Wheel
                              </TabsTrigger>
                              <TabsTrigger value="premium" className="py-3 md:py-4 rounded-xl data-[state=active]:bg-[#0c0c0c] dark:data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-md font-black text-[11px] md:text-xs tracking-tight flex items-center justify-center gap-1.5 transition-all text-slate-500 uppercase">
                                  <StarIcon className="w-4 h-4" />
                                  Premium Daily
                              </TabsTrigger>
                          </TabsList>
                      </div>
                      
                      {/* Free Spin Tab Content */}
                      <TabsContent value="free" className="flex-1 flex flex-col items-center justify-center p-6 md:p-16 outline-none animate-in fade-in slide-in-from-bottom-5 duration-500 min-h-[600px] md:min-h-[800px]">
                          <div className="mb-10 text-center">
                               {freeCooldownDate ? (
                                   <div className="flex flex-col items-center gap-3">
                                       <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Next Cycle Available In</span>
                                       <CountdownTimer targetDate={freeCooldownDate} />
                                   </div>
                               ) : (
                                   <div className="px-8 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-200/50 dark:border-emerald-500/20 shadow-sm animate-pulse">
                                       Cycle Ready to Execute
                                   </div>
                               )}
                          </div>
                          
                          <SpinWheel 
                              rewards={freeRewards} 
                              onSpin={executeSpin.bind(null, "FREE")} 
                              isLocked={false}
                              cooldown={freeCooldownDate ? 1 : 0} 
                              type="FREE"
                          />
                      </TabsContent>

                      {/* Premium Spin Tab Content */}
                      <TabsContent value="premium" className="flex-1 flex flex-col items-center justify-center p-6 md:p-16 outline-none animate-in fade-in slide-in-from-bottom-5 duration-500 min-h-[600px] md:min-h-[800px] relative bg-gradient-to-b from-amber-50/50 via-transparent to-transparent dark:from-amber-950/20">
                          {/* High-End Locked Overlay */}
                          {!currentUser.isActiveMember && (
                              <div className="absolute inset-0 z-40 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl flex flex-col items-center justify-center p-8">
                                  <div className="bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] max-w-md w-full border border-slate-100 dark:border-slate-800 text-center">
                                      <div className="w-24 h-24 bg-amber-500/10 dark:bg-amber-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-amber-500/20">
                                          <LockClosedIcon className="w-12 h-12 text-amber-500" />
                                      </div>
                                      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 italic uppercase">Premium Locked</h3>
                                      <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg leading-relaxed">Secure your membership for <span className="text-slate-900 dark:text-white font-black">$1.00</span> to unlock elite status prizes.</p>
                                      <a href="/dashboard/wallet" className="inline-flex items-center justify-center w-full px-10 py-5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-3xl shadow-xl shadow-amber-500/20 transition-all active:scale-95 uppercase tracking-tighter">
                                          Activate Elite Membership
                                      </a>
                                  </div>
                              </div>
                          )}

                          <div className="mb-10 text-center relative z-0">
                               {premiumCooldownDate ? (
                                   <div className="flex flex-col items-center gap-3">
                                       <span className="text-[10px] font-black text-amber-500 dark:text-amber-500 uppercase tracking-[0.3em]">Premium Cooldown Active</span>
                                       <CountdownTimer targetDate={premiumCooldownDate} />
                                   </div>
                               ) : (
                                   <div className="px-8 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border border-amber-500/20 shadow-sm">
                                       <SparklesIcon className="w-4 h-4 animate-spin-slow" />
                                       {currentUser.premiumBonusSpins > 0 ? `${currentUser.premiumBonusSpins} Bonus Cycles Ready` : "Elite Cycle Ready"}
                                   </div>
                               )}
                          </div>

                          <SpinWheel 
                              rewards={premiumRewards} 
                              onSpin={executeSpin.bind(null, "PREMIUM")}
                              isLocked={!currentUser.isActiveMember}
                              cooldown={premiumCooldownDate && currentUser.premiumBonusSpins <= 0 ? 1 : 0}
                              type="PREMIUM"
                          />
                      </TabsContent>
                  </Tabs>
             </div>

             {/* ═══ SIDEBAR: HISTORY & STATS ═══ */}
             <div className="lg:col-span-4 space-y-10">
                  <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-200/60 dark:border-slate-800/80 p-10 transition-all hover:shadow-indigo-500/5 group">
                      <div className="flex items-center justify-between mb-8">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase flex items-center gap-3">
                              <ClockIcon className="w-7 h-7 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                              Fortunes
                          </h3>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Recent</span>
                      </div>
                      <SpinHistory userId={currentUser.id} />
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 rounded-[3rem] shadow-[0_30px_60px_rgba(79,70,229,0.2)] p-10 text-white relative overflow-hidden group">
                      <div className="relative z-10 space-y-4">
                          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20">
                              <SparklesIcon className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="font-black text-3xl tracking-tighter uppercase leading-none">Elevate Your Strategy</h3>
                          <p className="text-indigo-100/80 text-sm md:text-base leading-relaxed font-medium">
                              Premium partners achieve up to <span className="text-white font-black underline decoration-amber-500 underline-offset-4">2x higher</span> win rates on Arnold Token rewards.
                          </p>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white opacity-5 rounded-full blur-[60px] group-hover:opacity-10 transition-opacity"></div>
                  </div>
             </div>
         </div>
      </div>
    )
  } catch (error: any) {
    console.error("Spin Page Error:", error);
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-10 min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <SparklesIcon className="w-10 h-10 text-red-600" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">System Interruption</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            We encountered a technical issue while initializing your daily portal. Use the button below to retry or check your connection.
          </p>
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-left border border-slate-200 dark:border-slate-700">
               <p className="text-[10px] font-mono text-red-500 uppercase font-bold mb-1">Diagnostic Info:</p>
               <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">{error.message}</p>
            </div>
          )}
        </div>
        <a 
          href="/dashboard/spin" 
          className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-black rounded-2xl shadow-lg transition-transform active:scale-95 uppercase tracking-tighter"
        >
          Re-initialize Portal
        </a>
      </div>
    )
  }
}

