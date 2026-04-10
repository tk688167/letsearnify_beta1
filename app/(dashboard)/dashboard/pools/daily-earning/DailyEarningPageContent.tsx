"use client"

import { useState, useEffect } from "react"
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
  const { formatCurrency, userCurrency, convertFromUSD, convertToUSD } = useCurrency();
  
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
    setTransferError("")
    const amountInUserCurrency = parseFloat(transferAmount)
    
    if (isNaN(amountInUserCurrency) || amountInUserCurrency <= 0) return setTransferError("Enter a valid amount.")
    
    // Convert current wallet balance to user currency for comparison
    const walletBalanceInUserCurrency = convertFromUSD(walletBalance)
    if (amountInUserCurrency > walletBalanceInUserCurrency) return setTransferError("Insufficient Main Wallet Balance.")

    // Convert input to USD for backend processing
    const amountInUSD = convertToUSD(amountInUserCurrency)

    setTransferLoader(true)
    try {
      const res = await fetch("/api/user/daily-earning/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInUSD, direction: "MAIN_TO_DAILY" })
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
    const amountInUserCurrency = parseFloat(investAmount)

    // Validation: We check against the equivalent of $1 USD
    const minAmountInUserCurrency = convertFromUSD(1)
    if (isNaN(amountInUserCurrency) || amountInUserCurrency < minAmountInUserCurrency) {
      setInvestError(`Minimum amount is ${formatCurrency(1)}`)
      return
    }
    
    // Check against current daily wallet balance in user currency
    const dailyWalletInUserCurrency = convertFromUSD(dailyEarningWallet)
    if (amountInUserCurrency > dailyWalletInUserCurrency) {
      setInvestError("INSUFFICIENT")
      return
    }

    // Convert input to USD for backend processing
    const amountInUSD = convertToUSD(amountInUserCurrency)

    setInvestLoader(true)
    try {
      const result = await createDailyPool(amountInUSD)
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
      
      {/* 1. SPECTACULAR GLASSMORPHISM HEADER SECTION */}
      <section className="mb-5 md:mb-10 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-[2rem] md:rounded-[3rem] blur-3xl pointer-events-none" />
        
        <div className="relative bg-card/40 backdrop-blur-2xl border border-border/50 rounded-3xl md:rounded-[3rem] p-4 sm:p-8 lg:p-12 shadow-2xl flex flex-col xl:flex-row items-center xl:items-start justify-between gap-5 sm:gap-8 xl:gap-10">
          
          <div className="text-center xl:text-left flex-1 w-full">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-3 md:mb-6">
               <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" /> Capital Yield Protocol
            </div>
            
            <h1 className="text-[1.6rem] leading-none sm:text-5xl md:text-6xl lg:text-7xl font-black font-serif tracking-tighter mb-2 md:mb-5">
               Daily Earning <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-500 inline-block">Pool</span>
            </h1>
            
            <p className="text-xs sm:text-base font-medium text-muted-foreground max-w-xl leading-relaxed mx-auto xl:mx-0 mb-4 md:mb-8 px-1 sm:px-0">
               Deposit a minimum of {formatCurrency(1)} to automatically earn an aggregated 1% daily return. Your initial capital remains secured via our 30-day smart locking period.
            </p>
          </div>
          
          {/* STATS SUMMARY (Compact Premium) */}
          <div className="shrink-0 grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
             <div className="bg-background/80 backdrop-blur-xl border border-border/50 p-3 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2rem] flex-1 sm:min-w-[160px] text-center shadow-sm flex flex-col justify-center">
               <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2 sm:mb-4 shrink-0">
                 <BanknotesIcon className="w-4 h-4 sm:w-6 sm:h-6" />
               </div>
               <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 sm:mb-1.5 whitespace-nowrap">Total Invested</p>
               <p className="font-serif font-black text-foreground text-base sm:text-2xl lg:text-3xl truncate leading-none">{formatCurrency(totalPrincipalLocked)}</p>
             </div>
             
             <div className="bg-background/80 backdrop-blur-xl border border-border/50 p-3 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2rem] flex-1 sm:min-w-[160px] text-center shadow-sm flex flex-col justify-center">
               <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2 sm:mb-4 shrink-0">
                 <ChartBarIcon className="w-4 h-4 sm:w-6 sm:h-6" />
               </div>
               <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 sm:mb-1.5 whitespace-nowrap">Total Earnings</p>
               <p className="font-serif font-black text-emerald-600 dark:text-emerald-400 text-base sm:text-2xl lg:text-3xl truncate leading-none">+{formatCurrency(totalAccumulatedProfit)}</p>
             </div>
          </div>
          
        </div>
      </section>

      {/* 2. ACTION SECTION */}
      <section className="bg-card border border-border rounded-3xl md:rounded-[3rem] p-4 sm:p-8 lg:p-12 mb-6 md:mb-12 shadow-xl shadow-indigo-500/5 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8 z-10 w-full group">
         {/* Decorative Overlay */}
         <div className="absolute top-0 right-0 p-8 opacity-[0.02] scale-150 rotate-12 pointer-events-none group-hover:scale-[1.6] transition-transform duration-1000">
            <WalletIcon className="w-[400px] h-[400px] text-foreground" />
         </div>

         <div className="relative z-10 w-full lg:w-auto text-center lg:text-left text-foreground">
            <p className="text-[10px] sm:text-[11px] lg:text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-2 sm:mb-3">Available Pool Balance</p>
            <div className="flex items-baseline justify-center lg:justify-start gap-2 mb-3">
               <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-serif tracking-tighter drop-shadow-sm leading-none">
                  {formatCurrency(dailyEarningWallet)}
               </h2>
            </div>
            <p className="text-xs sm:text-sm font-bold text-muted-foreground bg-muted/50 rounded-xl px-4 py-2 inline-block shadow-inner">Ready to allocate to new pools.</p>
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
                          <span className="text-muted-foreground/50 font-black font-mono text-xs uppercase">{userCurrency}</span>
                        </div>
                        <input type="number" step="0.01" value={transferAmount} onChange={(e: any) => setTransferAmount(e.target.value)} placeholder="0.00" className="w-full bg-background border border-border rounded-2xl py-5 pl-14 pr-5 text-foreground font-serif text-2xl focus:outline-none focus:border-indigo-500 shadow-sm transition-all" required />
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
                          <span className="text-muted-foreground/50 font-black font-mono text-xs uppercase">{userCurrency}</span>
                        </div>
                        <input type="number" step="0.01" value={investAmount} onChange={(e: any) => setInvestAmount(e.target.value)} placeholder="0.00" className="w-full bg-background border border-border rounded-2xl py-5 pl-14 pr-5 text-foreground font-serif text-2xl focus:outline-none focus:border-indigo-500 shadow-sm transition-all" required />
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
                     {investAmount && !isNaN(parseFloat(investAmount)) && parseFloat(investAmount) >= convertFromUSD(1) && !investError && (
                        <div className="mb-6 grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/40 border border-border shadow-inner">
                           <div className="text-center border-r border-border">
                              <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Daily Profit</p>
                              <p className="text-base font-black text-foreground font-serif">+{formatCurrency(convertToUSD(parseFloat(investAmount)) * 0.01)}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1">Total Expected Return</p>
                              <p className="text-base font-black text-foreground font-serif">+{formatCurrency(convertToUSD(parseFloat(investAmount)) * 0.30)}</p>
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
  const [poolTimer, setPoolTimer] = useState<string | null>(null);

  const now = new Date()
  const startDate = new Date(inv.createdAt)
  const expiryDate = new Date(inv.expiresAt)
  const totalDays = 30
  const elapsedMs = now.getTime() - startDate.getTime()
  const elapsedDays = Math.max(0, Math.min(totalDays, elapsedMs / (1000 * 60 * 60 * 24)))
  const progress = (elapsedDays / totalDays) * 100
  const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      const cycleMs = 24 * 60 * 60 * 1000;
      const runningElapsed = Date.now() - startDate.getTime();
      const remainingMs = cycleMs - (runningElapsed % cycleMs);
      const h = Math.floor(remainingMs / (1000 * 60 * 60));
      const m = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((remainingMs % (1000 * 60)) / 1000);
      setPoolTimer(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [inv.createdAt, isCompleted]);

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

       {/* Mid Row: Profit So Far & Timer */}
       <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row gap-4">
           <div className="p-4 rounded-xl bg-muted/30 border border-border flex-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Accumulated Profit</p>
              <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-500 font-serif leading-none tracking-tighter">+{formatCurrency(inv.profitEarned)}</h4>
           </div>
           
           {!isCompleted && (
             <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex-1 relative overflow-hidden group/timer hover:bg-indigo-500/10 transition-colors">
                <p className="text-[10px] font-black text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-widest mb-1.5 whitespace-nowrap">Next 1% Arrival In</p>
                <h4 className="text-xl sm:text-2xl font-black font-mono tracking-widest text-indigo-600 dark:text-indigo-400 tabular-nums leading-none">
                  {poolTimer || "00:00:00"}
                </h4>
                <ClockIcon className="absolute bottom-2 right-2 w-12 h-12 text-indigo-500/10 group-hover/timer:scale-110 transition-transform" />
             </div>
           )}
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
