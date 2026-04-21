"use client"

import { useState } from "react"
import { format } from "date-fns"
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  UsersIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  XMarkIcon,
  UserIcon
} from "@heroicons/react/24/outline"
import { 
  triggerForwardAdjustment, 
  triggerReverseAdjustment 
} from "@/app/actions/admin/daily-pools"
import { updateUserPoolSharing } from "@/app/actions/admin/pool-settings"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

export function DailyPoolsAdminClient({ pools, companyEarnings }: { pools: any[], companyEarnings: number }) {
    const [search, setSearch] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [isBackfilling, setIsBackfilling] = useState(false)
    
    // Sharing Settings Modal State
    const [isSharingModalOpen, setIsSharingModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [tempInvestorShare, setTempInvestorShare] = useState(80)
    const [tempReferrerShare, setTempReferrerShare] = useState(20)
    const [isSaving, setIsSaving] = useState(false)

    const handleForward = async () => {
        if (!confirm("Are you sure you want to execute a Forward Adjustment (+1 Day)? This will automatically advance all ACTIVE pools and credit the system 1% profit strictly.")) return;
        
        setIsProcessing(true)
        const res = await triggerForwardAdjustment()
        setIsProcessing(false)
        
        if (res.success) {
            toast.success(res.message, { duration: 5000 })
        } else {
            toast.error(res.message)
        }
    }

    const handleReverse = async () => {
        if (!confirm("CRITICAL ACTION: Are you sure you want to execute a Reverse Adjustment (-1 Day)? This will rollback profit yields by exactly 24 hours on all ACTIVE pools and deduct the balance from digital wallets (safely bounded to zero to prevent debt). COMPLETED pools will be completely ignored.")) return
        
        setIsBackfilling(true)
        try {
            const result = await triggerReverseAdjustment()
            if (result.success) {
                toast.success(result.message, { duration: 6000 })
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("Failed to execute reverse adjustment.")
        } finally {
            setIsBackfilling(false)
        }
    }

    const openSharingModal = (user: any) => {
        setSelectedUser(user)
        setTempInvestorShare(user.poolInvestorShare ?? 80)
        setTempReferrerShare(user.poolReferrerShare ?? 20)
        setIsSharingModalOpen(true)
    }

    const handleSaveSharing = async () => {
        if (tempInvestorShare + tempReferrerShare !== 100) {
            toast.error("Total share must be 100%")
            return
        }
        setIsSaving(true)
        const res = await updateUserPoolSharing(selectedUser.id, tempInvestorShare, tempReferrerShare)
        setIsSaving(false)
        if (res.success) {
            toast.success(res.message)
            setIsSharingModalOpen(false)
            // Revalidation will handle the UI update
        } else {
            toast.error(res.message)
        }
    }

    const filteredPools = pools.filter((p: any) => {
        const query = search.toLowerCase()
        return p.user?.email?.toLowerCase().includes(query) ||
               p.user?.name?.toLowerCase().includes(query) ||
               p.user?.memberId?.toLowerCase().includes(query)
    })

    const activePools = pools.filter((p: any) => p.status === "ACTIVE")
    const totalAllocated = activePools.reduce((sum: number, p: any) => sum + p.amount, 0)
    
    const uniqueActiveUsers = new Set(activePools.map((p: any) => p.userId)).size
    const totalDistributedProfit = pools.reduce((sum: number, p: any) => sum + p.profitEarned, 0)

    // Check for pending distributions
    const getMidnightNY = (date: Date | string) => {
        const nyDate = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/New_York",
            year: "numeric", month: "numeric", day: "numeric"
        }).format(new Date(date));
        return new Date(nyDate);
    };

    const nowNY = getMidnightNY(new Date());
    const isPendingDistribution = activePools.some((p: any) => {
        const lastNY = getMidnightNY(p.lastCalculatedDate);
        const daysPassed = Math.floor((nowNY.getTime() - lastNY.getTime()) / (24 * 60 * 60 * 1000));
        return daysPassed >= 1;
    });

    return (
        <div className="space-y-6">
            
            {/* Smart Notification Banner */}
            <AnimatePresence>
                {isPendingDistribution && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                </span>
                            </div>
                            <div>
                                <h4 className="text-amber-700 dark:text-amber-500 font-black tracking-tight">System Notification</h4>
                                <p className="text-xs font-bold text-amber-600/70 dark:text-amber-400/80 uppercase tracking-widest mt-1">
                                    1-day profit distribution pending. Please review admin action.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Bar */}
            <div className="flex flex-wrap justify-end gap-4 mb-2">
                <button 
                   onClick={handleReverse}
                   disabled={isBackfilling || isProcessing}
                   className="flex items-center gap-2 px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] sm:text-xs rounded-2xl shadow-xl shadow-rose-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                    {isBackfilling ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Reversing...
                        </>
                    ) : (
                        <>
                            <ArrowPathIcon className="w-5 h-5" />
                            Reverse Adjustment (-1 Day)
                        </>
                    )}
                </button>

                <button 
                   onClick={handleForward}
                   disabled={isProcessing || isBackfilling}
                   className="flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[10px] sm:text-xs rounded-2xl shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                    {isProcessing ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <PlayIcon className="w-5 h-5" />
                            Forward Adjustment (+1 Day)
                        </>
                    )}
                </button>
            </div>

            {/* Top Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <CurrencyDollarIcon className="w-32 h-32 transform translate-x-8 -translate-y-8" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Total Pool Amount</p>
                                <h3 className="text-4xl font-black">${totalAllocated.toFixed(2)}</h3>
                            </div>
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                                <CurrencyDollarIcon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="text-sm font-medium text-indigo-100 flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                           Live Active Allocation
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Users Invested</p>
                            <h3 className="text-4xl font-black text-gray-900 dark:text-white">{uniqueActiveUsers}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                            <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                        Unique user accounts currently locked in active pools.
                    </p>
                </div>
                
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Company Referral Earnings</p>
                            <h3 className="text-4xl font-black text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform origin-left">
                                ${companyEarnings.toFixed(2)}
                            </h3>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                            <ChartBarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                        Total profit captured from un-referred members or direct-to-company signups.
                    </p>
                </div>
            </div>

            {/* Main Table Interface */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/20">
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            type="text"
                            placeholder="Find user by email, name, or Member ID..."
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                            value={search}
                            onChange={(e: any) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-widest font-black">
                                <th className="px-6 py-4">Investor</th>
                                <th className="px-6 py-4">Inv. Amount</th>
                                <th className="px-6 py-4">Daily Yield (1%)</th>
                                <th className="px-6 py-4">Direct Referrer</th>
                                <th className="px-6 py-4">Profit Split</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredPools.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                        No pools match your search query.
                                    </td>
                                </tr>
                            ) : (
                                filteredPools.map((pool: any) => (
                                    <tr key={pool.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                                                    {pool.user?.name ? pool.user.name.charAt(0).toUpperCase() : "?"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{pool.user?.name || "Unknown"}</span>
                                                    <span className="text-[10px] text-gray-500">{pool.user?.email}</span>
                                                    <span className="text-[9px] text-indigo-500 font-mono mt-0.5 font-bold uppercase tracking-widest">{pool.user?.memberId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-black text-gray-900 dark:text-white text-sm">
                                                ${pool.amount.toFixed(2)}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                                +${pool.profitEarned.toFixed(2)}
                                            </span>
                                            <p className="text-[9px] text-gray-400 font-medium">Total Distributed</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            {pool.user?.referrer ? (
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{pool.user.referrer.name}</span>
                                                    <span className="text-[10px] text-gray-500">{pool.user.referrer.email}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-medium italic">Direct Partner</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-5 h-2.5 rounded-sm bg-indigo-500" />
                                                    <span className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-300">Inv: {pool.user?.poolInvestorShare ?? 80}%</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-5 h-2.5 rounded-sm bg-purple-500" />
                                                    <span className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-300">Ref: {pool.user?.poolReferrerShare ?? 20}%</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                pool.status === 'ACTIVE' 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                                                : pool.status === 'COMPLETED'
                                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                                                : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                            }`}>
                                                {pool.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => openSharingModal(pool.user)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 hover:text-indigo-600 rounded-lg transition-colors"
                                                title="Split Settings"
                                            >
                                                <Cog6ToothIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sharing Settings Modal */}
            <AnimatePresence>
                {isSharingModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSaving && setIsSharingModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-[2rem] p-8 relative z-10 shadow-2xl">
                            <button onClick={() => !isSaving && setIsSharingModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors bg-gray-100 dark:bg-slate-800 rounded-full">
                                <XMarkIcon className="w-5 h-5" />
                            </button>

                            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Pool Split Settings</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-6">Customize profit distribution percentages for this user.</p>

                            <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 mb-8">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                    {selectedUser.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-900 dark:text-white">{selectedUser.name}</p>
                                    <p className="text-[10px] text-gray-500 font-medium">{selectedUser.email}</p>
                                </div>
                            </div>

                            <div className="space-y-6 mb-8">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Investor Share (to User)</label>
                                        <span className="text-sm font-black text-indigo-600">{tempInvestorShare}%</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="100" step="5"
                                        value={tempInvestorShare}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value)
                                            setTempInvestorShare(val)
                                            setTempReferrerShare(100 - val)
                                        }}
                                        className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Referrer Share (to Ali/Referrer)</label>
                                        <span className="text-sm font-black text-purple-600">{tempReferrerShare}%</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="100" step="5"
                                        value={tempReferrerShare}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value)
                                            setTempReferrerShare(val)
                                            setTempInvestorShare(100 - val)
                                        }}
                                        className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleSaveSharing}
                                disabled={isSaving}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black tracking-widest uppercase text-[10px] rounded-xl transition-all shadow-xl shadow-indigo-500/25 active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? "Saving..." : "Apply Configuration"}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
