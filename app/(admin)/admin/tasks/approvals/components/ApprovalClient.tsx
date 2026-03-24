"use client"

import { useState, useTransition } from "react"
import { approveTaskCompletion, rejectTaskCompletion } from "@/app/actions/admin/task-approvals"
import { CheckCircleIcon, XCircleIcon, PhotoIcon, EyeIcon } from "@heroicons/react/24/outline"

export default function ApprovalClient({ completions }: { completions: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [feedback, setFeedback] = useState<string | null>(null)
    const [remarks, setRemarks] = useState<{[key: string]: string}>({})
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    const handleApprove = (id: string) => {
        if (!confirm("Are you sure you want to approve this task?")) return
        startTransition(async () => {
            const res = await approveTaskCompletion(id, remarks[id])
            if (res?.success) {
                setFeedback("Task Approved ✅")
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
                setFeedback("Task Rejected ❌")
            } else {
                setFeedback(res?.error || "Failed")
            }
             setTimeout(() => setFeedback(null), 3000)
        })
    }

    const isImageProof = (proof: string | null) => {
        if (!proof) return false
        return proof.startsWith("data:image/") || 
               proof.startsWith("/uploads") || 
               proof.startsWith("http")
    }

    if (completions.length === 0) {
        return <div className="p-12 text-center text-gray-500 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">No pending tasks to review.</div>
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            {feedback && (
                <div className="bg-indigo-600 text-white p-2 text-center text-sm font-bold">
                    {feedback}
                </div>
            )}
            
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proof</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remarks</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {completions.map((completion) => (
                            <tr key={completion.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{completion.user.name || "Unknown"}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{completion.user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">{completion.task.title}</div>
                                    <div className="text-xs text-green-600 font-bold">{completion.task.reward} ARN</div>
                                    <div className="text-xs text-gray-400">
                                        {new Date(completion.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {isImageProof(completion.proof) ? (
                                        <button 
                                            onClick={() => setPreviewImage(completion.proof)}
                                            className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800/50 transition-colors"
                                        >
                                            <EyeIcon className="w-4 h-4" /> Preview Proof
                                        </button>
                                    ) : completion.proof ? (
                                        <div className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-400" title={completion.proof}>
                                            {completion.proof}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">No proof</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input 
                                        type="text" 
                                        placeholder="Optional remarks..." 
                                        className="w-full text-sm border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                        onChange={(e) => setRemarks(prev => ({ ...prev, [completion.id]: e.target.value }))}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button 
                                        onClick={() => handleApprove(completion.id)}
                                        disabled={isPending}
                                        className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 disabled:opacity-50 font-bold rounded-lg border border-green-200 dark:border-green-800/50 transition-colors text-xs"
                                    >
                                        ✓ Approve
                                    </button>
                                    <button 
                                        onClick={() => handleReject(completion.id)}
                                        disabled={isPending}
                                        className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 font-bold rounded-lg border border-red-200 dark:border-red-800/50 transition-colors text-xs"
                                    >
                                        ✗ Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-slate-700">
                {completions.map((completion) => (
                    <div key={completion.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">{completion.user.name || "Unknown"}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{completion.user.email}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-green-600">{completion.task.reward} ARN</div>
                                <div className="text-[10px] text-gray-400">{new Date(completion.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{completion.task.title}</div>
                        
                        {isImageProof(completion.proof) ? (
                            <button 
                                onClick={() => setPreviewImage(completion.proof)}
                                className="flex items-center gap-1.5 text-indigo-600 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800/50"
                            >
                                <EyeIcon className="w-4 h-4" /> View Proof
                            </button>
                        ) : completion.proof ? (
                            <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{completion.proof}</div>
                        ) : null}

                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleApprove(completion.id)}
                                disabled={isPending}
                                className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg text-xs disabled:opacity-50"
                            >
                                ✓ Approve
                            </button>
                            <button 
                                onClick={() => handleReject(completion.id)}
                                disabled={isPending}
                                className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg text-xs disabled:opacity-50"
                            >
                                ✗ Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-3xl max-h-[90vh] overflow-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                            ✕
                        </button>
                        <img 
                            src={previewImage} 
                            alt="Task Proof" 
                            className="max-w-full max-h-[85vh] object-contain rounded-xl"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}