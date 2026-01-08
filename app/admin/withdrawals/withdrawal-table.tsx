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
                <div className={`p-4 rounded-xl text-center font-bold text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}
            
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {requests.length === 0 ? (
                     <div className="p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">No pending withdrawal requests.</div>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                             <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{req.user.email}</div>
                                    <div className="text-xs text-gray-400 font-mono">{req.user.id.slice(0, 8)}...</div>
                                </div>
                                <div className="text-right">
                                     <div className="font-bold text-gray-900 text-lg">${req.amount.toFixed(2)}</div>
                                     <div className="text-xs text-gray-400">Bal: ${req.user.balance.toFixed(2)}</div>
                                </div>
                             </div>

                             <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Destination</span>
                                <div className="font-mono text-xs break-all text-gray-600">
                                    {req.destinationAddress || req.description}
                                </div>
                             </div>

                             <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => handleAction(req.id, "APPROVE")}
                                    disabled={!!loadingId}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50 font-bold text-xs"
                                >
                                    {loadingId === req.id ? <ClockIcon className="w-4 h-4 animate-spin"/> : <CheckCircleIcon className="w-5 h-5" />}
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleAction(req.id, "REJECT")}
                                    disabled={!!loadingId}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 font-bold text-xs"
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
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Balance</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Address (TRC20)</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                        No pending withdrawal requests.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{req.user.email}</div>
                                            <div className="text-xs text-gray-400 font-mono">{req.user.id.slice(0, 8)}...</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-600">
                                            ${req.user.balance.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            ${req.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded w-fit max-w-[200px] truncate" title={req.destinationAddress || req.description}>
                                                {req.destinationAddress || req.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {new Date(req.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleAction(req.id, "APPROVE")}
                                                    disabled={!!loadingId}
                                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                                                    title="Approve"
                                                >
                                                    {loadingId === req.id ? <ClockIcon className="w-5 h-5 animate-spin"/> : <CheckCircleIcon className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, "REJECT")}
                                                    disabled={!!loadingId}
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
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
