"use client"

import { useState } from "react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { createTask, updateTask } from "@/app/actions/admin/tasks"

interface TaskModalProps {
    task: any
    companies: any[]
    defaultType?: string
    onClose: () => void
    onSuccess: (task: any) => void
}

export default function TaskModal({ task, companies, defaultType, onClose, onSuccess }: TaskModalProps) {
    const [isPending, setIsPending] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true)
        try {
            const res = task ? await updateTask(task.id, formData) : await createTask(formData)
            if (res?.success) {
                onSuccess(res.data)
            } else {
                alert(res?.error || "An error occurred")
            }
        } catch (error) {
            alert("Something went wrong. Please try again.")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 transition-opacity"
            onClick={(e) => { if (e.target === e.currentTarget && !isPending) onClose() }}
        >
            {/* Modal Box */}
            <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-2xl overflow-hidden shadow-2xl border-0 sm:border border-gray-100 dark:border-slate-800 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[92vh] sm:max-h-none flex flex-col">
                
                {/* Drag handle — Mobile only */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
                    <div className="w-12 h-1 bg-gray-200 dark:bg-slate-700 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-5 py-4 sm:pt-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {task ? "Edit Task" : "Create New Task"}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                            Configure task details and rewards.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-400 disabled:opacity-50"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Wrapper */}
                <form
                    action={handleSubmit}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    {/* Scrollable Content Area */}
                    <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] sm:max-h-[70vh] ios-scrollbar">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                                Task Title
                            </label>
                            <input
                                name="title"
                                defaultValue={task?.title}
                                required
                                disabled={isPending}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm disabled:opacity-60"
                                placeholder="e.g. Subscribe to YouTube Channel"
                            />
                        </div>

                        {/* Type + Reward */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                                    Type
                                </label>
                                <select
                                    name="type"
                                    defaultValue={task?.type || defaultType || "BASIC"}
                                    disabled={isPending}
                                    className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-semibold disabled:opacity-60"
                                >
                                    <option value="BASIC">Basic</option>
                                    <option value="PREMIUM">Premium</option>
                                    <option value="SOCIAL">Social</option>
                                    <option value="APP">App Install</option>
                                    <option value="SURVEY">Survey</option>
                                    <option value="VIDEO">Video</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                                    Reward (ARN)
                                </label>
                                <input
                                    name="reward"
                                    type="number"
                                    step="any"
                                    defaultValue={task?.reward}
                                    required
                                    disabled={isPending}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-bold disabled:opacity-60"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Company */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                                Company
                            </label>
                            <select
                                name="companyId"
                                defaultValue={task?.companyId || ""}
                                disabled={isPending}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm disabled:opacity-60"
                            >
                                <option value="">Let's Earnify Official</option>
                                {companies.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                                Instructions (optional)
                            </label>
                            <textarea
                                name="description"
                                defaultValue={task?.description}
                                rows={3}
                                disabled={isPending}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none disabled:opacity-60"
                                placeholder="Clear steps for the user to complete the task..."
                            />
                        </div>

                        {/* Link */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                                External Link (optional)
                            </label>
                            <input
                                name="link"
                                type="url"
                                defaultValue={task?.link}
                                disabled={isPending}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm disabled:opacity-60"
                                placeholder="https://example.com/task"
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                                Status
                            </label>
                            <select
                                name="status"
                                defaultValue={task?.status || "ACTIVE"}
                                disabled={isPending}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-semibold disabled:opacity-60"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Fixed Action Buttons Footer */}
                    <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-slate-800/80 bg-gray-50/50 dark:bg-slate-900/50 flex gap-3 shrink-0 pb-7 sm:pb-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="flex-1 py-3.5 sm:py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 py-3.5 sm:py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/70 text-white text-sm font-bold shadow-md shadow-indigo-500/10 transition-all active:scale-[0.98] disabled:pointer-events-none flex items-center justify-center"
                        >
                            {isPending ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {task ? "Saving..." : "Creating..."}
                                </span>
                            ) : (
                                task ? "Save Changes" : "Create Task"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}