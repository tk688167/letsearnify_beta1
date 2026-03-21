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
    InformationCircleIcon
} from "@heroicons/react/24/outline"
import { completeTask } from "@/app/actions/user/tasks"

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

export default function TaskPageClient({ user, platformTasks, cfxUrl, isUnlocked }: TaskPageClientProps) {
    const userIsActive = isUnlocked

    const [taskStates, setTaskStates] = useState<Record<string, { status: string, remarks?: string | null }>>(() => {
        const initialStates: Record<string, { status: string, remarks?: string | null }> = {}
        platformTasks.forEach(task => {
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

    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [proofType, setProofType] = useState<'text' | 'image'>('image')
    const [proofText, setProofText] = useState('')
    
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

                    setFeedback({ type: 'success', message: result.message || 'Task submitted for review!' })
                    setSelectedTask(null)
                    setProofText("")
                } else {
                    setFeedback({ type: 'error', message: result.error || 'Failed to submit' })
                }
            } catch (error) {
                setFeedback({ type: 'error', message: 'Something went wrong' })
            }
        })
    }

    const handleTaskClick = (task: Task) => {
        const state = taskStates[task.id]
        
        if (state?.status === 'APPROVED' || state?.status === 'PENDING') return
        
        if (task.link) {
            window.open(task.link, '_blank')
        }
        
        setSelectedTask(task)
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8 sm:space-y-12">
            
            {/* ═══ TASK CENTER BANNER ═══ */}
            <div className="relative overflow-hidden rounded-2xl text-white"
              style={{ background: "linear-gradient(135deg, #0f0f23 0%, #1e1040 45%, #0d1117 100%)" }}>

              <div className="absolute -top-8 right-0 w-40 h-40 bg-indigo-600/12 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 -left-8 w-36 h-36 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zm40 0h1v40h-1zM0 0v1h41V0zm0 40v1h41v-1z'/%3E%3C/g%3E%3C/svg%3E\")" }} />

              <div className="relative z-10 px-5 sm:px-7 py-4 sm:py-5 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3">
                <div className="min-w-0 text-center sm:text-left flex-1">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-[8px] font-bold uppercase tracking-[0.18em] text-amber-300/80 mb-1.5">
                    <BoltIcon className="w-2.5 h-2.5" />
                    Official Task Hub
                  </div>
                  <h1 className="text-sm sm:text-base font-bold tracking-tight leading-tight mb-0.5">
                    Earn More,{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">Faster.</span>
                  </h1>
                  <p className="text-white/40 text-[10px] max-w-xs leading-relaxed">
                    Complete verified tasks for ARN tokens
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <div className="min-w-[68px] sm:min-w-[80px] bg-white/6 border border-white/8 rounded-xl p-2 sm:p-2.5 text-center">
                    <div className="text-base sm:text-lg font-black text-emerald-400 leading-none mb-0.5">
                      {Math.floor(Object.values(taskStates).filter(s => s.status === 'APPROVED').length)}
                    </div>
                    <div className="text-[8px] font-bold text-white/30 uppercase tracking-wider">Done</div>
                  </div>
                  <div className="min-w-[68px] sm:min-w-[80px] bg-white/6 border border-white/8 rounded-xl p-2 sm:p-2.5 text-center">
                    <div className="text-base sm:text-lg font-black text-amber-400 leading-none mb-0.5">
                      {(platformTasks.reduce((sum, t) => sum + t.reward, 0)).toFixed(0)}
                    </div>
                    <div className="text-[8px] font-bold text-white/30 uppercase tracking-wider">ARN</div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
            </div>

            {/* TASKS CONTAINER */}
            <div className="space-y-8 sm:space-y-12">
                
                {/* 1. PREMIUM TASKS */}
                <section>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl text-amber-700 shadow-sm">
                                 <TrophyIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                 <h2 className="text-xl sm:text-2xl font-bold text-foreground">Premium Tasks</h2>
                                 <p className="text-xs sm:text-sm text-muted-foreground font-medium">Exclusive high-reward opportunities.</p>
                            </div>
                        </div>
                        {!userIsActive && (
                            <div className="w-full sm:w-auto bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide">
                                    <BoltIcon className="w-4 h-4" /> Locked
                                </div>
                                <a href="/dashboard/wallet" className="text-[10px] sm:text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-md transition-colors shadow-sm">
                                    Unlock Now
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                        {platformTasks.filter(t => t.type !== 'SOCIAL').map((task, index) => {
                            const state = taskStates[task.id]
                            const isApproved = state?.status === 'APPROVED'
                            const isPendingTask = state?.status === 'PENDING'
                            const isCompleted = isApproved 
                            
                            if (!userIsActive) {
                                return (
                                    <div key={task.id} className="relative group bg-card rounded-2xl border border-border p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-2 sm:gap-3 overflow-hidden shadow-sm min-h-[180px]">
                                        <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                                        
                                        <div className="relative z-20 flex flex-col items-center">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 sm:mb-2 text-gray-400 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 group-hover:text-amber-500 transition-colors">
                                                <TrophyIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <h3 className="font-bold text-foreground text-sm sm:text-base">Premium Opportunity</h3>
                                            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-muted-foreground bg-gray-50 dark:bg-gray-800/50 px-2 sm:px-2.5 py-1 sm:py-1 rounded-full border border-gray-100 dark:border-gray-800 mt-1">
                                                <span className="w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                Reward: {task.reward.toFixed(0)} ARN
                                            </div>
                                            <p className="text-[9px] sm:text-[10px] text-muted-foreground max-w-[180px] mt-1.5 leading-relaxed">
                                                Unlock this task and others by upgrading your status.
                                            </p>
                                        </div>
                                        
                                        {/* Fixed overlay — rounded + no scale overflow */}
                                        <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
                                            <a href="/dashboard/wallet" className="shadow-xl px-4 sm:px-5 py-2 sm:py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5">
                                                <BoltIcon className="w-3.5 h-3.5 text-amber-400 dark:text-amber-500" /> Unlock
                                            </a>
                                        </div>
                                    </div>
                                )
                            }

                            return (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`relative bg-gradient-to-br from-card to-amber-50/50 dark:from-card dark:to-amber-900/10 rounded-2xl p-4 sm:p-6 border transition-all duration-300 ${
                                        isCompleted 
                                            ? 'border-green-200 dark:border-green-800 shadow-none' 
                                            : 'border-amber-100 dark:border-amber-800/50 shadow-sm hover:shadow-lg hover:shadow-amber-100/50 dark:hover:shadow-amber-900/20 hover:border-amber-300 hover:-translate-y-1'
                                    }`}
                                >
                                    {isCompleted && (
                                        <div className="absolute top-4 right-4 text-green-500 bg-green-50 rounded-full p-1">
                                            <CheckCircleIcon className="w-5 h-5" />
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold border border-amber-100 dark:border-amber-800/50">
                                                {task.title.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wide">Premium Partner</span>
                                                <span className="text-[8px] sm:text-[10px] text-amber-500 dark:text-amber-400">Verified</span>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                                            {task.type}
                                        </span>
                                    </div>
                                    
                                    <h3 className="font-bold text-foreground text-sm sm:text-lg mb-2 sm:mb-3 leading-tight">
                                        {task.title}
                                    </h3>
                                    
                                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-amber-100/50 dark:border-amber-800/30">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground">Reward</span>
                                            <div className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                                                {task.reward.toFixed(0)} ARN
                                            </div>
                                        </div>
                                        
                                        {!isCompleted && !isPendingTask && (
                                            <button
                                                onClick={() => handleTaskClick(task)}
                                                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gray-900 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2"
                                            >
                                                Start <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            </button>
                                        )}
                                        {isPendingTask && <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] sm:text-xs font-bold border border-blue-100 dark:border-blue-800/50">Verifying...</span>}
                                        {isCompleted && <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-[10px] sm:text-xs font-bold border border-green-100 dark:border-green-800/50">Paid out</span>}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </section>

                {/* 2. BASIC TASKS */}
                <section>
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 border-t border-border pt-8 sm:pt-10">
                        <div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
                             <GiftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                             <h2 className="text-xl sm:text-2xl font-bold text-foreground">Basic Tasks</h2>
                             <p className="text-xs sm:text-sm text-muted-foreground font-medium">Steady growth for everyone. No restrictions.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                        {platformTasks.filter(t => t.type === 'SOCIAL').map((task, index) => {
                            const state = taskStates[task.id]
                            const isApproved = state?.status === 'APPROVED'
                            const isPendingTask = state?.status === 'PENDING'
                            const isRejected = state?.status === 'REJECTED'

                            return (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`group relative bg-card rounded-2xl p-4 sm:p-5 border transition-all duration-300 hover:shadow-md ${
                                        isApproved ? 'border-green-200 bg-green-50/20 dark:border-green-800 dark:bg-green-900/10' : 
                                        isPendingTask ? 'border-blue-200 bg-blue-50/20 dark:border-blue-800 dark:bg-blue-900/10' :
                                        isRejected ? 'border-red-200 bg-red-50/20 dark:border-red-800 dark:bg-red-900/10' : 'border-border hover:border-indigo-200 dark:hover:border-indigo-800'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            {task.company?.logoUrl ? (
                                                <img src={task.company.logoUrl} alt="" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-sm" />
                                            ) : (
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[10px] sm:text-xs font-bold border border-indigo-100 dark:border-indigo-800/50">
                                                    {task.company?.name?.[0] || 'L'}
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wide">{task.company?.name || 'Platform'}</span>
                                                <span className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500">Sponsored</span>
                                            </div>
                                        </div>
                                        {isApproved && <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />}
                                        {isRejected && <span className="text-[9px] sm:text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded">Failed</span>}
                                    </div>

                                    <h3 className="font-bold text-foreground text-xs sm:text-sm mb-3 sm:mb-4 min-h-[32px] sm:min-h-[40px] line-clamp-2 leading-snug">
                                        {task.title}
                                    </h3>

                                    <div className="flex items-center justify-between border-t border-border pt-3 sm:pt-4 mt-auto">
                                        <div className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-indigo-100 dark:border-indigo-800/50">
                                            +{task.reward} ARN
                                        </div>
                                        
                                        {!isApproved && !isPendingTask && (
                                            <button
                                                onClick={() => handleTaskClick(task)}
                                                className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                                                    isRejected 
                                                    ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 hover:dark:bg-red-900/40'
                                                    : 'bg-indigo-600 dark:bg-indigo-600 text-white border border-transparent hover:bg-indigo-700 dark:hover:bg-indigo-500'
                                                }`}
                                            >
                                                {isRejected ? 'Retry Task' : 'Start Task'}
                                            </button>
                                        )}
                                        {isPendingTask && <span className="text-[10px] sm:text-xs font-medium text-blue-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Checking</span>}
                                        {isApproved && <span className="text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-500">Completed</span>}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </section>

             {/* Minimal Footer Info */}
             <div className="mt-8 pt-8 border-t border-gray-100 dark:border-border text-center text-[10px] sm:text-xs text-muted-foreground">
                 <p className="flex items-center justify-center gap-1.5 sm:gap-2">
                     <InformationCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                     Tasks are verified within 24 hours. Rewards are credited immediately upon approval.
                 </p>
             </div>
            </div>

            {/* Task Submission Modal */}
            <AnimatePresence>
                {selectedTask && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isPending && setSelectedTask(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border p-5 sm:p-6 overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 mb-2">
                                        {selectedTask?.type}
                                    </span>
                                    <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                                        {selectedTask?.title}
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-0.5">Reward</span>
                                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 justify-end">
                                        <SparklesIcon className="w-4 h-4" />
                                        {selectedTask?.reward} ARN
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-muted/50 rounded-xl p-4 mb-6 text-sm text-foreground leading-relaxed whitespace-pre-wrap border border-border">
                                {selectedTask?.description || "Click the 'Start' button again to open the task link (if available). Then, complete the task instructions and upload your proof here."}
                            </div>

                            <form action={handleSubmitProof} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-2">Upload Screenshot Proof</label>
                                    <div className="border-2 border-dashed border-border rounded-xl p-4 sm:p-6 text-center hover:bg-muted/50 transition-colors">
                                        <input 
                                            type="file" 
                                            name="file" 
                                            accept="image/*" 
                                            required
                                            className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {feedback && (
                                    <div className={`p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${feedback?.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/50' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-900/50'}`}>
                                        {feedback?.type === 'error' ? <span>⚠️</span> : <CheckCircleIcon className="w-5 h-5" />}
                                        {feedback?.message}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTask(null)}
                                        disabled={isPending}
                                        className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl text-sm font-bold text-foreground bg-muted hover:bg-muted/80 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isPending ? 'Submitting...' : 'Submit Proof'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}