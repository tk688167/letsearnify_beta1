"use client"

import { useState, useTransition, useEffect } from "react"
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
                let proof = ""

                if (proofType === 'image') {
                    const file = formData.get('file') as File
                    if (!file || file.size === 0) {
                        setFeedback({ type: 'error', message: 'Please select an image.' })
                        return
                    }
                    const { uploadProof } = await import("@/app/actions/user/upload")
                    const uploadRes = await uploadProof(formData)
                    if (uploadRes?.error || !uploadRes?.path) {
                         setFeedback({ type: 'error', message: uploadRes?.error || 'Upload failed' })
                         return
                    }
                    proof = uploadRes.path
                } else {
                    if (!proofText.trim()) {
                        setFeedback({ type: 'error', message: 'Please enter proof text/url.' })
                        return
                    }
                    proof = proofText
                }

                const result = await completeTask(selectedTask.id, proof)
                
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
                setFeedback({ type: 'error', message: 'Something went wrong' })
            }
        })
    }

    // Step 1: Open Preview Popup
    const handleTaskClick = (task: Task) => {
        const state = taskStates[task.id]
        if (state?.status === 'APPROVED' || state?.status === 'PENDING') return
        setPreviewTask(task)
    }

    // Step 2: Confirmation Button inside Popup
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

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 font-sans">
            
            {/* ═══ TASK HUB BANNER ═══ */}
            <div className="relative overflow-hidden rounded-[2rem] text-white mb-8 sm:mb-10 bg-[#0f0f23] border border-white/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />
              
              <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                <div className="text-center sm:text-left flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-4">
                    <BoltIcon className="w-4 h-4" /> Official Task Hub
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-2">
                    Official <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 italic">Task Hub</span>
                  </h1>
                  <p className="text-white/40 text-xs sm:text-sm max-w-sm font-medium">
                    Complete basic & premium verified tasks to earn rewards.
                  </p>
                </div>
                
                <div className="flex gap-3 shrink-0">
                  <div className="min-w-[90px] bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <div className="text-xl font-black text-emerald-400 leading-none mb-1">
                      {Math.floor(Object.values(taskStates).filter((s: any) => s.status === 'APPROVED').length)}
                    </div>
                    <div className="text-[9px] font-black text-emerald-400/40 uppercase tracking-widest">Completed</div>
                  </div>
                  <div className="min-w-[90px] bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <div className="text-xl font-black text-amber-400 leading-none mb-1">
                      {platformTasks.length}
                    </div>
                    <div className="text-[9px] font-black text-amber-400/40 uppercase tracking-widest">Available</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ TAB NAVIGATION ═══ */}
            <div className="flex p-1.5 bg-muted/40 rounded-2xl border border-border/40 mb-8 sm:mb-10 w-full sm:w-fit mx-auto lg:mx-0 shadow-sm">
                <button 
                    onClick={() => setActiveTab("basic")}
                    className={cn(
                        "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                        activeTab === "basic" ? "bg-card text-foreground shadow-xl shadow-black/5 border border-border/20" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <GiftIcon className="w-4 h-4" />
                    Basic Tasks
                </button>
                <button 
                    onClick={() => setActiveTab("premium")}
                    className={cn(
                        "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                        activeTab === "premium" ? "bg-card text-foreground shadow-xl shadow-black/5 border border-border/20" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <TrophyIcon className="w-4 h-4 text-amber-500" />
                    Premium Tasks
                </button>
            </div>

            {/* ═══ TASKS CONTENT ═══ */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="relative"
                    >
                        {/* Premium Unlock Banner (Top) */}
                        {activeTab === "premium" && !userIsActive && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8"
                            >
                                <div className="bg-card border border-amber-500/20 rounded-[1.5rem] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl shadow-amber-500/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-all" />
                                    
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="shrink-0 w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
                                            <LockClosedIcon className="w-6 h-6" />
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight leading-tight mb-1">Unlock Premium Tasks</h3>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                                                High-reward verified opportunities await
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => router.push("/dashboard/wallet?action=unlock")}
                                        className="relative z-10 w-full sm:w-auto px-10 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-[10px] uppercase tracking-[0.15em] rounded-xl transition-all shadow-lg shadow-amber-600/20 active:scale-95"
                                    >
                                        Unlock Now
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        <div className={cn(
                            "bg-card border border-border/60 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5 divide-y divide-border/40 relative",
                            activeTab === "premium" && !userIsActive && "select-none pointer-events-none"
                        )}>
                            {/* Blurred tasks state when locked */}
                            {activeTab === "premium" && !userIsActive && (
                                <div className="absolute inset-0 z-10 bg-background/10 backdrop-blur-[12px]" />
                            )}
                            {filteredTasks.length === 0 ? (
                                <div className="py-24 text-center px-6">
                                    <div className="w-20 h-20 bg-muted/40 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-border/60">
                                        <InformationCircleIcon className="w-10 h-10 text-muted-foreground/20" />
                                    </div>
                                    <p className="text-foreground font-black text-lg tracking-tight">No tasks found in this hub</p>
                                    <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest opacity-60">Check back later for new opportunities</p>
                                </div>
                            ) : (
                                filteredTasks.map((task, index) => {
                                    const state = taskStates[task.id]
                                    const isApproved = state?.status === 'APPROVED'
                                    const isPendingTask = state?.status === 'PENDING'
                                    const isRejected = state?.status === 'REJECTED'
                                    
                                    return (
                                        <div 
                                            key={task.id}
                                            onClick={() => handleTaskClick(task)}
                                            className={cn(
                                                "group flex items-center gap-4 px-5 py-4 sm:px-7 sm:py-5 transition-all duration-300 relative overflow-hidden",
                                                (isApproved || isPendingTask) ? "bg-muted/5 pointer-events-none" : "hover:bg-muted/30 cursor-pointer active:bg-muted/50"
                                            )}
                                        >
                                            {/* Status Dot */}
                                            <div className="shrink-0 w-2.5 h-2.5 rounded-full relative">
                                                <div className={cn(
                                                    "absolute inset-0 rounded-full animate-ping opacity-20",
                                                    isApproved ? "bg-emerald-500" : isPendingTask ? "bg-blue-500" : isRejected ? "bg-rose-500" : "bg-indigo-500"
                                                )} />
                                                <div className={cn(
                                                    "relative w-full h-full rounded-full",
                                                    isApproved ? "bg-emerald-500" : isPendingTask ? "bg-blue-500" : isRejected ? "bg-rose-500" : "bg-indigo-500"
                                                )} />
                                            </div>

                                            {/* Title & Type */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 shrink-0">
                                                        {task.type}
                                                    </span>
                                                    <h3 className="font-black text-foreground text-xs sm:text-sm truncate tracking-tight">
                                                        {task.title}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[9px] font-medium text-muted-foreground/60 truncate uppercase tracking-widest">
                                                        {task.company?.name || 'Official Task'}
                                                    </p>
                                                    {(isApproved || isPendingTask || isRejected) && (
                                                        <span className={cn(
                                                            "sm:hidden flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.1em]",
                                                            isApproved ? "text-emerald-500" : isPendingTask ? "text-blue-500" : "text-rose-500"
                                                        )}>
                                                            • {isApproved ? "Done" : isPendingTask ? "Under Review" : "Retry"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Reward & Button */}
                                            <div className="shrink-0 flex items-center gap-3 sm:gap-6">
                                                <div className="text-right">
                                                    <div className={cn(
                                                        "text-xs sm:text-sm font-black tabular-nums tracking-tighter",
                                                        activeTab === "premium" ? "text-amber-600 dark:text-amber-500" : "text-indigo-600 dark:text-indigo-400"
                                                    )}>
                                                        +{task.reward.toLocaleString()} <span className="text-[9px] opacity-40">ARN</span>
                                                    </div>
                                                </div>
                                                
                                                <div className={cn(
                                                    "hidden sm:flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                    isApproved ? "bg-emerald-500/10 text-emerald-600" :
                                                    isPendingTask ? "bg-blue-500/10 text-blue-600" :
                                                    isRejected ? "bg-rose-500/10 text-rose-600" :
                                                    "bg-foreground text-background group-hover:px-6"
                                                )}>
                                                    {isApproved ? (
                                                        <><CheckCircleIcon className="w-3.5 h-3.5" /> Done</>
                                                    ) : isPendingTask ? (
                                                        <><ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> Under Review</>
                                                    ) : isRejected ? (
                                                        <><ArrowPathIcon className="w-3.5 h-3.5" /> Retry</>
                                                    ) : 'Start'}
                                                </div>
                                                <ChevronRightIcon className="w-4 h-4 text-muted-foreground/30 sm:hidden" />
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer Notice */}
            <div className="mt-10 py-6 border-t border-border/40 text-center">
                 <p className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                     <InformationCircleIcon className="w-4 h-4 text-indigo-500/40" />
                     Rewards are credited instantly after 24h verification cycle.
                 </p>
            </div>

            {/* ═══ MODALS ═══ */}
            <AnimatePresence>
                {/* STEP 1: PREVIEW POPUP */}
                {previewTask && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setPreviewTask(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-card rounded-[2.5rem] shadow-2xl border border-white/5 p-6 sm:p-8 overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-muted text-muted-foreground">
                                            {previewTask.type}
                                        </span>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verified Task</span>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black text-foreground leading-tight tracking-tight">
                                        {previewTask.title}
                                    </h2>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-1">Reward</p>
                                    <div className="text-xl font-black text-amber-500 flex items-center gap-1 justify-end tabular-nums">
                                        <SparklesIcon className="w-5 h-5" />
                                        {previewTask.reward.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="bg-muted/20 rounded-2xl p-5 border border-border/40">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <InformationCircleIcon className="w-4 h-4 text-indigo-500" /> Task Instructions
                                    </p>
                                    <p className="text-sm font-medium text-foreground leading-relaxed">
                                        {previewTask.description || "Follow the link to complete the task. Be sure to capture a screenshot of your successful completion to upload as proof later."}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                                    <ClockIcon className="w-4 h-4 text-amber-600" />
                                    <p className="text-[10px] font-bold text-amber-700/80 uppercase tracking-wide">
                                        Verification usually takes 24-48 hours
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={handleStartTask}
                                    className="w-full py-4 bg-foreground text-background font-black text-xs uppercase tracking-widest rounded-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 group"
                                >
                                    Start Task Now
                                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button 
                                    onClick={() => setPreviewTask(null)}
                                    className="w-full py-4 bg-muted hover:bg-muted/80 text-foreground font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* STEP 2: PROOF SUBMISSION */}
                {selectedTask && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isPending && closeProofModal()}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-md bg-card rounded-[2.5rem] shadow-2xl border border-border p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            {submittedTaskId === selectedTask.id ? (
                                /* ── Under Review Confirmation Screen ── */
                                <div className="flex flex-col items-center text-center py-4 gap-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-[2rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                            <ClockIcon className="w-9 h-9 text-blue-500" />
                                        </div>
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full animate-ping opacity-30" />
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-card" />
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.25em] mb-2">Submitted Successfully</p>
                                        <h3 className="text-2xl font-black text-foreground tracking-tight mb-3">
                                            Your task is<br/>under review
                                        </h3>
                                        <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-xs mx-auto">
                                            Our team is reviewing your proof. You'll be notified once it's approved and your reward is credited.
                                        </p>
                                    </div>

                                    <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden border border-border/40">
                                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                                    </div>

                                    <div className="w-full bg-muted/20 rounded-2xl p-4 border border-border/40 flex items-center gap-3">
                                        <ClockIcon className="w-4 h-4 text-amber-500 shrink-0" />
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Verification typically takes 24–48 hours</p>
                                    </div>

                                    <button
                                        onClick={closeProofModal}
                                        className="w-full py-4 bg-foreground text-background font-black text-xs uppercase tracking-widest rounded-xl shadow-xl active:scale-95 transition-all"
                                    >
                                        Got It, Done
                                    </button>
                                </div>
                            ) : (
                                /* ── Normal Proof Submission Form ── */
                                <>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-black text-foreground tracking-tight">Submit Proof</h2>
                                        <button
                                            onClick={() => !isPending && closeProofModal()}
                                            className="p-2 rounded-full hover:bg-muted transition-colors"
                                        >
                                            <XMarkIcon className="w-5 h-5 text-muted-foreground" />
                                        </button>
                                    </div>

                                    <form action={handleSubmitProof} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="bg-muted/10 rounded-2xl p-4 border border-border/40">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Task</p>
                                                <p className="text-sm font-bold text-foreground truncate">{selectedTask.title}</p>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 ml-1">Upload Screenshot Proof</label>
                                                <div className="group relative border-2 border-dashed border-border/60 hover:border-indigo-500/40 rounded-2xl p-6 sm:p-8 text-center transition-all bg-muted/5">
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
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-full max-w-[200px] aspect-video rounded-xl overflow-hidden border border-border/60 shadow-sm mx-auto">
                                                                <img src={previewUrl} alt="Screenshot preview" className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1">
                                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                                                    <CheckCircleIcon className="w-3 h-3 text-emerald-500" />
                                                                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Image ready</p>
                                                                </div>
                                                                <p className="text-[9px] text-muted-foreground/60 font-medium">Tap to change image</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-3 text-muted-foreground group-hover:text-indigo-500 transition-colors">
                                                                <ArrowTopRightOnSquareIcon className="w-6 h-6" />
                                                            </div>
                                                            <p className="text-xs font-bold text-foreground">Tap to select image</p>
                                                            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">JPG, PNG or WEBP</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {feedback && (
                                            <div className={cn(
                                                "p-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 border animate-in fade-in slide-in-from-bottom-2",
                                                feedback?.type === 'error' ? 'bg-rose-500/5 text-rose-500 border-rose-500/10' : 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10'
                                            )}>
                                                {feedback?.type === 'error' ? <InformationCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                                                {feedback?.message}
                                            </div>
                                        )}

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => closeProofModal()}
                                                disabled={isPending}
                                                className="flex-1 py-4 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted hover:bg-muted/80 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isPending}
                                                className="flex-[2] py-4 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-background bg-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                            >
                                                {isPending ? (
                                                    <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Uploading...</>
                                                ) : 'Confirm Submission'}
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

