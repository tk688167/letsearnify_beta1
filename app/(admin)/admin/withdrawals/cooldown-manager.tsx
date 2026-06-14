"use client"

import { useState, useTransition, useEffect } from "react"
import { resetWithdrawalTimer } from "@/app/actions/admin/timer"
import { 
    ArrowPathIcon, 
    ClockIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon,
    ShieldExclamationIcon 
} from "@heroicons/react/24/outline"

export default function CooldownManager({ users }: { users: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    
    const [isMounted, setIsMounted] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleReset = (userId: string) => {
        setLoadingId(userId)
        setMessage(null)
        startTransition(async () => {
            try {
                const res = await resetWithdrawalTimer(userId)
                if (res?.success) {
                    setMessage({ type: 'success', text: "Timer reset successfully." })
                } else {
                    setMessage({ type: 'error', text: res?.error || "Failed to reset." })
                }
            } catch (error) {
                setMessage({ type: 'error', text: "An error occurred." })
            } finally {
                setLoadingId(null)
            }
        })
    }
    
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 4000)
            return () => clearTimeout(timer)
        }
    }, [message])

    useEffect(() => {
        if (currentPage > Math.ceil(users.length / itemsPerPage)) {
            setCurrentPage(Math.max(1, Math.ceil(users.length / itemsPerPage)))
        }
    }, [users.length, currentPage])

    if (!users || users.length === 0) return null

    const totalPages = Math.ceil(users.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentUsers = users.slice(startIndex, endIndex)

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
            <div className="bg-white dark:bg-[#0E172B]/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/80 dark:border-slate-800/50 overflow-hidden transition-all duration-300">
                
                {/* 🏷️ HEADER SECTION WITH LIVE BADGE */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800/40 bg-gray-50/50 dark:bg-[#0A1120]/40 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-orange-400 rounded-xl hidden sm:block">
                            <ShieldExclamationIcon className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="font-bold text-gray-900 dark:text-white text-base tracking-tight">Active Withdrawal Cooldowns</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Users locked under temporary security rules or limits.</p>
                        </div>
                    </div>
                    <span className="bg-amber-500/10 dark:bg-orange-500/10 text-amber-700 dark:text-orange-400 text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider whitespace-nowrap border border-amber-500/20 dark:border-orange-500/10 animate-pulse">
                        {users.length} Throttled
                    </span>
                </div>
                
                {/* 🔔 FLOATING NOTIFICATION BANNER */}
                {message && (
                    <div className={`p-3 text-center text-xs font-medium border-b transition-all duration-300 ${
                        message.type === 'success' 
                            ? 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/10' 
                            : 'bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/10'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* 📱 MOBILE UI: GRID CARD STACKS */}
                <div className="block md:hidden divide-y divide-gray-100 dark:divide-slate-800/40">
                    {currentUsers.map((user) => {
                        const lastTime = new Date(user.lastWithdrawalTime).getTime()
                        const nextTime = lastTime + (24 * 60 * 60 * 1000)
                        
                        const now = isMounted ? Date.now() : lastTime
                        const minutesRemaining = Math.max(0, Math.ceil((nextTime - now) / (1000 * 60)))
                        const hours = Math.floor(minutesRemaining / 60)
                        const mins = minutesRemaining % 60

                        return (
                            <div key={user.id} className="p-5 space-y-4 bg-white dark:bg-transparent hover:bg-gray-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1 min-w-0">
                                        <div className="font-bold text-gray-900 dark:text-white text-sm truncate">{user.email}</div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                            {isMounted ? (
                                                new Date(user.lastWithdrawalTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                            ) : (
                                                <span>Loading sessions...</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right whitespace-nowrap bg-gray-50 dark:bg-[#0A1120]/60 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-slate-800/60">
                                        <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Remaining</div>
                                        <div className="font-mono text-amber-600 dark:text-orange-400 font-bold text-xs mt-0.5">
                                            {isMounted ? `${hours}h ${mins}m` : "--"}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleReset(user.id)}
                                    disabled={!!loadingId || isPending}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/5 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white rounded-xl text-xs font-bold border border-red-200/60 dark:border-red-500/10 transition-all active:scale-[0.98] disabled:opacity-40 shadow-sm"
                                >
                                    {loadingId === user.id ? <ClockIcon className="w-4 h-4 animate-spin"/> : <ArrowPathIcon className="w-4 h-4" />}
                                    Unlock & Reset Cooldown
                                </button>
                            </div>
                        )
                    })}
                </div>

                {/* 💻 DESKTOP TABLE UI */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-[#0A1120]/20 text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100 dark:border-slate-800/40">
                            <tr>
                                <th className="px-6 py-4">User Target</th>
                                <th className="px-6 py-4">Last Active Session</th>
                                <th className="px-6 py-4">Cooldown Remaining</th>
                                <th className="px-6 py-4 text-right">Action Trigger</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800/40">
                            {currentUsers.map((user) => {
                                const lastTime = new Date(user.lastWithdrawalTime).getTime()
                                const nextTime = lastTime + (24 * 60 * 60 * 1000)
                                
                                const now = isMounted ? Date.now() : lastTime
                                const minutesRemaining = Math.max(0, Math.ceil((nextTime - now) / (1000 * 60)))
                                const hours = Math.floor(minutesRemaining / 60)
                                const mins = minutesRemaining % 60
                                
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/10 transition-colors group">
                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white max-w-[240px] truncate">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs font-medium">
                                            {isMounted ? (
                                                new Date(user.lastWithdrawalTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                            ) : (
                                                <span>Syncing date...</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-amber-700 dark:text-orange-400 font-bold text-xs bg-amber-500/5 dark:bg-orange-500/10 px-2.5 py-1 rounded-md border border-amber-500/10 dark:border-orange-500/10">
                                                {isMounted ? `${hours}h ${mins}m` : "--h --m"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleReset(user.id)}
                                                disabled={!!loadingId || isPending}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/5 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white rounded-xl text-xs font-bold border border-red-200 dark:border-red-500/10 transition-all active:scale-[0.98] disabled:opacity-40 shadow-sm"
                                            >
                                                {loadingId === user.id ? <ClockIcon className="w-4 h-4 animate-spin"/> : <ArrowPathIcon className="w-4 h-4" />}
                                                Unlock User
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 🌐 RESPONSIVE CONTROLLER COMPACT PAGINATION BAR */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0E172B]/80 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-gray-200/80 dark:border-slate-800/50 shadow-sm">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Showing <span className="font-bold text-gray-900 dark:text-white">{startIndex + 1}</span> to{" "}
                        <span className="font-bold text-gray-900 dark:text-white">
                            {Math.min(endIndex, users.length)}
                        </span>{" "}
                        of <span className="font-bold text-gray-900 dark:text-white">{users.length}</span> entries
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 text-slate-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-gray-200 dark:border-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800/80 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                                    currentPage === page
                                        ? "bg-slate-900 dark:bg-blue-600 text-white shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/60"
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 text-slate-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-gray-200 dark:border-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800/80 disabled:opacity-30 transition-all"
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}