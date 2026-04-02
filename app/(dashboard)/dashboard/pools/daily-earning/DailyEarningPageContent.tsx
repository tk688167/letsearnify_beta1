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
  BanknotesIcon
} from "@heroicons/react/24/outline"
import { createDailyPool } from "@/app/actions/user/daily-pools"

const fetcher = (url: string) => fetch(url).then(r => r.json())

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function DailyEarningPageContent() {
  const { data, mutate } = useSWR("/api/user/daily-earning", fetcher)
  
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false)
  const [investAmount, setInvestAmount] = useState("")
  const [investLoader, setInvestLoader] = useState(false)
  const [investError, setInvestError] = useState("")
  const [investSuccess, setInvestSuccess] = useState("")

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
       if (!res.ok) throw new Error(result.error || "Execution failed")
       mutate()
     } catch(err: any) {
       setActionError(err.message)
     } finally {
       setActionLoader(null)
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
      mutate()
    } catch (err: any) {
      setInvestError(err.message)
    } finally {
      setInvestLoader(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 px-4 sm:px-6 pt-10 md:pt-16 font-sans">
      
      {/* 1. REFINED HEADER & STYLED HOOKLINE */}
      <section className="mb-12 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter mb-3 uppercase">
           Daily Earning Pool
        </h1>
        <p className="text-sm sm:text-base font-medium text-muted-foreground/90 max-w-2xl leading-relaxed">
           Initialize a secure 30-day smart contract and witness constant 
           <span className="mx-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black rounded-lg border border-emerald-500/20 shadow-sm">1.0% daily growth</span> 
           on your committed capital.
        </p>
      </section>

      {/* 2. HIGH-CONTRAST WALLET ALLOCATION SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
         <div className="md:col-span-12 xl:col-span-8 bg-zinc-950 dark:bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-125 rotate-6 group-hover:rotate-0 transition-transform duration-1000">
               <BanknotesIcon className="w-48 h-48 text-white" />
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
               <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3">Available Allocation</p>
                  <div className="flex items-baseline gap-2">
                     <span className="text-xl font-medium text-white/30 font-serif">$</span>
                     <h2 className="text-5xl font-black text-white tracking-tighter font-serif">
                        {dailyEarningWallet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </h2>
                  </div>
               </div>
               <button 
                 onClick={() => setIsInvestModalOpen(true)}
                 className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-10 py-5 bg-white text-zinc-950 font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-white/5 active:scale-95"
               >
                 <PlusIcon className="w-4 h-4" />
                 Start New
               </button>
            </div>
         </div>

         {/* Compact Secondary Stats */}
         <div className="md:col-span-12 xl:col-span-4 grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-1 gap-4">
            <div className="p-6 bg-card/40 border border-border rounded-2xl flex flex-col justify-center">
               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Locked Principle</p>
               <p className="text-xl font-black text-foreground font-serif">${totalPrincipalLocked.toFixed(2)}</p>
            </div>
            <div className="p-6 bg-card/40 border border-border rounded-2xl flex flex-col justify-center">
               <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Net Earnings</p>
               <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-serif">+${totalAccumulatedProfit.toFixed(2)}</p>
            </div>
         </div>
      </section>

      {/* 3. ACTIVE POOLS HIERARCHY */}
      <section className="mb-20">
         <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
               <BoltIcon className="w-4 h-4 text-indigo-500" />
            </div>
            <h2 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Live Contracts ({activeLocks.length})</h2>
         </div>

         {expiredLocks.length > 0 && (
            <div className="space-y-4 mb-10">
               {expiredLocks.map(inv => (
                 <div key={inv.id} className="p-8 bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 left-0 w-2 h-full bg-rose-500" />
                    <div>
                       <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">30-Day Term Completed</p>
                       <p className="text-3xl font-black text-foreground font-serif leading-none">${(inv.amount + inv.profitEarned).toFixed(2)}</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                       <button onClick={() => handleCompletionAction(inv.id, "REINVEST")} disabled={!!actionLoader} className="flex-1 md:flex-none px-8 py-4 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95">Reinvest</button>
                       <button onClick={() => handleCompletionAction(inv.id, "WITHDRAW_TO_WALLET")} disabled={!!actionLoader} className="flex-1 md:flex-none px-8 py-4 bg-background border border-border text-foreground text-[11px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95">Collect</button>
                    </div>
                 </div>
               ))}
               {actionError && <p className="text-xs text-rose-500 font-bold text-center mt-2">{actionError}</p>}
            </div>
         )}

         <div className="grid grid-cols-1 gap-5">
            {activeLocks.length === 0 ? (
              <div className="py-24 text-center border-2 border-dashed border-border rounded-[3rem] bg-muted/5 opacity-50">
                 <div className="w-14 h-14 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ClockIcon className="w-7 h-7 text-muted-foreground" />
                 </div>
                 <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">No Active contracts detected</p>
              </div>
            ) : (
              activeLocks.map(inv => <PremiumContractRow key={inv.id} inv={inv} />)
            )}
         </div>
      </section>

      {/* 4. STRUCTURED PROTOCOL SPECIFICATIONS */}
      <section className="bg-card/20 border border-border rounded-[3rem] p-12 sm:p-16 relative overflow-hidden backdrop-blur-sm">
         <h2 className="text-lg font-black text-foreground tracking-[0.2em] uppercase mb-12">Protocol Specs</h2>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <RuleBox 
               icon={ClockIcon} 
               label="Retention Cycle" 
               text="Secure 30-day lock term ensuring platform liquidity stability." 
               accent="emerald"
            />
            <RuleBox 
               icon={DocumentTextIcon} 
               label="Payout Auto-Logic" 
               text="24-hour snapshot distributions with automated term release." 
               accent="indigo"
            />
            <RuleBox 
               icon={ExclamationTriangleIcon} 
               label="Market Variability" 
               text="Rates correlate with ecosystem growth metrics." 
               accent="amber"
            />
         </div>
      </section>

      {/* --- PREMIUM INVESTMENT MODAL --- */}
      <AnimatePresence>
         {isInvestModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => !investLoader && setIsInvestModalOpen(false)} />
               <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="bg-card border border-border w-full max-w-sm rounded-[3rem] p-10 relative z-10 shadow-2xl">
                  <button onClick={() => !investLoader && setIsInvestModalOpen(false)} className="absolute top-8 right-8 p-2 text-muted-foreground hover:text-foreground transition-colors">
                     <XMarkIcon className="w-6 h-6" />
                  </button>

                  <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase mb-2">Protocol Init</h3>
                  <div className="flex justify-between items-center mb-10 pb-4 border-b border-border">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Available Allocation</span>
                     <span className="text-lg font-black text-foreground font-serif">${dailyEarningWallet.toFixed(2)}</span>
                  </div>

                  <form onSubmit={handleInvest}>
                     <div className="mb-8 relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <span className="text-muted-foreground/30 font-black font-serif">$</span>
                        </div>
                        <input type="number" step="0.01" min="1" max={dailyEarningWallet} value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} placeholder="0.00" className="w-full bg-muted/40 border border-border rounded-2xl py-6 pl-10 pr-6 text-foreground font-serif text-3xl focus:outline-none focus:border-indigo-500 transition-colors" required />
                     </div>

                     {/* ERROR STATE: Insufficient Assets */}
                     {investError === "INSUFFICIENT" ? (
                       <div className="mb-10 p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                          <p className="text-[11px] font-black text-rose-500 uppercase tracking-[0.1em] mb-4 leading-relaxed">
                             Asset allocation failed: Insufficient balance in Daily Wallet.
                          </p>
                          <Link 
                            href="/dashboard/wallet"
                            className="flex items-center justify-center gap-2.5 w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                          >
                             Transfer Funds <ArrowRightIcon className="w-4 h-4" />
                          </Link>
                       </div>
                     ) : investError && (
                       <p className="text-rose-500 text-[10px] font-black mb-8 uppercase tracking-widest">{investError}</p>
                     )}

                     {investSuccess && <p className="text-emerald-500 text-[10px] font-black mb-8 uppercase tracking-[0.2em] font-mono shadow-sm">✓ {investSuccess}</p>}
                     
                     <div className="mb-10 p-6 rounded-2xl bg-muted/30 border border-border text-[9px] text-muted-foreground/50 font-black uppercase tracking-[0.2em] leading-relaxed">
                        ⚠️ Protocol Disclaimer: All committed assets are strictly locked for the standard 30-day term. Term extraction is automated.
                     </div>

                     <button type="submit" disabled={investLoader || investError === "INSUFFICIENT"} className="w-full py-5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black tracking-widest uppercase text-[11px] rounded-2xl transition-all shadow-2xl disabled:opacity-50">
                        {investLoader ? "Enabling Contract..." : "Confirm Protocol"}
                     </button>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  )
}

function PremiumContractRow({ inv }: any) {
  const now = new Date()
  const startDate = new Date(inv.createdAt)
  const totalDays = 30
  const elapsedMs = now.getTime() - startDate.getTime()
  const progress = Math.min(100, (elapsedMs / (1000 * 60 * 60 * 24 * totalDays)) * 100)

  return (
    <div className="p-8 bg-card/60 border border-border rounded-[2.5rem] hover:border-indigo-500/40 transition-all duration-500 relative group overflow-hidden shadow-sm">
       <div className="absolute top-0 right-0 p-8 opacity-[0.02] scale-150 pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <ChartBarIcon className="w-32 h-32 text-indigo-500" />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          <div className="md:col-span-5 flex items-center gap-6 border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-6">
             <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-500/20">
                <BoltIcon className="w-7 h-7 text-indigo-500" />
             </div>
             <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-50">Principal Commit</p>
                <h4 className="text-3xl font-black text-foreground leading-none font-serif tracking-tighter">${inv.amount.toFixed(2)}</h4>
             </div>
          </div>

          <div className="md:col-span-4 flex flex-col justify-center">
             <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 opacity-80">Accumulated Growth</p>
             <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-serif leading-none tracking-tighter">+${inv.profitEarned.toFixed(2)}</h4>
          </div>

          <div className="md:col-span-3">
             <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] opacity-60">Maturation</span>
                <span className="text-[11px] font-black text-foreground font-serif">{Math.floor(progress)}%</span>
             </div>
             <div className="h-2.5 bg-muted rounded-full overflow-hidden p-[2px] border border-border">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-indigo-600 rounded-full" />
             </div>
             <div className="flex justify-between mt-3 text-[9px] font-bold text-muted-foreground/30 uppercase tracking-tighter">
                <span>Start: {format(startDate, 'MMM dd')}</span>
                <span>Term: 30D</span>
             </div>
          </div>
       </div>
    </div>
  )
}

function RuleBox({ icon: Icon, label, text, accent }: any) {
  const accents: any = {
    emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10",
    indigo: "text-indigo-500 bg-indigo-500/5 border-indigo-500/10",
    amber: "text-amber-500 bg-amber-500/5 border-amber-500/10"
  }
  return (
    <div className={cn("p-8 rounded-[2rem] border transition-all duration-300 hover:scale-[1.03]", accents[accent])}>
       <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-current/10">
          <Icon className="w-6 h-6" />
       </div>
       <h4 className="text-[13px] font-black text-foreground uppercase tracking-[0.1em] mb-3">{label}</h4>
       <p className="text-[12px] font-medium text-muted-foreground leading-relaxed">{text}</p>
    </div>
  )
}
