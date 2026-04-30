"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import { format } from "date-fns"
import Link from "next/link"
import Image from "next/image"
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
  UsersIcon,
  HomeModernIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline"
import { createDailyPool } from "@/app/actions/user/daily-pools"
import { useCurrency } from "@/app/components/providers/CurrencyProvider"

const fetcher = async (url: string) => {
  const r = await fetch(url)
  const data = await r.json()
  if (!r.ok) {
    console.error(`[API Error] ${url}:`, data)
    throw new Error(data.error || `API error: ${r.status}`)
  }
  return data
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function InvestmentSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/slider/stock.png",
      title: "Stock Market Growth",
      description: "Earn daily returns similar to top-performing stocks.",
      color: "border-emerald-500/20 bg-emerald-500/5",
      titleColor: "text-emerald-700 dark:text-emerald-400"
    },
    {
      image: "/slider/real_estate.png",
      title: "Real Estate Stability",
      description: "Stable, consistent growth like prime real estate.",
      color: "border-blue-500/20 bg-blue-500/5",
      titleColor: "text-blue-700 dark:text-blue-400"
    },
    {
      image: "/slider/business.png",
      title: "Business Assets",
      description: "Hold a stake and share in continuous business profits.",
      color: "border-indigo-500/20 bg-indigo-500/5",
      titleColor: "text-indigo-700 dark:text-indigo-400"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="mb-6 md:mb-8 w-full">
      <div className="relative h-[100px] sm:h-[120px] w-full overflow-hidden rounded-[2rem]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 p-4 sm:p-6 flex items-center gap-4 sm:gap-6 border rounded-[2rem] transition-opacity duration-500 ease-in-out overflow-hidden",
              slide.color,
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            )}
          >
            {/* Background Image Accent */}
            <div className="absolute right-0 top-0 bottom-0 w-2/3 pointer-events-none">
               <Image src={slide.image} alt="" fill className="object-cover object-right opacity-10 dark:opacity-20" />
               <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
            </div>

            <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 relative rounded-xl border border-border shadow-sm overflow-hidden z-10 bg-background">
              <Image src={slide.image} alt={slide.title} fill className="object-cover" />
            </div>
            <div className="z-10 relative">
              <h3 className={cn("font-black font-sans text-base sm:text-lg md:text-xl tracking-tight mb-0.5 sm:mb-1", slide.titleColor)}>
                {slide.title}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground max-w-[200px] sm:max-w-none">
                {slide.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index === currentSlide ? "bg-muted-foreground" : "bg-border"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function DailyEarningPageContent() {
  const { data, mutate, isLoading, error } = useSWR("/api/user/daily-earning", fetcher)
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
  const totalPendingInvestorProfit = data?.totalPendingProfit || 0
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
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const handleCompletionAction = async (investmentId: string) => {
     setActionError(null)
     setActionSuccess(null)
     setActionLoader(investmentId)
     try {
       const res = await fetch("/api/user/daily-earning/complete", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ investmentId })
       })
       const result = await res.json()
       if (!res.ok) throw new Error(result.error || "Execution failed")
       setActionSuccess(result.message || "Congrats, your pool is complete")
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

  // --- Error Logging ---
  useEffect(() => {
    if (error) {
      console.error("[DEP] Data Fetching Error:", error);
    }
  }, [error]);

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto pb-24 px-4 sm:px-6 pt-10 md:pt-16 font-sans">
        <div className="animate-pulse space-y-6">
          {/* Hero skeleton */}
          <div className="bg-card/40 border border-border/50 rounded-[3rem] p-8 lg:p-12 flex flex-col xl:flex-row items-center gap-8">
            <div className="flex-1 w-full space-y-4">
              <div className="h-4 bg-muted rounded-full w-40" />
              <div className="h-14 bg-muted rounded-2xl w-3/4" />
              <div className="h-4 bg-muted rounded-full w-full max-w-md" />
            </div>
            <div className="grid grid-cols-2 gap-4 w-full xl:w-auto">
              <div className="h-32 bg-muted rounded-[2rem]" />
              <div className="h-32 bg-muted rounded-[2rem]" />
            </div>
          </div>
          {/* Action section skeleton */}
          <div className="bg-card border-2 border-border/60 rounded-[3rem] p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 w-full lg:w-1/2">
              <div className="h-3 bg-muted rounded-full w-32" />
              <div className="h-20 bg-muted rounded-2xl w-64" />
            </div>
            <div className="flex gap-4 w-full lg:w-auto">
              <div className="h-14 bg-muted rounded-2xl flex-1 lg:w-40" />
              <div className="h-14 bg-muted rounded-2xl flex-1 lg:w-48" />
            </div>
          </div>
          {/* Pool cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-muted/40 border border-border/40 rounded-[2rem]" />
            <div className="h-64 bg-muted/40 border border-border/40 rounded-[2rem]" />
          </div>
        </div>
      </div>
    )
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="max-w-6xl mx-auto pb-24 px-4 sm:px-6 pt-10 md:pt-16 font-sans">
        {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-2 uppercase italic flex items-center gap-3">
            Daily <span className="text-primary">Earning</span> Pool
          </h1>
          <p className="text-muted-foreground font-medium">Maximize your returns with daily automated growth.</p>
        </div>

        {/* Debug Info (Only if there are partial errors) */}
        {(data?._debug?.userError || data?._debug?.investmentsError) && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
            <div className="text-xs text-amber-200">
              {data._debug.userError && <p>Profile error: {data._debug.userError}</p>}
              {data._debug.investmentsError && <p>Investment error: {data._debug.investmentsError}</p>}
            </div>
          </div>
        )}
      </div>

        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-rose-500/30 rounded-[3rem] bg-rose-500/[0.02]">
          <div className="w-20 h-20 bg-rose-500/10 border-2 border-rose-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">Failed to Load Pool Data</h2>
          <p className="text-sm font-medium text-muted-foreground max-w-sm mb-8 leading-relaxed">
            There was an error connecting to the server. Your pool data is safe — please try again.
          </p>
          <button
            onClick={() => mutate()}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 px-4 sm:px-6 pt-10 md:pt-16 font-sans">
      
      <InvestmentSlider />

      {/* ── Tab Navigation (directly under slider) ── */}
      <div className="flex items-center gap-2 mb-6 md:mb-8 bg-muted/30 p-1.5 rounded-2xl border border-border/40 w-full sm:w-fit">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={cn(
            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeTab === "dashboard" ? "bg-card text-foreground shadow-lg shadow-black/5" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BoltIcon className="w-4 h-4 shrink-0" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("referrals")}
          className={cn(
            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeTab === "referrals" ? "bg-card text-foreground shadow-lg shadow-black/5" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <UserGroupIcon className="w-4 h-4 shrink-0" />
          Partner Network
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "dashboard" ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* ── Portfolio Summary (Dashboard-only) ── */}
            <section>
              <div className="bg-card border border-border rounded-2xl md:rounded-3xl p-4 sm:p-5 lg:p-6 flex flex-col lg:flex-row items-start justify-between gap-5">

                {/* Heading */}
                <div className="text-center lg:text-left w-full lg:flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-3">
                     <SparklesIcon className="w-3.5 h-3.5 shrink-0" /> 1% Daily Return
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-sans tracking-tight mb-2 text-foreground">
                     Portfolio <span className="text-emerald-600 dark:text-emerald-500">Summary</span>
                  </h1>
                  <p className="text-sm font-medium text-muted-foreground max-w-md mx-auto lg:mx-0 mb-2 px-1 sm:px-0">
                     Secure investments with fixed daily returns.
                  </p>
                </div>

                {/* Metrics */}
                <div className="w-full lg:w-auto lg:shrink-0 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 border border-border p-3 rounded-xl text-center flex flex-col items-center justify-center overflow-hidden">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-1.5 shrink-0">
                        <BanknotesIcon className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 shrink-0">Active Stake</p>
                      <p className="font-sans font-black text-foreground leading-none tabular-nums whitespace-nowrap w-full text-center" style={{ fontSize: "clamp(11px, 3.5vw, 18px)" }}>
                        {formatCurrency(totalPrincipalLocked)}
                      </p>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl text-center flex flex-col items-center justify-center overflow-hidden">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-1.5 shrink-0">
                        <CurrencyDollarIcon className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1 shrink-0">Settled Wallet</p>
                      <p className="font-sans font-black text-emerald-600 dark:text-emerald-500 leading-none tabular-nums whitespace-nowrap w-full text-center" style={{ fontSize: "clamp(11px, 3.5vw, 18px)" }}>
                        {formatCurrency(dailyEarningWallet)}
                      </p>
                    </div>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl flex items-center justify-between gap-3 overflow-hidden">
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <ChartBarIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest whitespace-nowrap">Pending Profit</p>
                        <p className="text-[9px] font-medium text-muted-foreground/60 mt-0.5 whitespace-nowrap">Settles at 30-day completion</p>
                      </div>
                    </div>
                    <p className="font-sans font-black text-amber-600 dark:text-amber-500 leading-none tabular-nums whitespace-nowrap shrink-0" style={{ fontSize: "clamp(11px, 3.5vw, 18px)" }}>
                      +{formatCurrency(totalPendingInvestorProfit)}
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* ── Action Section ── */}
            <section className="bg-card border border-border rounded-[2rem] p-5 sm:p-8 mb-8 md:mb-12 flex flex-col lg:flex-row items-center justify-between gap-6 w-full">
               <div className="w-full lg:w-auto text-center lg:text-left text-foreground">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-2">Wallet Balance Available to Invest</p>
                  <h2
                    className="font-black font-sans tracking-tight leading-none whitespace-nowrap"
                    style={{ fontSize: "clamp(28px, 8vw, 56px)" }}
                  >
                    {formatCurrency(dailyEarningWallet)}
                  </h2>
               </div>

               <div className="grid grid-cols-2 lg:flex lg:flex-row w-full lg:w-auto gap-3">
                  <button 
                    onClick={() => setIsTransferModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-4 bg-muted border border-border hover:bg-muted/80 text-foreground font-black uppercase tracking-widest text-[10px] rounded-xl transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    Add Money
                  </button>
                  <button 
                    onClick={() => setIsInvestModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 shrink-0" />
                    Invest Now
                  </button>
               </div>
            </section>

            {/* 3. POOL CARDS SECTION */}
            <section className="space-y-6 mb-20">

               {/* PRIMARY: Active Investments */}
               <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  {/* Section header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/20">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                       <BriefcaseIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm sm:text-base font-black text-foreground font-sans tracking-tight leading-none">Your Active Investments</h2>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Tracking Your Money</p>
                    </div>
                  </div>

                  {/* Expired / ready to collect pools */}
                  {expiredLocks.length > 0 && (
                     <div className="p-4 space-y-4 border-b border-border">
                        <p className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                          Ready to Collect
                        </p>
                        {expiredLocks.map((inv: any) => (
                          <PoolCard key={inv.id} inv={inv} isCompleted={true} actionLoader={actionLoader} handleCompletionAction={handleCompletionAction} isUnattached={data?.isUnattached} />
                        ))}
                        {actionError && <p className="text-xs text-rose-500 font-black text-center py-3 bg-rose-500/5 rounded-xl border border-rose-500/10 px-4 uppercase tracking-widest">{actionError}</p>}
                        {actionSuccess && <p className="text-xs text-emerald-500 font-black text-center py-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 px-4 uppercase tracking-widest">{actionSuccess}</p>}
                     </div>
                  )}

                  {/* Active Pools */}
                  <div className="p-4">
                    {activeLocks.length === 0 ? (
                      <div className="py-16 text-center border border-dashed border-border rounded-xl bg-muted/10">
                         <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center mx-auto mb-4 border border-border">
                            <DocumentTextIcon className="w-6 h-6 text-muted-foreground/40" />
                         </div>
                         <p className="text-foreground font-black text-base tracking-tight">No active investments</p>
                         <p className="text-xs font-medium text-muted-foreground mt-1.5 max-w-xs mx-auto">Tap "Invest Now" above to start growing your money daily.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                        {activeLocks.map((inv: any) => <PoolCard key={inv.id} inv={inv} isCompleted={false} isUnattached={data?.isUnattached} />)}
                      </div>
                    )}
                  </div>
               </div>

               {/* SECONDARY: Past Investments — clearly smaller, visually separated */}
               <div className="border border-border/50 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <ClockIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="text-left">
                        <p className="text-xs font-black text-foreground uppercase tracking-widest leading-none">Past Investments</p>
                        <p className="text-[9px] font-medium text-muted-foreground mt-0.5">View completed pool history</p>
                      </div>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="bg-card border-2 border-emerald-500/20 p-5 sm:p-7 rounded-2xl shadow-lg relative overflow-hidden group transition-all hover:border-emerald-500/40">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none rotate-12 group-hover:scale-110 transition-all duration-700">
                     <CurrencyDollarIcon className="w-24 h-24 text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <SparklesIcon className="w-3.5 h-3.5 shrink-0" /> Total Settled Earnings
                  </p>
                  <p
                    className="font-black text-foreground font-sans tabular-nums whitespace-nowrap leading-none mt-1"
                    style={{ fontSize: "clamp(22px, 6vw, 40px)" }}
                  >
                    {formatCurrency(data?.totalSettledEarnings || 0)}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground/60 mt-2 uppercase tracking-wider">Already credited to wallet</p>
               </div>

               <div className="bg-card border-2 border-amber-500/20 p-5 sm:p-7 rounded-2xl shadow-lg relative overflow-hidden group transition-all hover:border-amber-500/40">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none -rotate-12 group-hover:scale-110 transition-all duration-700">
                     <CurrencyDollarIcon className="w-24 h-24 text-amber-500" />
                  </div>
                  <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <SparklesIcon className="w-3.5 h-3.5 shrink-0" /> Total Pending Earnings
                  </p>
                  <p
                    className="font-black text-foreground font-sans tabular-nums whitespace-nowrap leading-none mt-1"
                    style={{ fontSize: "clamp(22px, 6vw, 40px)" }}
                  >
                    {formatCurrency(data?.totalPendingEarnings || 0)}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground/60 mt-2 uppercase tracking-wider">Settles at 30-day expiry</p>
               </div>

               <div className="bg-card border-2 border-border/60 p-5 sm:p-7 rounded-2xl shadow-lg relative overflow-hidden group transition-all hover:border-indigo-500/30 sm:col-span-2 md:col-span-1">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none -rotate-12 group-hover:scale-110 transition-all duration-700">
                     <UsersIcon className="w-24 h-24 text-indigo-500" />
                  </div>
                  <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <UserGroupIcon className="w-3.5 h-3.5 shrink-0" /> Active Partner Network
                  </p>
                  <p className="text-4xl font-black text-foreground font-sans tabular-nums leading-none mt-1">
                    {referralList.filter((r: any) => r.totalInvested > 0).length}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground/60 mt-2 uppercase tracking-wider">Verified yielding members</p>
               </div>
            </div>

            {/* Referred Members Section */}
            <div className="bg-card border-2 border-border/60 rounded-2xl overflow-hidden">
               <div className="px-5 py-4 sm:px-8 sm:py-6 border-b border-border/60 bg-muted/20 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-xl font-black text-foreground tracking-tight">Your Referral Earnings Overview</h2>
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground/70 mt-0.5">People you invited and earnings they generated.</p>
                  </div>
                  <button onClick={() => mutateReferrals()} className="p-2.5 rounded-xl bg-background border border-border/60 hover:border-indigo-500/40 hover:bg-muted transition-all active:scale-90 text-muted-foreground hover:text-indigo-600 shrink-0 group">
                    <ArrowPathIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                  </button>
               </div>

               {/* Mobile View: Card Based */}
               <div className="block lg:hidden divide-y divide-border/40">
                  {referralList.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                       <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border/60">
                         <UserGroupIcon className="w-8 h-8 text-muted-foreground/20" />
                       </div>
                       <p className="text-foreground font-black text-base tracking-tight">Network is currently empty</p>
                       <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest opacity-60">Share your referral link to begin</p>
                    </div>
                  ) : (
                    referralList.map((ref: any) => {
                      const dailyGeneration = ref.totalInvested * 0.01 * 0.20;
                      return (
                      <div key={ref.id} className="p-4 space-y-3">

                         {/* Identity row — 3 elements, each properly constrained */}
                         <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shrink-0">
                               {ref.name ? ref.name[0].toUpperCase() : "?"}
                            </div>
                            {/* Name + email — overflow-safe, min-w-0 required for truncate to work */}
                            <div className="flex-1 min-w-0 overflow-hidden">
                               <p className="font-black text-foreground text-sm leading-tight truncate">{ref.name || "Anonymous Member"}</p>
                               <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest truncate mt-0.5 opacity-70">{ref.email}</p>
                            </div>
                            {/* Status badge — shrink-0 prevents it compressing name */}
                            {ref.totalInvested > 0 ? (
                              <div className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                 <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest whitespace-nowrap">Active</span>
                              </div>
                            ) : null}
                         </div>

                         {/* Stats mini-cards — fluid font to prevent overflow */}
                         <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 rounded-xl bg-muted/30 border border-border/60 overflow-hidden">
                               <p className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1">Deployed Capital</p>
                               <p
                                 className="font-black text-foreground leading-none tabular-nums whitespace-nowrap"
                                 style={{ fontSize: "clamp(11px, 3.5vw, 16px)" }}
                               >{formatCurrency(ref.totalInvested)}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 overflow-hidden">
                               <p className="text-[8px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-widest mb-1">Total Earnings</p>
                               <p
                                 className="font-black text-indigo-600 dark:text-indigo-500 leading-none tabular-nums whitespace-nowrap"
                                 style={{ fontSize: "clamp(11px, 3.5vw, 16px)" }}
                               >+{formatCurrency(ref.earningsGenerated)}</p>
                            </div>
                         </div>

                         {/* Daily rate — full-width strip, never compresses */}
                         {ref.totalInvested > 0 && (
                           <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                             <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 whitespace-nowrap">
                               Generating <span className="tabular-nums">+{formatCurrency(dailyGeneration)}</span>/day for you
                             </p>
                           </div>
                         )}

                      </div>
                      )})
                  )}
               </div>

               {/* Desktop View: Table */}
               <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-muted/40 text-[11px] font-black text-muted-foreground/50 uppercase tracking-[0.25em] border-b border-border/60">
                           <th className="px-12 py-7">Partner Identity</th>
                           <th className="px-12 py-7">Capital Allocation</th>
                           <th className="px-12 py-7">Accumulated Pending Earnings</th>
                           <th className="px-12 py-7 text-right">Daily Generation Status</th>
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
                           referralList.map((ref: any) => {
                               const dailyGeneration = ref.totalInvested * 0.01 * 0.20;
                               return (
                              <tr key={ref.id} className="group hover:bg-indigo-500/[0.03] transition-all duration-300">
                                 <td className="px-12 py-8">
                                   <div className="flex items-center gap-5">
                                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 p-[2px] shadow-lg group-hover:scale-105 transition-transform duration-500">
                                         <div className="w-full h-full bg-card rounded-[14px] flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-base">
                                            {ref.name ? ref.name[0].toUpperCase() : "?"}
                                         </div>
                                      </div>
                                      <div>
                                         <div className="flex items-center gap-2">
                                             <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Source:</p>
                                             <p className="font-black text-foreground text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">{ref.name || "Anonymous Member"}</p>
                                          </div>
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
                           )})
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>      {/* 4. ADD MONEY MODAL */}
      <AnimatePresence>
         {isTransferModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-background/90" onClick={() => !transferLoader && setIsTransferModalOpen(false)} />
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-card border border-border w-full max-w-md rounded-[2rem] p-8 sm:p-10 relative z-10">
                  <button onClick={() => !transferLoader && setIsTransferModalOpen(false)} className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground bg-muted rounded-xl">
                     <XMarkIcon className="w-5 h-5" />
                  </button>

                  <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">Add Money</h3>
                  <p className="text-muted-foreground text-sm mb-6">Transfer money from your Main Wallet to invest it.</p>

                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
                     <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Main Wallet Balance</span>
                     <span className="text-xl font-black text-foreground font-sans">{formatCurrency(walletBalance)}</span>
                  </div>

                  <form onSubmit={handleTransfer}>
                     <div className="mb-6 relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                          <span className="text-muted-foreground font-black text-sm uppercase">{userCurrency}</span>
                        </div>
                        <input type="number" step="0.01" value={transferAmount} onChange={(e: any) => setTransferAmount(e.target.value)} placeholder="0.00" className="w-full bg-muted border border-border rounded-2xl py-4 pl-16 pr-6 text-foreground font-sans text-2xl focus:outline-none focus:border-indigo-500 transition-colors" required />
                     </div>

                     {transferError && <p className="text-rose-500 text-xs font-black mb-6 uppercase tracking-wider text-center bg-rose-500/10 py-3 rounded-xl">{transferError}</p>}

                     <button type="submit" disabled={transferLoader || !transferAmount} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-colors disabled:opacity-50">
                        {transferLoader ? "Processing..." : "Confirm"}
                     </button>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* 5. INVEST MODAL */}
      <AnimatePresence>
         {isInvestModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-background/90" onClick={() => !investLoader && setIsInvestModalOpen(false)} />
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-card border border-border w-full max-w-md rounded-[2rem] p-8 sm:p-10 relative z-10">
                  <button onClick={() => !investLoader && setIsInvestModalOpen(false)} className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground bg-muted rounded-xl">
                     <XMarkIcon className="w-5 h-5" />
                  </button>

                  <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">Invest Now</h3>
                  <p className="text-muted-foreground text-sm mb-6">Invest your money to earn 1% profit every day for 30 days.</p>

                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
                     <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Available to Invest</span>
                     <span className="text-xl font-black text-foreground font-sans">{formatCurrency(dailyEarningWallet)}</span>
                  </div>

                  <form onSubmit={handleInvest}>
                     <div className="mb-6 relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                          <span className="text-muted-foreground font-black text-sm uppercase">{userCurrency}</span>
                        </div>
                        <input type="number" step="0.01" value={investAmount} onChange={(e: any) => setInvestAmount(e.target.value)} placeholder="0.00" className="w-full bg-muted border border-border rounded-2xl py-4 pl-16 pr-6 text-foreground font-sans text-2xl focus:outline-none focus:border-emerald-500 transition-colors" required />
                     </div>

                     {investError === "INSUFFICIENT" ? (
                       <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                          <p className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-4 text-center">
                             Not enough money in wallet.
                          </p>
                          <button 
                            type="button"
                            onClick={() => { setIsInvestModalOpen(false); setIsTransferModalOpen(true); }}
                            className="flex items-center justify-center gap-2 w-full py-4 bg-rose-500 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-colors hover:bg-rose-600"
                          >
                             Add Money First <ArrowRightIcon className="w-4 h-4" />
                          </button>
                       </div>
                     ) : investError && (
                       <p className="text-rose-500 text-xs font-black mb-6 uppercase tracking-wider text-center bg-rose-500/10 py-3 rounded-xl">{investError}</p>
                     )}

                     {investSuccess && <p className="text-emerald-600 dark:text-emerald-500 text-xs font-bold mb-6 uppercase tracking-wider text-center bg-emerald-500/10 py-3 rounded-xl">✓ {investSuccess}</p>}
                     
                     {investAmount && !isNaN(parseFloat(investAmount)) && parseFloat(investAmount) >= convertFromUSD(1) && !investError && (
                        <div className="mb-6 grid grid-cols-2 gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                           <div className="text-center border-r border-border/50">
                              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1">Daily Profit</p>
                              <p className="text-lg font-black text-foreground font-sans">+{formatCurrency(convertToUSD(parseFloat(investAmount)) * 0.01)}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1">Total in 30 Days</p>
                              <p className="text-lg font-black text-foreground font-sans">+{formatCurrency(convertToUSD(parseFloat(investAmount)) * 0.30)}</p>
                           </div>
                        </div>
                     )}

                     <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-400 text-xs font-bold flex gap-3 items-center">
                        <LockClosedIcon className="w-5 h-5 shrink-0" />
                        <span>Investment locked for 30 days. Cannot be cancelled early.</span>
                     </div>

                     <button type="submit" disabled={investLoader || investError === "INSUFFICIENT"} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase text-xs rounded-xl transition-colors disabled:opacity-50">
                        {investLoader ? "Investing..." : "Confirm Investment"}
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
      "bg-card p-6 sm:p-8 rounded-[1.5rem] border overflow-hidden",
      isCompleted 
        ? "border-emerald-500/30 bg-emerald-500/5" 
        : "border-border"
    )}>
      <div className="flex flex-col h-full">
        {/* Header: Identity & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
           <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                isCompleted ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              )}>
                 <BriefcaseIcon className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Investment ID</p>
                 <p className="font-sans font-black text-sm text-foreground">#{inv.id.slice(-6).toUpperCase()}</p>
              </div>
           </div>
           
           <div className={cn(
              "px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest self-start sm:self-center",
              isCompleted 
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" 
                : "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
           )}>
              <div className={cn("w-1.5 h-1.5 rounded-full", isCompleted ? "bg-emerald-500" : "bg-indigo-500 animate-pulse")} />
              {isCompleted ? "Completed" : "Active"}
           </div>
        </div>

        {/* Financial Simple Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
           <div className="p-4 rounded-xl bg-muted/50 border border-border flex flex-col justify-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                 Invested Amount
              </p>
              <p className="font-sans font-black text-xl text-foreground">
                 {formatCurrency(inv.amount)}
              </p>
           </div>
           
           <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-center">
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-widest mb-1">
                 Total Expected Return
              </p>
              <p className="font-sans font-black text-xl text-emerald-700 dark:text-emerald-500">
                 +{formatCurrency(inv.amount * 0.30)}
              </p>
           </div>
        </div>

        {/* Current Accumulated Profit */}
        <div className="mb-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between gap-4">
           <div>
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-0.5">
                 Profit Earned So Far
              </p>
              <p className="text-[9px] text-muted-foreground uppercase">(Your 80% Share)</p>
           </div>
           <div className="text-right">
              <p className="font-sans font-black text-2xl text-indigo-600 dark:text-indigo-400">
                 +{formatCurrency(inv.profitEarned * 0.8)}
              </p>
           </div>
        </div>

        {/* Progress Bar (Pure CSS) */}
        <div className="mb-6">
           <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              <span>{format(startDate, "MMM dd, yyyy")}</span>
              <span>{Math.round(progress)}% Completed</span>
              <span>{format(expiryDate, "MMM dd, yyyy")}</span>
           </div>
           <div className="h-2 w-full bg-muted border border-border rounded-full overflow-hidden">
              <div 
                 className={cn("h-full transition-all duration-1000", isCompleted ? "bg-emerald-500" : "bg-indigo-500")} 
                 style={{ width: `${progress}%` }} 
              />
           </div>
        </div>

        {/* Action Button / Timer */}
        <div className="mt-auto pt-4 border-t border-border">
           {isCompleted ? (
              <button 
                onClick={() => handleCompletionAction(inv.id)}
                disabled={actionLoader === inv.id}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                 {actionLoader === inv.id ? "Processing..." : "Claim Investment"}
              </button>
           ) : (
              <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border">
                 <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Next Profit In</span>
                 </div>
                 <span className="font-mono font-bold text-sm text-foreground">
                    {poolTimer || "..."}
                 </span>
              </div>
           )}
        </div>
      </div>
    </div>
  )
}
