"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import { format } from "date-fns"
import { 
  ChartBarIcon, 
  WalletIcon, 
  ArrowPathIcon,
  ClockIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  PlusIcon,
  SparklesIcon
} from "@heroicons/react/24/outline"
import { createDailyPool } from "@/app/actions/user/daily-pools"

const fetcher = (url: string) => fetch(url).then(r => r.json())

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function DailyEarningWidget({ isCompact = false }: { isCompact?: boolean }) {
  const { data, error, mutate } = useSWR("/api/user/daily-earning", fetcher)
  
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState("")
  const [transferDirection, setTransferDirection] = useState<"MAIN_TO_DAILY" | "DAILY_TO_MAIN">("MAIN_TO_DAILY")
  const [transferLoader, setTransferLoader] = useState(false)
  const [transferError, setTransferError] = useState("")

  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false)
  const [investAmount, setInvestAmount] = useState("")
  const [investLoader, setInvestLoader] = useState(false)
  const [investError, setInvestError] = useState("")
  const [investSuccess, setInvestSuccess] = useState("")

  const walletBalance = data?.walletBalance || 0
  const dailyEarningWallet = data?.dailyEarningWallet || 0
  const activeInvestments: any[] = data?.activeInvestments || []

  // Derive Stats
  const now = new Date()
  const activeLocks = activeInvestments.filter(inv => inv.status === "ACTIVE" && new Date(inv.expiresAt) > now)
  const expiredLocks = activeInvestments.filter(inv => inv.status === "ACTIVE" && new Date(inv.expiresAt) <= now)
  const totalPrincipalLocked = activeLocks.reduce((sum, inv) => sum + inv.amount, 0)
  const totalAccumulatedProfit = activeLocks.reduce((sum, inv) => sum + inv.profitEarned, 0)
  const [actionLoader, setActionLoader] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleCompletionAction = async (investmentId: string, action: "REINVEST" | "WITHDRAW_TO_WALLET") => {
     setActionError(null)
     setActionLoader(investmentId)
     try {
       const res = await fetch("/api/user/daily-earning/complete", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ investmentId, action })
       })
       const result = await res.json()
       if (!res.ok) throw new Error(result.error || "Action failed")
       mutate()
     } catch(err: any) {
       setActionError(err.message)
     } finally {
       setActionLoader(null)
     }
  }
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setTransferError("")
    const amount = parseFloat(transferAmount)
    
    if (isNaN(amount) || amount <= 0) return setTransferError("Enter a valid amount.")
    const limit = transferDirection === "MAIN_TO_DAILY" ? walletBalance : dailyEarningWallet
    if (amount > limit) return setTransferError(`Insufficient ${transferDirection === "MAIN_TO_DAILY" ? 'Main' : 'Daily'} Wallet Balance.`)

    setTransferLoader(true)
    try {
      const res = await fetch("/api/user/daily-earning/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, direction: transferDirection })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Transfer failed")
      
      setTransferAmount("")
      setIsTransferModalOpen(false)
      mutate() // Refresh SWR state instantly
    } catch (err: any) {
      setTransferError(err.message)
    } finally {
      setTransferLoader(false)
    }
  }

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault()
    setInvestError("")
    setInvestSuccess("")
    const amount = parseFloat(investAmount)

    if (isNaN(amount) || amount < 1) return setInvestError("Minimum lock amount is $1.00")
    if (amount > dailyEarningWallet) return setInvestError("Insufficient Daily Earning Wallet balance. Use the Transfer button to move funds from your Main Wallet.")

    setInvestLoader(true)
    try {
      const result = await createDailyPool(amount)
      if (result.error) throw new Error(result.error)

      setInvestSuccess(result.message || `Pool of $${amount.toFixed(2)} activated for 30 days.`)
      setInvestAmount("")
      mutate() // Instantly refresh SWR data across both Dashboard and main page
    } catch (err: any) {
      setInvestError(err.message)
    } finally {
      setInvestLoader(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl border border-indigo-500/20 shadow-2xl overflow-hidden relative",
        isCompact ? "p-5 sm:p-7" : ""
      )}
    >
      {/* Background Decor */}
      {!isCompact && (
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <ChartBarIcon className="w-64 h-64 text-indigo-400" />
        </div>
      )}

      <div className={cn("relative z-10", isCompact ? "" : "p-6 sm:p-10")}>
        
        {/* --- HEADER SECTION --- */}
        <div className={cn("flex flex-col gap-5", isCompact ? "mb-6" : "mb-12")}>
           <div className="flex items-center justify-between">
              <h2 className={cn("font-black text-white tracking-tight leading-none", isCompact ? "text-xl sm:text-2xl" : "text-4xl sm:text-5xl mb-4")}>
                Daily <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Earning Pool</span>
              </h2>
              {isCompact && (
                <button 
                  onClick={() => setIsTransferModalOpen(true)}
                  className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1 transition-colors transition-all hover:scale-105"
                >
                  <ArrowPathIcon className="w-3 h-3" /> Transfer
                </button>
              )}
           </div>

           {isCompact && (
             <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                <button 
                  onClick={() => setIsInvestModalOpen(true)}
                  disabled={dailyEarningWallet < 1}
                  className="relative w-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all flex items-center justify-between disabled:opacity-50"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-110">
                            <PlusIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h4 className="text-sm font-black text-white tracking-tight">Start Pool</h4>
                            <p className="text-[10px] font-medium text-white/50 uppercase tracking-widest">1% Daily Yield � 30-Day Term</p>
                        </div>
                    </div>
                    <div className="px-3 py-1.5 bg-white/10 rounded-lg text-[9px] font-black text-indigo-300 uppercase tracking-widest group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        Start Pool
                    </div>
                </button>
             </div>
           )}

           {!isCompact && (
             <div className="flex flex-col sm:flex-row items-center gap-3">
                <button 
                  onClick={() => setIsTransferModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-2xl border border-white/10 transition-all hover:scale-105"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Transfer Funds
                </button>
                <button 
                  onClick={() => setIsInvestModalOpen(true)}
                  disabled={dailyEarningWallet < 1}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-500/20 hover:scale-105 disabled:opacity-50 disabled:scale-100"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Start Pool
                </button>
             </div>
           )}
        </div>

        {/* --- STATS GRID --- */}
        <div className={cn("grid gap-3", isCompact ? "grid-cols-2 mb-8" : "grid-cols-2 lg:grid-cols-5 mb-12")}>
            <StatBox 
              label="Earnings Wallet" 
              value={`$${dailyEarningWallet.toFixed(2)}`} 
              icon={CurrencyDollarIcon} 
              color="indigo" 
              isCompact={isCompact}
            />
            <StatBox 
              label="Active Pool" 
              value={`$${totalPrincipalLocked.toFixed(2)}`} 
              icon={LockClosedIcon} 
              color="amber" 
              isCompact={isCompact}
            />
            <div className={cn(isCompact ? "col-span-2" : "hidden lg:block")}>
               <StatBox 
                 label="Active Pool Profit" 
                 value={`$${totalAccumulatedProfit.toFixed(2)}`} 
                 icon={ChartBarIcon} 
                 color="emerald" 
                 isCompact={isCompact}
               />
            </div>
            {!isCompact && (
              <>
                <StatBox 
                  label="Active Pools" 
                  value={activeLocks.length.toString()} 
                  icon={GridIcon} 
                  color="blue" 
                />
                <StatBox 
                  label="Main Balance" 
                  value={`$${walletBalance.toFixed(2)}`} 
                  icon={WalletIcon} 
                  color="white" 
                />
              </>
            )}
        </div>

        {/* ACTION REQUIRED: Expired Locks Segment */}
        {expiredLocks.length > 0 && (
           <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center">
                 <ClockIcon className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <h3 className={cn("font-black text-white uppercase tracking-tighter", isCompact ? "text-base" : "text-xl")}>Terms Completed</h3>
            </div>
              
              {actionError && <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-2xl">{actionError}</div>}

              <div className="grid grid-cols-1 gap-4">
                 {expiredLocks.map((inv: any) => (
                    <motion.div 
                      key={inv.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between shadow-xl relative overflow-hidden group",
                        isCompact ? "p-4" : "p-6 lg:p-8"
                      )}
                    >
                       <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
                       <div className="mb-6 lg:mb-0 pl-4">
                          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Principal Return Ready</p>
                          <div className="flex items-baseline gap-3">
                             <p className="text-3xl font-mono font-black text-white">${inv.amount.toFixed(2)}</p>
                             <div className="flex items-center gap-1 text-emerald-400 font-black text-sm">
                                <PlusIcon className="w-3 h-3" />
                                ${inv.profitEarned.toFixed(2)}
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex flex-col sm:flex-row gap-3">
                          <button 
                            type="button" onClick={() => handleCompletionAction(inv.id, "REINVEST")}
                            disabled={actionLoader === inv.id}
                            className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                          >
                            {actionLoader === inv.id ? "Working..." : "Reinvest All"}
                          </button>
                          <button 
                            type="button" onClick={() => handleCompletionAction(inv.id, "WITHDRAW_TO_WALLET")}
                            disabled={actionLoader === inv.id}
                            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl border border-white/10 transition-all disabled:opacity-50"
                          >
                             Collect Payout
                          </button>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </div>
        )}

        {/* Live Active Investments Segment */}
        <div>
           <div className={cn("flex items-center justify-between", isCompact ? "mb-5" : "mb-8 text-center sm:text-left")}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                   <ClockIcon className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <h3 className={cn("font-black text-white uppercase tracking-tighter", isCompact ? "text-base" : "text-xl")}>All Active Pools</h3>
              </div>
              
              {activeLocks.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shrink-0">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest shrink-0">1% Daily</span>
                </div>
              )}
           </div>
           
           <div className="grid grid-cols-1 gap-6">
               {activeLocks.length === 0 ? (
                 <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02]">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                       <ClockIcon className="w-8 h-8 text-indigo-400/50" />
                    </div>
                    <p className="text-indigo-200 font-bold">No active pools running.</p>
                    <p className="text-indigo-400/60 text-xs mt-2 font-medium">Start a new pool to begin earning daily yields.</p>
                 </div>
               ) : (
                 activeLocks.map((inv: any) => {
                    const startDate = new Date(inv.createdAt)
                    const expiryDate = new Date(inv.expiresAt)
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
                        className={cn(
                          "bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.05] transition-all group overflow-hidden relative",
                          isCompact ? "p-4 sm:p-5" : "p-6 sm:p-8"
                        )}
                      >
                         {/* Subtle Glow Background */}
                         <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>

                         <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-6", isCompact ? "mb-6" : "mb-8")}>
                            <div className="flex items-start gap-4">
                               <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                                  <ChartBarIcon className="w-5 h-5 text-indigo-400" />
                               </div>
                               <div>
                                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Principal</p>
                                  <p className={cn("font-mono font-black text-white", isCompact ? "text-xl sm:text-2xl" : "text-3xl")}>${inv.amount.toFixed(2)}</p>
                               </div>
                            </div>

                            <div className={cn("grid grid-cols-2 gap-6", isCompact ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
                               <div>
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Profit</p>
                                  <p className={cn("font-mono font-black text-emerald-400", isCompact ? "text-lg" : "text-xl")}>+${inv.profitEarned.toFixed(2)}</p>
                               </div>
                               <div>
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Left</p>
                                  <p className={cn("font-mono font-black text-white", isCompact ? "text-lg" : "text-xl")}>{daysRemaining} <span className="text-[9px] font-black text-indigo-400">DAYS</span></p>
                               </div>
                               {!isCompact && (
                                 <div className="hidden sm:block">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Daily Rate</p>
                                    <p className="text-xl font-mono font-black text-indigo-300">1.0%</p>
                                 </div>
                               )}
                            </div>
                         </div>

                         {/* Progress Bar Container */}
                         <div className="space-y-4">
                            <div className="flex justify-between items-end">
                               <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Lock Status</span>
                                  <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-300 text-[9px] font-black rounded border border-indigo-500/20">30 DAYS TERM</span>
                               </div>
                               <span className="text-xs font-black text-white font-mono">{Math.floor(progress)}%</span>
                            </div>
                            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-px">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${progress}%` }}
                                 transition={{ duration: 1, ease: "easeOut" }}
                                 className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
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

      {/* --- MODALS --- */}
      <AnimatePresence>
         {isTransferModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !transferLoader && setIsTransferModalOpen(false)} />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 sm:p-8 relative z-10 shadow-2xl"
               >
                  <button onClick={() => !transferLoader && setIsTransferModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors">
                     <XMarkIcon className="w-6 h-6" />
                  </button>

                  <h3 className="text-2xl font-bold text-white mb-2">Transfer Funds</h3>
                  <p className="text-slate-400 text-sm mb-6">Move USD between your Main Wallet and your Daily Earning Wallet.</p>
                  
                  {/* Direction Selection */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button 
                      type="button"
                      onClick={() => setTransferDirection("MAIN_TO_DAILY")}
                      className={cn(
                        "p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                        transferDirection === "MAIN_TO_DAILY" 
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]" 
                          : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                      )}
                    >
                      Main ? Daily
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTransferDirection("DAILY_TO_MAIN")}
                      className={cn(
                        "p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                        transferDirection === "DAILY_TO_MAIN" 
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]" 
                          : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                      )}
                    >
                      Daily ? Main
                    </button>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700/50 flex justify-between items-center">
                     <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                       {transferDirection === "MAIN_TO_DAILY" ? "Available in Main" : "Available in Daily"}
                     </span>
                     <span className="text-white font-mono font-bold">
                       ${transferDirection === "MAIN_TO_DAILY" ? walletBalance.toFixed(2) : dailyEarningWallet.toFixed(2)}
                     </span>
                  </div>

                  <form onSubmit={handleTransfer}>
                     <div className="mb-6 relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-slate-400 font-bold">$</span>
                        </div>
                        <input 
                          type="number"
                          step="0.01"
                          min="1"
                          max={transferDirection === "MAIN_TO_DAILY" ? walletBalance : dailyEarningWallet}
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-8 pr-4 text-white font-mono text-lg focus:outline-none focus:border-indigo-500 transition-colors"
                          required
                        />
                     </div>
                     {transferError && <p className="text-rose-400 text-sm font-bold mb-4">{transferError}</p>}
                     <button 
                       type="submit" 
                       disabled={transferLoader}
                       className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                     >
                        {transferLoader ? "Processing..." : "Confirm Transfer"}
                     </button>
                  </form>
               </motion.div>
            </div>
         )}

         {isInvestModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !investLoader && setIsInvestModalOpen(false)} />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-indigo-950 border border-indigo-500/30 w-full max-w-md rounded-3xl p-6 sm:p-8 relative z-10 shadow-[0_0_50px_rgba(79,70,229,0.15)]"
               >
                  <button onClick={() => !investLoader && setIsInvestModalOpen(false)} className="absolute top-4 right-4 p-2 text-indigo-300 hover:text-white transition-colors">
                     <XMarkIcon className="w-6 h-6" />
                  </button>

                  <h3 className="text-2xl font-bold text-white mb-2">Initialize 30-Day Lock</h3>
                  <p className="text-indigo-200/80 text-sm mb-6">Invest funds from your Daily Earning Wallet to earn a strict 1% daily yield for exactly 30 days.</p>
                  
                  <div className="bg-indigo-900/50 rounded-xl p-4 mb-6 border border-indigo-500/20 flex justify-between items-center">
                     <span className="text-indigo-300 text-sm font-bold uppercase">Pool Wallet Base</span>
                     <span className="text-white font-mono font-bold">${dailyEarningWallet.toFixed(2)}</span>
                  </div>

                  <form onSubmit={handleInvest}>
                     <div className="mb-6 relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-indigo-400 font-bold">$</span>
                        </div>
                        <input 
                          type="number"
                          step="0.01"
                          min="1"
                          max={dailyEarningWallet}
                          value={investAmount}
                          onChange={(e) => setInvestAmount(e.target.value)}
                          placeholder="Minimum $1.00"
                          className="w-full bg-indigo-950/50 border border-indigo-500/40 rounded-xl py-4 pl-8 pr-4 text-white font-mono text-lg focus:outline-none focus:border-teal-400 transition-colors"
                          required
                        />
                     </div>
                     {investError && <p className="text-rose-400 text-sm font-bold mb-4">{investError}</p>}
                     {investSuccess && <p className="text-emerald-400 text-sm font-bold mb-4">? {investSuccess}</p>}
                     <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs font-semibold leading-relaxed">
                        ⚠️ By confirming, these funds will be completely locked for 30 calendar days. Early withdrawal is not permitted. Your principal and earned profit will be automatically returned at the end of the term.
                     </div>

                     <button 
                       type="submit" 
                       disabled={investLoader}
                       className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold tracking-wider uppercase rounded-xl transition-all disabled:opacity-50"
                     >
                        {investLoader ? "Locking Payload..." : "Confirm 30-Day Lock"}
                     </button>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </motion.div>
  )
}

function StatBox({ label, value, icon: Icon, color, isCompact }: any) {
    const colorMap: any = {
        white: "text-white/40 group-hover:text-white",
        indigo: "text-indigo-400 group-hover:text-indigo-300",
        emerald: "text-emerald-400 group-hover:text-emerald-300",
        blue: "text-blue-400 group-hover:text-blue-300",
        amber: "text-amber-400 group-hover:text-amber-300",
    }
    return (
        <div className={cn(
          "bg-white/5 border border-white/10 rounded-2xl transition-all hover:bg-white/10 group",
          isCompact ? "p-3 sm:p-4" : "p-5 sm:p-6 rounded-3xl"
        )}>
            <div className={cn(
              "rounded-xl bg-white/5 flex items-center justify-center mb-3 transition-colors", 
              colorMap[color],
              isCompact ? "w-8 h-8" : "w-10 h-10 rounded-2xl mb-4"
            )}>
                <Icon className={cn(isCompact ? "w-4 h-4" : "w-5 h-5")} />
            </div>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5 group-hover:text-white/50 transition-colors uppercase truncate">{label}</p>
            <p className={cn("font-mono font-black text-white truncate", isCompact ? "text-lg" : "text-xl sm:text-2xl")}>{value}</p>
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

function LockClosedIcon({ className }: { className?: string }) {
   return (
       <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
           <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
       </svg>
   )
}


