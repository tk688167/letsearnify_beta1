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
    ArrowPathIcon,
    CameraIcon,
    DocumentTextIcon,
    UserIcon,
    CalendarIcon,
    CurrencyRupeeIcon,
    CurrencyDollarIcon
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



const USD_TO_ARN = 10      // 1 USD = 10 ARN (Platform fixed rate)
const USD_TO_PKR = 280     // 1 USD = 280 PKR (Market rate)
const ARN_TO_PKR = USD_TO_PKR / USD_TO_ARN  // 1 ARN = 28 PKR

// Helper functions
const convertARNtoPKR = (arnAmount: number): number => {
    return arnAmount * ARN_TO_PKR
}

const formatPKR = (amount: number): string => {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

const formatUSD = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount)
}

export default function TaskPageClient({ user, platformTasks, cfxUrl, isUnlocked }: TaskPageClientProps) {
    const router = useRouter()
    const userIsActive = isUnlocked

    const [activeTab, setActiveTab] = useState<"basic" | "premium">("basic")
    const [previewTask, setPreviewTask] = useState<Task | null>(null)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [showUploadGuide, setShowUploadGuide] = useState(false)

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
        setShowUploadGuide(false)
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
        setShowUploadGuide(true)
    }

    const filteredTasks = platformTasks.filter(t => 
        activeTab === "premium" ? t.type === "PREMIUM" : t.type !== "PREMIUM"
    )

    const completedCount = Object.values(taskStates).filter((s: any) => s.status === 'APPROVED').length
    const pendingCount = Object.values(taskStates).filter((s: any) => s.status === 'PENDING').length

    // Calculate total earned in all currencies
    const totalEarnedARN = platformTasks
        .filter(t => taskStates[t.id]?.status === 'APPROVED')
        .reduce((sum, t) => sum + t.reward, 0)

    const totalEarnedPKR = platformTasks
        .filter(t => taskStates[t.id]?.status === 'APPROVED')
        .reduce((sum, t) => sum + convertARNtoPKR(t.reward), 0)

    const totalEarnedUSD = platformTasks
        .filter(t => taskStates[t.id]?.status === 'APPROVED')
        .reduce((sum, t) => sum + (t.reward / USD_TO_ARN), 0)

    return (
        <div className="min-h-screen  from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            <div className="max-w-6xl mx-auto px-2 ">
                {/*  HERO SECTION */}
                <div className="w-full bg-white dark:bg-gradient-to-br from-slate-900 via-indigo-950 mb-3 to-blue-950 rounded-2xl p-6 sm:p-8 dark:text-white dark:shadow-2xl shadow-indigo-950/40 relative overflow-hidden border border-slate-200  dark:border-white/5 flex flex-col items-center justify-center text-center">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -mr-36 -mt-36" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl -ml-36 -mb-36" /> 
                    <div className="relative px-2 sm:px-10 py-1 sm:py-6">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary  text-white dark:bg-white/10 backdrop-blur-sm border border-white/20 text-[9px] font-bold uppercase tracking-wider mb-2 sm:mb-4">
                                    <BoltIcon className="w-3.5 h-3.5" />
                                    Task Hub
                                </div>
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-20">
                            {/* Left Content */}
                            <div className="text-center lg:text-left">
                                <h2 className="text-3xl  lg:text-4xl font-bold tracking-tight leading-tight">
                                    Complete Tasks,
                                    <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-200 to-yellow-200">
                                        Earn Rewards
                                    </span>
                                </h2>
                            </div>
                            
                            {/* Stats Cards - All 3 Currencies */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 w-full sm:w-auto">
                                {/* Completed Tasks */}
                                <div className="bg-white/10 backdrop-blur-sm border border-slate-300 dark:border-white/20 rounded-xl px-4 py-1 sm:py-2 text-center">
                                    <div className="text-1xl sm:text-2xl font-bold text-emerald-300">
                                        {completedCount}
                                    </div>
                                    <div className="text-[8px] font-semibold text-black dark:text-white/60 uppercase tracking-wider">Completed</div>
                                </div>
                                
                                {/* Available Tasks */}
                                <div className="bg-white/10 backdrop-blur-sm border border-slate-300 dark:border-white/20 rounded-xl px-4 py-1 sm:py-2 text-center">
                                    <div className="text-1xl sm:text-2xl font-bold text-yellow-300">
                                        {platformTasks.length}
                                    </div>
                                    <div className="text-[8px] font-semibold text-black dark:text-white/60 uppercase tracking-wider">Available</div>
                                </div>
                                
                                {/* Total Earned - All Currencies */}
                                <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-sm border border-slate-300 dark:border-white/20 rounded-xl px-4 py-1 sm:py-2 text-center">
                                    <div className="text-1xl sm:text-2xl font-bold text-amber-300">
                                        {formatPKR(totalEarnedPKR)}
                                    </div>
                                    <div className="text-[7px] text-white/40 mt-0.5 flex items-center justify-center gap-2">
                                        <span className="text-xs font-bold text-amber-300 dark:text-amber-100">{formatUSD(totalEarnedUSD)}</span>
                                        <span className="w-px h-3 bg-white/20" />
                                        <span className="text-xs font-bold text-amber-300 dark:text-amber-100">{totalEarnedARN.toFixed(2)} ARN</span>
                                    </div>
                                    <div className="text-[9px] font-semibold text-black dark:text-white/50 uppercase tracking-wider mt-0.5">Total Earned</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══ TABS ═══ */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
                    <div className="flex bg-white dark:bg-gray-900/50 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm w-full sm:w-auto">
                        <button 
                            onClick={() => setActiveTab("basic")}
                            className={cn(
                                "flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                activeTab === "basic" 
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            )}
                        >
                            <GiftIcon className="w-4 h-4" />
                            Basic Tasks
                            <span className={cn(
                                "ml-1 px-2 py-0.5 rounded-full text-[8px]",
                                activeTab === "basic" ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                            )}>
                                {platformTasks.filter(t => t.type !== "PREMIUM").length}
                            </span>
                        </button>
                        <button 
                            onClick={() => setActiveTab("premium")}
                            className={cn(
                                "flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                activeTab === "premium" 
                                    ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20" 
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            )}
                        >
                            <TrophyIcon className="w-4 h-4" />
                            Premium Tasks
                            <span className={cn(
                                "ml-1 px-2 py-0.5 rounded-full text-[8px]",
                                activeTab === "premium" ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                            )}>
                                {platformTasks.filter(t => t.type === "PREMIUM").length}
                            </span>
                        </button>
                    </div>
                    
                    {pendingCount > 0 && (
                        <div className="flex items-center gap-2 text-[9px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3.5 py-2 rounded-lg border border-blue-200/50 dark:border-blue-500/20">
                            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                            {pendingCount} task{pendingCount > 1 ? 's' : ''} under review
                        </div>
                    )}
                </div>

                {/* ═══ TASKS LIST ═══ */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                        >
                            {activeTab === "premium" && !userIsActive && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mb-6"
                                >
                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border border-amber-200/50 dark:border-amber-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5 shadow-lg shadow-amber-500/5">
                                        <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                            <LockClosedIcon className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <h4 className="text-base font-bold text-gray-900 dark:text-white">Unlock Premium Tasks</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Access high-reward tasks and earn up to 5x more</p>
                                        </div>
                                        <button 
                                            onClick={() => router.push("/dashboard/wallet?action=unlock")}
                                            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-600/20 active:scale-95 whitespace-nowrap flex items-center gap-2"
                                        >
                                            Unlock Now
                                            <ArrowRightIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            <div className={cn(
                                "bg-white dark:bg-gray-900/30 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl overflow-hidden shadow-xl shadow-black/5",
                                activeTab === "premium" && !userIsActive && "select-none pointer-events-none relative"
                            )}>
                                {activeTab === "premium" && !userIsActive && (
                                    <div className="absolute inset-0 z-10 bg-white/30 dark:bg-gray-900/50 backdrop-blur-[2px] flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-3 p-6 text-center">
                                            <LockClosedIcon className="w-10 h-10 text-amber-500/40" />
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unlock to view premium tasks</p>
                                        </div>
                                    </div>
                                )}
                                
                                {filteredTasks.length === 0 ? (
                                    <div className="py-20 text-center px-6">
                                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-5 border-2 border-dashed border-gray-300 dark:border-gray-700">
                                            <InformationCircleIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                                        </div>
                                        <p className="text-gray-900 dark:text-white font-bold text-lg">No tasks available</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">New tasks will appear here soon</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {filteredTasks.map((task, index) => {
                                            const state = taskStates[task.id]
                                            const isApproved = state?.status === 'APPROVED'
                                            const isPendingTask = state?.status === 'PENDING'
                                            const isRejected = state?.status === 'REJECTED'
                                            
                                            const pkrAmount = convertARNtoPKR(task.reward)
                                            const usdAmount = task.reward / USD_TO_ARN
                                            
                                            return (
                                                <motion.div 
                                                    key={task.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    onClick={() => handleTaskClick(task)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-5 py-4 transition-all cursor-pointer",
                                                        (isApproved || isPendingTask) 
                                                            ? "opacity-60 pointer-events-none bg-gray-50/50 dark:bg-gray-800/30" 
                                                            : "hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 hover:pl-6"
                                                    )}
                                                >
                                                    {/* Status Badge */}
                                                    <div className="shrink-0">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                                            isApproved ? "bg-emerald-100 dark:bg-emerald-950/30" :
                                                            isPendingTask ? "bg-blue-100 dark:bg-blue-950/30" :
                                                            isRejected ? "bg-rose-100 dark:bg-rose-950/30" :
                                                            "bg-indigo-100 dark:bg-indigo-950/30"
                                                        )}>
                                                            {isApproved ? (
                                                                <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                            ) : isPendingTask ? (
                                                                <ArrowPathIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                                                            ) : isRejected ? (
                                                                <XMarkIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                                            ) : (
                                                                <DocumentTextIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                                                {task.type}
                                                            </span>
                                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                                {task.title}
                                                            </h3>
                                                            {task.company?.name && (
                                                                <span className="text-[8px] text-gray-400 dark:text-gray-500 hidden sm:inline">
                                                                    • {task.company.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-0.5">
                                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                                                                {task.company?.name || 'Official Task'}
                                                            </p>
                                                            {isPendingTask && (
                                                                <span className="text-[8px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full">
                                                                    Under Review
                                                                </span>
                                                            )}
                                                            {isRejected && (
                                                                <span className="text-[8px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-full">
                                                                    Rejected
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Reward - All 3 Currencies */}
                                                    <div className="text-right shrink-0">
                                                        <div className={cn(
                                                            "text-sm font-bold",
                                                            activeTab === "premium" 
                                                                ? "text-amber-600 dark:text-amber-400" 
                                                                : "text-indigo-600 dark:text-indigo-400"
                                                        )}>
                                                            {formatPKR(pkrAmount)}
                                                        </div>
                                                        <div className="flex items-center justify-end gap-1.5 text-[8px] text-gray-400 dark:text-gray-500">
                                                            <span>${usdAmount.toFixed(2)}</span>
                                                            <span className="text-gray-300 dark:text-gray-600">•</span>
                                                            <span>+{task.reward} ARN</span>
                                                        </div>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="shrink-0">
                                                        {isApproved ? (
                                                            <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full">
                                                                <CheckCircleIcon className="w-3 h-3" />
                                                                Done
                                                            </span>
                                                        ) : isPendingTask ? (
                                                            <span className="flex items-center gap-1 text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-full">
                                                                <ArrowPathIcon className="w-3 h-3 animate-spin" />
                                                                Review
                                                            </span>
                                                        ) : isRejected ? (
                                                            <span className="flex items-center gap-1 text-[8px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 rounded-full">
                                                                Retry
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider hidden sm:flex items-center gap-1">
                                                                Start
                                                                <ArrowRightIcon className="w-3 h-3" />
                                                            </span>
                                                        )}
                                                    </div>

                                                    <ChevronRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 sm:hidden" />
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* ═══ FOOTER ═══ */}
                <div className="mt-10 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 flex flex-row sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 text-[9px] font-medium text-gray-400 dark:text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <ClockIcon className="w-3.5 h-3.5" />
                            Rewards credited after 24h verification
                        </div>
                        
                    </div>
                    <div className="flex items-center gap-3 text-[9px] font-medium text-gray-400 dark:text-gray-500">
                        <span>Total: {platformTasks.length}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                        <span className="text-emerald-600 dark:text-emerald-400">Done: {completedCount}</span>
                        {pendingCount > 0 && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <span className="text-blue-600 dark:text-blue-400">Pending: {pendingCount}</span>
                            </>
                        )}
                    </div>
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
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="text-[8px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                                                {previewTask.type}
                                            </span>
                                            <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-lg flex items-center gap-1">
                                                <CheckCircleIcon className="w-3 h-3" />
                                                Verified
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {previewTask.title}
                                        </h2>
                                        {previewTask.company?.name && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {previewTask.company.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <p className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Reward</p>
                                        <div className="text-2xl font-bold text-amber-500">
                                            {formatPKR(convertARNtoPKR(previewTask.reward))}
                                        </div>
                                        <div className="text-[9px] text-gray-400 dark:text-gray-500">
                                            ${(previewTask.reward / USD_TO_ARN).toFixed(2)} • +{previewTask.reward} ARN
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50">
                                        <p className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <InformationCircleIcon className="w-4 h-4 text-indigo-500" />
                                            Instructions
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {previewTask.description || "Complete the task and upload a screenshot as proof of completion."}
                                        </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200/50 dark:border-blue-500/10">
                                            <ClockIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                            <p className="text-[9px] font-medium text-blue-700 dark:text-blue-400">
                                                24-48 hrs
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/50 dark:border-emerald-500/10">
                                            <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                            <p className="text-[9px] font-medium text-emerald-700 dark:text-emerald-400">
                                                Auto-verified
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={handleStartTask}
                                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        Start Task
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setPreviewTask(null)}
                                        className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all"
                                    >
                                        Maybe Later
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
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
                            >
                                {submittedTaskId === selectedTask.id ? (
                                    /* ── Success / Under Review Screen ── */
                                    <div className="flex flex-col items-center text-center py-4 gap-6">
                                        <div className="relative">
                                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                                                <ClockIcon className="w-10 h-10 text-white" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full animate-ping" />
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900" />
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/30 px-4 py-1.5 rounded-full">
                                                Submitted Successfully
                                            </p>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
                                                Under Review
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
                                                Your proof has been submitted. Our team will review it within 24-48 hours.
                                            </p>
                                        </div>

                                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                                        </div>

                                        <div className="w-full grid grid-cols-2 gap-3">
                                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center border border-gray-200/50 dark:border-gray-700/50">
                                                <p className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Reward</p>
                                                <p className="text-sm font-bold text-amber-500">
                                                    {formatPKR(convertARNtoPKR(selectedTask.reward))}
                                                </p>
                                                <p className="text-[8px] text-gray-400 dark:text-gray-500">
                                                    ${(selectedTask.reward / USD_TO_ARN).toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center border border-gray-200/50 dark:border-gray-700/50">
                                                <p className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</p>
                                                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                                                    <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                                                    Reviewing
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={closeProofModal}
                                            className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95"
                                        >
                                            Got It
                                        </button>
                                    </div>
                                ) : (
                                    /* ── Proof Submission Form ── */
                                    <>
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <p className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Submit Proof</p>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{selectedTask.title}</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    <span>Reward: {formatPKR(convertARNtoPKR(selectedTask.reward))}</span>
                                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                                    <span>${(selectedTask.reward / USD_TO_ARN).toFixed(2)}</span>
                                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                                    <span>+{selectedTask.reward} ARN</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => !isPending && closeProofModal()}
                                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <XMarkIcon className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </div>

                                        {/* Upload Guide */}
                                        {showUploadGuide && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200/50 dark:border-blue-500/20"
                                            >
                                                <p className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                    <CameraIcon className="w-3.5 h-3.5" />
                                                    Upload Guide
                                                </p>
                                                <ul className="text-[10px] text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                                                    <li>Take a clear screenshot showing task completion</li>
                                                    <li>Include visible date and time if possible</li>
                                                    <li>Image should be in PNG, JPG, or WEBP format</li>
                                                </ul>
                                            </motion.div>
                                        )}

                                        <form action={handleSubmitProof} className="space-y-6">
                                            <div>
                                                <label className="block text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                                                    Upload Screenshot
                                                </label>
                                                <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-400 rounded-2xl p-8 text-center transition-all bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
                                                            <div className="w-full max-w-[220px] aspect-video rounded-xl overflow-hidden border-2 border-indigo-200 dark:border-indigo-500/30 shadow-md">
                                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-200/50 dark:border-emerald-500/20">
                                                                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                                                    Image Ready
                                                                </span>
                                                            </div>
                                                            <p className="text-[8px] text-gray-400 dark:text-gray-500">Tap to change image</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
                                                                <CameraIcon className="w-7 h-7 text-gray-400" />
                                                            </div>
                                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tap to upload</p>
                                                            <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, or WEBP</p>
                                                            <p className="text-[8px] text-gray-400/60 dark:text-gray-500/60 mt-1">Max file size: 5MB</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {feedback && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={cn(
                                                        "p-4 rounded-xl text-[10px] font-medium flex items-center gap-3 border",
                                                        feedback.type === 'error' 
                                                            ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-500/10' 
                                                            : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/10'
                                                    )}
                                                >
                                                    {feedback.type === 'error' 
                                                        ? <InformationCircleIcon className="w-5 h-5" /> 
                                                        : <CheckCircleIcon className="w-5 h-5" />
                                                    }
                                                    {feedback.message}
                                                </motion.div>
                                            )}

                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => closeProofModal()}
                                                    disabled={isPending}
                                                    className="flex-1 py-4 rounded-xl text-[9px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isPending}
                                                    className="flex-[2] py-4 rounded-xl text-[9px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                                                >
                                                    {isPending ? (
                                                        <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Uploading...</>
                                                    ) : 'Submit Proof'}
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
        </div>
    )
}