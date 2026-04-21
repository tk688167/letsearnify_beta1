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
  CheckCircleIcon,
  UserGroupIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  UsersIcon
} from "@heroicons/react/24/outline"
import { createDailyPool } from "@/app/actions/user/daily-pools"
import { useCurrency } from "@/app/components/providers/CurrencyProvider"

const fetcher = (url: string) => fetch(url).then(r => r.json())

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function DailyEarningPageContent() {
  const { data, mutate } = useSWR("/api/user/daily-earning", fetcher)
  const { data: referralData, mutate: mutateReferrals } = useSWR("/api/user/daily-earning/referrals", fetcher)
  const { formatCurrency, userCurrency, convertFromUSD, convertToUSD } = useCurrency();
  
  const [activeTab, setActiveTab] = useState<"dashboard" | "referrals">("dashboard")
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false)
  const [investAmount, setInvestAmount] = useState("")
  const [investLoader, setInvestLoader] = useState(false)
  const [investError, setInvestError] = useState("")
  const [investSuccess, setInvestSuccess] = useState("")

  // Auto-clear states on modal close/open to prevent stale UI
  useEffect(() => {
    if (!isInvestModalOpen) {
      setInvestError("")
      setInvestSuccess("")
      setInvestAmount("")
    }
  }, [isInvestModalOpen])



  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferAmount, setTransferAmount] = useState("")
  const [transferLoader, setTransferLoader] = useState(false)
  const [transferError, setTransferError] = useState("")

  const walletBalance = data?.walletBalance || 0
  const dailyEarningWallet = data?.dailyEarningWallet || 0
  const activeInvestments: any[] = data?.activeInvestments || []

  // Reactive error clearing: if wallet balance updates and is now sufficient, remove the error
  useEffect(() => {
    if (investError === "INSUFFICIENT" && investAmount) {
      const amountInUSD = convertToUSD(parseFloat(investAmount));
      if (!isNaN(amountInUSD) && amountInUSD <= dailyEarningWallet + 0.001) {
        setInvestError("");
      }
    }
  }, [dailyEarningWallet, investAmount, investError, convertToUSD]);

  // Referral Stats
  const totalReferralEarnings = referralData?.totalReferralEarnings || 0
  const referralList = referralData?.referrals || []

  // Derive Stats
  const now = new Date()
  const activeLocks = activeInvestments.filter((inv: any) => inv.status === "ACTIVE" && new Date(inv.expiresAt) > now)
  const expiredLocks = activeInvestments.filter((inv: any) => inv.status === "ACTIVE" && new Date(inv.expiresAt) <= now)
  const completedLocks = activeInvestments.filter((inv: any) => inv.status === "COMPLETED")
  const totalPrincipalLocked = activeInvestments.filter((inv: any) => inv.status === "ACTIVE").reduce((sum: any, inv: any) => sum + inv.amount, 0)
  const totalAccumulatedProfit = activeInvestments.filter((inv: any) => inv.status === "ACTIVE").reduce((sum: any, inv: any) => sum + inv.profitEarned, 0)
  
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
    const amountInUserCurrency = parseFloat(transferAmount)
    
    if (isNaN(amountInUserCurrency) || amountInUserCurrency <= 0) return setTransferError("Enter a valid amount.")
    
    const amountInUSD = convertToUSD(amountInUserCurrency)
    if (amountInUSD > walletBalance + 0.001) return setTransferError("Insufficient Main Wallet Balance.")

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
      if (investError === "INSUFFICIENT") setInvestError("")
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

    const amountInUSD = convertToUSD(amountInUserCurrency)

    if (isNaN(amountInUSD) || amountInUSD < 0.999) { // 0.999 to cover tiny float errors instead of strict 1
      setInvestError(`Minimum amount is ${formatCurrency(1)}`)
      return
    }
    
    if (amountInUSD > dailyEarningWallet + 0.001) { // 0.001 epsilon for float errors
      setInvestError("INSUFFICIENT")
      return
    }

    setInvestLoader(true)
    try {
      const res = await fetch("/api/user/daily-earning/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInUSD })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Investment failed")

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
      
      <section className="mb-5 md:mb-10 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-[2rem] md:rounded-[3rem] blur-3xl pointer-events-none" />
        
        <div className="relative bg-card/40 backdrop-blur-2xl border border-border/50 rounded-3xl md:rounded-[3rem] p-4 sm:p-8 lg:p-12 shadow-2xl flex flex-col xl:flex-row items-center xl:items-start justify-between gap-5 sm:gap-8 xl:gap-10">
          
          <div className="text-center xl:text-left flex-1 w-full">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] rounded-full mb-4 md:mb-6 shadow-sm">
               <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> Capital Yield Protocol
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-serif tracking-tighter mb-4 md:mb-5 lg:-ml-1">
               Daily Earning <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-500 inline-block">Pool</span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg font-medium text-muted-foreground/80 max-w-xl leading-relaxed mx-auto xl:mx-0 mb-6 md:mb-8 px-1 sm:px-0">
               Secure your financial growth with exactly 1% guaranteed daily returns. Your capital is protected via our institutional-grade 30-day liquidity lock.
            </p>
          </div>
          
          <div className="shrink-0 grid grid-cols-2 lg:flex lg:flex-row gap-3 sm:gap-4 w-full xl:w-auto">
             <div className="bg-card/60 backdrop-blur-xl border border-border/50 p-5 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] flex-1 sm:min-w-[180px] text-center shadow-lg shadow-black/5 flex flex-col justify-center transition-all hover:border-indigo-500/30">
               <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3 sm:mb-4 shrink-0">
                 <BanknotesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
               </div>
               <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1.5 whitespace-nowrap">Total Invested</p>
               <p className="font-serif font-black text-foreground text-xl sm:text-2xl lg:text-3xl truncate leading-none">{formatCurrency(totalPrincipalLocked)}</p>
             </div>
             
             <div className="bg-card/60 backdrop-blur-xl border border-border/50 p-5 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] flex-1 sm:min-w-[180px] text-center shadow-lg shadow-black/5 flex flex-col justify-center transition-all hover:border-emerald-500/30">
               <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 sm:mb-4 shrink-0">
                 <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
               </div>
               <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1.5 whitespace-nowrap">Total Earnings</p>
               <p className="font-serif font-black text-emerald-600 dark:text-emerald-400 text-xl sm:text-2xl lg:text-3xl truncate leading-none">+{formatCurrency(totalAccumulatedProfit)}</p>
             </div>
          </div>
          
        </div>
      </section>

      <div className="flex items-center gap-2 mb-8 bg-muted/30 p-1.5 rounded-2xl border border-border/40 w-fit mx-auto lg:mx-0">
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeTab === "dashboard" ? "bg-card text-foreground shadow-lg shadow-black/5" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BoltIcon className="w-4 h-4" />
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab("referrals")}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeTab === "referrals" ? "bg-card text-foreground shadow-lg shadow-black/5" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <UserGroupIcon className="w-4 h-4" />
          Partner Network
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "dashboard" ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* 2. ACTION SECTION */}
            <section className="bg-card border-2 border-border/60 rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-10 lg:p-12 mb-8 md:mb-16 shadow-2xl shadow-indigo-500/5 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 z-10 w-full group">
               {/* Decorative Overlay */}
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-150 rotate-12 pointer-events-none group-hover:scale-[1.6] transition-transform duration-1000">
                  <WalletIcon className="w-[400px] h-[400px] text-foreground" />
               </div>

               <div className="relative z-10 w-full lg:w-auto text-center lg:text-left text-foreground">
                  <p className="text-[11px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.25em] mb-3 md:mb-4">Available Allocation</p>
                  <div className="flex items-baseline justify-center lg:justify-start gap-2 mb-4">
                     <h2 className="text-5xl sm:text-7xl md:text-8xl font-black font-serif tracking-tighter drop-shadow-sm leading-none">
                        {formatCurrency(dailyEarningWallet)}
                     </h2>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-muted-foreground/80 bg-muted/50 rounded-2xl px-5 py-2.5 inline-block shadow-inner backdrop-blur-sm">Ready to initialize new yield contracts.</p>
               </div>

               <div className="relative z-10 flex flex-col sm:flex-row w-full lg:w-auto gap-4 sm:gap-5">
                  <button 
                    onClick={() => setIsTransferModalOpen(true)}
                    className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-10 py-6 bg-background border-2 border-border/60 hover:border-indigo-500/30 hover:bg-muted text-foreground font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-sm active:scale-95 overflow-hidden"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                    Deposit Funds
                  </button>
                  <button 
                    onClick={() => setIsInvestModalOpen(true)}
                    className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-12 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 transition-all active:scale-95 overflow-hidden"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Start New Pool
                  </button>
               </div>
            </section>

            {/* 3. POOL CARDS SECTION */}
            <section className="mb-20">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/5">
                     <BoltIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground font-serif tracking-tight">Active Yield Contracts</h2>
                    <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Institutional Proof of Stake</p>
                  </div>
                  <div className="ml-auto">
                    <button 
                      onClick={() => setIsHistoryModalOpen(true)} 
                      className="group flex flex-col sm:flex-row items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-indigo-500/20 rounded-2xl transition-all shadow-sm active:scale-95"
                    >
                      <ClockIcon className="w-5 h-5 text-indigo-500 group-hover:rotate-12 transition-transform duration-500" />
                      <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-foreground">Pool History</span>
                      </div>
                    </button>
                  </div>
               </div>

               {/* Expired Pools (Completed Status) */}
               {expiredLocks.length > 0 && (
                  <div className="space-y-8 mb-12">
                     {expiredLocks.map((inv: any) => (
                       <PoolCard key={inv.id} inv={inv} isCompleted={true} actionLoader={actionLoader} handleCompletionAction={handleCompletionAction} isUnattached={data?.isUnattached} />
                     ))}
                     {actionError && <p className="text-xs text-rose-500 font-black text-center mt-4 bg-rose-500/5 py-4 rounded-2xl border border-rose-500/10 px-6 uppercase tracking-widest">{actionError}</p>}
                  </div>
               )}

               {/* Active Pools Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {activeLocks.length === 0 ? (
                    <div className="col-span-1 md:col-span-2 py-32 text-center border-2 border-dashed border-border rounded-[3rem] bg-muted/10 relative overflow-hidden group">
                       <div className="w-20 h-20 bg-card rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-border group-hover:scale-110 transition-transform duration-500">
                          <ClockIcon className="w-10 h-10 text-muted-foreground/40" />
                       </div>
                       <p className="text-foreground font-black text-xl tracking-tight">No active yield cycles detected</p>
                       <p className="text-sm font-bold text-muted-foreground mt-2 max-w-xs mx-auto opacity-70">Initialize a new pool contract to begin generating institutional-grade returns.</p>
                       <div className="absolute inset-0 bg-indigo-500/[0.02] pointer-events-none" />
                    </div>
                  ) : (
                    activeLocks.map((inv: any) => <PoolCard key={inv.id} inv={inv} isCompleted={false} isUnattached={data?.isUnattached} />)
                  )}
               </div>
            </section>
          </motion.div>
        ) : (
          <motion.div 
            key="referrals"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Referral Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-card border-2 border-border/60 p-8 rounded-[2rem] shadow-xl shadow-black/5 relative overflow-hidden group transition-all hover:border-indigo-500/30">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                     <CurrencyDollarIcon className="w-32 h-32 text-emerald-500" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4" /> Referral Yield Generated
                  </p>
                  <h3 className="text-4xl sm:text-5xl font-black text-foreground font-serif tracking-tighter tabular-nums drop-shadow-sm">
                    {formatCurrency(totalReferralEarnings)}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground/60 mt-3 uppercase tracking-wider">Lifetime commission network</p>
               </div>

               <div className="bg-card border-2 border-border/60 p-8 rounded-[2rem] shadow-xl shadow-black/5 relative overflow-hidden group transition-all hover:border-indigo-500/30">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none -rotate-12 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700">
                     <UsersIcon className="w-32 h-32 text-indigo-500" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <UserGroupIcon className="w-4 h-4" /> Active Partner Network
                  </p>
                  <h3 className="text-4xl sm:text-5xl font-black text-foreground font-serif tracking-tighter tabular-nums drop-shadow-sm">
                    {referralList.filter((r: any) => r.totalInvested > 0).length}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground/60 mt-3 uppercase tracking-wider">Verified yielding members</p>
               </div>
            </div>

            {/* Referred Members Section */}
            <div className="bg-card border-2 border-border/60 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-black/5 overflow-hidden transition-all hover:border-border">
               <div className="p-8 sm:p-12 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-black text-foreground font-serif tracking-tight">Direct Partners Hierarchy</h2>
                    <p className="text-sm font-bold text-muted-foreground/70 mt-2 max-w-md">Comprehensive visualization of your direct downline, active capital allocations, and generated yields.</p>
                  </div>
                  <button onClick={() => mutateReferrals()} className="w-fit p-4 rounded-2xl bg-background border-2 border-border/60 hover:border-indigo-500/40 hover:bg-muted transition-all active:scale-90 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm group">
                    <ArrowPathIcon className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
                  </button>
               </div>

               {/* Mobile View: Card Based */}
               <div className="block lg:hidden divide-y-2 divide-border/40 bg-muted/5">
                  {referralList.length === 0 ? (
                    <div className="px-8 py-24 text-center">
                       <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-border/60 shadow-xl">
                         <UserGroupIcon className="w-10 h-10 text-muted-foreground/20" />
                       </div>
                       <p className="text-foreground font-black text-lg tracking-tight">Network is currently empty</p>
                       <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-widest opacity-60">Share your referral link to begin</p>
                    </div>
                  ) : (
                    referralList.map((ref: any) => (
                      <div key={ref.id} className="p-8 space-y-6 group hover:bg-indigo-500/[0.02] transition-colors relative">
                         <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-indigo-600/20">
                               {ref.name ? ref.name[0].toUpperCase() : "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="font-black text-foreground text-lg truncate tracking-tight">{ref.name || "Anonymous Member"}</p>
                               <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] truncate opacity-70 mt-0.5">{ref.email}</p>
                            </div>
                            {ref.totalInvested > 0 ? (
                              <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Active</span>
                              </div>
                            ) : null}
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-[1.5rem] bg-background border border-border/60 shadow-sm">
                               <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-2">Deployed Capital</p>
                               <p className="font-black text-foreground font-serif text-xl leading-none tracking-tighter tabular-nums">{formatCurrency(ref.totalInvested)}</p>
                            </div>
                            <div className="p-5 rounded-[1.5rem] bg-emerald-500/5 border border-emerald-500/10 shadow-sm transition-all group-hover:bg-emerald-500/10">
                               <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-2">Your Yield Share</p>
                               <p className="font-black text-emerald-600 dark:text-emerald-500 font-serif text-xl leading-none tracking-tighter tabular-nums">+{formatCurrency(ref.earningsGenerated)}</p>
                            </div>
                         </div>
                      </div>
                    ))
                  )}
               </div>

               {/* Desktop View: Table */}
               <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-muted/40 text-[11px] font-black text-muted-foreground/50 uppercase tracking-[0.25em] border-b border-border/60">
                           <th className="px-12 py-7">Partner Identity</th>
                           <th className="px-12 py-7">Capital Allocation</th>
                           <th className="px-12 py-7">Aggregated Share (20%)</th>
                           <th className="px-12 py-7 text-right">Protocol Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y-2 divide-border/30">
                        {referralList.length === 0 ? (
                           <tr>
                              <td colSpan={4} className="px-12 py-32 text-center text-muted-foreground font-black text-lg tracking-tight uppercase opacity-20">
                                 Empty Hierarchy
                              </td>
                           </tr>
                        ) : (
                           referralList.map((ref: any) => (
                              <tr key={ref.id} className="group hover:bg-indigo-500/[0.03] transition-all duration-300">
                                 <td className="px-12 py-8">
                                   <div className="flex items-center gap-5">
                                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 p-[2px] shadow-lg group-hover:scale-105 transition-transform duration-500">
                                         <div className="w-full h-full bg-card rounded-[14px] flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-base">
                                            {ref.name ? ref.name[0].toUpperCase() : "?"}
                                         </div>
                                      </div>
                                      <div>
                                         <p className="font-black text-foreground text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">{ref.name || "Anonymous Member"}</p>
                                         <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-black tracking-[0.1em] uppercase opacity-50 mt-1">
                                           {ref.email}
                                         </div>
                                      </div>
                                   </div>
                                 </td>
                                 <td className="px-12 py-8">
                                   <p className="font-black text-foreground font-serif text-xl leading-none tracking-tighter tabular-nums drop-shadow-sm">
                                     {formatCurrency(ref.totalInvested)}
                                   </p>
                                 </td>
                                 <td className="px-12 py-8">
                                   <p className="font-black text-emerald-600 dark:text-emerald-500 font-serif text-xl leading-none tracking-tighter tabular-nums drop-shadow-sm">
                                     +{formatCurrency(ref.earningsGenerated)}
                                   </p>
                                 </td>
                                 <td className="px-12 py-8 text-right">
                                   {ref.totalInvested > 0 ? (
                                     <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-600 dark:text-emerald-500 text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl shadow-xl shadow-emerald-500/5">
                                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active Yielding
                                     </div>
                                   ) : (
                                     <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-muted/50 border-2 border-border/60 text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl">
                                       Standby Protocol
                                     </div>
                                   )}
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. PREMIUM DEPOSIT MODAL */}
      <AnimatePresence>
         {isTransferModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => !transferLoader && setIsTransferModalOpen(false)} />
               <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }} className="bg-card border-2 border-border/60 w-full max-w-md rounded-[2.5rem] p-10 sm:p-12 relative z-10 shadow-[0_30px_100px_rgba(0,0,0,0.3)]">
                  <button onClick={() => !transferLoader && setIsTransferModalOpen(false)} className="absolute top-8 right-8 p-2.5 text-muted-foreground hover:text-foreground transition-all bg-muted hover:bg-muted/80 rounded-2xl active:scale-90 border border-border/50">
                     <XMarkIcon className="w-5 h-5" />
                  </button>

                  <h3 className="text-3xl font-black text-foreground tracking-tight mb-3 font-serif">Deposit to Pool</h3>
                  <p className="text-muted-foreground text-sm font-medium mb-8 leading-relaxed">Securely transfer liquid capital from your Main Wallet to the Daily Earning Protocol.</p>

                  <div className="flex justify-between items-center mb-8 pb-5 border-b border-border/60">
                     <span className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Source: Main Wallet</span>
                     <span className="text-2xl font-black text-foreground font-serif tracking-tighter">{formatCurrency(walletBalance)}</span>
                  </div>

                  <form onSubmit={handleTransfer}>
                     <div className="mb-8 relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                          <span className="text-indigo-500/40 font-black font-mono text-sm uppercase group-focus-within:text-indigo-500 transition-colors">{userCurrency}</span>
                        </div>
                        <input type="number" step="0.01" value={transferAmount} onChange={(e: any) => setTransferAmount(e.target.value)} placeholder="0.00" className="w-full bg-muted/30 border-2 border-border/60 rounded-3xl py-6 pl-16 pr-6 text-foreground font-serif text-3xl focus:outline-none focus:border-indigo-500 shadow-inner transition-all placeholder:opacity-20" required />
                     </div>

                     {transferError && <p className="text-rose-500 text-[11px] font-black mb-8 uppercase tracking-[0.1em] text-center bg-rose-500/5 py-3 rounded-xl border border-rose-500/10 px-4">{transferError}</p>}

                     <button type="submit" disabled={transferLoader || !transferAmount} className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black tracking-[0.25em] uppercase text-xs rounded-[1.5rem] transition-all shadow-2xl shadow-indigo-500/30 disabled:opacity-50 active:scale-95">
                        {transferLoader ? "Synchronizing Asset..." : "Confirm Deposit"}
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
               <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => !investLoader && setIsInvestModalOpen(false)} />
               <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-card border-2 border-border/60 w-full max-w-md rounded-[3rem] p-10 sm:p-14 relative z-10 shadow-[0_40px_120px_rgba(0,0,0,0.4)]">
                  <button onClick={() => !investLoader && setIsInvestModalOpen(false)} className="absolute top-10 right-10 p-2.5 text-muted-foreground hover:text-foreground transition-all bg-muted hover:bg-muted/80 rounded-2xl border border-border/50">
                     <XMarkIcon className="w-5 h-5" />
                  </button>

                  <h3 className="text-3xl font-black text-foreground tracking-tight mb-3 font-serif">Initiate Pool</h3>
                  <p className="text-muted-foreground text-sm font-medium mb-8 leading-relaxed">Allocate capital to earn an aggregated 1% daily yield. Your assets will be locked for exactly 30 days.</p>

                  <div className="flex justify-between items-center mb-8 pb-5 border-b border-border/60">
                     <span className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Ready Allocation</span>
                     <span className="text-2xl font-black text-foreground font-serif tracking-tighter">{formatCurrency(dailyEarningWallet)}</span>
                  </div>

                  <form onSubmit={handleInvest}>
                     <div className="mb-8 relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                          <span className="text-indigo-500/40 font-black font-mono text-sm uppercase group-focus-within:text-indigo-500 transition-colors">{userCurrency}</span>
                        </div>
                        <input type="number" step="0.01" value={investAmount} onChange={(e: any) => setInvestAmount(e.target.value)} placeholder="0.00" className="w-full bg-muted/30 border-2 border-border/60 rounded-3xl py-6 pl-16 pr-6 text-foreground font-serif text-3xl focus:outline-none focus:border-indigo-500 shadow-inner transition-all placeholder:opacity-20" required />
                     </div>

                     {/* ERROR STATE: Insufficient Assets */}
                     {investError === "INSUFFICIENT" ? (
                       <div className="mb-10 p-6 bg-rose-500/5 border-2 border-rose-500/20 rounded-[2rem]">
                          <p className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.1em] mb-5 leading-relaxed text-center">
                             Allocation Failure: Insufficient capital detected in Daily Wallet.
                          </p>
                          <button 
                            type="button"
                            onClick={() => { setIsInvestModalOpen(false); setIsTransferModalOpen(true); }}
                            className="flex items-center justify-center gap-3 w-full py-5 bg-rose-500 text-white shadow-2xl shadow-rose-500/30 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:bg-rose-600 hover:-translate-y-0.5 active:translate-y-0"
                          >
                             Allocate Funds <ArrowRightIcon className="w-5 h-5" />
                          </button>
                       </div>
                     ) : investError && (
                       <p className="text-rose-500 text-[11px] font-black mb-8 uppercase tracking-[0.1em] text-center bg-rose-500/5 py-4 rounded-2xl border border-rose-500/10">{investError}</p>
                     )}

                     {investSuccess && <p className="text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold mb-8 uppercase tracking-[0.2em] font-mono text-center bg-emerald-500/5 py-4 rounded-2xl border border-emerald-500/10">✓ {investSuccess}</p>}
                     
                     {/* Preview Box */}
                     {investAmount && !isNaN(parseFloat(investAmount)) && parseFloat(investAmount) >= convertFromUSD(1) && !investError && (
                        <div className="mb-10 grid grid-cols-2 gap-5 p-6 rounded-[2rem] bg-indigo-500/5 border-2 border-border/40 shadow-inner backdrop-blur-sm">
                           <div className="text-center border-r-2 border-border/40">
                              <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Daily Profit</p>
                              <p className="text-xl font-black text-foreground font-serif tracking-tighter tabular-nums drop-shadow-sm">+{formatCurrency(convertToUSD(parseFloat(investAmount)) * 0.01)}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-2">30-Day Return</p>
                              <p className="text-xl font-black text-foreground font-serif tracking-tighter tabular-nums drop-shadow-sm">+{formatCurrency(convertToUSD(parseFloat(investAmount)) * 0.30)}</p>
                           </div>
                        </div>
                     )}

                     <div className="mb-10 p-6 rounded-[2rem] bg-orange-500/5 border-2 border-orange-500/20 text-orange-700 dark:text-orange-400 text-xs font-bold leading-relaxed flex gap-4 shadow-sm items-center">
                        <LockClosedIcon className="w-6 h-6 shrink-0 opacity-80" />
                        <span>Capital protocol: Assets are strictly locked for 30 cycles. No early termination permitted.</span>
                     </div>

                     <button type="submit" disabled={investLoader || investError === "INSUFFICIENT"} className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black tracking-[0.25em] uppercase text-xs rounded-[1.5rem] transition-all shadow-2xl shadow-indigo-500/40 disabled:opacity-50 active:scale-95">
                        {investLoader ? "Enabling Protocol..." : "Start Yield Cycle"}
                     </button>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* 6. HISTORY MODAL (Strictly Read-Only COMPLETED Pools) */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsHistoryModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border/50 rounded-[2rem] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-6 sm:p-8 flex items-center justify-between border-b border-border/50 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <ClockIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black font-serif tracking-tight">Pool History</h3>
                    <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-500 mt-1">Finalized & Settled Contracts</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-muted/50 hover:bg-muted font-bold text-muted-foreground flex items-center justify-center transition-all"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 sm:p-8 flex-1 overflow-y-auto space-y-6 sm:space-y-8 bg-muted/10 custom-scrollbar">
                {completedLocks.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center">
                    <DocumentTextIcon className="w-16 h-16 text-muted-foreground/30 mb-4" />
                    <p className="text-xl font-black text-foreground">No settled history found.</p>
                    <p className="text-sm font-medium text-muted-foreground mt-2 max-w-xs">Once an active pool completes its 30-day cycle, its final unchangeable record will appear here.</p>
                  </div>
                ) : (
                  completedLocks.map((inv: any) => (
                    <PoolCard key={inv.id} inv={inv} isCompleted={true} isUnattached={data?.isUnattached} />
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

function PoolCard({ inv, isCompleted, handleCompletionAction, actionLoader, isUnattached }: any) {
  const { formatCurrency } = useCurrency();
  const [poolTimer, setPoolTimer] = useState<string | null>(null);

  const now = new Date()
  const startDate = new Date(inv.createdAt)
  const expiryDate = new Date(inv.expiresAt)
  const totalDays = 30
  const elapsedMs = now.getTime() - startDate.getTime()
  const elapsedDays = Math.max(0, Math.min(totalDays, elapsedMs / (1000 * 60 * 60 * 24)))
  const progress = (elapsedDays / totalDays) * 100

  // Calculate next distribution (every 24h since creation)
  useEffect(() => {
    if (isCompleted) return;

    const updateTimer = () => {
      const timeSinceStart = new Date().getTime() - startDate.getTime();
      const currentCycleMs = timeSinceStart % (24 * 60 * 60 * 1000);
      const remainingMs = (24 * 60 * 60 * 1000) - currentCycleMs;

      const h = Math.floor(remainingMs / (1000 * 60 * 60));
      const m = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((remainingMs % (1000 * 60)) / 1000);
      setPoolTimer(`${h}h ${m}m ${s}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startDate, isCompleted]);

  return (
    <div className={cn(
      "bg-card group relative p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 overflow-hidden",
      isCompleted 
        ? "border-emerald-500/30 shadow-[0_20px_50px_rgba(16,185,129,0.05)] bg-emerald-500/[0.01]" 
        : "border-border shadow-2xl shadow-black/5 hover:border-indigo-500/30 hover:shadow-indigo-500/5 hover:-translate-y-1"
    )}>
      <div className="relative z-10 flex flex-col h-full">
        {/* Header: Identity & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
           <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500",
                isCompleted ? "bg-emerald-500/10 text-emerald-500" : "bg-indigo-500/10 text-indigo-500"
              )}>
                 <BoltIcon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-0.5">Pool Reference</p>
                 <p className="font-mono font-black text-lg text-foreground truncate max-w-[150px] sm:max-w-none">#{inv.id.slice(-6).toUpperCase()}</p>
              </div>
           </div>
           
           <div className={cn(
              "px-4 py-2 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest self-start sm:self-center shadow-sm",
              isCompleted 
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
           )}>
              <div className={cn("w-1.5 h-1.5 rounded-full", isCompleted ? "bg-emerald-500" : "bg-indigo-500 animate-pulse")} />
              {isCompleted ? "Mature & Liquid" : "Generating Proof"}
           </div>
        </div>

        {/* Financial High-Density 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
           <div className="p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border/50 group-hover:bg-muted/50 transition-colors flex flex-col justify-center">
              <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-2 truncate">
                 Principal
              </p>
              <p className="font-serif font-black text-lg sm:text-2xl md:text-3xl text-foreground tracking-tighter tabular-nums leading-none truncate">
                 {formatCurrency(inv.amount)}
              </p>
           </div>
           
           <div className="p-4 sm:p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 group-hover:bg-indigo-500/10 transition-colors flex flex-col justify-center">
              <p className="text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 truncate">
                 Investor (80%)
              </p>
              <p className="font-serif font-black text-lg sm:text-2xl md:text-3xl text-indigo-600 dark:text-indigo-400 tracking-tighter tabular-nums leading-none truncate">
                 +{formatCurrency((inv.amount * 0.01) * 0.8)}
              </p>
           </div>

           <div className={cn(
             "p-4 sm:p-5 rounded-2xl border transition-colors flex flex-col justify-center",
             isUnattached 
                ? "bg-rose-500/5 border-rose-500/10 group-hover:bg-rose-500/10" 
                : "bg-purple-500/5 border-purple-500/10 group-hover:bg-purple-500/10"
           )}>
              <p className={cn(
                "text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 leading-tight truncate",
                isUnattached ? "text-rose-600 dark:text-rose-400" : "text-purple-600 dark:text-purple-400"
              )}>
                 {isUnattached ? "20% Donation" : "Referrer (20%)"}
              </p>
              <p className={cn(
                "font-serif font-black text-lg sm:text-2xl md:text-3xl tracking-tighter tabular-nums leading-none truncate",
                isUnattached ? "text-rose-600 dark:text-rose-400" : "text-purple-600 dark:text-purple-400"
              )}>
                 +{formatCurrency((inv.amount * 0.01) * 0.2)}
              </p>
           </div>
           
           <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 group-hover:bg-emerald-500/10 transition-colors flex flex-col justify-center">
              <p className="text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-2 truncate">
                 30-Day Return
              </p>
              <p className="font-serif font-black text-lg sm:text-2xl md:text-3xl text-emerald-600 dark:text-emerald-500 tracking-tighter tabular-nums leading-none truncate">
                 +{formatCurrency(inv.amount * 0.30)}
              </p>
           </div>
        </div>

        {/* Current Accumulated Profit */}
        <div className="mb-8 p-5 sm:p-6 rounded-[1.5rem] bg-indigo-500/5 border border-indigo-500/20 group-hover:bg-indigo-500/10 transition-colors flex flex-col sm:flex-row items-center sm:justify-between gap-4">
           <div className="text-center sm:text-left w-full sm:w-auto">
              <p className="text-[10px] sm:text-xs font-black text-indigo-500 uppercase tracking-widest mb-1 flex items-center justify-center sm:justify-start gap-1">
                 <svg className="w-4 h-4 animate-pulse fill-indigo-500" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                 Your Accumulated Profit
              </p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Live 80% share credited to wallet</p>
           </div>
           <div className="text-center sm:text-right w-full sm:w-auto">
              <p className="font-serif font-black text-3xl sm:text-4xl text-indigo-600 dark:text-indigo-400 tracking-tighter tabular-nums leading-none">
                 +{formatCurrency(inv.profitEarned * 0.8)}
              </p>
           </div>
        </div>

        {/* Institutional Lifecycle Bar */}
        <div className="mb-8 p-6 rounded-[1.5rem] bg-muted/20 border border-border/40 relative overflow-hidden group/progress">
           <div className="flex items-center justify-between gap-4 mb-4 text-[10px] font-black uppercase tracking-[0.15em]">
              <span className="text-muted-foreground/60">{format(startDate, "MMM dd, yyyy")}</span>
              <span className={cn("px-2 py-0.5 rounded-lg border", isCompleted ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" : "bg-indigo-500/5 border-indigo-500/20 text-indigo-500")}>
                 {Math.round(progress)}% Progress
              </span>
              <span className="text-muted-foreground/60 text-right">{format(expiryDate, "MMM dd, yyyy")}</span>
           </div>
           
           <div className="h-4 bg-muted border border-border/60 rounded-full overflow-hidden shadow-inner p-1">
              <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: `${progress}%` }} 
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 className={cn(
                   "h-full rounded-full shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all",
                   isCompleted ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-indigo-500 to-purple-500"
                 )}
              />
           </div>
        </div>

        {/* Control & Reward Center */}
        <div className="mt-auto pt-6 border-t border-border/60">
           {isCompleted ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <button 
                   onClick={() => handleCompletionAction(inv.id, "REINVEST")}
                   disabled={actionLoader === inv.id}
                   className="relative group py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-[0.15em] text-[10px] rounded-2xl hover:shadow-[0_15px_30px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-2 overflow-hidden active:scale-95"
                 >
                    {actionLoader === inv.id ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ArrowPathIcon className="w-4 h-4" />}
                    Rollover Deposit
                 </button>
                 <button 
                   onClick={() => handleCompletionAction(inv.id, "WITHDRAW_TO_WALLET")}
                   disabled={actionLoader === inv.id}
                   className="group py-4 px-6 bg-background border-2 border-border/60 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-foreground font-black uppercase tracking-[0.15em] text-[10px] rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
                 >
                    {actionLoader === inv.id ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <WalletIcon className="w-4 h-4 group-hover:text-emerald-500" />}
                    Claim to Wallet
                 </button>
              </div>
           ) : (
              <div className="flex items-center justify-between bg-muted/40 p-5 rounded-2xl border border-border/60">
                 <div className="flex items-center gap-3">
                    <ClockIcon className="w-5 h-5 text-indigo-500" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Profit Cycle</span>
                 </div>
                 <span className="font-serif font-black text-base text-foreground tabular-nums tracking-tighter bg-card px-4 py-2 rounded-xl shadow-lg border border-border">
                    {poolTimer || "Evaluating..."}
                 </span>
              </div>
           )}
        </div>
      </div>
    </div>
  )
}
