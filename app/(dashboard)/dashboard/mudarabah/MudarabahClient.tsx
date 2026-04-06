"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChartPieIcon, 
  BanknotesIcon, 
  ArrowTrendingUpIcon,
  XMarkIcon,
  ClockIcon,
  ShieldExclamationIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  CheckBadgeIcon,
  CalendarDaysIcon,
  BuildingLibraryIcon,
  ArchiveBoxIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface MudarabahPool {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  targetAmount: number;
  minDeposit: number;
  maxDeposit: number;
  durationMonths: number;
  totalDeposited: number;
  status: string;
}

interface Wallet {
  balance: number;
  totalInvested: number;
  totalProfit: number;
  investments: any[];
}

type Tab = "live" | "previous" | "history";

export default function MudarabahClient() {
  const [pools, setPools] = useState<MudarabahPool[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeatureLive, setIsFeatureLive] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("live");
  
  // Investment Modal
  const [selectedPool, setSelectedPool] = useState<MudarabahPool | null>(null);
  const [investAmount, setInvestAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/user/mudarabah?_t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      
      setIsFeatureLive(data.isFeatureLive);
      setIsUnlocked(data.isUnlocked); // This is correctly mapped to isActiveMember in API
      if (data.isFeatureLive && data.isUnlocked) {
        setPools(data.pools);
        setWallet(data.userWallet);
      } else if (data.isFeatureLive && !data.isUnlocked) {
        setWallet(data.userWallet);
      }
    } catch (error) {
      toast.error("Error loading Mudarabah pools");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    try {
      const res = await fetch("/api/user/unlock", {
        method: "POST",
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg);
      }

      toast.success("All Premium Features Unlocked!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to unlock features");
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPool) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/mudarabah/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId: selectedPool.id,
          amount: investAmount
        })
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg);
      }

      toast.success("Investment successful!");
      setSelectedPool(null);
      setInvestAmount("");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to invest");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-0 py-10 space-y-10">
        {/* Unlock Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 px-8 py-14 text-center shadow-2xl">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 70% 20%, #10b981 0%, transparent 50%), radial-gradient(circle at 30% 80%, #0d9488 0%, transparent 50%)" }}></div>
          
          {/* Locked Badge */}
          <div className="relative inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            <ShieldExclamationIcon className="w-4 h-4 text-emerald-400" />
            Access Restricted
          </div>

          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-6">
            <ChartPieIcon className="h-10 w-10 text-emerald-400" />
          </div>

          <h1 className="relative text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Unlock Mudaraba<br/>
            <span className="text-emerald-400">Profit Pools</span>
          </h1>
          <p className="relative text-emerald-100/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Gain exclusive access to Shariah-compliant, professionally managed investment pools. Start your journey with ethical profit-sharing today.
          </p>

          <div className="relative flex flex-col items-center gap-4">
            <button 
              onClick={handleUnlock}
              disabled={isUnlocking}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              {isUnlocking ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent"></div>
                  Unlocking...
                </>
              ) : (
                <>
                  <CheckBadgeIcon className="w-6 h-6" />
                  Unlock Now for $1.00
                </>
              )}
            </button>
            <p className="text-emerald-100/40 text-xs font-medium">One-time activation fee. Results in permanent access.</p>
          </div>
        </div>

        {/* Informative Stats for Hidden Pools */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
              <BanknotesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Ethical Investing</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Your capital is deployed into audited real-world assets. No riba, no speculation — just pure profit sharing.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center mb-4">
              <ArrowTrendingUpIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Passive Growth</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Enjoy weekly or monthly profit distributions directly to your Mudaraba wallet, ready for reinvestment or withdrawal.
            </p>
          </div>
        </div>

        {/* Disclaimer Reminder */}
        <div className="rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10 p-6 flex gap-5 items-start">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mt-0.5">
            <ShieldExclamationIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Standard Mudaraba Terms</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              By unlocking, you acknowledge that Mudaraba involves profit and loss sharing. Profits are shared at a fixed ratio, while the Rabb-ul-Mal (you) bears any actual financial loss. Funds are locked for the duration of the chosen pool.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const livePools = pools.filter((p: any) => p.status === "OPEN" || p.status === "ACTIVE");
  const previousPools = pools.filter((p: any) => p.status === "COMPLETED");
  const investments = wallet?.investments || [];

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "live", label: "Live Pools", icon: BuildingLibraryIcon, count: livePools.length },
    { id: "previous", label: "Previous Pools", icon: ArchiveBoxIcon, count: previousPools.length },
    { id: "history", label: "My History", icon: DocumentTextIcon, count: investments.length },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 px-4 sm:px-0">

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 px-6 py-10 sm:px-12 sm:py-14 shadow-2xl">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #10b981 0%, transparent 50%), radial-gradient(circle at 20% 80%, #0d9488 0%, transparent 50%)" }}></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl">
            <ChartPieIcon className="h-8 w-8 text-emerald-400" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-emerald-400 font-semibold text-sm uppercase tracking-widest mb-1">Shariah-Compliant</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">Mudarabah Investment Pools</h1>
            <p className="text-emerald-100/70 text-base max-w-xl">
              Partner with LetsEarnify in professionally managed, halal investment pools. Grow your wealth through real, transparent profit-sharing.
            </p>
          </div>
        </div>
      </div>

      {/* Wallet Stats */}
      {wallet && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Available Balance", value: `$${wallet.balance.toFixed(2)}`, sub: "Ready to invest", icon: BanknotesIcon, color: "emerald" },
            { label: "Total Invested", value: `$${wallet.totalInvested.toFixed(2)}`, sub: "Active in pools", icon: ChartPieIcon, color: "blue" },
            { label: "Active Investment", value: `${investments.filter((i: any) => i.status === "ACTIVE").length}`, sub: "Running positions", icon: ArrowTrendingUpIcon, color: "violet" },
            { label: "Total Profit Earned", value: `$${wallet.totalProfit.toFixed(2)}`, sub: "All-time returns", icon: ArrowTrendingUpIcon, color: "green" },
          ].map((stat) => (
            <div key={stat.label} className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`mb-3 w-9 h-9 flex items-center justify-center rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-500/10`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl w-full">
        {tabs.map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <tab.icon className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                activeTab === tab.id ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300"
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "live" && (
          <motion.div key="live" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {livePools.length === 0 ? (
              <EmptyState icon={ClockIcon} title="No Live Pools" message="Our upcoming pools are being finalized. Please check back soon." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {livePools.map((pool, idx) => <PoolCard key={pool.id} pool={pool} idx={idx} onInvest={() => setSelectedPool(pool)} />)}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "previous" && (
          <motion.div key="previous" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {previousPools.length === 0 ? (
              <EmptyState icon={ArchiveBoxIcon} title="No Previous Pools" message="Completed pools will appear here once pool cycles finish." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {previousPools.map((pool, idx) => <PoolCard key={pool.id} pool={pool} idx={idx} completed />)}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {investments.length === 0 ? (
              <EmptyState icon={DocumentTextIcon} title="No Investments Yet" message="Your investment history will appear here once you invest in a pool." />
            ) : (
              <div className="space-y-3">
                {investments.map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                        <ChartPieIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{inv.pool?.title || "Unknown Pool"}</p>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {new Date(inv.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900 dark:text-white text-lg">${inv.amount?.toLocaleString()}</p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-emerald-500" />
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+${inv.profitEarned?.toLocaleString() ?? "0"} earned</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Important Disclaimer — moved below main content */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10 p-5 flex gap-4 items-start">
        <ShieldExclamationIcon className="w-7 h-7 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Important Mudarabah Disclosure</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
            Mudarabah is a profit-sharing structure. You act as the capital provider (Rabb-ul-Mal); LetsEarnify acts as the manager (Mudarib). In the event of a genuine business loss, the capital provider bears the financial risk.
          </p>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex gap-2"><span className="text-amber-500 font-bold">•</span> <span><b>Lock-in:</b> Funds cannot be withdrawn before pool duration completes.</span></li>
            <li className="flex gap-2"><span className="text-amber-500 font-bold">•</span> <span><b>Transfer first:</b> Move funds from your main wallet to the Mudarabah Wallet to invest.</span></li>
            <li className="flex gap-2"><span className="text-amber-500 font-bold">•</span> <span><b>Profit distribution:</b> Profits are calculated and distributed at the end of each pool's duration.</span></li>
          </ul>
        </div>
      </div>

      {/* Invest Modal */}
      <AnimatePresence>
        {selectedPool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPool(null)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
              {selectedPool.imageUrl && (
                <div className="h-32 w-full overflow-hidden">
                  <img src={selectedPool.imageUrl} alt={selectedPool.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Invest in Pool</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPool.title}</p>
                  </div>
                  <button onClick={() => setSelectedPool(null)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-slate-800">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleInvest} className="space-y-4">
                  <div className="rounded-xl bg-gray-50 dark:bg-slate-800/50 p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Available Balance</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">${wallet?.balance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Deposit Range</span>
                      <span className="font-medium text-gray-900 dark:text-white">${selectedPool.minDeposit} – ${selectedPool.maxDeposit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Duration</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedPool.durationMonths} months</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Investment Amount ($)</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-gray-400">$</span></div>
                      <input type="number" min={selectedPool.minDeposit} max={Math.min(selectedPool.maxDeposit, wallet?.balance || 0)} step="0.01" required value={investAmount} onChange={(e: any) => setInvestAmount(e.target.value)} className="block w-full rounded-xl border border-gray-200 dark:border-slate-700 pl-7 py-3 text-sm font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-800 dark:text-white outline-none" placeholder="0.00" />
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting || !investAmount || parseFloat(investAmount) < selectedPool.minDeposit} className="w-full rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {isSubmitting ? "Processing..." : "Confirm Investment"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PoolCard({ pool, idx, onInvest, completed }: { pool: MudarabahPool; idx: number; onInvest?: () => void; completed?: boolean }) {
  const progress = Math.min((pool.totalDeposited / pool.targetAmount) * 100, 100);
  const isFull = pool.totalDeposited >= pool.targetAmount;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all">
      {/* Image/Header */}
      <div className="h-44 w-full relative overflow-hidden">
        {pool.imageUrl ? (
          <img src={pool.imageUrl} alt={pool.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <h3 className="text-xl font-extrabold text-white drop-shadow">{pool.title}</h3>
          {completed ? (
            <span className="bg-gray-700/80 text-gray-100 text-xs font-bold px-3 py-1 rounded-full">Completed</span>
          ) : isFull ? (
            <span className="bg-black/40 text-white border border-white/30 text-xs font-bold px-3 py-1 rounded-full">Fully Funded</span>
          ) : (
            <span className="bg-emerald-500/90 text-white text-xs font-bold px-3 py-1 rounded-full">Open</span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        {pool.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{pool.description}</p>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center gap-1 text-gray-400 mb-1"><CalendarDaysIcon className="w-3.5 h-3.5" /><span className="text-xs font-bold uppercase tracking-wider">Duration</span></div>
            <p className="font-bold text-gray-900 dark:text-white">{pool.durationMonths} Months</p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center gap-1 text-gray-400 mb-1"><InformationCircleIcon className="w-3.5 h-3.5" /><span className="text-xs font-bold uppercase tracking-wider">Min. Entry</span></div>
            <p className="font-bold text-gray-900 dark:text-white">${pool.minDeposit}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Funded: <span className="font-bold text-emerald-600 dark:text-emerald-400">${pool.totalDeposited.toLocaleString()}</span></span>
            <span className="font-bold text-gray-900 dark:text-white">${pool.targetAmount.toLocaleString()} target</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, ease: "easeOut" }} className={`h-full rounded-full ${completed ? "bg-gray-400" : isFull ? "bg-emerald-500" : "bg-gradient-to-r from-emerald-400 to-teal-500"}`} />
          </div>
          <p className="text-xs text-right text-gray-500 dark:text-gray-400 font-medium">{progress.toFixed(1)}% capacity reached</p>
        </div>

        {!completed && (
          <button onClick={onInvest} disabled={isFull} className="mt-auto w-full rounded-2xl bg-slate-900 dark:bg-white py-3 text-sm font-bold text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {isFull ? "Pool Full" : "Invest in This Pool"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, title, message }: { icon: React.ElementType; title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-dashed border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
      <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-slate-800 mb-4">
        <Icon className="w-7 h-7 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{message}</p>
    </div>
  );
}
