"use client"

import Link from "next/link"
import { CopyableText } from "../dashboard/components/copyable-text"
import { ArrowRightIcon, LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/solid"
import WelcomePoolsSection from "../components/welcome/WelcomePoolsSection"
import dynamic from "next/dynamic"
import CbspSection from "../components/welcome/CbspSection"
// Remove static import
import NumberTicker from "../components/NumberTicker"

const WelcomeSlider = dynamic(() => import("../components/WelcomeSlider"), { ssr: false })

interface WelcomeContentProps {
  user: {
    name: string | null
    referralCode: string | null
    isActiveMember: boolean
    isCbspMember: boolean
    totalDeposit: number
    tier?: string
  }
  pools: any[]
  messages: any[]
}

export default function WelcomeContent({ user, pools, messages }: WelcomeContentProps) {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">

      <div 
        className="max-w-7xl mx-auto px-6 py-32 md:py-48 animate-in fade-in duration-500"
      >
        {/* HERO SECTION */}
        <div className="relative z-10 space-y-8 max-w-5xl mx-auto">
             {/* Background Ambience (Subtle & Professional) */}
             <div className="absolute inset-0 pointer-events-none -z-10">
                 <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[100px] mix-blend-multiply" />
                 <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[100px] mix-blend-multiply" />
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
             </div>

             {/* Main Hero Card */}
             <div className="relative flex flex-col items-start p-8 md:p-12 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] text-left w-full overflow-hidden">
                
                {/* Decoration: Top Gradient Line */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500 opacity-50"></div>

                {/* Top Row: User & Status */}
                <div className="w-full flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    
                    {/* Status Indicator (Consolidated Professional Line) */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-full border border-gray-200/50 shadow-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-gray-600 tracking-wide uppercase">
                            System Operational &middot; Live Trading
                        </span>
                    </div>

                    {/* User Badge */}
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Logged In As</span>
                            <span className="text-sm font-bold text-gray-900 leading-none">
                                {user.name || "Admin User"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="space-y-6 max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
                        Unlock the power of your <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                            earning potential.
                        </span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-500 font-normal leading-relaxed max-w-2xl">
                        Experience a professional ecosystem designed for growth. Secure pools, real-time analytics, and instant rewards.
                    </p>

                    <div className="pt-6 flex flex-wrap gap-4">
                        <Link href="/dashboard/wallet?tab=deposit">
                            <button className="px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold shadow-lg hover:bg-slate-800 hover:shadow-xl transition-all flex items-center gap-2 active:scale-95">
                                <span>Start Earning Now</span>
                                <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        </Link>
                        
                        {!user.isActiveMember && (
                             <div className="flex items-center gap-2 px-6 py-4 rounded-xl border border-gray-200 text-gray-500 font-medium">
                                <LockClosedIcon className="w-4 h-4" />
                                <span>Account limit reached? Upgrade tier.</span>
                             </div>
                        )}
                    </div>
                </div>
             </div>
        </div>

        {/* SLIDER SECTION - Centered & Spaced */}
        <div className="w-full max-w-7xl mx-auto my-24 px-6 md:px-12">
             <div className="rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden transform transition-all hover:shadow-md">
                <WelcomeSlider />
             </div>
        </div>

        {/* UNLOCK FEATURES SECTION */}
        <section className="relative py-24">
            <div className="text-center mb-10 space-y-3">
                 <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        {user.isActiveMember ? "Your Active Features" : "Deposit to Unlock Your Exclusive Features"}
                    </span>
                 </h2>
                 {!user.isActiveMember && (
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Make a deposit today to instantly access our premium earning channels.
                    </p>
                 )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <FeatureCard 
                    title="Task Center"
                    desc="Complete simple surveys, app installs, and social tasks to earn instant cash rewards."
                    icon="✅"
                    gradient="from-green-500 to-emerald-600"
                    bg="bg-green-50"
                    href={user.isActiveMember ? "/dashboard/tasks" : "/dashboard/wallet?tab=deposit"}
                    actionText={user.isActiveMember ? "View Task" : "Unlock Feature"}
                    isActive={user.isActiveMember}
                />
                <FeatureCard 
                    title="Mudaraba Pool"
                    desc="Invest in compliant pools with transparent profit sharing. Secure your future."
                    icon="📈"
                    gradient="from-blue-500 to-cyan-600"
                    bg="bg-blue-50"
                    href={user.isActiveMember ? "/dashboard/investments" : "/dashboard/wallet?tab=deposit"}
                    actionText={user.isActiveMember ? "View Pool" : "Unlock Feature"}
                    isActive={user.isActiveMember}
                />
                <FeatureCard 
                    title="Marketplace"
                    desc="Buy and sell digital services. Micro-freelancing made easy for everyone."
                    icon="🛍️"
                    gradient="from-orange-500 to-amber-600"
                    bg="bg-orange-50"
                    href={user.isActiveMember ? "/dashboard/marketplace" : "/dashboard/wallet?tab=deposit"}
                    actionText={user.isActiveMember ? "View Marketplace" : "Unlock Feature"}
                    isActive={user.isActiveMember}
                />
            </div>
        </section>

        {/* ACTIVE POOLS SECTION */}
        <section className="space-y-16 py-24">
             <div className="text-center max-w-2xl mx-auto space-y-6">
                 <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900">
                    Active Pools
                 </h2>
                 <p className="text-xl text-gray-500 leading-relaxed font-light">
                    Multiple earning streams, <span className="text-indigo-600 font-medium">one powerful ecosystem</span>.
                 </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {pools.length > 0 ? pools.map((pool, i) => (
                    <PoolCard key={pool.id} pool={pool} index={i} />
                 )) : (
                    <div className="col-span-full text-center py-12 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                        <p className="text-gray-400">Loading pools...</p>
                    </div>
                 )}
             </div>
        </section>

        {/* CBSP POOL DEDICATED SECTION */}
        <CbspSection user={user} />

        {/* ACTIVE & REFERRAL SECTION */}
        <section className="grid md:grid-cols-1 gap-8 py-16">
             {/* Referral Section - Enhanced (Light/Glass Theme) */}
             <div className="relative overflow-hidden bg-white rounded-[2.5rem] p-8 md:p-16 border border-gray-100 shadow-xl">
                  {/* Background Accents */}
                  <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-50/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                      <div className="flex-1 space-y-8 text-center md:text-left">
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-bold uppercase tracking-wider text-indigo-700">
                             🎁 Affiliate Program
                          </div>
                          <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight text-gray-900">
                              Invite Friends & <br/>
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">Earn Rewards!</span>
                          </h2>
                          <p className="text-gray-500 text-lg max-w-xl leading-relaxed">
                              For every friend who joins and deposits, you earn an instant <span className="font-bold text-gray-900">20% commission</span>. Build your passive income stream today.
                          </p>
                      </div>

                      <div className="flex-1 w-full max-w-md">
                          <div className="bg-white/90 backdrop-blur-xl border border-gray-100 p-8 rounded-[2rem] space-y-6 shadow-2xl shadow-indigo-100/50 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-50 z-0"></div>
                              <div className="relative z-10 text-center">
                                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Your Unique Code</p>
                                  <div className="flex items-center justify-center">
                                      <div className="text-4xl font-mono font-bold text-gray-900 tracking-wider">
                                         {user.referralCode || "------"}
                                      </div>
                                  </div>
                              </div>

                              {user.referralCode && (
                                 <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between pl-4 border border-gray-100 transition-colors hover:border-indigo-100">
                                     <span className="text-gray-500 text-sm truncate mr-4">le-earn.com/ref/{user.referralCode}</span>
                                     <CopyableText text={`https://letsearnify.com/welcome/${user.referralCode}`} className="bg-white text-indigo-700 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all" />
                                 </div>
                              )}

                              <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
                                      <div className="text-2xl font-bold text-indigo-600 mb-1">20%</div>
                                      <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Direct Bonus</div>
                                  </div>
                                  <div className="bg-fuchsia-50 rounded-xl p-4 text-center border border-fuchsia-100">
                                      <div className="text-2xl font-bold text-fuchsia-600 mb-1">10%</div>
                                      <div className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-wider">Team Override</div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
             </div>
        </section>

        {/* POOLS SECTION */}
        <div className="rounded-[2.5rem] overflow-hidden bg-white shadow-xl border border-gray-100">
            <WelcomePoolsSection />
        </div>

        {/* FUTURE ROADMAP */}
        <section className="bg-gray-900 rounded-[2.5rem] p-8 md:p-16 text-center text-gray-300 relative overflow-hidden shadow-2xl my-24">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
             
             <div className="relative z-10 max-w-4xl mx-auto space-y-10">
                 <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-wider text-white">Coming Soon</div>
                 <h2 className="text-3xl md:text-5xl font-bold text-white font-serif leading-tight">Building the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Future of Finance</span></h2>
                 <p className="text-lg leading-relaxed max-w-2xl mx-auto text-gray-400 font-light">
                    LetsEarnify is evolving. We represent the convergence of traditional values and modern blockchain technology.
                 </p>
                 
                 <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-6">
                     <div className="p-8 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors group text-left">
                        <div className="text-4xl mb-6 bg-white/10 w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">🎮</div>
                        <h3 className="text-xl font-bold text-white mb-2">Play-to-Earn</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">Competitive gaming ecosystem with real value rewards. Compete in tournaments and earn crypto.</p>
                     </div>
                     <div className="p-8 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors group text-left">
                        <div className="text-4xl mb-6 bg-white/10 w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">💱</div>
                        <h3 className="text-xl font-bold text-white mb-2">P2P Exchange</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">Secure, low-fee crypto trading directly between users. Fiat-to-crypto onramps coming soon.</p>
                     </div>
                 </div>
             </div>
        </section>

        <footer className="text-center text-gray-400 text-sm pt-8 border-t border-gray-100 pb-10">
             &copy; {new Date().getFullYear()} LetsEarnify. All rights reserved.
        </footer>
      </div>
    </div>
  )
}

function FeatureCard({ title, desc, icon, gradient, bg, href, actionText, isActive }: any) {
    return (
        <div 
            className={`flex flex-col h-full p-8 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden hover:-translate-y-2 hover:scale-[1.02] ${
                isActive 
                ? "bg-white border-gray-100 shadow-xl" 
                : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 opacity-90 grayscale-[0.3] hover:grayscale-0"
            }`}
        >
            {/* Background Gradient Blur based on card type - Visible on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

            {/* Lock/Unlock Indicator */}
            <div className={`absolute top-0 right-0 p-4 transition-all duration-300 ${isActive ? "text-green-500" : "text-gray-400"}`}>
                {isActive ? (
                    <div className="bg-green-50 p-2 rounded-xl animate-in zoom-in duration-300">
                        <LockOpenIcon className="w-5 h-5" />
                    </div>
                ) : (
                    <div className="bg-gray-200 p-2 rounded-xl">
                        <LockClosedIcon className="w-5 h-5" />
                    </div>
                )}
            </div>

            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl mb-6 text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 ${!isActive && "opacity-75"}`}>
                {icon}
            </div>
            
            <h3 className="text-2xl font-bold mb-3 font-serif text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-colors">
                {title}
            </h3>
            
            <p className="text-gray-500 mb-8 flex-1 leading-relaxed font-medium">
                {desc}
            </p>
            
            <Link 
                href={href}
                className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-sm transition-all shadow-md relative overflow-hidden ${
                    isActive 
                    ? `bg-gray-900 text-white hover:bg-black hover:shadow-lg` 
                    : "bg-white text-gray-400 border border-gray-200 cursor-not-allowed group-hover:border-gray-300 group-hover:text-gray-500"
                }`}
            >
                {isActive ? (
                     <>
                        {actionText} <ArrowRightIcon className="w-4 h-4" />
                     </>
                ) : (
                     <>
                        <LockClosedIcon className="w-4 h-4" /> Unlock Feature
                     </>
                )}
            </Link>
        </div>
    )
}

function PoolCard({ pool, index, userTier }: { pool: any, index: number, userTier?: string }) {
    const isRoyalty = pool.name === "ROYALTY";
    const name = pool.name;
    
    // Royalty Eligibility Logic
    const eligibleTiers = ['PLATINUM', 'DIAMOND', 'EMERALD'];
    const isEligible = isRoyalty ? eligibleTiers.includes(userTier || "") : true;

    // Theme Config - Updated for Premium Light Theme
    const getTheme = (n: string) => {
        if (n === 'CBSP') return { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100", icon: "🏢" }
        if (n === 'REWARD') return { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100", icon: "💎" }
        if (n === 'EMERGENCY') return { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100", icon: "🛡️" }
        // Default / Royalty
        return { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100", icon: "👑" }
    }

    const theme = getTheme(name);
    
    return (
        <div 
            className={`group relative flex flex-col justify-between p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
                isRoyalty && !isEligible ? "opacity-80" : ""
            }`}
        >
            <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${theme.bg} ${theme.text} border ${theme.border}`}>
                        {theme.icon}
                    </div>
                    
                    {isRoyalty ? (
                        !isEligible ? (
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100 text-[10px] font-medium uppercase tracking-wide">
                                <LockClosedIcon className="w-3 h-3" />
                                Locked
                            </span>
                        ) : (
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                Eligible
                            </span>
                        )
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                        </span>
                    )}
                </div>
                
                <div>
                    <h4 className="text-lg font-medium text-gray-900 tracking-tight">
                        {pool.name === "ROYALTY" ? "Royalty Pool" : pool.name}
                    </h4>
                    
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-0.5">Balance</p>
                            <p className="text-lg font-semibold text-gray-900 font-sans tracking-tight">
                                <NumberTicker value={pool.balance} prefix="$" />
                            </p>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-0.5">
                                APY
                            </p>
                            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100/50">
                                {isRoyalty ? "1-2%" : `${pool.percentage}%`}
                            </span>
                        </div>
                    </div>

                    {isRoyalty && !isEligible && (
                        <div className="mt-3 text-center">
                            <p className="text-[10px] text-gray-400">Deposit MLM $1 to unlock</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
