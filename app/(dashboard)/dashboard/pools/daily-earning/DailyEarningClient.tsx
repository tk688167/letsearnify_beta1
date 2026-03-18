"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  CurrencyDollarIcon, 
  ClockIcon,
  BanknotesIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  PlusIcon,
  WalletIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline"
import { format, differenceInDays } from "date-fns"
import useSWR from "swr"
import { createDailyPool, transferToMainWallet, transferToDailyWallet } from "@/app/actions/user/daily-pools"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function DailyEarningPoolContent() {
  const [amount, setAmount] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferDirection, setTransferDirection] = useState<"MAIN_TO_DAILY" | "DAILY_TO_MAIN">("MAIN_TO_DAILY")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { data, error: fetchError, mutate } = useSWR("/api/user/daily-earning", fetcher)

  const mainBalance = data?.walletBalance || 0
  const dailyBalance = data?.dailyEarningWallet || 0
  const activeInvestments: any[] = data?.activeInvestments || []

  const totalInvested = activeInvestments.filter(inv => inv.status === "ACTIVE").reduce((sum, inv) => sum + inv.amount, 0)
  const totalProfit = activeInvestments.filter(inv => inv.status === "ACTIVE").reduce((sum, inv) => sum + inv.profitEarned, 0)

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount < 1) {
      setError("Minimum investment is $1.00")
      setIsSubmitting(false)
      return
    }

    if (numAmount > dailyBalance) {
      setError("Insufficient Daily Wallet balance")
      setIsSubmitting(false)
      return
    }

    try {
      const result = await createDailyPool(numAmount)
      if (result.error) throw new Error(result.error)

      setSuccess(result.message || `Successfully invested $${numAmount.toFixed(2)} into the Daily Earning Pool.`)
      setAmount("")
      mutate()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsTransferring(true)
    setError("")
    setSuccess("")

    const numAmount = parseFloat(transferAmount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount to transfer.")
      setIsTransferring(false)
      return
    }

    const limit = transferDirection === "MAIN_TO_DAILY" ? mainBalance : dailyBalance
    if (numAmount > limit) {
      setError(`Insufficient ${transferDirection === "MAIN_TO_DAILY" ? "Main" : "Daily"} Wallet balance`)
      setIsTransferring(false)
      return
    }

    try {
      const result = transferDirection === "MAIN_TO_DAILY" 
        ? await transferToDailyWallet(numAmount)
        : await transferToMainWallet(numAmount)

      if (result.error) throw new Error(result.error)

      setSuccess(result.message || `Successfully transferred $${numAmount.toFixed(2)}.`)
      setTransferAmount("")
      mutate()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsTransferring(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12">
      
      {/* Back Button */}
      <Link 
        href="/dashboard/pools" 
        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Pools
      </Link>

      {/* Hero Header matching CBS aesthetic but recolored */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-xl md:rounded-3xl p-6 sm:p-8 md:p-12 text-white relative overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20 shadow-inner">
                <ChartBarIcon className="w-8 h-8 text-purple-300" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">Daily Earning Pool</h1>
                <p className="text-purple-200 text-lg font-medium">Earn 1% Daily Profit</p>
              </div>
            </div>
            <p className="text-purple-100/80 leading-relaxed max-w-2xl text-base md:text-lg">
              A high-yield, automated 30-day lock pool. Allocate funds from your Daily Earnings Wallet, lock them for 30 days, and earn 1% every 24 hours. After 30 days, your principal + profit return automatically.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 min-w-[300px] shrink-0">
             <div className="flex items-center justify-between mb-4">
               <span className="text-sm font-bold text-purple-200/70 uppercase tracking-widest">Global Rate</span>
               <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">Active</span>
             </div>
             <div className="flex items-baseline gap-1 mb-1">
               <p className="text-5xl font-black font-mono tracking-tighter">1.0<span className="text-2xl text-purple-300/80">%</span></p>
             </div>
             <p className="text-indigo-200/80 text-sm font-medium">Daily Fixed Yield</p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Investment Form & Logic Explanation */}
        <div className="lg:col-span-1 space-y-6">
           {/* Create Pool Form */}
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-500/5 rounded-bl-full flex items-start justify-end p-6">
                <BanknotesIcon className="w-8 h-8 text-indigo-500/20" />
             </div>
             
             <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 relative z-10">Start New Pool</h2>
             
             <form onSubmit={handleInvest} className="space-y-4 relative z-10">
               <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Allocation Amount</label>
                    <div className="text-right">
                       <span className="text-[10px] block text-gray-400 font-bold uppercase tracking-tight">Daily Wallet</span>
                       <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">${dailyBalance.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-xl focus:ring-0 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors font-mono text-lg text-gray-900 dark:text-white"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 font-medium">
                     Min: $1.00 • Lock: 30 Days @ 1%/Day
                  </p>
               </div>

               {error && <div className="p-3 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-lg text-sm font-bold border border-red-100 dark:border-red-900/30">{error}</div>}
               {success && <div className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg text-sm font-bold border border-emerald-100 dark:border-emerald-900/30">{success}</div>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-indigo-500/20 hover:scale-105 disabled:opacity-50 disabled:scale-100 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <PlusIcon className="w-5 h-5" />
                      Create New Pool
                    </>
                  )}
                </button>
             </form>
           </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Transfer Funds</h2>
                
                {/* Direction Selector */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button 
                    type="button"
                    onClick={() => setTransferDirection("MAIN_TO_DAILY")}
                    className={cn(
                      "p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                      transferDirection === "MAIN_TO_DAILY" 
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                        : "bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-500"
                    )}
                  >
                    Main → Daily
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTransferDirection("DAILY_TO_MAIN")}
                    className={cn(
                      "p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                      transferDirection === "DAILY_TO_MAIN" 
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                        : "bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-500"
                    )}
                  >
                    Daily → Main
                  </button>
                </div>

                <form onSubmit={handleTransfer} className="space-y-4">
                   <div>
                     <div className="flex justify-between items-center mb-2">
                       <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Amount to Transfer</label>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                         Available: ${transferDirection === "MAIN_TO_DAILY" ? mainBalance.toFixed(2) : dailyBalance.toFixed(2)}
                       </span>
                     </div>
                     <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <span className="text-gray-500 font-bold">$</span>
                       </div>
                       <input
                         type="number"
                         step="0.01"
                         className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-xl font-mono text-gray-900 dark:text-white focus:border-indigo-500 outline-none transition-all"
                         placeholder="0.00"
                         value={transferAmount}
                         onChange={(e) => setTransferAmount(e.target.value)}
                         max={transferDirection === "MAIN_TO_DAILY" ? mainBalance : dailyBalance}
                         required
                       />
                     </div>
                   </div>

                   <button
                     type="submit"
                     disabled={isTransferring}
                     className="w-full py-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-bold rounded-xl transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                   >
                     {isTransferring ? "Processing..." : `Transfer to ${transferDirection === "MAIN_TO_DAILY" ? "Daily Wallet" : "Main Balance"}`}
                   </button>
                </form>
             </div>

           <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/30">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2 mb-4">
                 <InformationCircleIcon className="w-5 h-5" />
                 How it works
              </h3>
              <ul className="space-y-3 text-sm text-indigo-800/80 dark:text-indigo-200/70 font-medium">
                 <li className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    Funds deposited are reflected in your Daily Earnings Wallet.
                 </li>
                 <li className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    Create multiple pools with $1 or more at any time.
                 </li>
                 <li className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    Each pool is locked for 30 days and earns 1% profit daily.
                 </li>
                 <li className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    After 30 days, principal + profit automatically return to your Daily Wallet.
                 </li>
                 <li className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    Transfer from Daily Wallet to Main Wallet anytime at your convenience.
                 </li>
              </ul>
           </div>
        </div>        {/* Right Column: User's Dashboard & Open Investments */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* --- PREMIUM STATS GRID --- */}
           <div className="grid grid-cols-2 gap-4">
               <StatBox 
                 label="Main Balance" 
                 value={`$${mainBalance.toFixed(2)}`} 
                 icon={WalletIcon} 
                 color="white" 
               />
               <StatBox 
                 label="Earning Wallet" 
                 value={`$${dailyBalance.toFixed(2)}`} 
                 icon={CurrencyDollarIcon} 
                 color="indigo" 
               />
               <StatBox 
                 label="Active Pools" 
                 value={activeInvestments.filter(inv => inv.status === "ACTIVE").length.toString()} 
                 icon={GridIcon} 
                 color="blue" 
               />
               <StatBox 
                 label="Total Earnings" 
                 value={`$${totalProfit.toFixed(2)}`} 
                 icon={ChartBarIcon} 
                 color="emerald" 
               />
           </div>

           {/* Active Contracts Section */}
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                    <ClockIcon className="w-6 h-6 text-indigo-500" />
                    Running Pools
                 </h2>
                 {activeInvestments.filter(inv => inv.status === "ACTIVE").length > 0 && (
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Generating 1% Daily</span>
                   </div>
                 )}
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {activeInvestments.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02]">
                       <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <ClockIcon className="w-8 h-8 text-indigo-400/50" />
                       </div>
                       <p className="text-indigo-200 font-bold">No active pools found.</p>
                       <p className="text-indigo-400/60 text-xs mt-2 font-medium">Allocate funds and start your first pool.</p>
                    </div>
                ) : (
                    activeInvestments.map((inv) => {
                       const now = new Date()
                       const startDate = new Date(inv.createdAt)
                       const expiryDate = new Date(inv.expiresAt)
                       const isComplete = now >= expiryDate || inv.status === "COMPLETED"
                       
                       const totalDays = 30
                       const elapsedMs = now.getTime() - startDate.getTime()
                       const elapsedDays = Math.max(0, Math.min(totalDays, elapsedMs / (1000 * 60 * 60 * 24)))
                       const progress = (elapsedDays / totalDays) * 100
                       const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

                       return (
                         <motion.div 
                           key={inv.id} 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className={`bg-white/[0.03] border ${isComplete ? 'border-emerald-500/20' : 'border-white/10'} rounded-3xl p-6 sm:p-8 hover:bg-white/[0.05] transition-all group overflow-hidden relative`}
                         >
                            {isComplete && <div className="absolute top-0 right-0 px-4 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl">Matured</div>}
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                               <div className="flex items-start gap-4">
                                  <div className={`w-12 h-12 ${isComplete ? 'bg-emerald-500/20' : 'bg-indigo-500/20'} rounded-2xl flex items-center justify-center shrink-0`}>
                                     <ChartBarIcon className={`w-6 h-6 ${isComplete ? 'text-emerald-400' : 'text-indigo-400'}`} />
                                  </div>
                                  <div>
                                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Principal Amount</p>
                                     <p className="text-3xl font-mono font-black text-white">${inv.amount.toFixed(2)}</p>
                                  </div>
                               </div>

                               <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                                  <div>
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Profit Earned</p>
                                     <p className="text-xl font-mono font-black text-emerald-400">+${inv.profitEarned.toFixed(2)}</p>
                                  </div>
                                  <div>
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Time Left</p>
                                     <p className="text-xl font-mono font-black text-white">{isComplete ? 0 : daysRemaining} <span className="text-[10px] font-black text-indigo-400">DAYS</span></p>
                                  </div>
                                  <div className="hidden sm:block">
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Daily Rate</p>
                                     <p className="text-xl font-mono font-black text-indigo-300">1.0%</p>
                                  </div>
                               </div>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="space-y-4">
                               <div className="flex justify-between items-end">
                                  <div className="flex items-center gap-2">
                                     <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Lock Status</span>
                                     <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-300 text-[9px] font-black rounded border border-indigo-500/20">30 DAYS TERM</span>
                                  </div>
                                  <span className="text-xs font-black text-white font-mono">{isComplete ? 100 : Math.floor(progress)}%</span>
                               </div>
                               <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-px">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${isComplete ? 100 : progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full bg-gradient-to-r ${isComplete ? 'from-emerald-500 to-emerald-400' : 'from-indigo-500 via-indigo-400 to-indigo-500'} rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]`}
                                  />
                               </div>
                               <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                  <span>Started {format(startDate, 'MMM dd')}</span>
                                  <span>Matures {format(expiryDate, 'MMM dd')}</span>
                               </div>
                            </div>
                         </motion.div>
                       )
                    })
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function StatBox({ label, value, icon: Icon, color }: any) {
    const colorMap: any = {
        white: "text-white/40 group-hover:text-white",
        indigo: "text-indigo-400 group-hover:text-indigo-300",
        emerald: "text-emerald-400 group-hover:text-emerald-300",
        blue: "text-blue-400 group-hover:text-blue-300",
        amber: "text-amber-400 group-hover:text-amber-300",
    }
    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 transition-all hover:bg-white/10 group">
            <div className={cn("w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mb-4 transition-colors", colorMap[color])}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1 group-hover:text-white/50 transition-colors">{label}</p>
            <p className="text-xl sm:text-2xl font-mono font-black text-white">{value}</p>
        </div>
    )
}

function GridIcon({ className }: { className?: string }) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
    )
}
