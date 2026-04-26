"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { rewardSurpriseWinner, dismissSurpriseWinner } from "@/app/actions/admin/surprise-winners"
import { GiftIcon, CheckCircleIcon, XMarkIcon, ClockIcon } from "@heroicons/react/24/outline"
import { SparklesIcon } from "@heroicons/react/24/solid"
import toast from "react-hot-toast"

type Winner = {
    id: string
    userId: string
    userName: string | null
    userEmail: string | null
    spinType: string
    status: string
    adminRewardNote: string | null
    rewardedAt: Date | null
    createdAt: Date
    user: {
        id: string
        name: string | null
        email: string | null
        arnBalance: number
        balance: number
    }
}

type Props = {
    initialWinners: Winner[]
}

export default function SurpriseWinnersClient({ initialWinners }: Props) {
    const [winners, setWinners] = useState<Winner[]>(initialWinners)
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "REWARDED" | "DISMISSED">("PENDING")
    const [rewardNotes, setRewardNotes] = useState<Record<string, string>>({})
    const [rewardAmounts, setRewardAmounts] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState<Record<string, boolean>>({})
    const router = useRouter()

    const filtered = filter === "ALL" ? winners : winners.filter(w => w.status === filter)

    const pendingCount = winners.filter(w => w.status === "PENDING").length

    const handleReward = async (id: string) => {
        const note = rewardNotes[id]?.trim() || "Spin Reward"
        const amountStr = rewardAmounts[id]?.trim()
        const amount = parseFloat(amountStr || "0")

        if (!amountStr || isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid reward amount (ARN)")
            return
        }
        
        setLoading(prev => ({ ...prev, [id]: true }))
        const res = await rewardSurpriseWinner(id, amount, note)
        if (res.success) {
            toast.success(`Success! ${amount} ARN credited to user.`)
            router.refresh()
            setWinners(prev => prev.map(w => w.id === id ? { ...w, status: "REWARDED", adminRewardNote: note, rewardedAt: new Date() } : w))
        } else {
            const errorMsg = (res as any).error || "Unknown error"
            toast.error("Failed to assign reward: " + errorMsg)
        }
        setLoading(prev => ({ ...prev, [id]: false }))
    }

    const handleDismiss = async (id: string) => {
        if (!confirm("Dismiss this Surprise Bonus winner? This will mark them as reviewed with no reward.")) return
        setLoading(prev => ({ ...prev, [id]: true }))
        const res = await dismissSurpriseWinner(id)
        if (res.success) {
            toast.success("Winner dismissed")
            router.refresh()
            setWinners(prev => prev.map(w => w.id === id ? { ...w, status: "DISMISSED" } : w))
        } else {
            toast.error("Failed: " + res.error)
        }
        setLoading(prev => ({ ...prev, [id]: false }))
    }

    return (
        <div className="space-y-6">
            {/* Header + Stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-pink-500 dark:bg-pink-400 rounded-full" />
                        Surprise Bonus Winners
                        {pendingCount > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-pink-500 text-white text-xs font-black rounded-full animate-pulse">
                                {pendingCount} pending
                            </span>
                        )}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Users who landed on Surprise Bonus. Assign a custom reward manually.
                    </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                    {(["PENDING", "REWARDED", "DISMISSED", "ALL"] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                                filter === f
                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            }`}
                        >
                            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Empty State */}
            {filtered.length === 0 && (
                <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center">
                        <GiftIcon className="w-8 h-8 text-pink-400" />
                    </div>
                    <p className="font-bold text-slate-700 dark:text-white">
                        {filter === "PENDING" ? "No pending winners right now" : `No ${filter.toLowerCase()} winners`}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {filter === "PENDING" ? "Winners appear here when a user lands on a Surprise Bonus segment." : "Use the filter above to view other statuses."}
                    </p>
                </div>
            )}

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {filtered.map(winner => (
                    <div key={winner.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm ${
                                    winner.spinType === "PREMIUM" ? "bg-amber-500" : "bg-indigo-600"
                                }`}>
                                    {(winner.user.name || winner.user.email || "?").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{winner.user.name || "—"}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">{winner.user.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                    winner.spinType === "PREMIUM"
                                        ? "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                        : "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                                }`}>
                                    {winner.spinType === "PREMIUM" ? "Premium" : "Basic"}
                                </span>
                                <WinnerStatusBadge status={winner.status} />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Won: {new Date(winner.createdAt).toLocaleString()}</p>
                        {winner.status === "REWARDED" && winner.adminRewardNote && (
                            <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3">
                                <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">{winner.adminRewardNote}</p>
                            </div>
                        )}
                        {winner.status === "PENDING" && (
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Amount (ARN)"
                                        className="w-24 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-pink-500 text-slate-900 dark:text-white"
                                        value={rewardAmounts[winner.id] || ""}
                                        onChange={e => setRewardAmounts(prev => ({ ...prev, [winner.id]: e.target.value }))}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Note (optional)"
                                        className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-pink-500 text-slate-900 dark:text-white"
                                        value={rewardNotes[winner.id] || ""}
                                        onChange={e => setRewardNotes(prev => ({ ...prev, [winner.id]: e.target.value }))}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleReward(winner.id)}
                                        disabled={loading[winner.id]}
                                        className="flex-1 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-bold rounded-xl text-xs transition-all"
                                    >
                                        {loading[winner.id] ? "Saving..." : "✓ Assign Reward"}
                                    </button>
                                    <button
                                        onClick={() => handleDismiss(winner.id)}
                                        disabled={loading[winner.id]}
                                        className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-500 font-bold rounded-xl text-xs transition-all"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Desktop Table */}
            {filtered.length > 0 && (
                <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/50">
                            <tr>
                                <th className="pl-6 pr-4 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">User</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Spin Type</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Won At</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-4 pr-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Reward / Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {filtered.map(winner => (
                                <tr key={winner.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td className="pl-6 pr-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 ${
                                                winner.spinType === "PREMIUM" ? "bg-amber-500" : "bg-indigo-600"
                                            }`}>
                                                {(winner.user.name || winner.user.email || "?").charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{winner.user.name || "—"}</p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500">{winner.user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${
                                            winner.spinType === "PREMIUM"
                                                ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20"
                                                : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-500/20"
                                        }`}>
                                            {winner.spinType === "PREMIUM" ? (
                                                <SparklesIcon className="w-3 h-3" />
                                            ) : (
                                                <GiftIcon className="w-3 h-3" />
                                            )}
                                            {winner.spinType === "PREMIUM" ? "Premium" : "Basic"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <ClockIcon className="w-3.5 h-3.5" />
                                            {new Date(winner.createdAt).toLocaleDateString()} {new Date(winner.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <WinnerStatusBadge status={winner.status} />
                                    </td>
                                    <td className="px-4 pr-6 py-4">
                                        {winner.status === "REWARDED" && (
                                            <div className="flex items-start gap-1.5 max-w-xs">
                                                <CheckCircleIcon className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium leading-tight">{winner.adminRewardNote}</span>
                                            </div>
                                        )}
                                        {winner.status === "DISMISSED" && (
                                            <span className="text-xs text-slate-400 dark:text-slate-500 italic">Dismissed</span>
                                        )}
                                        {winner.status === "PENDING" && (
                                            <div className="flex items-center gap-2 min-w-[350px]">
                                                <input
                                                    type="number"
                                                    placeholder="Amount"
                                                    className="w-20 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-pink-500 text-slate-900 dark:text-white transition-all"
                                                    value={rewardAmounts[winner.id] || ""}
                                                    onChange={e => setRewardAmounts(prev => ({ ...prev, [winner.id]: e.target.value }))}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 50 ARN bonus"
                                                    className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-pink-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                                                    value={rewardNotes[winner.id] || ""}
                                                    onChange={e => setRewardNotes(prev => ({ ...prev, [winner.id]: e.target.value }))}
                                                    onKeyDown={e => e.key === "Enter" && handleReward(winner.id)}
                                                />
                                                <button
                                                    onClick={() => handleReward(winner.id)}
                                                    disabled={loading[winner.id]}
                                                    className="px-3 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-bold rounded-xl text-xs transition-all whitespace-nowrap active:scale-95"
                                                >
                                                    {loading[winner.id] ? "..." : "Assign"}
                                                </button>
                                                <button
                                                    onClick={() => handleDismiss(winner.id)}
                                                    disabled={loading[winner.id]}
                                                    className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
                                                    title="Dismiss"
                                                >
                                                    <XMarkIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

function WinnerStatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PENDING: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20",
        REWARDED: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20",
        DISMISSED: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    }
    const labels: Record<string, string> = {
        PENDING: "Pending",
        REWARDED: "Rewarded",
        DISMISSED: "Dismissed",
    }
    return (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${styles[status] || styles.PENDING}`}>
            {labels[status] || status}
        </span>
    )
}
