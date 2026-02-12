"use client"

import { useState, useTransition } from "react"
import { approveTaskCompletion, rejectTaskCompletion } from "@/app/actions/admin/task-approvals"
import { CheckCircleIcon, XCircleIcon, ArrowTopRightOnSquareIcon, PhotoIcon } from "@heroicons/react/24/outline"

export default function ApprovalClient({ completions }: { completions: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [feedback, setFeedback] = useState<string | null>(null)
    const [remarks, setRemarks] = useState<{[key: string]: string}>({})

    const handleApprove = (id: string) => {
        if (!confirm("Are you sure you want to approve this task?")) return
        startTransition(async () => {
            const res = await approveTaskCompletion(id, remarks[id])
            if (res?.success) {
                setFeedback("Task Approved")
            } else {
                setFeedback(res?.error || "Failed")
            }
            setTimeout(() => setFeedback(null), 3000)
        })
    }

    const handleReject = (id: string) => {
        if (!confirm("Are you sure you want to REJECT this task?")) return
        startTransition(async () => {
            const res = await rejectTaskCompletion(id, remarks[id])
             if (res?.success) {
                setFeedback("Task Rejected")
            } else {
                setFeedback(res?.error || "Failed")
            }
             setTimeout(() => setFeedback(null), 3000)
        })
    }

    if (completions.length === 0) {
        return <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">No pending tasks to review.</div>
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {feedback && (
                <div className="bg-indigo-600 text-white p-2 text-center text-sm font-bold">
                    {feedback}
                </div>
            )}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Info</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proof</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {completions.map((completion) => (
                        <tr key={completion.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{completion.user.name || "Unknown"}</div>
                                <div className="text-xs text-gray-500">{completion.user.email}</div>
                                <div className="text-[10px] text-gray-400 font-mono mt-1">ID: {completion.user.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{completion.task.title}</div>
                                <div className="text-xs text-green-600 font-bold">{completion.task.reward} ARN</div>
                                <div className="text-xs text-gray-400">
                                    {new Date(completion.createdAt).toISOString().split('T')[0]}
                                </div>
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                                {completion.proof?.startsWith("/uploads") ? (
                                    <a href={completion.proof} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                                        <PhotoIcon className="w-4 h-4" /> View Image
                                    </a>
                                ) : (
                                    <div className="max-w-xs truncate text-sm text-gray-600" title={completion.proof}>
                                        {completion.proof}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <input 
                                    type="text" 
                                    placeholder="Optional remarks..." 
                                    className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    onChange={(e) => setRemarks(prev => ({ ...prev, [completion.id]: e.target.value }))}
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button 
                                    onClick={() => handleApprove(completion.id)}
                                    disabled={isPending}
                                    className="text-green-600 hover:text-green-900 disabled:opacity-50 font-bold"
                                >
                                    Approve
                                </button>
                                <button 
                                    onClick={() => handleReject(completion.id)}
                                    disabled={isPending}
                                    className="text-red-600 hover:text-red-900 disabled:opacity-50 font-bold"
                                >
                                    Reject
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
