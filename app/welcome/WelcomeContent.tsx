"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CopyableText } from "../dashboard/components/copyable-text"
import { ArrowRightIcon, LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/solid"
import SpecialPoolsSection from "../components/landing/SpecialPoolsSection"
import CbspSection from "../components/welcome/CbspSection"

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
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function WelcomeContent({ user, pools }: WelcomeContentProps) {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-16"
      >
        {/* HERO SECTION */}
        <motion.div variants={item} className="relative z-10 text-center space-y-8">
             {/* Background Ambience */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-b from-indigo-50/50 via-white/50 to-white/0 -z-10 rounded-[40%] blur-3xl opacity-60 pointer-events-none"></div>

             {/* Status Badge */}
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-indigo-100 shadow-sm transition-all hover:shadow-md hover:scale-105"
             >
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                </div>
                <span className="text-sm font-semibold text-indigo-900 tracking-wide">Active Session</span>
             </motion.div>

             {/* Main Heading */}
             <div className="space-y-6 pt-4">
                 <div className="relative inline-block px-10 py-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl shadow-indigo-100/50">
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 tracking-tight leading-tight relative z-10">
                        Welcome back, <br className="hidden md:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 drop-shadow-sm animate-gradient-x">
                            {user.name || "Valued User"}
                        </span>
                    </h1>
                 </div>
                 
                 <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-light">
                    Your financial command center is ready. <br className="hidden md:block"/>
                    Continue your journey towards <span className="font-medium text-gray-900">financial freedom</span>.
                 </p>
             </div>
             
             {/* CTA Button */}
             <div className="flex justify-center pt-8 pb-4">
                <Link href="/dashboard/wallet?tab=deposit">
                    <motion.button 
                        whileHover={{ scale: 1.05, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="group relative px-12 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-[1.5rem] font-bold text-lg shadow-2xl shadow-indigo-500/40 overflow-hidden flex items-center gap-4 transition-all hover:shadow-indigo-600/50"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                        
                        <span className="relative z-10 text-xl tracking-wide">Deposit & Grow</span>
                        <div className="relative z-10 bg-white/20 p-2 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                            <ArrowRightIcon className="w-5 h-5 text-white" />
                        </div>
                    </motion.button>
                </Link>
             </div>
        </motion.div>

        {/* UNLOCK FEATURES SECTION */}
        <motion.section variants={item} className="relative py-8">
            <div className="text-center mb-10 space-y-3">
                 <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        {user.isActiveMember ? "Your Active Features" : "Deposit to Unlock Your Exclusive Features!"}
                    </span>
                 </h2>
                 {!user.isActiveMember && (
                    <p className="text-gray-500 max-w-xl mx-auto">
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
        </motion.section>

        {/* ACTIVE POOLS SECTION */}
        <motion.section variants={item} className="space-y-12 py-8">
             <div className="text-center max-w-2xl mx-auto space-y-4">
                 <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
                    Active Pools
                 </h2>
                 <p className="text-xl text-gray-500 font-light leading-relaxed">
                    Multiple earning streams, <span className="text-indigo-600 font-medium">one powerful ecosystem</span>.
                 </p>
             </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {pools.length > 0 ? pools.map((pool, i) => (
                    <PoolCard key={pool.id} pool={pool} index={i} />
                 )) : (
                    <div className="col-span-full text-center py-12 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                        <p className="text-gray-400">Loading pools...</p>
                    </div>
                 )}
             </div>
        </motion.section>

        {/* CBSP POOL DEDICATED SECTION */}
        <CbspSection user={user} />

        {/* ACTIVE & REFERRAL SECTION */}
        <motion.section variants={item} className="grid md:grid-cols-1 gap-8">
             {/* Referral Section - Enhanced */}
            <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[2.5rem] p-8 md:p-16 text-white shadow-2xl">
                 <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                 
                 <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                     <div className="flex-1 space-y-6 text-center md:text-left">
                         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-bold uppercase tracking-wider backdrop-blur-md">
                            🎁 Affiliate Program
                         </div>
                         <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
                             Invite Friends & <br/>
                             <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-200">Earn Rewards!</span>
                         </h2>
                         <p className="text-indigo-100 text-lg max-w-xl leading-relaxed opacity-90">
                             For every friend who joins and deposits, you earn an instant <span className="font-bold text-white">20% commission</span>. Build your passive income stream today.
                         </p>
                     </div>

                     <div className="flex-1 w-full max-w-md">
                         <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[2rem] space-y-6 shadow-inner">
                             <div className="text-center">
                                 <p className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-2">Your Unique Code</p>
                                 <div className="flex items-center justify-center">
                                     <div className="text-4xl font-mono font-bold text-white tracking-wider drop-shadow-md">
                                        {user.referralCode || "------"}
                                     </div>
                                 </div>
                             </div>

                             {user.referralCode && (
                                <div className="bg-black/20 rounded-xl p-2 flex items-center justify-between pl-4">
                                    <span className="text-gray-300 text-sm truncate mr-4">le-earn.com/ref/{user.referralCode}</span>
                                    <CopyableText text={`https://lets-earnify.com/register?ref=${user.referralCode}`} className="bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-bold" />
                                </div>
                             )}

                             <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-white/5 rounded-xl p-4 text-center">
                                     <div className="text-2xl font-bold text-white mb-1">20%</div>
                                     <div className="text-xs text-indigo-200">Direct Bonus</div>
                                 </div>
                                 <div className="bg-white/5 rounded-xl p-4 text-center">
                                     <div className="text-2xl font-bold text-white mb-1">10%</div>
                                     <div className="text-xs text-indigo-200">Team Override</div>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
            </div>
        </motion.section>

        {/* POOLS SECTION */}
        <div className="rounded-[2.5rem] overflow-hidden bg-white shadow-sm border border-gray-100">
            <SpecialPoolsSection />
        </div>

        {/* FUTURE ROADMAP */}
        <motion.section variants={item} className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 text-center text-gray-300 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
             
             <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                 <div className="inline-block px-4 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-wider text-white">Coming Soon</div>
                 <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">Building the Future of Finance</h2>
                 <p className="text-lg leading-relaxed max-w-2xl mx-auto text-gray-400">
                    LetsEarnify is evolving. We represent the convergence of traditional values and modern blockchain technology.
                 </p>
                 
                 <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-4">
                     <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="text-4xl mb-4">🎮</div>
                        <h3 className="text-xl font-bold text-white mb-2">Play-to-Earn</h3>
                        <p className="text-sm text-gray-400">Competitive gaming ecosystem with real value rewards.</p>
                     </div>
                     <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="text-4xl mb-4">💱</div>
                        <h3 className="text-xl font-bold text-white mb-2">P2P Exchange</h3>
                        <p className="text-sm text-gray-400">Secure, low-fee crypto trading directly between users.</p>
                     </div>
                 </div>
             </div>
        </motion.section>

        <motion.footer variants={item} className="text-center text-gray-400 text-sm pt-8">
             &copy; {new Date().getFullYear()} LetsEarnify. All rights reserved.
        </motion.footer>
      </motion.div>
    </div>
  )
}

function FeatureCard({ title, desc, icon, gradient, bg, href, actionText, isActive }: any) {
    return (
        <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            className={`flex flex-col h-full p-8 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden ${
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
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-green-50 p-2 rounded-xl">
                        <LockOpenIcon className="w-5 h-5" />
                    </motion.div>
                ) : (
                    <motion.div className="bg-gray-200 p-2 rounded-xl">
                        <LockClosedIcon className="w-5 h-5" />
                    </motion.div>
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
        </motion.div>
    )
}

function PoolCard({ pool, index, userTier }: { pool: any, index: number, userTier?: string }) {
    const isRoyalty = pool.name === "ROYALTY";
    const ecosystemPools = ["CBSP", "REWARD", "EMERGENCY"];
    
    // Royalty Eligibility Logic
    const eligibleTiers = ['PLATINUM', 'DIAMOND', 'EMERALD'];
    const isEligible = isRoyalty ? eligibleTiers.includes(userTier || "") : true;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`group relative flex flex-col justify-between p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] transition-all duration-300 overflow-hidden ${
                isRoyalty && !isEligible ? "opacity-90 grayscale-[0.5]" : "hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1"
            }`}
        >
            {/* Hover Gradient Overlay */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                isRoyalty ? "bg-gradient-to-br from-amber-50/50 to-yellow-50/50" : "bg-gradient-to-br from-indigo-50/50 to-purple-50/50"
            }`}></div>

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                        isRoyalty 
                            ? "bg-gradient-to-br from-amber-400 to-orange-600 shadow-amber-500/20" 
                            : "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/20"
                    }`}>
                        {pool.name.includes("CBSP") ? "🏢" : 
                         pool.name.includes("ROYALTY") ? "👑" : 
                         pool.name.includes("EMERGENCY") ? "🛡️" : "💎"}
                    </div>
                    
                    {isRoyalty ? (
                        !isEligible ? (
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200 text-xs font-bold uppercase tracking-wider">
                                <LockClosedIcon className="w-3 h-3" />
                                Locked
                            </span>
                        ) : (
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Eligible
                            </span>
                        )
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-100 text-xs font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Active
                        </span>
                    )}
                </div>
                
                <h4 className={`text-2xl font-serif font-bold text-gray-900 mb-2 transition-colors ${
                    isRoyalty ? "group-hover:text-amber-700" : "group-hover:text-indigo-900"
                }`}>
                    {pool.name === "ROYALTY" ? "Royalty Pool" : pool.name}
                </h4>
                


                {isRoyalty && !isEligible ? (
                     <div className="pt-6 border-t border-gray-100">
                        <p className="text-xs text-amber-600 font-bold bg-amber-50 p-2 rounded-lg text-center" title="Deposit $1 to unlock Platinum+ features">
                            Deposit $1 via MLM to become eligible
                        </p>
                    </div>
                ) : (
                    <div className="pt-6 border-t border-gray-100 flex items-end justify-between">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Balance</p>
                            <p className="text-xl font-bold text-gray-900 font-mono">${pool.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                                {isRoyalty ? "Monthly Dist." : "Current Yield"}
                            </p>
                            <p className={`font-bold px-2 py-1 rounded-lg ${
                                isRoyalty ? "text-amber-600 bg-amber-50" : "text-indigo-600 bg-indigo-50"
                            }`}>
                                {isRoyalty ? "1-2%" : `${pool.percentage}%`}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
