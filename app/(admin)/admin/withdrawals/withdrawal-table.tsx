"use client"

import { useState, useTransition } from "react"
import { processWithdrawal } from "@/app/actions/admin/withdrawal"
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline"

export default function WithdrawalTable({ requests }: { requests: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleAction = (id: string, action: "APPROVE" | "REJECT") => {
        setLoadingId(id)
        setMessage(null)
        startTransition(async () => {
            try {
                const res = await processWithdrawal(id, action)
                if (res?.success) {
                    setMessage({ type: 'success', text: `Request ${action === 'APPROVE' ? 'Approved' : 'Rejected'} successfully.` })
                } else {
                    setMessage({ type: 'error', text: res?.error || "Action failed." })
                }
            } catch (error) {
                setMessage({ type: 'error', text: "An error occurred." })
            } finally {
                setLoadingId(null)
            }
        })
    }

    // Helper to clear message
    if (message) {
        setTimeout(() => setMessage(null), 5000)
    }

    return (
        <div className="space-y-4">
            {message && (
                <div className={`p-4 rounded-xl text-center font-bold text-sm shadow-sm border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {message.text}
                </div>
            )}
            
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {requests.length === 0 ? (
                     <div className="p-8 text-center text-gray-400 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">No pending withdrawal requests.</div>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
                             <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white text-sm truncate max-w-[150px]">{req.user.email}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{req.method}</div>
                                </div>
                                <div className="text-right">
                                     <div className="font-bold text-gray-900 dark:text-white text-lg">${req.amount.toFixed(2)}</div>
                                     {req.convertedAmount && (
                                         <div className="text-[11px] text-gray-500 dark:text-slate-500 font-medium">
                                             {req.convertedAmount.toLocaleString()} {req.currency}
                                         </div>
                                     )}
                                     <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bal: ${req.user.balance.toFixed(2)}</div>
                                </div>
                             </div>

                             <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                                <span className="text-[10px] text-gray-400 font-black uppercase block mb-1 tracking-widest">Destination</span>
                                <div className="font-mono text-xs break-all text-gray-600 dark:text-slate-300">
                                    {req.destinationAddress}
                                </div>
                             </div>

                             <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => handleAction(req.id, "APPROVE")}
                                    disabled={!!loadingId}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 font-bold text-xs shadow-sm shadow-green-200"
                                >
                                    {loadingId === req.id ? <ClockIcon className="w-4 h-4 animate-spin"/> : <CheckCircleIcon className="w-5 h-5" />}
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleAction(req.id, "REJECT")}
                                    disabled={!!loadingId}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 font-bold text-xs"
                                >
                                    {loadingId === req.id ? <ClockIcon className="w-4 h-4 animate-spin"/> : <XCircleIcon className="w-5 h-5" />}
                                    Reject
                                </button>
                             </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Balance</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Destination</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 italic">
                                        No pending withdrawal requests.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white capitalize">{req.user.email?.split('@')[0]}</div>
                                            <div className="text-[10px] text-gray-400 font-mono tracking-tighter opacity-70">{req.user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${req.type === 'CRYPTO' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'}`}>
                                                {req.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-600 dark:text-slate-400 text-xs">
                                            ${req.user.balance.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 dark:text-white font-bold">${req.amount.toFixed(2)}</span>
                                                {req.convertedAmount && (
                                                    <span className="text-[10px] text-gray-500 dark:text-slate-500 font-medium leading-none mt-1">
                                                        {req.convertedAmount.toLocaleString()} {req.currency}
                                                    </span>
                                                )}
                                                {req.exchangeRate && (
                                                    <span className="text-[9px] text-gray-400 dark:text-slate-600 leading-tight mt-0.5">
                                                        @ {req.exchangeRate}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-[10px] text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg w-fit max-w-[240px] truncate" title={req.destinationAddress}>
                                                {req.destinationAddress}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400 whitespace-nowrap text-[10px] font-medium uppercase tracking-tighter">
                                            {new Date(req.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleAction(req.id, "APPROVE")}
                                                    disabled={!!loadingId}
                                                    className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all hover:scale-110 disabled:opacity-50"
                                                    title="Approve"
                                                >
                                                    {loadingId === req.id ? <ClockIcon className="w-5 h-5 animate-spin"/> : <CheckCircleIcon className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, "REJECT")}
                                                    disabled={!!loadingId}
                                                    className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all hover:scale-110 disabled:opacity-50"
                                                    title="Reject"
                                                >
                                                    {loadingId === req.id ? <ClockIcon className="w-5 h-5 animate-spin"/> : <XCircleIcon className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
