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

export default async function SpinPage() {
  const session = await auth()
  
  let [user, freeRewardsDB, premiumRewardsDB, spinSettings] = await Promise.all([
      prisma.user.findUnique({
          where: { id: session?.user?.id },
          select: { 
              id: true, 
              name: true,
              email: true,
              isActiveMember: true, 
              lastSpinTime: true,
              lastPremiumSpinTime: true,
              premiumBonusSpins: true
          }
      }),
      prisma.spinReward.findMany({ where: { spinType: "FREE", isEnabled: true }, orderBy: { order: "asc" } }),
      prisma.spinReward.findMany({ where: { spinType: "PREMIUM", isEnabled: true }, orderBy: { order: "asc" } }),
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

  if (!user) {
      if (session?.user?.id === "super-admin-id") {
          const cookieStore = await cookies();
          const adminLastSpin = cookieStore.get("admin_lastSpinTime")?.value;
          const adminLastPremium = cookieStore.get("admin_lastPremiumSpinTime")?.value;

          user = {
              id: "super-admin-id",
              name: "Super Admin",
              email: "admin@letsearnify.com",
              isActiveMember: true,
              lastSpinTime: adminLastSpin ? new Date(adminLastSpin) : null,
              lastPremiumSpinTime: adminLastPremium ? new Date(adminLastPremium) : null,
              premiumBonusSpins: 0
          } as any;
      } else {
          return <div>User not found</div>
      }
  }

  if (!user) return null;

  const now = new Date()

  // Calculate Free Spin Cooldown
  let freeCooldownDate: Date | null = null
  if (user.lastSpinTime) {
      const diffMs = now.getTime() - user.lastSpinTime.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)
      if (diffHours < spinSettings.freeSpinCooldownHours) {
          freeCooldownDate = new Date(user.lastSpinTime.getTime() + (spinSettings.freeSpinCooldownHours * 60 * 60 * 1000))
      }
  }

  // Calculate Premium Spin Cooldown
  let premiumCooldownDate: Date | null = null
  const lastPremiumSpin = user.lastPremiumSpinTime ? user.lastPremiumSpinTime : null
  
  if (lastPremiumSpin) {
      const diffMs = now.getTime() - lastPremiumSpin.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)
      if (diffHours < spinSettings.premiumSpinCooldownHours) {
          if (user.premiumBonusSpins <= 0) {
             premiumCooldownDate = new Date(lastPremiumSpin.getTime() + (spinSettings.premiumSpinCooldownHours * 60 * 60 * 1000))
          }
      }
  }

  return (
    <div className="max-w-6xl mx-auto p-3 md:p-8 space-y-6 md:space-y-8 pb-20">
       {/* Premium Header */}
       <div className="relative py-4 sm:py-5 px-5 sm:px-7 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-2xl text-white shadow-xl overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")` }}
          />
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-yellow-500/12 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-500/12 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-[0.18em] border border-white/10 bg-white/8 text-yellow-300/80 mb-1.5">
                <SparklesIcon className="w-2.5 h-2.5" />
                Daily Rewards
              </div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight leading-tight mb-0.5">
                Spin &amp; Win
              </h1>
              <p className="text-white/40 text-[10px] max-w-xs leading-relaxed">
                Free every <span className="text-white/60 font-semibold">{spinSettings.freeSpinCooldownHours}h</span> · Premium spins <span className="text-yellow-300/80 font-semibold">daily</span>
              </p>
            </div>
            <div className="shrink-0 hidden sm:flex w-10 h-10 rounded-xl bg-white/8 border border-white/10 items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-yellow-300" />
            </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Main Wheel Area */}
           <div className="lg:col-span-2 bg-card rounded-3xl shadow-xl border border-border overflow-hidden min-h-[600px] flex flex-col">
               <Tabs defaultValue="free" className="w-full flex-1 flex flex-col">
                   {/* Tabs Switcher */}
                   <div className="bg-secondary/80 border-b border-border p-2 flex justify-center backdrop-blur-sm sticky top-0 z-10 text-sm md:text-base">
                       <TabsList className="grid w-full max-w-md grid-cols-2 bg-card rounded-xl shadow-sm border border-border p-1 h-auto">
                           <TabsTrigger value="free" className="py-2 md:py-3 rounded-lg data-[state=active]:bg-indigo-50 dark:data-[state=active]:bg-indigo-900/50 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-300 font-bold text-xs md:text-base transition-all text-muted-foreground">
                               Free Spin ({spinSettings.freeSpinCooldownHours}h)
                           </TabsTrigger>
                           <TabsTrigger value="premium" className="py-2 md:py-3 rounded-lg data-[state=active]:bg-amber-50 dark:data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-300 font-bold text-xs md:text-base flex items-center justify-center gap-2 transition-all text-muted-foreground">
                               <StarIcon className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                               Premium Daily
                           </TabsTrigger>
                       </TabsList>
                   </div>
                   
                   {/* Free Spin Tab */}
                   <TabsContent value="free" className="flex-1 flex flex-col items-center justify-center p-2 md:p-8 bg-gradient-to-b from-card to-secondary outline-none animate-in fade-in zoom-in-95 duration-300">
                       <div className="mb-6 flex flex-col items-center gap-2">
                            {freeCooldownDate ? (
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Next Free Spin</span>
                                    <div className="animate-bounce">
                                        <CountdownTimer targetDate={freeCooldownDate} />
                                    </div>
                                </div>
                            ) : (
                                <span className="px-4 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200 dark:border-green-800/50">
                                    Ready to Spin
                                </span>
                            )}
                       </div>
                       
                       <SpinWheel 
                           rewards={freeRewards} 
                           onSpin={executeSpin.bind(null, "FREE")} 
                           cooldown={freeCooldownDate ? 1 : 0} 
                           type="FREE"
                       />
                   </TabsContent>

                   {/* Premium Spin Tab */}
                   <TabsContent value="premium" className="flex-1 flex flex-col items-center justify-center p-2 md:p-8 outline-none animate-in fade-in zoom-in-95 duration-300 relative bg-gradient-to-b from-amber-50 to-secondary dark:from-amber-950/30 dark:to-gray-950">
                       {/* Premium Info Overlay if locked */}
                       {!user.isActiveMember && (
                           <div className="absolute inset-0 z-40 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
                               <div className="bg-card p-8 rounded-3xl shadow-xl max-w-sm border-2 border-yellow-200 dark:border-yellow-800/50">
                               <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                                   <LockClosedIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                               </div>
                                   <h3 className="text-2xl font-black text-foreground mb-2">Premium Locked</h3>
                                   <p className="text-muted-foreground mb-6">Deposit just <span className="text-foreground font-bold">$1.00</span> to unlock higher rewards and exclusive prizes!</p>
                                   <a href="/dashboard/wallet" className="inline-block px-6 py-3 bg-yellow-500 text-gray-900 font-bold rounded-xl shadow-lg hover:bg-yellow-400 transition-colors cursor-pointer">
                                       Unlock Now
                                   </a>
                               </div>
                           </div>
                       )}

                       <div className="mb-6 flex flex-col items-center gap-2 relative z-0">
                            {premiumCooldownDate ? (
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest">Next Daily Spin</span>
                                    <CountdownTimer targetDate={premiumCooldownDate} />
                                </div>
                            ) : (
                                <div className="px-4 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 border border-amber-200 dark:border-amber-700/50">
                                    <StarIcon className="w-3 h-3" />
                                    {user.premiumBonusSpins > 0 ? `${user.premiumBonusSpins} Bonus Spins` : "Daily Spin Ready"}
                                </div>
                            )}
                       </div>

                       <SpinWheel 
                           rewards={premiumRewards} 
                           onSpin={executeSpin.bind(null, "PREMIUM")}
                           isLocked={!user.isActiveMember}
                           cooldown={premiumCooldownDate && user.premiumBonusSpins <= 0 ? 1 : 0}
                           type="PREMIUM"
                       />
                   </TabsContent>
               </Tabs>
           </div>

           {/* Sidebar: History & Stats */}
           <div className="space-y-6">
                <div className="bg-card rounded-3xl shadow-lg border border-border p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-muted-foreground" />
                        Winning History
                    </h3>
                    <SpinHistory userId={user.id} />
                </div>
                
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-lg p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="font-bold text-lg mb-2">Did you know?</h3>
                        <p className="text-indigo-100 text-sm opacity-90">
                            Premium members get 2x better odds on top-tier rewards. Unlock your potential today!
                        </p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                </div>
           </div>
       </div>
    </div>
  )
}
