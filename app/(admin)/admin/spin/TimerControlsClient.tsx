"use client"

import { useState } from "react"
import { searchUserForSpinReset, resetFreeSpinTimer, resetPremiumSpinTimer } from "@/app/actions/admin/spin-timers"
import { MagnifyingGlassIcon, ClockIcon, LockClosedIcon } from "@heroicons/react/24/outline"
import toast from "react-hot-toast"

export default function TimerControlsClient() {
    const [userId, setUserId] = useState("")
    const [searching, setSearching] = useState(false)
    const [resettingFree, setResettingFree] = useState(false)
    const [resettingPremium, setResettingPremium] = useState(false)
    const [userResult, setUserResult] = useState<any>(null)

    const handleSearch = async () => {
        if (!userId.trim()) {
            toast.error("Please enter a search term")
            return
        }

        setSearching(true)
        setUserResult(null)

        try {
            const result = await searchUserForSpinReset(userId)
            
            if (result.success) {
                setUserResult(result.user)
                toast.success("User found")
            } else {
                toast.error(result.message || "User not found")
            }
        } catch (error) {
            toast.error("An error occurred while searching")
            console.error(error)
        } finally {
            setSearching(false)
        }
    }

    const handleResetFreeSpin = async () => {
        if (!userResult?.id) return

        setResettingFree(true)

        try {
            const result = await resetFreeSpinTimer(userResult.id)
            
            if (result.success) {
                toast.success(result.message || "Free Spin timer reset successfully")
                // Refresh user data
                await handleSearch()
            } else {
                toast.error(result.message || "Failed to reset timer")
            }
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        } finally {
            setResettingFree(false)
        }
    }

    const handleResetPremiumSpin = async () => {
        if (!userResult?.id) return

        setResettingPremium(true)

        try {
            const result = await resetPremiumSpinTimer(userResult.id)
            
            if (result.success) {
                toast.success(result.message || "Premium Spin timer reset successfully")
                // Refresh user data
                await handleSearch()
            } else {
                toast.error(result.message || "Failed to reset timer")
            }
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        } finally {
            setResettingPremium(false)
        }
    }

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Search Section */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/80 shadow-sm p-8 backdrop-blur-sm">
                <div className="mb-6 flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                        <MagnifyingGlassIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">User Verification</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Locate a specific account to manually override spin cooldown timers.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={userId}
                            onChange={(e: any) => setUserId(e.target.value)}
                            onKeyDown={(e: any) => e.key === "Enter" && handleSearch()}
                            placeholder="Search by User ID, Email, or Full Name..."
                            className="w-full pl-12 pr-4 h-14 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-[1.25rem] text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={searching || !userId.trim()}
                        className="h-14 px-8 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-[1.25rem] hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                        {searching ? (
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : "Execute Search"}
                    </button>
                </div>
            </div>

            {/* User Result Section */}
            {userResult && (
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-indigo-100/50 dark:border-indigo-500/20 p-8 shadow-xl shadow-indigo-500/5 space-y-8 relative overflow-hidden transition-all animate-in slide-in-from-bottom-4 duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
                    
                    {/* User Info Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800/50">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30">
                                {userResult.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-none mb-1">{userResult.name || "Anonymous User"}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{userResult.email}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Membership Type</span>
                                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                                    userResult.isActiveMember ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                                }`}>
                                    {userResult.isActiveMember ? "Premium Partner" : "Standard User"}
                                </span>
                            </div>
                            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Reference ID</span>
                                <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300">#{userResult.id.slice(-8).toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Free Spin Card */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 hover:border-indigo-500/30 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm group-hover:shadow-indigo-500/10 transition-all">
                                        <ClockIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Free Spin Timer</h4>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                    userResult.freeSpinStatus === "Available" 
                                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20" 
                                        : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20"
                                }`}>
                                    {userResult.freeSpinStatus}
                                </span>
                            </div>
                            
                            <div className="mb-6">
                                <div className="flex justify-between text-[11px] mb-2 font-bold tracking-tight">
                                    <span className="text-slate-400 dark:text-slate-500">REMAINING COOLDOWN</span>
                                    <span className="text-slate-900 dark:text-white font-mono">{userResult.freeSpinHoursRemaining}h</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-indigo-500 h-full rounded-full transition-all duration-1000" 
                                        style={{ width: `${Math.max(0, Math.min(100, (48 - userResult.freeSpinHoursRemaining) / 48 * 100))}%` }} 
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleResetFreeSpin}
                                disabled={resettingFree || userResult.freeSpinStatus === "Available"}
                                className="w-full py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 dark:hover:bg-indigo-500 dark:hover:border-indigo-500 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                            >
                                {resettingFree ? "Processing..." : "Force Reset Timer"}
                            </button>
                        </div>

                        {/* Premium Spin Card */}
                        <div className={`p-6 rounded-[2rem] border transition-all group ${
                            userResult.isActiveMember 
                                ? "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700/50 hover:border-amber-500/30" 
                                : "bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-75"
                        }`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm group-hover:shadow-amber-500/10 transition-all">
                                        {userResult.isActiveMember ? (
                                            <ClockIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        ) : (
                                            <LockClosedIcon className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                                        )}
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Premium Spin Timer</h4>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                    userResult.premiumSpinStatus === "Available" 
                                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20" 
                                        : userResult.premiumSpinStatus.includes("Locked") 
                                            ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-700"
                                            : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20"
                                }`}>
                                    {userResult.premiumSpinStatus}
                                </span>
                            </div>
                            
                            <div className="mb-6">
                                <div className="flex justify-between text-[11px] mb-2 font-bold tracking-tight">
                                    <span className="text-slate-400 dark:text-slate-500">REMAINING COOLDOWN</span>
                                    <span className="text-slate-900 dark:text-white font-mono">{userResult.premiumSpinHoursRemaining}h</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
                                        style={{ width: `${Math.max(0, Math.min(100, (24 - userResult.premiumSpinHoursRemaining) / 24 * 100))}%` }} 
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleResetPremiumSpin}
                                disabled={resettingPremium || !userResult.isActiveMember || userResult.premiumSpinStatus === "Available"}
                                className="w-full py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-amber-600 hover:text-white hover:border-amber-600 dark:hover:bg-amber-500 dark:hover:border-amber-500 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                            >
                                {resettingPremium ? "Processing..." : userResult.isActiveMember ? "Force Reset Timer" : "Eligibility Locked"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Help/Advisory Text */}
            <div className="bg-slate-900/5 dark:bg-white/5 rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 flex items-start gap-4">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h5 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Administrative Advisory</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Manually resetting timers bypasses the system's pre-configured award frequencies. This action is irreversible and will grant the user an immediate spin opportunity. Please verify user eligibility before execution. 
                        <strong> Search is active for ID, Email, and Full Name.</strong>
                    </p>
                </div>
            </div>
        </div>
    )
}
