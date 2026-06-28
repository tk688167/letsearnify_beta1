"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    CheckCircleIcon,
    ArrowTopRightOnSquareIcon,
    SparklesIcon,
    TrophyIcon,
    BoltIcon,
    GiftIcon,
    InformationCircleIcon,
    ChevronRightIcon,
    XMarkIcon,
    ArrowRightIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline"
import { LockClosedIcon, ClockIcon } from "@heroicons/react/24/solid"
import { completeTask } from "@/app/actions/user/tasks"
import { useRouter } from "next/navigation"

interface Task {
    id: string
    title: string
    description: string
    reward: number
    type: string
    status: string
    completionStatus?: string | null
    completionRemarks?: string | null
    link?: string | null
    company?: {
        name: string
        logoUrl: string | null
    } | null
}

interface TaskPageClientProps {
    user: { id: string, name: string | null }
    platformTasks: Task[]
    cfxUrl: string
    isUnlocked: boolean
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}

export default function TaskPageClient({ user, platformTasks, cfxUrl, isUnlocked }: TaskPageClientProps) {
    const router = useRouter()
    const userIsActive = isUnlocked

    const [activeTab, setActiveTab] = useState<"basic" | "premium">("basic")
    const [previewTask, setPreviewTask] = useState<Task | null>(null)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)

    const [taskStates, setTaskStates] = useState<Record<string, { status: string, remarks?: string | null }>>(() => {
        const initialStates: Record<string, { status: string, remarks?: string | null }> = {}
        platformTasks.forEach((task: any) => {
            if (task.completionStatus) {
                initialStates[task.id] = { 
                    status: task.completionStatus,
                    remarks: task.completionRemarks
                }
            }
        })
        return initialStates
    })

    const [isPending, startTransition] = useTransition()
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [proofType, setProofType] = useState<'text' | 'image'>('image')
    const [proofText, setProofText] = useState('')
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [submittedTaskId, setSubmittedTaskId] = useState<string | null>(null)

    const closeProofModal = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
        setSelectedTask(null)
        setSubmittedTaskId(null)
        setFeedback(null)
    }

   const handleSubmitProof = async (formData: FormData) => {
    if (!selectedTask) return

    startTransition(async () => {
        try {
            const file = formData.get('file') as File
            
            if (!file || file.size === 0) {
                setFeedback({ type: 'error', message: 'Please select an image.' })
                return
            }

            const uploadFormData = new FormData()
            uploadFormData.append('file', file)

            const { uploadProof } = await import("@/app/actions/user/upload")
            const uploadRes = await uploadProof(uploadFormData)
            
            if (uploadRes?.error || !uploadRes?.path) {
                setFeedback({ type: 'error', message: uploadRes?.error || 'Upload failed' })
                return
            }

            const result = await completeTask(selectedTask.id, uploadRes.path)
            
            if (result.success) {
                setTaskStates(prev => ({
                    ...prev,
                    [selectedTask.id]: { status: 'PENDING', remarks: null }
                }))
                setSubmittedTaskId(selectedTask.id)
                setFeedback(null)
                setProofText("")
                if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }
            } else {
                setFeedback({ type: 'error', message: result.error || 'Failed to submit' })
            }
        } catch (error) {
            console.error('Submission error:', error)
            setFeedback({ type: 'error', message: 'Something went wrong' })
        }
    })
}

    const handleTaskClick = (task: Task) => {
        const state = taskStates[task.id]
        if (state?.status === 'APPROVED' || state?.status === 'PENDING') return
        setPreviewTask(task)
    }

    const handleStartTask = () => {
        if (!previewTask) return
        
        if (previewTask.link) {
            window.open(previewTask.link, '_blank')
        }
        
        setSelectedTask(previewTask)
        setPreviewTask(null)
    }

    const filteredTasks = platformTasks.filter(t => 
        activeTab === "premium" ? t.type === "PREMIUM" : t.type !== "PREMIUM"
    )

    const completedCount = Object.values(taskStates).filter((s: any) => s.status === 'APPROVED').length

    return (
        <div className="mx-auto px-4 sm:px-2  ">
            
            {/* ═══ HERO BANNER ═══ */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mb-8 sm:mb-10 border border-white/5 shadow-xl">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent" />
                
                <div className="relative px-6 sm:px-8 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-center sm:text-left">
                        {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-3">
                            <BoltIcon className="w-3.5 h-3.5" />
                            Official Hub
                        </div> */}
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            Task Hub
                        </h1>
                        <p className="text-white/50 text-sm mt-1 max-w-sm">
                            Complete verified tasks and earn rewards
                        </p>
                    </div>
                    
                    <div className="flex gap-3 shrink-0">
                        <div className="min-w-[80px] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
                            <div className="text-lg font-bold text-emerald-400">
                                {completedCount}
                            </div>
                            <div className="text-[8px] font-semibold text-white/40 uppercase tracking-wider">Done</div>
                        </div>
                        <div className="min-w-[80px] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
                            <div className="text-lg font-bold text-amber-400">
                                {platformTasks.length}
                            </div>
                            <div className="text-[8px] font-semibold text-white/40 uppercase tracking-wider">Total</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ TABS ═══ */}
            <div className="flex bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50 mb-8 w-full sm:w-3/13 shadow-sm">
                <button 
                    onClick={() => setActiveTab("basic")}
                    className={cn(
                        "flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                        activeTab === "basic" 
                            ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md" 
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    )}
                >
                    <GiftIcon className="w-4 h-4" />
                    Basic
                </button>
                <button 
                    onClick={() => setActiveTab("premium")}
                    className={cn(
                        "flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                        activeTab === "premium" 
                            ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md" 
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    )}
                >
                    <TrophyIcon className="w-4 h-4 text-amber-500" />
                    Premium
                </button>
            </div>

            {/* ═══ TASKS LIST ═══ */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === "premium" && !userIsActive && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6"
                            >
                                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-500/20 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4">
                                    <div className="shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
                                        <LockClosedIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Premium Tasks Locked</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Unlock to access high-reward tasks</p>
                                    </div>
                                    <button 
                                        onClick={() => router.push("/dashboard/wallet?action=unlock")}
                                        className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap"
                                    >
                                        Unlock Now
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        <div className={cn(
                            "bg-white dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl overflow-hidden shadow-sm relative",
                            activeTab === "premium" && !userIsActive && "select-none pointer-events-none"
                        )}>
                            {activeTab === "premium" && !userIsActive && (
                                <div className="absolute inset-0 z-10 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-[2px]" />
                            )}
                            
                            {filteredTasks.length === 0 ? (
                                <div className="py-16 text-center px-6">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <InformationCircleIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <p className="text-gray-900 dark:text-white font-semibold">No tasks available</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Check back later</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredTasks.map((task) => {
                                        const state = taskStates[task.id]
                                        const isApproved = state?.status === 'APPROVED'
                                        const isPendingTask = state?.status === 'PENDING'
                                        const isRejected = state?.status === 'REJECTED'
                                        
                                        return (
                                            <div 
                                                key={task.id}
                                                onClick={() => handleTaskClick(task)}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3.5 transition-all",
                                                    (isApproved || isPendingTask) 
                                                        ? "opacity-60 pointer-events-none" 
                                                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                                                )}
                                            >
                                                {/* Status Dot */}
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full shrink-0",
                                                    isApproved ? "bg-emerald-500" : 
                                                    isPendingTask ? "bg-blue-500" : 
                                                    isRejected ? "bg-rose-500" : 
                                                    "bg-indigo-500"
                                                )} />

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                                            {task.type}
                                                        </span>
                                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                            {task.title}
                                                        </h3>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                                                        {task.company?.name || 'Official Task'}
                                                    </p>
                                                </div>

                                                {/* Reward */}
                                                <div className="text-right shrink-0">
                                                    <div className={cn(
                                                        "text-sm font-bold",
                                                        activeTab === "premium" 
                                                            ? "text-amber-600 dark:text-amber-400" 
                                                            : "text-indigo-600 dark:text-indigo-400"
                                                    )}>
                                                        +{task.reward.toLocaleString()}
                                                        <span className="text-[8px] opacity-50 ml-0.5">ARN</span>
                                                    </div>
                                                </div>

                                                {/* Status Badge */}
                                                <div className="shrink-0">
                                                    {isApproved ? (
                                                        <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
                                                            <CheckCircleIcon className="w-3 h-3" />
                                                            Done
                                                        </span>
                                                    ) : isPendingTask ? (
                                                        <span className="flex items-center gap-1 text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1 rounded-full">
                                                            <ArrowPathIcon className="w-3 h-3 animate-spin" />
                                                            Review
                                                        </span>
                                                    ) : isRejected ? (
                                                        <span className="flex items-center gap-1 text-[8px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-full">
                                                            Retry
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden sm:inline">
                                                            Start →
                                                        </span>
                                                    )}
                                                </div>

                                                <ChevronRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 sm:hidden" />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ═══ FOOTER ═══ */}
            <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 text-center">
                <p className="flex items-center justify-center gap-2 text-[9px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    <ClockIcon className="w-3.5 h-3.5" />
                    Rewards credited after 24h verification
                </p>
            </div>

            {/* ═══ MODALS ═══ */}
            <AnimatePresence>
                {/* Preview Modal */}
                {previewTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setPreviewTask(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6"
                        >
                            <div className="flex justify-between items-start mb-5">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[8px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                            {previewTask.type}
                                        </span>
                                        <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                            Verified
                                        </span>
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {previewTask.title}
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Reward</p>
                                    <div className="text-lg font-bold text-amber-500 flex items-center gap-1">
                                        <SparklesIcon className="w-4 h-4" />
                                        {previewTask.reward.toLocaleString()} ARN
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                                    <p className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <InformationCircleIcon className="w-3.5 h-3.5" />
                                        Instructions
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {previewTask.description || "Complete the task and upload a screenshot as proof."}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-500/10">
                                    <ClockIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                    <p className="text-[9px] font-medium text-amber-700 dark:text-amber-400">
                                        Verification: 24-48 hours
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <button 
                                    onClick={handleStartTask}
                                    className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Start Task
                                    <ArrowRightIcon className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                    onClick={() => setPreviewTask(null)}
                                    className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-[9px] uppercase tracking-wider rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Proof Submission Modal */}
                {selectedTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isPending && closeProofModal()}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
                        >
                            {submittedTaskId === selectedTask.id ? (
                                /* ── Success Screen ── */
                                <div className="flex flex-col items-center text-center py-4 gap-5">
                                    <div className="relative">
                                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 rounded-2xl flex items-center justify-center">
                                            <ClockIcon className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Submitted</p>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">Under Review</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">
                                            Your proof is being reviewed. You'll get the reward once approved.
                                        </p>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                                    </div>
                                    <button
                                        onClick={closeProofModal}
                                        className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95"
                                    >
                                        Got it
                                    </button>
                                </div>
                            ) : (
                                /* ── Form ── */
                                <>
                                    <div className="flex justify-between items-center mb-5">
                                        <div>
                                            <p className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Submit Proof</p>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{selectedTask.title}</h3>
                                        </div>
                                        <button
                                            onClick={() => !isPending && closeProofModal()}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <XMarkIcon className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>

                                    <form action={handleSubmitProof} className="space-y-5">
                                        <div>
                                            <label className="block text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                                                Upload Screenshot
                                            </label>
                                            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-400 rounded-xl p-6 text-center transition-colors">
                                                <input
                                                    type="file"
                                                    name="file"
                                                    accept="image/*"
                                                    required
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) {
                                                            if (previewUrl) URL.revokeObjectURL(previewUrl)
                                                            setPreviewUrl(URL.createObjectURL(file))
                                                        }
                                                    }}
                                                />
                                                {previewUrl ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-full max-w-[180px] aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                        </div>
                                                        <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                                            ✓ Image ready
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-2">
                                                            <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Tap to upload</p>
                                                        <p className="text-[8px] text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, WEBP</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {feedback && (
                                            <div className={cn(
                                                "p-3 rounded-lg text-[10px] font-medium flex items-center gap-2",
                                                feedback.type === 'error' 
                                                    ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/10' 
                                                    : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/10'
                                            )}>
                                                {feedback.type === 'error' 
                                                    ? <InformationCircleIcon className="w-4 h-4" /> 
                                                    : <CheckCircleIcon className="w-4 h-4" />
                                                }
                                                {feedback.message}
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => closeProofModal()}
                                                disabled={isPending}
                                                className="flex-1 py-3 rounded-lg text-[9px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isPending}
                                                className="flex-[2] py-3 rounded-lg text-[9px] font-bold uppercase tracking-wider text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                            >
                                                {isPending ? (
                                                    <><ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> Uploading</>
                                                ) : 'Submit'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}