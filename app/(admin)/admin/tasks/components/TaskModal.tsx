"use client"

import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon"
import { useFormStatus } from "react-dom"
import { createTask, updateTask } from "@/app/actions/admin/tasks"

interface TaskModalProps {
    task: any
    companies: any[]
    defaultType?: string
    onClose: () => void
    onSuccess: (task: any) => void
}

export default function TaskModal({ task, companies, defaultType, onClose, onSuccess }: TaskModalProps) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/30">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{task ? "Edit Task" : "Add New Task"}</h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Configure task details and rewards.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <XMarkIcon className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                    </button>
                </div>
                
                <form action={async (formData) => {
                    const res = task ? await updateTask(task.id, formData) : await createTask(formData)
                    if (res?.success) onSuccess(res.data)
                    else alert(res?.error || "An error occurred")
                }} className="p-6 space-y-5">

                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">Task Title</label>
                        <input 
                            name="title" 
                            defaultValue={task?.title} 
                            required 
                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium" 
                            placeholder="e.g. Subscribe to YouTube"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">Task Category (Type)</label>
                            <select 
                                name="type" 
                                defaultValue={task?.type || defaultType || "BASIC"} 
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-bold"
                            >
                                <option value="BASIC">Basic Task</option>
                                <option value="PREMIUM">Premium Task</option>
                                <option value="SOCIAL">Social Interaction</option>
                                <option value="APP">App Install</option>
                                <option value="SURVEY">Survey/Quiz</option>
                                <option value="VIDEO">Watch Video</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">Reward (ARN)</label>
                            <input 
                                name="reward" 
                                type="number" 
                                step="1" 
                                defaultValue={task?.reward} 
                                required 
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-black"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">Company Partner</label>
                        <select 
                            name="companyId" 
                            defaultValue={task?.companyId || ""} 
                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-semibold"
                        >
                            <option value="">Let's Earnify Official</option>
                            {companies.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">Instruction Details</label>
                        <textarea 
                            name="description" 
                            defaultValue={task?.description} 
                            required 
                            rows={3} 
                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium resize-none"
                            placeholder="Provide clear steps for the user..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">Current Status</label>
                            <select 
                                name="status" 
                                defaultValue={task?.status || "ACTIVE"} 
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-bold"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">External Link</label>
                            <input 
                                name="link" 
                                type="url" 
                                defaultValue={task?.link} 
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium" 
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <SubmitButton label={task ? "Save Changes" : "Create Task"} />
                </form>
            </div>
        </div>
    )
}

function SubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus()
    return (
        <button 
            disabled={pending} 
            className={`w-full py-4 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/20 text-sm uppercase tracking-widest flex items-center justify-center gap-2 ${
                pending ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
            }`}
        >
            {pending ? (
                <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Processing...
                </>
            ) : label}
        </button>
    )
}
