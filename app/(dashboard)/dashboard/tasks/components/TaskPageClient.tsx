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
}

export default function TaskPageClient({ user, platformTasks, cfxUrl }: TaskPageClientProps) {
    const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
    const [isPending, startTransition] = useTransition()
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    const handleCompleteTask = (taskId: string) => {
        startTransition(async () => {
            try {
                const result = await completeTask(taskId)
                if (result.success) {
                    setCompletedTasks(prev => new Set([...prev, taskId]))
                    setFeedback({ type: 'success', message: result.message || 'Task completed!' })
                    setTimeout(() => setFeedback(null), 5000)
                } else {
                    setFeedback({ type: 'error', message: result.error || 'Failed to complete task' })
                    setTimeout(() => setFeedback(null), 3000)
                }
            } catch (error) {
                setFeedback({ type: 'error', message: 'Something went wrong' })
                setTimeout(() => setFeedback(null), 3000)
            }
        })
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
                        className="fixed top-4 left-4 right-4 sm:top-6 sm:right-6 sm:left-auto z-50"
                    >
                        <div className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl ${feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white font-bold flex items-center gap-2 sm:gap-3 text-sm sm:text-base`}>
                            {feedback.type === 'success' && <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                            {feedback.message}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section - ARN Token Economy Introduction */}
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
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{completedTasks.size}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">Tasks Completed</div>
                </div>
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{platformTasks.reduce((sum, t) => sum + t.reward, 0).toFixed(0)} ARN</div>
                    <div className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider leading-tight">Total Earnings Available</div>
                </div>
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{Array.from(completedTasks).reduce((sum, id) => sum + (platformTasks.find(t => t.id === id)?.reward || 0), 0).toFixed(0)} ARN</div>
                    <div className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">Your Total Earnings</div>
                </div>
            </div>

            {/* Tasks Grid */}
            <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">Earning Opportunities</h2>
                    <div className="hidden sm:flex text-sm text-gray-500">
                        <InformationCircleIcon className="w-4 h-4 inline mr-1" />
                        Complete to earn ARN tokens instantly
                    </div>
                </div>

                {platformTasks.length === 0 ? (
                    <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-dashed border-gray-200 p-8 sm:p-12 text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Tasks Available</h3>
                        <p className="text-sm sm:text-base text-gray-500">Check back later for new earning opportunities!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {platformTasks.map((task, index) => {
                            const isCompleted = completedTasks.has(task.id)
                            
                            return (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`group relative bg-white rounded-xl sm:rounded-[2rem] p-4 sm:p-6 border-2 transition-all duration-300 ${
                                        isCompleted 
                                            ? 'border-green-200 bg-green-50/50' 
                                            : 'border-gray-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/50'
                                    }`}
                                >
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
                                    </div>

                                    {/* ARN Reward Badge - Prominent */}
                                    <div className="mb-3 sm:mb-4">
                                        <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">You'll Earn:</div>
                                        <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl ${
                                            isCompleted 
                                                ? 'bg-green-100 text-green-700' 
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

                                    {/* Action Button */}
                                    {isCompleted ? (
                                        <div className="w-full py-3 sm:py-3.5 bg-green-100 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2 text-sm sm:text-base">
                                            <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                            ✓ ARN Earned
                                        </div>
                                    ) : task.link ? (
                                        <a
                                            href={task.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => handleCompleteTask(task.id)}
                                            className="w-full py-3 sm:py-4 bg-gray-900 hover:bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm sm:text-base"
                                        >
                                            Earn {task.reward.toFixed(0)} ARN Now
                                            <ArrowTopRightOnSquareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </a>
                                    ) : (
                                        <button
                                            onClick={() => handleCompleteTask(task.id)}
                                            disabled={isPending}
                                            className="w-full py-3 sm:py-4 bg-gray-900 hover:bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 text-sm sm:text-base"
                                        >
                                            {isPending ? 'Processing...' : `Earn ${task.reward.toFixed(0)} ARN`}
                                            <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                )}
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
