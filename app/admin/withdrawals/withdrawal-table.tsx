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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {message && (
                <div className={`p-4 text-center font-bold text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}
            
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
    )
}
