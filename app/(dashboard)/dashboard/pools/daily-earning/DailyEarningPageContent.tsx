"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import { format } from "date-fns"
import Link from "next/link"
import { 
  ChartBarIcon, 
  WalletIcon, 
  ClockIcon,
  XMarkIcon,
  BoltIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  PlusIcon,
  BanknotesIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  LockClosedIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"
import { createDailyPool } from "@/app/actions/user/daily-pools"
import { useCurrency } from "@/app/components/providers/CurrencyProvider"

const fetcher = (url: string) => fetch(url).then(r => r.json())

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function DailyEarningPageContent() {
  const { data, mutate } = useSWR("/api/user/daily-earning", fetcher)
  const { formatCurrency, userCurrency } = useCurrency();
  
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false)
  const [investAmount, setInvestAmount] = useState("")
  const [investLoader, setInvestLoader] = useState(false)
  const [investError, setInvestError] = useState("")
  const [investSuccess, setInvestSuccess] = useState("")

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferAmount, setTransferAmount] = useState("")
  const [transferLoader, setTransferLoader] = useState(false)
  const [transferError, setTransferError] = useState("")

  const walletBalance = data?.walletBalance || 0
  const dailyEarningWallet = data?.dailyEarningWallet || 0
  const activeInvestments: any[] = data?.activeInvestments || []

  // Derive Stats
  const now = new Date()
  const activeLocks = activeInvestments.filter((inv: any) => inv.status === "ACTIVE" && new Date(inv.expiresAt) > now)
  const expiredLocks = activeInvestments.filter((inv: any) => inv.status === "ACTIVE" && new Date(inv.expiresAt) <= now)
  const totalPrincipalLocked = activeLocks.reduce((sum: any, inv: any) => sum + inv.amount, 0)
  const totalAccumulatedProfit = activeLocks.reduce((sum: any, inv: any) => sum + inv.profitEarned, 0)
  
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
       if (!res.ok) throw new Error(result.error || "Execution failed")
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
    if (amount > walletBalance) return setTransferError("Insufficient Main Wallet Balance.")

    setTransferLoader(true)
    try {
      const res = await fetch("/api/user/daily-earning/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, direction: "MAIN_TO_DAILY" })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Transfer failed")
      
      setTransferAmount("")
      setIsTransferModalOpen(false)
      mutate()
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

    if (isNaN(amount) || amount < 1) {
      setInvestError("Minimum amount is $1.00")
      return
    }
    
    if (amount > dailyEarningWallet) {
      setInvestError("INSUFFICIENT")
      return
    }

    setInvestLoader(true)
    try {
      const result = await createDailyPool(amount)
      if (result.error) throw new Error(result.error)

      setInvestSuccess(result.message || `Protocol activated successfully.`)
      setInvestAmount("")
      setIsInvestModalOpen(false)
      mutate()
    } catch (err: any) {
      setInvestError(err.message)
    } finally {
      setInvestLoader(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 px-4 sm:px-6 pt-10 md:pt-16 font-sans">
      
      {/* 1. REFINED HEADER SECTION */}
      <section className="mb-10 flex flex-col items-center text-center md:items-end md:text-left md:flex-row justify-between gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-4 capitalize">
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Daily Earning Pool</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg font-medium text-muted-foreground/90 max-w-2xl leading-relaxed mx-auto md:mx-0">
             Create your pool from $1 and earn 1% daily. Funds are locked for 30 days before withdrawal.
          </p>
        </div>
        
        {/* STATS SUMMARY (Compact) */}
        <div className="flex bg-card border border-border p-2 rounded-2xl shadow-sm overflow-hidden">
           <div className="px-5 py-2 border-r border-border text-center">
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Total Invested</p>
             <p className="font-serif font-black text-foreground text-lg">{formatCurrency(totalPrincipalLocked)}</p>
           </div>
           <div className="px-5 py-2 border-r border-border text-center">
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Active Pools</p>
             <p className="font-serif font-black text-foreground text-lg">{activeLocks.length}</p>
           </div>
           <div className="px-5 py-2 text-center">
             <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Total Earnings</p>
             <p className="font-serif font-black text-emerald-600 dark:text-emerald-400 text-lg">+{formatCurrency(totalAccumulatedProfit)}</p>
           </div>
        </div>
      </section>

      {/* 2. ACTION SECTION */}
      <section className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 mb-12 shadow-xl shadow-indigo-500/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 z-10 w-full transform transition-all">
         {/* Decorative Overlay */}
         <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-150 rotate-12 pointer-events-none">
            <BanknotesIcon className="w-64 h-64 text-indigo-500" />
         </div>

         <div className="relative z-10 w-full md:w-auto text-center md:text-left text-foreground">
            <p className="text-[10px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-2">Daily Earning Wallet Balance</p>
            <div className="flex items-baseline justify-center md:justify-start gap-2 mb-2">
               <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-serif tracking-tighter">
                  {formatCurrency(dailyEarningWallet)}
               </h2>
            </div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Ready to allocate to new pools.</p>
         </div>

         <div className="relative z-10 flex flex-col sm:flex-row w-full md:w-auto gap-4">
            <button 
              onClick={() => setIsTransferModalOpen(true)}
              className="w-full sm:w-auto group relative flex items-center justify-center gap-2.5 px-8 py-5 bg-background border border-border hover:bg-muted text-foreground font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all shadow-sm active:scale-95 overflow-hidden"
            >
              <ArrowDownTrayIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              Deposit Funds
            </button>
            <button 
              onClick={() => setIsInvestModalOpen(true)}
              className="w-full sm:w-auto group relative flex items-center justify-center gap-2.5 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-500/25 active:scale-95 overflow-hidden"
            >
              {/* Button Inner Glow */}
              <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 -translate-x-full group-hover:animate-[shine_1s_ease-out]"></div>
              <PlusIcon className="w-4 h-4" />
              Start New Pool
            </button>
         </div>
      </section>

      {/* 3. POOL CARDS SECTION */}
      <section className="mb-20">
         <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
               <BoltIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-black text-foreground font-serif tracking-tight">Your Pools Hierarchy</h2>
         </div>

         {/* Expired Pools (Completed Status) */}
         {expiredLocks.length > 0 && (
            <div className="space-y-6 mb-10">
               {expiredLocks.map((inv: any) => (
                 <PoolCard key={inv.id} inv={inv} isCompleted={true} actionLoader={actionLoader} handleCompletionAction={handleCompletionAction} />
               ))}
               {actionError && <p className="text-xs text-rose-500 font-bold text-center mt-2">{actionError}</p>}
            </div>
         )}

         {/* Active Pools */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeLocks.length === 0 ? (
              <div className="col-span-1 md:col-span-2 py-24 text-center border-2 border-dashed border-border rounded-[2.5rem] bg-muted/20">
                 <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
                    <ClockIcon className="w-8 h-8 text-muted-foreground/60" />
                 </div>
                 <p className="text-foreground font-black text-lg">No active pools detected</p>
                 <p className="text-sm font-medium text-muted-foreground mt-1">Start a new pool to begin generating daily returns.</p>
              </div>
            ) : (
              activeLocks.map((inv: any) => <PoolCard key={inv.id} inv={inv} isCompleted={false} />)
            )}
         </div>
      </section>

      {/* 4. PREMIUM DEPOSIT MODAL */}
      <AnimatePresence>
         {isTransferModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => !transferLoader && setIsTransferModalOpen(false)} />
               <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="bg-card border border-border w-full max-w-sm rounded-[2.5rem] p-8 sm:p-10 relative z-10 shadow-2xl">
                  <button onClick={() => !transferLoader && setIsTransferModalOpen(false)} className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors bg-muted hover:bg-muted/80 rounded-full">
                     <XMarkIcon className="w-5 h-5" />
                  </button>

                  <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">Deposit to Pool</h3>
                  <p className="text-muted-foreground text-sm font-medium mb-6">Transfer funds from your Main Wallet to the Daily Earning Wallet.</p>

                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Main Wallet</span>
                     <span className="text-lg font-black text-foreground font-serif">{formatCurrency(walletBalance)}</span>
                  </div>

                  <form onSubmit={handleTransfer}>
                     <div className="mb-6 relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <span className="text-muted-foreground/50 font-black font-serif text-xl">$</span>
                        </div>
                        <input type="number" step="0.01" min="1" max={walletBalance} value={transferAmount} onChange={(e: any) => setTransferAmount(e.target.value)} placeholder="0.00" className="w-full bg-background border border-border rounded-2xl py-5 pl-10 pr-5 text-foreground font-serif text-2xl focus:outline-none focus:border-indigo-500 shadow-sm transition-all" required />
                     </div>

                     {transferError && <p className="text-rose-500 text-[10px] font-black mb-6 uppercase tracking-widest text-center">{transferError}</p>}

                     <button type="submit" disabled={transferLoader || !transferAmount} className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black tracking-widest uppercase text-[11px] rounded-2xl transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 active:scale-95">
                        {transferLoader ? "Processing..." : "Confirm Deposit"}
                     </button>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* 5. CREATE POOL MODAL */}
      <AnimatePresence>
         {isInvestModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => !investLoader && setIsInvestModalOpen(false)} />
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border w-full max-w-sm rounded-[2.5rem] p-8 sm:p-10 relative z-10 shadow-2xl">
                  <button onClick={() => !investLoader && setIsInvestModalOpen(false)} className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors bg-muted hover:bg-muted/80 rounded-full">
                     <XMarkIcon className="w-5 h-5" />
                  </button>

                  <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">Create Pool</h3>
                  <p className="text-muted-foreground text-sm font-medium mb-6">Invest funds to earn 1% daily. Locked for exactly 30 days.</p>

                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Available Allocation</span>
                     <span className="text-lg font-black text-foreground font-serif">{formatCurrency(dailyEarningWallet)}</span>
                  </div>

                  <form onSubmit={handleInvest}>
                     <div className="mb-6 relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <span className="text-muted-foreground/50 font-black font-serif text-xl">$</span>
                        </div>
                        <input type="number" step="0.01" min="1" max={dailyEarningWallet} value={investAmount} onChange={(e: any) => setInvestAmount(e.target.value)} placeholder="0.00" className="w-full bg-background border border-border rounded-2xl py-5 pl-10 pr-5 text-foreground font-serif text-2xl focus:outline-none focus:border-indigo-500 shadow-sm transition-all" required />
                     </div>

                     {/* ERROR STATE: Insufficient Assets */}
                     {investError === "INSUFFICIENT" ? (
                       <div className="mb-8 p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                          <p className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.1em] mb-4 leading-relaxed">
                             Asset allocation failed: Insufficient balance. Please deposit funds first.
                          </p>
                          <button 
                            type="button"
                            onClick={() => { setIsInvestModalOpen(false); setIsTransferModalOpen(true); }}
                            className="flex items-center justify-center gap-2.5 w-full py-4 bg-rose-500 text-white shadow-xl shadow-rose-500/20 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:bg-rose-600"
                          >
                             Deposit Funds <ArrowRightIcon className="w-4 h-4" />
                          </button>
                       </div>
                     ) : investError && (
                       <p className="text-rose-500 text-[10px] font-black mb-6 uppercase tracking-widest text-center">{investError}</p>
                     )}

                     {investSuccess && <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black mb-6 uppercase tracking-[0.2em] font-mono text-center">✓ {investSuccess}</p>}
                     
                     {/* Preview Box */}
                     {investAmount && !isNaN(parseFloat(investAmount)) && parseFloat(investAmount) >= 1 && !investError && (
                        <div className="mb-6 grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/40 border border-border shadow-inner">
                           <div className="text-center border-r border-border">
                              <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Daily Profit</p>
                              <p className="text-base font-black text-foreground font-serif">+{formatCurrency(parseFloat(investAmount) * 0.01)}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1">Total Expected Return</p>
                              <p className="text-base font-black text-foreground font-serif">+{formatCurrency(parseFloat(investAmount) * 0.30)}</p>
                           </div>
                        </div>
                     )}

                     <div className="mb-8 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-400 text-[11px] font-bold leading-relaxed flex gap-3 shadow-sm">
                        <LockClosedIcon className="w-5 h-5 shrink-0" />
                        <span>Capital is strictly locked for 30 days. No early withdrawal permitted.</span>
                     </div>

                     <button type="submit" disabled={investLoader || investError === "INSUFFICIENT"} className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black tracking-widest uppercase text-[11px] rounded-2xl transition-all shadow-xl shadow-indigo-500/25 disabled:opacity-50 active:scale-95">
                        {investLoader ? "Enabling Contract..." : "Start Pool"}
                     </button>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  )
}

function PoolCard({ inv, isCompleted, handleCompletionAction, actionLoader }: any) {
  const { formatCurrency } = useCurrency();
  const now = new Date()
  const startDate = new Date(inv.createdAt)
  const expiryDate = new Date(inv.expiresAt)
  const totalDays = 30
  const elapsedMs = now.getTime() - startDate.getTime()
  const elapsedDays = Math.max(0, Math.min(totalDays, elapsedMs / (1000 * 60 * 60 * 24)))
  const progress = (elapsedDays / totalDays) * 100
  const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

  return (
    <div className={cn(
       "p-6 sm:p-8 rounded-[2rem] relative overflow-hidden transition-all duration-500 shadow-sm group",
       isCompleted ? "bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950 dark:to-background border border-indigo-200 dark:border-indigo-500/30 shadow-indigo-500/10" : "bg-card border border-border hover:border-indigo-500/40"
    )}>
       {/* Background Decor */}
       <div className="absolute top-0 right-0 p-6 opacity-[0.03] scale-150 pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <ChartBarIcon className="w-32 h-32 text-indigo-500" />
       </div>

       {/* Status Badge */}
       <div className="absolute top-6 right-6">
          {isCompleted ? (
             <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
               <CheckCircleIcon className="w-3.5 h-3.5" /> Completed
             </div>
          ) : (
             <div className="inline-flex flex-col items-end gap-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active
                </div>
                <div className="inline-flex items-center gap-1 px-2 text-[9px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-widest bg-orange-500/10 rounded-md border border-orange-500/20">
                  <LockClosedIcon className="w-2.5 h-2.5" /> Locked – {daysRemaining} Days Left
                </div>
             </div>
          )}
       </div>

       {/* Top Row: Principal & Expected Return */}
       <div className="mb-5 sm:mb-6 pr-0 sm:pr-24">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Invested Amount</p>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3">
             <h4 className="text-3xl sm:text-4xl font-black text-foreground leading-none font-serif tracking-tighter">{formatCurrency(inv.amount)}</h4>
             <div className="inline-flex w-fit items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                <PlusIcon className="w-3 h-3" />
                {formatCurrency(inv.amount * 0.01)}/day
             </div>
          </div>
       </div>

       {/* Mid Row: Profit So Far */}
       <div className="mb-5 sm:mb-6 p-4 rounded-xl bg-muted/30 border border-border block w-full sm:inline-block sm:w-auto sm:min-w-[50%]">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Accumulated Profit</p>
          <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-500 font-serif leading-none tracking-tighter">+{formatCurrency(inv.profitEarned)}</h4>
       </div>

       {/* Bottom Row / Actions */}
       {isCompleted ? (
         <div className="flex flex-col sm:flex-row gap-3 mt-6 border-t border-border pt-6">
            <button onClick={() => handleCompletionAction(inv.id, "REINVEST")} disabled={!!actionLoader} className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 shadow-indigo-500/25">
               {actionLoader === inv.id ? "Working..." : "Reinvest"}
            </button>
            <button onClick={() => handleCompletionAction(inv.id, "WITHDRAW_TO_WALLET")} disabled={!!actionLoader} className="flex-1 px-6 py-4 bg-background border border-border text-foreground hover:bg-muted text-[11px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-sm">
               Collect (Withdraw)
            </button>
         </div>
       ) : (
         <div className="mt-4">
            <div className="flex justify-between items-end mb-2">
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">30-Day Timeline</span>
               <span className="text-[11px] font-black text-foreground font-serif">{Math.floor(progress)}%</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden p-[2px] border border-border shadow-inner">
               <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-sm" />
            </div>
            <div className="flex justify-between mt-3 text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
               <span>Start: <span className="text-foreground">{format(startDate, 'MMM dd')}</span></span>
               <span>Unlock: <span className="text-indigo-600 dark:text-indigo-400">{format(expiryDate, 'MMM dd')}</span></span>
            </div>
         </div>
       )}
    </div>
  )
}
