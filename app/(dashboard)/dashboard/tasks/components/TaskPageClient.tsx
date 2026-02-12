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
        <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto pb-12 px-4 sm:px-6">
            
            {/* Feedback Toast */}
            <AnimatePresence>
                {feedback && (
                    <motion.div 
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-4 left-4 right-4 sm:top-6 sm:right-6 sm:left-auto z-[60]"
                    >
                        <div className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl ${feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white font-bold flex items-center gap-2 sm:gap-3 text-sm sm:text-base`}>
                            {feedback.type === 'success' && <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                            {feedback.message}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Proof Submission Modal */}
            <AnimatePresence>
                {selectedTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedTask(null)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-lg relative z-50 shadow-2xl overflow-hidden"
                        >
                             <button onClick={() => setSelectedTask(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                 </svg>
                             </button>

                             <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 mb-2">Submit Proof</h3>
                             <p className="text-gray-500 text-sm mb-6">
                                 Upload a screenshot or provide proof that you completed: <span className="font-bold text-indigo-600">{selectedTask.title}</span>
                             </p>

                             {/* Tabs */}
                             <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                                 <button 
                                    onClick={() => setProofType('image')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${proofType === 'image' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                 >
                                     Screenshot
                                 </button>
                                 <button 
                                    onClick={() => setProofType('text')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${proofType === 'text' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                 >
                                     Text / Link
                                 </button>
                             </div>

                             <form action={handleSubmitProof} className="space-y-4">
                                 {proofType === 'image' ? (
                                     <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors cursor-pointer relative group">
                                         <input 
                                            type="file" 
                                            name="file" // Changed to 'file' to match server action
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                         />
                                         <div className="flex flex-col items-center gap-2 pointer-events-none">
                                              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                                                  <ArrowTopRightOnSquareIcon className="w-6 h-6 rotate-[-45deg]" /> {/* Access generic upload icon via generic icon lol */}
                                                  {/* Actually use CloudArrowUpIcon if available, else generic */}
                                              </div>
                                              <span className="text-sm font-bold text-gray-700">Click to Upload Screenshot</span>
                                              <span className="text-xs text-gray-400">Supports JPG, PNG (Max 5MB)</span>
                                         </div>
                                     </div>
                                 ) : (
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Proof Details</label>
                                         <textarea 
                                             value={proofText}
                                             onChange={(e) => setProofText(e.target.value)}
                                             placeholder="Enter username, URL, or details..."
                                             className="w-full h-32 px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none text-sm"
                                         />
                                     </div>
                                 )}

                                 <button 
                                     disabled={isPending}
                                     className="w-full py-3.5 bg-gray-900 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                                 >
                                     {isPending ? <span className="animate-pulse">Submitting...</span> : 'Submit for Review'}
                                 </button>
                             </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Hero Section ... */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 sm:p-8 md:p-12 shadow-2xl"
            >
                {/* Animated Background */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl animate-pulse delay-700" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center">
                            <BoltIcon className="w-5 h-5 sm:w-7 sm:h-7 text-blue-200" />
                        </div>
                        <span className="px-3 py-1 sm:px-4 bg-white/20 backdrop-blur-md rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider">💰 Earning Opportunities</span>
                    </div>
                    
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 sm:mb-4 leading-tight">
                        Turn Your Time Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">ARN Earnings.</span>
                    </h1>
                    
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-indigo-100 max-w-2xl mb-6 sm:mb-8 leading-relaxed">
                        Each task you complete credits <strong>real ARN tokens</strong> directly to your account. ARN gives you purchasing power within our ecosystem—upgrade tiers, unlock premium pools, and accelerate your earning potential.
                    </p>

                    {/* ARN Token Benefits */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20">
                            <GiftIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200 mb-1 sm:mb-2" />
                            <h3 className="font-bold text-sm sm:text-base mb-1">Instant Payouts</h3>
                            <p className="text-xs sm:text-sm text-indigo-100">ARN credited immediately</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20">
                            <TrophyIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200 mb-1 sm:mb-2" />
                            <h3 className="font-bold text-sm sm:text-base mb-1">Higher Tier = More Income</h3>
                            <p className="text-xs sm:text-sm text-indigo-100">Spend ARN to unlock bigger rewards</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20">
                            <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200 mb-1 sm:mb-2" />
                            <h3 className="font-bold text-sm sm:text-base mb-1">Real Value</h3>
                            <p className="text-xs sm:text-sm text-indigo-100">ARN has utility across the platform</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Task Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{platformTasks.length}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">Earning Opportunities</div>
                </div>
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{Object.values(taskStates).filter(s => s.status === 'APPROVED').length}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">Tasks Completed</div>
                </div>
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{platformTasks.reduce((sum, t) => sum + t.reward, 0).toFixed(0)} ARN</div>
                    <div className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider leading-tight">Total Earnings Available</div>
                </div>
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{Object.keys(taskStates).reduce((sum, id) => {
                         const state = taskStates[id]
                         if (state.status === 'APPROVED') {
                             return sum + (platformTasks.find(t => t.id === id)?.reward || 0)
                         }
                         return sum
                    }, 0).toFixed(0)} ARN</div>
                    <div className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">Your Total Earnings</div>
                </div>
            </div>

            {/* Tasks Grid */}
            <div className="space-y-12">
                {/* 1. BASIC TASKS (Free) */}
                <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
                           <GiftIcon className="w-6 h-6 text-indigo-500" />
                           Basic Tasks
                           <span className="text-xs font-sans font-normal bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase tracking-wider">Free Access</span>
                        </h2>
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
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`group relative bg-white rounded-xl sm:rounded-[2rem] p-4 sm:p-6 border-2 transition-all duration-300 ${
                                        isApproved
                                            ? 'border-green-200 bg-green-50/50' 
                                            : isPending
                                            ? 'border-blue-200 bg-blue-50/50'
                                            : isRejected
                                            ? 'border-red-200 bg-red-50/50'
                                            : 'border-gray-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/50'
                                    }`}
                                >
                                    {/* Completion Badge */}
                                    {isApproved && (
                                        <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-10">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 sm:border-4 border-white">
                                                <CheckCircleIcon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Task Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                {task.type}
                                            </span>
                                            {task.company && (
                                                <div className="flex items-center gap-1">
                                                    {task.company.logoUrl && (
                                                        <img src={task.company.logoUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                                                    )}
                                                    <span className="text-xs text-gray-400 font-medium">{task.company.name}</span>
                                                </div>
                                            )}
                                        </div>
                                        {/* Status Text for non-approved states */}
                                        {isPending && <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">Under Review</span>}
                                        {isRejected && <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-2 py-1 rounded-lg">Action Required</span>}
                                    </div>

                                    {/* ARN Reward Badge - Prominent */}
                                    <div className="mb-3 sm:mb-4">
                                        <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">You'll Earn:</div>
                                        <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl ${
                                            isApproved
                                                ? 'bg-green-100 text-green-700' 
                                                : isPending
                                                ? 'bg-blue-100 text-blue-700'
                                                : isRejected
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                        }`}>
                                            <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                            {task.reward.toFixed(0)} ARN
                                        </div>
                                    </div>

                                    {/* Task Content */}
                                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 leading-tight">
                                        {task.title}
                                    </h3>
                                    <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed line-clamp-3">
                                        {task.description}
                                    </p>
                                    
                                    {/* Rejection Remarks */}
                                    {isRejected && state.remarks && (
                                        <div className="mb-4 text-xs p-3 bg-white/60 border border-red-200 rounded-lg text-red-700">
                                            <span className="font-bold">Admin Feedback:</span> {state.remarks}
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    {isApproved ? (
                                        <div className="w-full py-3 sm:py-3.5 bg-green-100 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2 text-sm sm:text-base">
                                            <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                            ✓ Completed
                                        </div>
                                    ) : isPending ? (
                                        <div className="w-full py-3 sm:py-3.5 bg-blue-100 text-blue-700 rounded-xl font-bold flex items-center justify-center gap-2 text-sm sm:text-base cursor-not-allowed">
                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            Pending Review
                                        </div>
                                     ) : (
                                        <button
                                            onClick={() => handleTaskClick(task)}
                                            disabled={isPending} // Global loading state
                                            className={`w-full py-3 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 text-sm sm:text-base ${
                                                isRejected 
                                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                                : 'bg-gray-900 hover:bg-indigo-600 text-white'
                                            }`}
                                        >
                                            {task.link && <ArrowTopRightOnSquareIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                                            {isRejected ? 'Fix & Resubmit' : `Earn ${task.reward.toFixed(0)} ARN`}
                                            {!task.link && <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                                        </button>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* 2. PREMIUM TASKS (Locked unless active member) */}
                <div>
                     <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
                           <TrophyIcon className="w-6 h-6 text-amber-500" />
                           Premium Tasks
                           {!userIsActive && (
                               <span className="text-xs font-sans font-normal bg-amber-100 text-amber-800 px-2 py-1 rounded-full uppercase tracking-wider">Locked</span>
                           )}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {platformTasks.filter(t => t.type !== 'SOCIAL').map((task, index) => {
                            const state = taskStates[task.id]
                            const isApproved = state?.status === 'APPROVED'
                            const isPending = state?.status === 'PENDING'
                            const isRejected = state?.status === 'REJECTED'
                            
                            const isCompleted = isApproved // For backward compatibility with variable name in current scope
                            
                            // Locked State Overlay
                            if (!userIsActive) {
                                return (
                                    <div key={task.id} className="relative group bg-gray-50 rounded-xl sm:rounded-[2rem] p-4 sm:p-6 border-2 border-dashed border-gray-200 opacity-75 hover:opacity-100 transition-all overflow-hidden">
                                        <div className="absolute inset-0 z-20 backdrop-blur-[2px] bg-white/40 flex flex-col items-center justify-center text-center p-4">
                                            <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mb-3 shadow-xl">
                                                <BoltIcon className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 mb-1">Unlock Premium Task</h3>
                                            <p className="text-xs text-gray-600 mb-3 max-w-[200px]">Deposit $1.00 or more to access high-reward tasks.</p>
                                            <a href="/dashboard/wallet" className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-colors">
                                                Unlock Now
                                            </a>
                                        </div>
                                        {/* Blurred Content Preview */}
                                        <div className="blur-sm select-none pointer-events-none">
                                            <div className="flex justify-between mb-4">
                                                <span className="px-3 py-1 bg-gray-200 text-gray-500 text-[10px] font-bold rounded-full">{task.type}</span>
                                            </div>
                                            <div className="mb-4">
                                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">You'll Earn:</div>
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-500 rounded-xl font-bold text-lg">
                                                    <SparklesIcon className="w-5 h-5" />
                                                    {task.reward.toFixed(0)} ARN
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-gray-800 text-lg mb-2">{task.title}</h3>
                                            <p className="text-gray-400 text-xs line-clamp-2">{task.description}</p>
                                        </div>
                                    </div>
                                )
                            }

                            // Unlocked Premium Task
                            return (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`group relative bg-white rounded-xl sm:rounded-[2rem] p-4 sm:p-6 border-2 transition-all duration-300 ${
                                        isCompleted 
                                            ? 'border-green-200 bg-green-50/50' 
                                            : 'border-amber-100 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-100/50'
                                    }`}
                                >
                                    {/* Premium Badge */}
                                    <div className="absolute top-0 right-0 bg-amber-400 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-[1.8rem]">
                                        PREMIUM
                                    </div>

                                    {/* Completion Badge */}
                                    {isCompleted && (
                                        <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-10">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 sm:border-4 border-white">
                                                <CheckCircleIcon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Task Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                {task.type}
                                            </span>
                                            {task.company && (
                                                <div className="flex items-center gap-1">
                                                    {task.company.logoUrl && (
                                                        <img src={task.company.logoUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                                                    )}
                                                    <span className="text-xs text-gray-400 font-medium">{task.company.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ARN Reward Badge - Prominent */}
                                    <div className="mb-3 sm:mb-4">
                                        <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">You'll Earn:</div>
                                        <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl ${
                                            isCompleted 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                                        }`}>
                                            <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                            {task.reward.toFixed(0)} ARN
                                        </div>
                                    </div>

                                    {/* Task Content */}
                                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 leading-tight">
                                        {task.title}
                                    </h3>
                                    <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed line-clamp-3">
                                        {task.description}
                                    </p>

                                    {/* Action Button */}
                                    {isCompleted ? (
                                        <div className="w-full py-3 sm:py-3.5 bg-green-100 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2 text-sm sm:text-base">
                                            <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                            ✓ Submitted / Paid
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleTaskClick(task)}
                                            disabled={isPending}
                                            className="w-full py-3 sm:py-4 bg-gray-900 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 text-sm sm:text-base"
                                        >
                                            {task.link && <ArrowTopRightOnSquareIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                                            {isPending ? 'Processing...' : `Earn ${task.reward.toFixed(0)} ARN`}
                                            {!task.link && <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                                        </button>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* ARN Info Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-100">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <InformationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                    Why ARN Tokens Have Value
                </h3>
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 leading-relaxed">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">💰 What Makes ARN Valuable?</h4>
                        <p>ARN is our platform's native digital asset with <strong>real utility</strong>. Every ARN token you earn can be spent to upgrade your tier, unlock premium investment pools, access exclusive features, and multiply your earning potential. It's not just points—it's purchasing power.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">🚀 How to Maximize Your ARN Earnings?</h4>
                        <p>Complete all available tasks to accumulate ARN, then strategically invest your ARN to upgrade tiers. <strong>Higher tiers = higher commissions, bigger pool shares, and faster wealth growth.</strong> Your ARN balance is your key to financial acceleration.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
