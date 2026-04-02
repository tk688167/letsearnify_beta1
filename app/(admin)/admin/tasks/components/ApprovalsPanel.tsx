"use client"

import { useState, useTransition } from "react"
import CheckCircleIcon from "@heroicons/react/24/outline/CheckCircleIcon"
import XCircleIcon from "@heroicons/react/24/outline/XCircleIcon"
import EyeIcon from "@heroicons/react/24/outline/EyeIcon"
import ChatBubbleLeftEllipsisIcon from "@heroicons/react/24/outline/ChatBubbleLeftEllipsisIcon"
import PhotoIcon from "@heroicons/react/24/outline/PhotoIcon"
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon"
import { approveTaskCompletion, rejectTaskCompletion } from "@/app/actions/admin/task-approvals"

interface ApprovalsPanelProps {
    completions: any[]
}

export default function ApprovalsPanel({ completions }: ApprovalsPanelProps) {
    const [isPending, startTransition] = useTransition()
    const [searchTerm, setSearchTerm] = useState("")
    const [remarks, setRemarks] = useState<{[key: string]: string}>({})
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    const handleAction = (id: string, action: 'approve' | 'reject') => {
        const confirmMsg = action === 'approve' 
            ? "Approve this task and credit the user?" 
            : "Reject this task submission?"
            
        if (!confirm(confirmMsg)) return
        
        startTransition(async () => {
            const res = action === 'approve' 
                ? await approveTaskCompletion(id, remarks[id]) 
                : await rejectTaskCompletion(id, remarks[id])
                
            if (!res?.success) alert(res?.error || "Action failed")
        })
    }

    const filteredCompletions = completions.filter(comp => 
        (comp.user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comp.user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comp.task.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (completions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircleIcon className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest leading-none">Inbox Empty</h3>
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-2 max-w-[220px]">All user submissions have been processed. Great work!</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            {/* Search Section */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-50 dark:border-slate-800/50">
                <div className="relative group max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                        <MagnifyingGlassIcon className={`w-4 h-4 transition-colors ${searchTerm ? 'text-indigo-600' : 'text-gray-400'}`} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users by name, email or task..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-6 py-3 bg-slate-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 rounded-xl text-xs font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all"
                    />
                </div>
            </div>

            {filteredCompletions.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No matching submissions found</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/20 dark:bg-slate-800/20">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Task</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Proof</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status / Feedback</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Decisions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {filteredCompletions.map((comp) => (
                                    <tr key={comp.id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/20 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-gray-900 dark:text-white">{comp.user.name || "Anonymous User"}</span>
                                                <span className="text-[11px] text-gray-500 dark:text-slate-500 font-mono italic">{comp.user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 mb-0.5">{comp.task.title}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Reward: {comp.task.reward.toFixed(2)} ARN</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <button 
                                                onClick={() => setPreviewImage(comp.proof)}
                                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all active:scale-95"
                                            >
                                                <EyeIcon className="w-3.5 h-3.5" /> View Proof
                                            </button>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 max-w-[200px]">
                                                <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-gray-300 dark:text-slate-600 shrink-0" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Audit remarks..." 
                                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                                    onChange={(e) => setRemarks(p => ({ ...p, [comp.id]: e.target.value }))}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    disabled={isPending}
                                                    onClick={() => handleAction(comp.id, 'approve')}
                                                    className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-600 hover:text-white transition-all rounded-xl active:scale-90"
                                                    title="Approve Submission"
                                                >
                                                    <CheckCircleIcon className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    disabled={isPending}
                                                    onClick={() => handleAction(comp.id, 'reject')}
                                                    className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-600 hover:text-white transition-all rounded-xl active:scale-90"
                                                    title="Reject Submission"
                                                >
                                                    <XCircleIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden divide-y divide-gray-100 dark:divide-slate-800">
                        {filteredCompletions.map((comp) => (
                            <div key={comp.id} className="p-5 space-y-4 hover:bg-gray-50/20 dark:hover:bg-slate-800/20 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-0.5">
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{comp.user.name || "User"}</h4>
                                        <p className="text-[10px] text-gray-500 font-mono truncate max-w-[150px]">{comp.user.email}</p>
                                    </div>
                                    <span className="text-[10px] font-black text-green-600 bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded">+{comp.task.reward} ARN</span>
                                </div>
                                
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-gray-100 dark:border-slate-800">
                                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{comp.task.title}</div>
                                    <button 
                                        onClick={() => setPreviewImage(comp.proof)}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-800/50 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold text-xs shadow-sm shadow-indigo-500/5 active:scale-95 transition-all"
                                    >
                                        <PhotoIcon className="w-4 h-4" /> View Screenshot
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <textarea 
                                        placeholder="Audit remarks..." 
                                        className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:border-indigo-500 outline-none resize-none"
                                        rows={2}
                                        onChange={(e) => setRemarks(p => ({ ...p, [comp.id]: e.target.value }))}
                                    />
                                    <div className="flex gap-2">
                                        <button 
                                            disabled={isPending}
                                            onClick={() => handleAction(comp.id, 'approve')}
                                            className="flex-1 py-3 bg-green-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            disabled={isPending}
                                            onClick={() => handleAction(comp.id, 'reject')}
                                            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 font-black rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-2 border border-slate-700/30 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setPreviewImage(null)} className="absolute -top-4 -right-4 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-all shadow-xl active:scale-90 z-20 font-bold border-4 border-white dark:border-slate-900">✕</button>
                        <div className="overflow-auto rounded-2xl max-h-[85vh]">
                            <img src={previewImage} alt="User Proof" className="max-w-full h-auto object-contain" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
