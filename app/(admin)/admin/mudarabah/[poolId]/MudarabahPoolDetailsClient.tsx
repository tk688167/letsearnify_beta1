"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  ArrowLeftIcon, 
  BanknotesIcon, 
  UserGroupIcon, 
  ChartPieIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Investment {
  id: string;
  amount: number;
  status: string;
  profitEarned: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface Distribution {
  id: string;
  totalProfit: number;
  userSharePercentage: number;
  platformSharePercentage: number;
  createdAt: string;
}

interface PoolDetails {
  id: string;
  title: string;
  targetAmount: number;
  minDeposit: number;
  maxDeposit: number;
  durationMonths: number;
  isLive: boolean;
  totalDeposited: number;
  status: string;
  investments: Investment[];
  distributions: Distribution[];
}

export default function MudarabahPoolDetailsClient({ poolId }: { poolId: string }) {
  const router = useRouter();
  const [pool, setPool] = useState<PoolDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDistributing, setIsDistributing] = useState(false);

  // Distribution form
  const [distData, setDistData] = useState({
    totalProfit: "",
    userSharePercentage: "80",
    platformSharePercentage: "20",
  });

  const fetchPool = async () => {
    try {
      const res = await fetch(`/api/admin/mudarabah/${poolId}`);
      if (!res.ok) throw new Error("Failed to fetch pool details");
      const data = await res.json();
      setPool(data);
    } catch (error) {
      toast.error("Error loading pool details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPool();
  }, [poolId]);

  const handleDistributeProfit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pool || pool.totalDeposited <= 0) {
      return toast.error("Pool has no active deposits to distribute to");
    }

    setIsDistributing(true);
    try {
      const res = await fetch("/api/admin/mudarabah/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId,
          totalProfit: distData.totalProfit,
          userSharePercentage: distData.userSharePercentage,
          platformSharePercentage: distData.platformSharePercentage,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      toast.success("Profit distributed successfully!");
      setDistData({ ...distData, totalProfit: "" });
      fetchPool();
    } catch (error: any) {
      toast.error(error.message || "Error distributing profit");
    } finally {
      setIsDistributing(false);
    }
  };

  const handleShareChange = (e: React.ChangeEvent<HTMLInputElement>, field: "user" | "platform") => {
    const val = parseFloat(e.target.value) || 0;
    if (val > 100) return;
    
    if (field === "user") {
      setDistData({
        ...distData,
        userSharePercentage: val.toString(),
        platformSharePercentage: (100 - val).toString(),
      });
    } else {
      setDistData({
        ...distData,
        platformSharePercentage: val.toString(),
        userSharePercentage: (100 - val).toString(),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="p-8 text-center text-gray-500">
        Pool not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900/50 p-4 md:p-6 lg:p-8 transition-colors duration-200">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-full bg-white p-2 text-gray-400 shadow-sm hover:text-gray-900 dark:bg-slate-800 dark:border-slate-700 border hover:bg-gray-50 border-gray-100 dark:hover:bg-slate-700/50"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{pool.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage investors and distributions</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-800">
            <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400 text-sm">
              <BanknotesIcon className="w-5 h-5 text-indigo-500" />
              Total Deposited
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">${pool.totalDeposited.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">out of ${pool.targetAmount.toLocaleString()} target</p>
          </div>
          
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-800">
            <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400 text-sm">
              <UserGroupIcon className="w-5 h-5 text-blue-500" />
              Total Investors
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{pool.investments.length}</p>
            <p className="text-xs text-gray-400 mt-1">active participants</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-800">
            <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400 text-sm">
              <ChartPieIcon className="w-5 h-5 text-green-500" />
              Distributions Made
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{pool.distributions.length}</p>
            <p className="text-xs text-gray-400 mt-1">profit payouts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content: Investors */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-800 overflow-hidden">
              <div className="border-b border-gray-100 dark:border-slate-800/60 p-5 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Active Investors</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-slate-800/60">
                {pool.investments.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No investors yet in this pool.
                  </div>
                ) : (
                  pool.investments.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-700">
                          {inv.user.image ? (
                            <Image src={inv.user.image} alt="" fill className="object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-500 dark:text-gray-400 uppercase">
                              {(inv.user.name || inv.user.email || "?").charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {inv.user.name || "Anonymous User"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{inv.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">${inv.amount.toLocaleString()}</p>
                        <p className="text-xs text-green-500 font-medium">Earned +${inv.profitEarned.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Distribution Form */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-green-100 bg-green-50/30 p-5 shadow-sm dark:border-green-900/30 dark:bg-green-900/10">
              <h3 className="font-semibold text-green-800 dark:text-green-400 mb-4 flex items-center gap-2">
                <BanknotesIcon className="w-5 h-5" />
                Distribute Profit
              </h3>
              
              <form onSubmit={handleDistributeProfit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Total Profit Generated ($)
                  </label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="e.g. 1000"
                    value={distData.totalProfit}
                    onChange={(e) => setDistData({ ...distData, totalProfit: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex justify-between">
                      User Share %
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      max="100"
                      value={distData.userSharePercentage}
                      onChange={(e) => handleShareChange(e, "user")}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex justify-between">
                      Platform Share %
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      max="100"
                      value={distData.platformSharePercentage}
                      onChange={(e) => handleShareChange(e, "platform")}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400 space-y-1.5 border border-green-100 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span>Pool Total:</span>
                    <span className="font-medium text-gray-900 dark:text-white">${pool.totalDeposited.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>User Profit Pool:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      ${((parseFloat(distData.totalProfit) || 0) * (parseFloat(distData.userSharePercentage) / 100)).toFixed(2)}
                    </span>
                  </div>
                  <p className="pt-1 text-[11px] border-t border-gray-100 dark:border-slate-700 mt-1">
                    Users will receive proportional profit directly to their main balance.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isDistributing || !distData.totalProfit || pool.totalDeposited <= 0}
                  className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
                >
                  {isDistributing ? (
                    <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircleIcon className="w-5 h-5" />
                  )}
                  {isDistributing ? "Processing..." : "Distribute Profit Now"}
                </button>
              </form>
            </div>

            {/* Distribution History */}
            {pool.distributions.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-800 overflow-hidden text-sm">
                <div className="bg-gray-50 dark:bg-slate-800/50 p-4 border-b border-gray-100 dark:border-slate-800/60 font-semibold text-gray-900 dark:text-white">
                  Distribution History
                </div>
                <div className="divide-y divide-gray-100 dark:divide-slate-800/60 max-h-64 overflow-y-auto">
                  {pool.distributions.map((dist, idx) => (
                    <div key={dist.id} className="p-4 space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">Total: ${dist.totalProfit.toLocaleString()}</span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(dist.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex text-xs justify-between text-gray-500 dark:text-gray-400">
                        <span>Users ({dist.userSharePercentage}%)</span>
                        <span className="text-green-600 font-medium">+${(dist.totalProfit * (dist.userSharePercentage / 100)).toFixed(2)} distributed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
