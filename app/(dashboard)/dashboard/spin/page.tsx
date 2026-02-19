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

// Force re-evaluation of types
export default async function SpinPage() {
  const session = await auth()
  
  // Fetch everything in parallel
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
  
  // Fallback to constants if DB empty (initial load safety)
  // Fallback to constants if DB empty (initial load safety)
  // Explicitly map properties and cast types to match SpinWheel expectations
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
          user = {
              id: "super-admin-id",
              name: "Super Admin",
              email: "admin@letsearnify.com",
              isActiveMember: true,
              lastSpinTime: null,
              lastPremiumSpinTime: null,
              premiumBonusSpins: 0
          };
      } else {
          return <div>User not found</div>
      }
  }

  const now = new Date()

  // Calculate Free Spin Cooldown (Dynamic)
  let freeCooldownDate: Date | null = null
  if (user.lastSpinTime) {
      const diffMs = now.getTime() - user.lastSpinTime.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)
      if (diffHours < spinSettings.freeSpinCooldownHours) {
          freeCooldownDate = new Date(user.lastSpinTime.getTime() + (spinSettings.freeSpinCooldownHours * 60 * 60 * 1000))
      }
  }

  // Calculate Premium Spin Cooldown (Dynamic)
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
       <div className="relative text-center space-y-2 md:space-y-4 py-6 md:py-8 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 rounded-2xl md:rounded-3xl text-white shadow-2xl overflow-hidden">
          <div 
            className="absolute inset-0 opacity-10 mix-blend-overlay"
            style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
            }}
          ></div>
          <div className="relative z-10">
              <h1 className="text-xl md:text-3xl font-black tracking-tight drop-shadow-md flex items-center justify-center gap-2 md:gap-3">
                 <SparklesIcon className="w-5 h-5 md:w-8 md:h-8 text-yellow-400 animate-pulse" />
                 Spin & Win <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Rewards</span>
              </h1>
              <p className="text-gray-300 text-[10px] md:text-sm max-w-2xl mx-auto px-4">
                  Free Spin every <span className="font-bold text-white">{spinSettings.freeSpinCooldownHours} hours</span>. Join Premium to spin <span className="font-bold text-yellow-400">Daily</span>!
              </p>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Main Wheel Area */}
           <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
               <Tabs defaultValue="free" className="w-full flex-1 flex flex-col">
                   {/* Tabs Switcher */}
                   <div className="bg-gray-50/80 border-b border-gray-100 p-2 flex justify-center backdrop-blur-sm sticky top-0 z-10 text-sm md:text-base">
                       <TabsList className="grid w-full max-w-md grid-cols-2 bg-white rounded-xl shadow-sm border border-gray-200 p-1 h-auto">
                           <TabsTrigger value="free" className="py-2 md:py-3 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 font-bold text-xs md:text-base transition-all">
                               Free Spin ({spinSettings.freeSpinCooldownHours}h)
                           </TabsTrigger>
                           <TabsTrigger value="premium" className="py-2 md:py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-50 data-[state=active]:to-amber-50 data-[state=active]:text-amber-800 font-bold text-xs md:text-base flex items-center justify-center gap-2 transition-all">
                               <StarIcon className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                               Premium Daily
                           </TabsTrigger>
                       </TabsList>
                   </div>
                   
                   {/* Free Spin Tab */}
                   <TabsContent value="free" className="flex-1 flex flex-col items-center justify-center p-2 md:p-8 bg-gradient-to-b from-white to-gray-50 outline-none animate-in fade-in zoom-in-95 duration-300">
                       <div className="mb-6 flex flex-col items-center gap-2">
                            {freeCooldownDate ? (
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Next Free Spin</span>
                                    <div className="animate-bounce">
                                        <CountdownTimer targetDate={freeCooldownDate} />
                                    </div>
                                </div>
                            ) : (
                                <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
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
                   <TabsContent value="premium" className="flex-1 flex flex-col items-center justify-center p-2 md:p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-50 via-white to-gray-50 outline-none animate-in fade-in zoom-in-95 duration-300 relative">
                       {/* Premium Info Overlay if locked */}
                       {!user.isActiveMember && (
                           <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
                               <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm border-2 border-yellow-100">
                                   <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                       <LockClosedIcon className="w-8 h-8 text-yellow-600" />
                                   </div>
                                   <h3 className="text-2xl font-black text-gray-900 mb-2">Premium Locked</h3>
                                   <p className="text-gray-500 mb-6">Deposit just <span className="text-gray-900 font-bold">$1.00</span> to unlock higher rewards and exclusive prizes!</p>
                                   <div className="inline-block px-6 py-3 bg-yellow-400 text-yellow-900 font-bold rounded-xl shadow-lg hover:bg-yellow-300 transition-colors cursor-pointer">
                                       Unlock Now
                                   </div>
                               </div>
                           </div>
                       )}

                       <div className="mb-6 flex flex-col items-center gap-2 relative z-0">
                            {premiumCooldownDate ? (
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Next Daily Spin</span>
                                    <CountdownTimer targetDate={premiumCooldownDate} />
                                </div>
                            ) : (
                                <div className="px-4 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                                    <StarIcon className="w-3 h-3" />
                                    {user.premiumBonusSpins > 0 ? `${user.premiumBonusSpins} Bonus Spins` : "Daily Spin Ready"}
                                </div>
                            )}
                       </div>

                       <SpinWheel 
                           rewards={premiumRewards} 
                           onSpin={executeSpin.bind(null, "PREMIUM")}
                           isLocked={!user.isActiveMember || (!!premiumCooldownDate && user.premiumBonusSpins <= 0)}
                           type="PREMIUM"
                       />
                   </TabsContent>
               </Tabs>
           </div>

           {/* Sidebar: History & Stats */}
           <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-gray-400" />
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
