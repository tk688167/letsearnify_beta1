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
    status: string // This is likely the completion status (APPROVED/PENDING) or task status?
                   // Wait, in `getUserTasks` we map: 
                   // completionStatus: task.completions[0]?.status || null
                   // We need to make sure this is passed to the client.
    completionStatus?: string | null
    completionRemarks?: string | null // Added
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

    // State for granular status tracking
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
    
    // Using simple form action for file upload
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
                    // Upload
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

                // Submit Task
                const result = await completeTask(selectedTask.id, proof)
                
                if (result.success) {
                    // Update Local State immediately
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
        
        // Prevent clicking strictly PROCESSED tasks (Approved/Pending)
        // BUT allow clicking REJECTED tasks to retry
        if (state?.status === 'APPROVED' || state?.status === 'PENDING') return
        
        // Open link if exists
        if (task.link) {
            window.open(task.link, '_blank')
        }
        
        // Open Modal
        setSelectedTask(task)
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* ENHANCED HEADER SECTION */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-gray-900 to-black text-white shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-amber-500 rounded-full blur-3xl opacity-20"></div>
                
                <div className="relative px-6 py-8 sm:px-10 sm:py-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left max-w-xl">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                            <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider text-amber-300 border border-white/10">
                                Official Task Hub
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
                            Earn More, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">Faster.</span>
                        </h1>
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                            Complete verified tasks to instantly earn ARN tokens. Access inclusive <span className="text-white font-bold">Premium Opportunities</span> and daily <span className="text-white font-bold">Basic Tasks</span> to accelerate your tier upgrades.
                        </p>
                    </div>

                    {/* DASHBOARD STYLE STATS */}
                    <div className="flex gap-3 sm:gap-4 w-full md:w-auto justify-center">
                        <div className="flex-1 md:flex-none min-w-[140px] bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center hover:bg-white/15 transition-colors">
                             <div className="w-10 h-10 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-2 text-green-400">
                                <CheckCircleIcon className="w-6 h-6" />
                             </div>
                             <div className="text-2xl font-bold text-white">{Math.floor(Object.values(taskStates).filter(s => s.status === 'APPROVED').length)}</div>
                             <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tasks Completed</div>
                        </div>
                        <div className="flex-1 md:flex-none min-w-[140px] bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center hover:bg-white/15 transition-colors">
                             <div className="w-10 h-10 mx-auto bg-indigo-500/20 rounded-full flex items-center justify-center mb-2 text-indigo-400">
                                <SparklesIcon className="w-6 h-6" />
                             </div>
                             <div className="text-2xl font-bold text-white">{platformTasks.reduce((sum, t) => sum + t.reward, 0).toFixed(0)}</div>
                             <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Earnings (ARN)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TASKS CONTAINER */}
            <div className="space-y-12">
                
                {/* 1. PREMIUM TASKS (Highlighted & Modern) */}
                <section>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl text-amber-700 shadow-sm">
                                 <TrophyIcon className="w-6 h-6" />
                            </div>
                            <div>
                                 <h2 className="text-2xl font-bold text-gray-900">Premium Tasks</h2>
                                 <p className="text-sm text-gray-500 font-medium">Exclusive high-reward opportunities.</p>
                            </div>
                        </div>
                        {!userIsActive && (
                            <div className="w-full sm:w-auto bg-amber-50 border border-amber-100 px-4 py-2 rounded-lg flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wide">
                                    <BoltIcon className="w-4 h-4" /> Locked Access
                                </div>
                                <a href="/dashboard/wallet" className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-md transition-colors shadow-sm">
                                    Unlock Now
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {platformTasks.filter(t => t.type !== 'SOCIAL').map((task, index) => {
                            const state = taskStates[task.id]
                            const isApproved = state?.status === 'APPROVED'
                            const isPending = state?.status === 'PENDING'
                            const isCompleted = isApproved 
                            
                            // Locked State Overlay
                            if (!userIsActive) {
                                return (
                                    <div key={task.id} className="relative group bg-card rounded-2xl border border-border p-6 flex flex-col items-center justify-center text-center gap-4 overflow-hidden shadow-sm">
                                        {/* Background Decoration */}
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                                        
                                        <div className="relative z-20 flex flex-col items-center">
                                            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
                                                <TrophyIcon className="w-7 h-7" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-lg">Premium Opportunity</h3>
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                                Reward: {task.reward.toFixed(0)} ARN
                                            </div>
                                            <p className="text-xs text-gray-400 max-w-[200px] mt-2 leading-relaxed">
                                                Unlock this task and others by upgrading your account status.
                                            </p>
                                        </div>
                                        
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <a href="/dashboard/wallet" className="scale-110 shadow-xl px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm flex items-center gap-2 transform transition-transform hover:scale-115">
                                                <BoltIcon className="w-4 h-4 text-amber-400" /> Unlock Access
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
                                    className={`relative bg-gradient-to-br from-card to-amber-50/50 dark:from-card dark:to-amber-900/10 rounded-2xl p-6 border transition-all duration-300 ${
                                        isCompleted 
                                            ? 'border-green-200 shadow-none' 
                                            : 'border-amber-100 shadow-sm hover:shadow-lg hover:shadow-amber-100/50 hover:border-amber-300 hover:-translate-y-1'
                                    }`}
                                >
                                    {isCompleted && (
                                        <div className="absolute top-4 right-4 text-green-500 bg-green-50 rounded-full p-1">
                                            <CheckCircleIcon className="w-5 h-5" />
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between mb-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                                            {task.type}
                                        </span>
                                    </div>
                                    
                                    <h3 className="font-bold text-gray-900 text-lg mb-3 leading-tight">
                                        {task.title}
                                    </h3>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-amber-100/50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-gray-400">Reward</span>
                                            <div className="text-lg font-bold text-amber-600 flex items-center gap-1">
                                                <SparklesIcon className="w-5 h-5 text-amber-500" />
                                                {task.reward.toFixed(0)} ARN
                                            </div>
                                        </div>
                                        
                                        {!isCompleted && !isPending && (
                                            <button
                                                onClick={() => handleTaskClick(task)}
                                                className="px-5 py-2.5 bg-gray-900 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                                            >
                                                Start <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                        {isPending && <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100">Verifying...</span>}
                                        {isCompleted && <span className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold border border-green-100">Paid out</span>}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </section>

                {/* 2. BASIC TASKS (Clean & Professional) */}
                <section>
                    <div className="flex items-center gap-4 mb-6 border-t border-gray-100 pt-10">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                             <GiftIcon className="w-6 h-6" />
                        </div>
                        <div>
                             <h2 className="text-2xl font-bold text-gray-900">Basic Tasks</h2>
                             <p className="text-sm text-gray-500 font-medium">Steady growth for everyone. No restrictions.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {platformTasks.filter(t => t.type === 'SOCIAL').map((task, index) => {
                            const state = taskStates[task.id]
                            const isApproved = state?.status === 'APPROVED'
                            const isPending = state?.status === 'PENDING'
                            const isRejected = state?.status === 'REJECTED'

                            return (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`group relative bg-card rounded-2xl p-5 border transition-all duration-300 hover:shadow-md ${
                                        isApproved ? 'border-green-200 bg-green-50/20 dark:border-green-800 dark:bg-green-900/10' : 
                                        isPending ? 'border-blue-200 bg-blue-50/20 dark:border-blue-800 dark:bg-blue-900/10' :
                                        isRejected ? 'border-red-200 bg-red-50/20 dark:border-red-800 dark:bg-red-900/10' : 'border-border hover:border-indigo-200 dark:hover:border-indigo-800'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            {task.company?.logoUrl ? (
                                                <img src={task.company.logoUrl} alt="" className="w-8 h-8 rounded-full shadow-sm" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-bold border border-indigo-100">
                                                    {task.company?.name?.[0] || 'L'}
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">{task.company?.name || 'Platform'}</span>
                                                <span className="text-[10px] text-gray-400">Sponsored</span>
                                            </div>
                                        </div>
                                        {isApproved && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                                        {isRejected && <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded">Failed</span>}
                                    </div>

                                    <h3 className="font-bold text-gray-900 text-sm mb-4 min-h-[40px] line-clamp-2 leading-snug">
                                        {task.title}
                                    </h3>

                                    <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-auto">
                                        <div className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                                            +{task.reward} ARN
                                        </div>
                                        
                                        {!isApproved && !isPending && (
                                            <button
                                                onClick={() => handleTaskClick(task)}
                                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                    isRejected 
                                                    ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                                    : 'bg-card text-foreground border border-border hover:bg-indigo-600 hover:text-white hover:border-indigo-600'
                                                }`}
                                            >
                                                {isRejected ? 'Retry Task' : 'Start Task'}
                                            </button>
                                        )}
                                        {isPending && <span className="text-xs font-medium text-blue-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Checking</span>}
                                        {isApproved && <span className="text-xs font-medium text-green-600">Completed</span>}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </section>
            </div>
            
            {/* Minimal Footer Info */}
             <div className="mt-8 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
                 <p className="flex items-center justify-center gap-2">
                     <InformationCircleIcon className="w-4 h-4" />
                     Tasks are verified within 24 hours. Rewards are credited immediately upon approval.
                 </p>
             </div>
        </div>
    )
}
