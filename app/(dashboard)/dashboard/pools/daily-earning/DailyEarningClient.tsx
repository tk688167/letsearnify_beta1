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
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12 px-4 sm:px-6 lg:px-8">
      
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
        className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-xl md:rounded-3xl p-5 sm:p-8 md:p-12 text-white relative overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20 shadow-inner">
                <ChartBarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-300" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-1 sm:mb-2 tracking-tight leading-tight">Daily Earning Pool</h1>
                <p className="text-purple-200 text-sm sm:text-lg font-medium">Earn 1.0% Fixed Daily Yield</p>
              </div>
            </div>
            <p className="text-purple-100/70 leading-relaxed text-sm sm:text-base md:text-lg max-w-2xl">
              A premium, high-yield lock pool. Allocate funds from your Daily Earnings Wallet, lock them for 30 days, and earn 1% every 24 hours. After the 30-day period, your principal + profit return automatically.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 w-full md:w-auto md:min-w-[260px] md:shrink-0">
             <div className="flex items-center justify-between mb-3 sm:mb-4">
               <span className="text-sm font-bold text-purple-200/70 uppercase tracking-widest">Global Rate</span>
               <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">Active</span>
             </div>
             <div className="flex items-baseline gap-1 mb-1">
               <p className="text-4xl sm:text-5xl font-black font-mono tracking-tighter">1.0<span className="text-xl sm:text-2xl text-purple-300/80">%</span></p>
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
             
             <h2 className="text-xl font-bold text-foreground mb-6 relative z-10 flex items-center gap-2">
                <PlusIcon className="w-5 h-5 text-indigo-500" />
                Start New Pool
             </h2>
             
             <form onSubmit={handleInvest} className="space-y-4 relative z-10">
               <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-muted-foreground">Allocation Amount</label>
                    <div className="text-right">
                       <span className="text-[10px] block text-muted-foreground/60 font-bold uppercase tracking-tight">Daily Wallet</span>
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
                      className="w-full pl-8 pr-4 py-3 bg-muted/30 border-2 border-border rounded-xl focus:ring-0 focus:border-indigo-500 transition-colors font-mono text-lg text-foreground"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-[10px] text-indigo-500 mt-2 font-bold uppercase tracking-widest">
                     Min: $1.00 • 30 Day Term
                  </p>
               </div>

               {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm font-bold border border-destructive/20">{error}</div>}
               {success && <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm font-bold border border-emerald-500/20">{success}</div>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <PlusIcon className="w-5 h-5" />
                      Create Investment
                    </>
                  )}
                </button>
             </form>
           </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                   <ArrowPathIcon className="w-5 h-5 text-indigo-500" />
                   Transfer Wallet Funds
                </h2>
                
                {/* Direction Selector */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button 
                    type="button"
                    onClick={() => setTransferDirection("MAIN_TO_DAILY")}
                    className={cn(
                      "p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                      transferDirection === "MAIN_TO_DAILY" 
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                        : "bg-muted border-border text-muted-foreground"
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
                        : "bg-muted border-border text-muted-foreground"
                    )}
                  >
                    Daily → Main
                  </button>
                </div>

                <form onSubmit={handleTransfer} className="space-y-4">
                   <div>
                     <div className="flex justify-between items-center mb-2">
                       <label className="text-sm font-bold text-muted-foreground">Amount to Transfer</label>
                       <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-none">
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
                         className="w-full pl-8 pr-4 py-3 bg-muted/30 border-2 border-border rounded-xl font-mono text-foreground focus:border-indigo-500 outline-none transition-all"
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
                     className="w-full py-4 bg-foreground text-background font-bold rounded-xl transition-all disabled:opacity-50 hover:bg-foreground/90 active:scale-95 shadow-lg"
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
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox 
                  label="Available Bal." 
                  value={`$${mainBalance.toFixed(2)}`} 
                  icon={WalletIcon} 
                  color="indigo" 
                />
                <StatBox 
                  label="Daily Wallet" 
                  value={`$${dailyBalance.toFixed(2)}`} 
                  icon={CurrencyDollarIcon} 
                  color="purple" 
                />
                <StatBox 
                  label="Active Pools" 
                  value={activeInvestments.filter(inv => inv.status === "ACTIVE").length.toString()} 
                  icon={GridIcon} 
                  color="blue" 
                />
                <StatBox 
                  label="Total Profit" 
                  value={`$${totalProfit.toFixed(2)}`} 
                  icon={ChartBarIcon} 
                  color="emerald" 
                />
            </div>

           {/* Active Contracts Section */}
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-xl font-black text-foreground dark:text-white uppercase tracking-tighter flex items-center gap-2">
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
                            className={`bg-card border ${isComplete ? 'border-emerald-500/30' : 'border-border'} rounded-[2rem] p-6 sm:p-8 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative shadow-sm`}
                          >
                             {isComplete && <div className="absolute top-0 right-0 px-4 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-md">MATURED</div>}
                             
                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                                <div className="flex items-start gap-4">
                                   <div className={`w-14 h-14 ${isComplete ? 'bg-emerald-500/10' : 'bg-indigo-500/10'} rounded-2xl flex items-center justify-center shrink-0 border border-indigo-500/10`}>
                                      <ChartBarIcon className={`w-7 h-7 ${isComplete ? 'text-emerald-500' : 'text-indigo-500'}`} />
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                         <ShieldCheckIcon className="w-3 h-3 text-indigo-500/60" />
                                         Pool Allocation
                                      </p>
                                      <p className="text-3xl font-mono font-black text-foreground">${inv.amount.toFixed(2)}</p>
                                   </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-6">
                                   <div>
                                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Profit Yield</p>
                                      <p className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                                         +${inv.profitEarned.toFixed(2)}
                                      </p>
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Time Remaining</p>
                                      <p className="text-xl font-mono font-black text-foreground">
                                         {isComplete ? 0 : daysRemaining} <span className="text-[10px] text-indigo-500">DAYS</span>
                                      </p>
                                   </div>
                                   <div className="hidden sm:block">
                                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Fixed Rate</p>
                                      <p className="text-xl font-mono font-black text-indigo-500">1.0%</p>
                                   </div>
                                </div>
                             </div>

                             {/* Progress Bar Container */}
                             <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                   <div className="flex items-center gap-2">
                                      <div className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${isComplete ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600'}`}>
                                         {isComplete ? '30 Days Matured' : '30 Days Lock-in'}
                                      </div>
                                   </div>
                                   <span className="text-xs font-black text-indigo-600 font-mono">{isComplete ? 100 : Math.floor(progress)}%</span>
                                </div>
                                <div className="h-3 bg-muted rounded-full overflow-hidden p-0.5 border border-border/50 shadow-inner">
                                   <motion.div 
                                     initial={{ width: 0 }}
                                     animate={{ width: `${isComplete ? 100 : progress}%` }}
                                     transition={{ duration: 1.5, ease: "circOut" }}
                                     className={`h-full rounded-full shadow-[0_0_15px_rgba(99,102,241,0.3)] ${isComplete ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-gradient'}`}
                                   />
                                </div>
                                <div className="flex justify-between text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                   <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" /> {format(startDate, 'MMM dd, yyyy')}</span>
                                   <span className="flex items-center gap-1"><ShieldCheckIcon className="w-3 h-3" /> {isComplete ? 'Matured' : `Matures ${format(expiryDate, 'MMM dd')}`}</span>
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
        white: "bg-muted text-foreground",
        indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
        emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    }
    return (
        <div className="bg-card border border-border rounded-3xl p-4 sm:p-6 transition-all hover:bg-muted/50 group shadow-sm hover:shadow-md">
            <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-4 transition-all border", colorMap[color])}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 group-hover:text-foreground transition-colors">{label}</p>
            <p className="text-xl sm:text-2xl font-mono font-black text-foreground">{value}</p>
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
