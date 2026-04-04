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
import { useCurrency } from "@/app/components/providers/CurrencyProvider"

const fetcher = (url: string) => fetch(url).then(r => r.json())

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function DailyEarningWidget({ isCompact = false }: { isCompact?: boolean }) {
  const { data, error, mutate } = useSWR("/api/user/daily-earning", fetcher)
  const { formatCurrency, userCurrency } = useCurrency();
  
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
        "bg-card border border-border rounded-[2.5rem] shadow-xl relative overflow-hidden transition-colors duration-300",
        isCompact ? "p-5 sm:p-7" : ""
      )}
    >
      {/* Background Decor */}
      {!isCompact && (
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <ChartBarIcon className="w-64 h-64 text-indigo-500" />
        </div>
      )}

      {/* Global Background Gradient Overlays for themes */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-600/10 dark:to-purple-600/10 pointer-events-none" />

      <div className={cn("relative z-10", isCompact ? "" : "p-6 sm:p-10")}>
        
        {/* --- HEADER SECTION --- */}
        <div className={cn("flex flex-col gap-5", isCompact ? "mb-6" : "mb-12 border-b border-border pb-8")}>
           <div className={cn("flex justify-between items-start md:items-center")}>
              <div className="w-full md:w-auto pr-4">
                <h2 className={cn("font-black tracking-tighter capitalize text-foreground", isCompact ? "text-xl sm:text-2xl" : "text-4xl sm:text-5xl mb-2")}>
                  <span className={cn(isCompact ? "" : "text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500")}>Daily Earning Pool</span>
                </h2>
                {!isCompact && (
                  <p className="text-muted-foreground font-medium text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
                     Create your pool from $1 and earn 1% daily. Funds are locked for 30 days before withdrawal.
                  </p>
                )}
              </div>
              
              {isCompact && (
                <button 
                  onClick={() => setIsTransferModalOpen(true)}
                  className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 uppercase tracking-widest flex items-center gap-1 transition-all hover:scale-105"
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
                  className="relative w-full overflow-hidden bg-background hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 border border-border hover:border-indigo-500/30 rounded-2xl p-4 transition-all flex items-center justify-between shadow-sm disabled:opacity-50"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-110">
                            <PlusIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h4 className="text-sm font-black text-foreground tracking-tight">Create Pool</h4>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">1% Daily Yield • 30-Day</p>
                        </div>
                    </div>
                    <div className="hidden sm:block px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        Create
                    </div>
                </button>
             </div>
           )}

           {!isCompact && (
             <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-4">
                <button 
                  onClick={() => setIsTransferModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-background hover:bg-muted text-foreground text-xs font-black uppercase tracking-widest rounded-[1rem] border border-border transition-all shadow-sm active:scale-95"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Transfer Funds
                </button>
                <button 
                  onClick={() => setIsInvestModalOpen(true)}
                  disabled={dailyEarningWallet < 1}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black uppercase tracking-widest rounded-[1rem] transition-all shadow-xl shadow-indigo-500/25 active:scale-95 disabled:opacity-50"
                >
                  <SparklesIcon className="w-4 h-4" />
                  + Create New Pool
                </button>
             </div>
           )}
        </div>

        <div className={cn("grid gap-4", isCompact ? "grid-cols-2 mb-8" : "grid-cols-2 lg:grid-cols-5 mb-12")}>
            <StatBox 
              label={`Earnings Wallet (${userCurrency})`} 
              value={formatCurrency(dailyEarningWallet)} 
              icon={CurrencyDollarIcon} 
              color="indigo" 
              isCompact={isCompact}
            />
            <StatBox 
              label={`Active Pool (${userCurrency})`} 
              value={formatCurrency(totalPrincipalLocked)} 
              icon={LockClosedIcon} 
              color="amber" 
              isCompact={isCompact}
            />
            <div className={cn(isCompact ? "col-span-2" : "hidden lg:block")}>
               <StatBox 
                 label={`Accumulated Profit (${userCurrency})`} 
                 value={formatCurrency(totalAccumulatedProfit)} 
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
                  label={`Main Balance (${userCurrency})`} 
                  value={formatCurrency(walletBalance)} 
                  icon={WalletIcon} 
                  color="gray" 
                />
              </>
            )}
        </div>

        {/* ACTION REQUIRED: Expired Locks Segment */}
        {expiredLocks.length > 0 && (
           <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                 <ClockIcon className="w-4 h-4 text-rose-500" />
              </div>
              <h3 className={cn("font-black text-foreground uppercase tracking-tighter", isCompact ? "text-base" : "text-xl")}>Terms Completed</h3>
            </div>
              
              {actionError && <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold rounded-2xl">{actionError}</div>}

              <div className="grid grid-cols-1 gap-4">
                 {expiredLocks.map((inv: any) => (
                    <motion.div 
                      key={inv.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "bg-background border border-rose-500/30 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between shadow-xl shadow-rose-500/5 relative overflow-hidden group",
                        isCompact ? "p-5" : "p-6 lg:p-8"
                      )}
                    >
                       <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-rose-400 to-rose-600"></div>
                       <div className="mb-6 md:mb-0 pl-4">
                          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                             Principal Ready to be Collected
                          </p>
                          <div className="flex items-baseline gap-3">
                             <p className="text-3xl font-serif font-black text-foreground">{formatCurrency(inv.amount)}</p>
                             <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                                <PlusIcon className="w-3 h-3" />
                                {formatCurrency(inv.profitEarned)}
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex flex-col sm:flex-row gap-3">
                          <button 
                            type="button" onClick={() => handleCompletionAction(inv.id, "REINVEST")}
                            disabled={actionLoader === inv.id}
                            className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 shadow-md shadow-indigo-500/25 active:scale-95"
                          >
                            {actionLoader === inv.id ? "Working..." : "Reinvest All"}
                          </button>
                          <button 
                            type="button" onClick={() => handleCompletionAction(inv.id, "WITHDRAW_TO_WALLET")}
                            disabled={actionLoader === inv.id}
                            className="px-6 py-3.5 bg-card hover:bg-muted text-foreground text-xs font-black uppercase tracking-widest rounded-xl border border-border transition-all disabled:opacity-50 active:scale-95"
                          >
                             Collect To Main
                          </button>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </div>
        )}

        {/* Live Active Investments Segment */}
        <div>
           <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between", isCompact ? "mb-5 gap-3" : "mb-8 gap-4")}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                   <ClockIcon className="w-4 h-4 text-indigo-500" />
                </div>
                <h3 className={cn("font-black text-foreground uppercase tracking-tighter", isCompact ? "text-base" : "text-xl")}>Active Live Pools</h3>
              </div>
              
              {activeLocks.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-max">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Growing 1% Daily</span>
                </div>
              )}
           </div>
           
           <div className="grid grid-cols-1 gap-5">
               {activeLocks.length === 0 ? (
                 <div className="py-16 text-center border-2 border-dashed border-border rounded-[2.5rem] bg-muted/20">
                    <div className="w-16 h-16 bg-background rounded-2xl border border-border shadow-sm flex items-center justify-center mx-auto mb-4">
                       <WalletIcon className="w-8 h-8 text-muted-foreground/60" />
                    </div>
                    <p className="text-foreground font-black text-lg">No active pools running.</p>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Start your first pool to generate consistent passive yields.</p>
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
                          "bg-background/80 backdrop-blur-sm border border-border rounded-[2rem] shadow-sm hover:border-indigo-500/30 transition-all duration-300 group overflow-hidden relative",
                          isCompact ? "p-5" : "p-6 sm:p-8"
                        )}
                      >
                         {/* Subtle Glow Background hover */}
                         <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform"></div>

                         <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6", isCompact ? "mb-6" : "mb-8")}>
                            <div className="flex items-center gap-4 sm:gap-5">
                               <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                                  <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                               </div>
                               <div>
                                  <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Locked Principal</p>
                                  <div className="flex items-baseline gap-2">
                                     <p className={cn("font-serif font-black text-foreground tracking-tighter", isCompact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl")}>{formatCurrency(inv.amount)}</p>
                                     <div className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                                        +{formatCurrency(inv.amount * 0.01)}/day
                                     </div>
                                  </div>
                               </div>
                            </div>

                            <div className={cn("flex flex-col sm:flex-row gap-3 sm:gap-6", isCompact ? "w-full sm:w-auto" : "w-full sm:w-auto")}>
                               <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-center flex-1 sm:flex-none sm:min-w-[100px]">
                                  <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1 flex justify-center items-center gap-1">
                                    <SparklesIcon className="w-3 h-3" /> Profit
                                  </p>
                                  <p className={cn("font-serif font-black text-emerald-600 dark:text-emerald-400 tracking-tighter", isCompact ? "text-lg" : "text-xl")}>+{formatCurrency(inv.profitEarned)}</p>
                               </div>
                               <div className="bg-orange-500/5 p-3 rounded-xl border border-orange-500/10 text-center flex-1 sm:flex-none sm:min-w-[100px]">
                                  <p className="text-[9px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-widest mb-1 flex justify-center items-center gap-1">
                                    <LockClosedIcon className="w-3 h-3" /> Locked
                                  </p>
                                  <p className={cn("font-black text-foreground tabular-nums", isCompact ? "text-lg" : "text-xl")}>
                                     {daysRemaining} <span className="text-[9px] sm:text-[10px] text-muted-foreground">DAYS</span>
                                  </p>
                               </div>
                            </div>
                         </div>

                         {/* Term Progress Bar Container */}
                         <div className="space-y-3 bg-muted/30 p-4 rounded-2xl border border-border">
                            <div className="flex justify-between items-end">
                               <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Maturation Progress</span>
                               </div>
                               <span className="text-xs font-black text-foreground font-mono">{Math.floor(progress)}%</span>
                            </div>
                            <div className="h-3 bg-card border border-border rounded-full overflow-hidden p-0.5 shadow-inner">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${progress}%` }}
                                 transition={{ duration: 1, ease: "easeOut" }}
                                 className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-sm"
                               />
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest pt-1">
                               <span>Started: {format(startDate, 'MMM dd')}</span>
                               <span className="text-indigo-600 dark:text-indigo-400">Unlock: {format(expiryDate, 'MMM dd')}</span>
                            </div>
                         </div>
                      </motion.div>
                    )
                 })
               )}
           </div>
        </div>

      </div>

      {/* --- PREMIUM MODALS --- */}
      <AnimatePresence>
         {isTransferModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pr-6 sm:pr-4">
               <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => !transferLoader && setIsTransferModalOpen(false)} />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 20 }}
                 className="bg-card border border-border w-full max-w-md rounded-[2.5rem] p-8 relative z-10 shadow-2xl"
               >
                  <button onClick={() => !transferLoader && setIsTransferModalOpen(false)} className="absolute top-6 right-6 p-2 bg-muted hover:bg-muted-foreground/10 rounded-full text-muted-foreground transition-colors">
                     <XMarkIcon className="w-5 h-5" />
                  </button>

                  <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">Fund Allocation</h3>
                  <p className="text-muted-foreground text-sm font-medium mb-8 leading-relaxed">Shift your balance internally between your standard Wallet and Earning Pool Wallet.</p>
                  
                  {/* Direction Selection */}
                  <div className="flex bg-muted/50 p-1 rounded-2xl border border-border mb-6">
                    <button 
                      type="button"
                      onClick={() => setTransferDirection("MAIN_TO_DAILY")}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                        transferDirection === "MAIN_TO_DAILY" 
                          ? "bg-card border border-border shadow-sm text-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="opacity-50">Main</span> → Daily
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTransferDirection("DAILY_TO_MAIN")}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                        transferDirection === "DAILY_TO_MAIN" 
                          ? "bg-card border border-border shadow-sm text-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="opacity-50">Daily</span> → Main
                    </button>
                  </div>

                  <div className="bg-muted/40 rounded-2xl p-4 mb-6 border border-border flex justify-between items-center shadow-inner">
                     <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                       {transferDirection === "MAIN_TO_DAILY" ? "Main Wallet Balance" : "Daily Earning Base"}
                     </span>
                     <span className="text-foreground font-serif font-black text-lg">
                       {formatCurrency(transferDirection === "MAIN_TO_DAILY" ? walletBalance : dailyEarningWallet)}
                     </span>
                  </div>

                  <form onSubmit={handleTransfer}>
                     <div className="mb-8 relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <span className="text-muted-foreground text-xl font-serif font-black">$</span>
                        </div>
                        <input 
                          type="number"
                          step="0.01"
                          min="1"
                          max={transferDirection === "MAIN_TO_DAILY" ? walletBalance : dailyEarningWallet}
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-background border border-border focus:border-indigo-500 rounded-2xl py-5 pl-10 pr-5 text-foreground font-serif text-2xl outline-none shadow-sm transition-all"
                          required
                        />
                     </div>

                     {transferError && <p className="text-rose-500 text-[11px] font-black uppercase tracking-widest text-center mb-6">{transferError}</p>}
                     
                     <button 
                       type="submit" 
                       disabled={transferLoader}
                       className="w-full py-5 bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50"
                     >
                        {transferLoader ? "Processing..." : "Authorize Transfer"}
                     </button>
                  </form>
               </motion.div>
            </div>
         )}

         {isInvestModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => !investLoader && setIsInvestModalOpen(false)} />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 30 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 30 }}
                 className="bg-card border border-border w-full max-w-md rounded-[2.5rem] p-8 relative z-10 shadow-2xl"
               >
                  <button onClick={() => !investLoader && setIsInvestModalOpen(false)} className="absolute top-6 right-6 p-2 bg-muted hover:bg-muted-foreground/10 rounded-full text-muted-foreground transition-colors">
                     <XMarkIcon className="w-5 h-5" />
                  </button>

                  <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">Create New Pool</h3>
                  <p className="text-muted-foreground text-sm font-medium mb-8 leading-relaxed">Deposit capital to automatically generate a steady 1% daily return over a 30-day locked term.</p>
                  
                  <div className="bg-muted/40 rounded-2xl p-4 mb-6 border border-border flex justify-between items-center">
                     <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Available Allocation</span>
                     <span className="text-foreground font-serif font-black text-lg">{formatCurrency(dailyEarningWallet)}</span>
                  </div>

                  <form onSubmit={handleInvest}>
                     <div className="mb-6 relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <span className="text-muted-foreground text-xl font-serif font-black">$</span>
                        </div>
                        <input 
                          type="number"
                          step="0.01"
                          min="1"
                          max={dailyEarningWallet}
                          value={investAmount}
                          onChange={(e) => setInvestAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-background border border-border focus:border-indigo-500 rounded-2xl py-5 pl-10 pr-5 text-foreground font-serif text-2xl outline-none shadow-inner transition-colors"
                          required
                        />
                     </div>
                     
                     {/* Preview Box */}
                     {investAmount && !isNaN(parseFloat(investAmount)) && parseFloat(investAmount) >= 1 && (
                        <div className="mb-6 grid grid-cols-2 gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                           <div className="text-center border-r border-indigo-500/10">
                              <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">Expected Daily</p>
                              <p className="text-base font-black text-indigo-600 dark:text-indigo-400 font-serif">+{formatCurrency(parseFloat(investAmount) * 0.01)}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Return (30d)</p>
                              <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-serif">+{formatCurrency(parseFloat(investAmount) * 0.30)}</p>
                           </div>
                        </div>
                     )}

                     {investError && <p className="text-rose-500 text-[11px] font-black uppercase tracking-widest text-center mb-6">{investError}</p>}
                     {investSuccess && <p className="text-emerald-500 text-[11px] font-black uppercase tracking-[0.1em] text-center mb-6"><SparklesIcon className="inline w-4 h-4 mb-0.5" /> {investSuccess}</p>}
                     
                     <div className="mb-8 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold leading-relaxed flex items-start gap-3 shadow-sm">
                        <LockClosedIcon className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>Capital is strictly locked for 30 days. Your principal and 30% accumulated profit are released automatically upon maturity.</p>
                     </div>

                     <button 
                       type="submit" 
                       disabled={investLoader || !investAmount || parseFloat(investAmount) < 1 || parseFloat(investAmount) > dailyEarningWallet}
                       className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black tracking-widest uppercase text-[11px] rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/25 active:scale-95"
                     >
                        {investLoader ? "Initializing Contract..." : "Confirm & Start Pool"}
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
        gray: "text-muted-foreground bg-muted border-border",
        indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20",
        emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20",
        blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20",
        amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20",
    }
    return (
        <div className={cn(
          "bg-background/80 border border-border shadow-sm rounded-2xl transition-all hover:bg-muted/30 group",
          isCompact ? "p-3 sm:p-4 hover:scale-[1.02]" : "p-5 sm:p-6 rounded-[2rem] hover:scale-[1.02]"
        )}>
            <div className={cn(
              "rounded-xl flex items-center justify-center mb-3 transition-colors", 
              colorMap[color],
              isCompact ? "w-8 h-8" : "w-12 h-12 rounded-2xl mb-5 shadow-sm"
            )}>
                <Icon className={cn(isCompact ? "w-4 h-4" : "w-6 h-6")} />
            </div>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 group-hover:text-foreground/70 transition-colors truncate">{label}</p>
            <p className={cn("font-serif font-black text-foreground truncate", isCompact ? "text-lg" : "text-2xl sm:text-3xl")}>{value}</p>
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
