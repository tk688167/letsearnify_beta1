"use client"

import { useState, useEffect, useTransition, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import ClipboardDocumentListIcon from "@heroicons/react/24/outline/ClipboardDocumentListIcon"
import ShieldCheckIcon from "@heroicons/react/24/outline/ShieldCheckIcon"
import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon"
import BuildingOfficeIcon from "@heroicons/react/24/outline/BuildingOfficeIcon"
import PlusIcon from "@heroicons/react/24/outline/PlusIcon"
import TasksTable from "./TasksTable"
import ApprovalsPanel from "./ApprovalsPanel"
import TaskModal from "./TaskModal"
import { deleteTask } from "@/app/actions/admin/tasks"

interface TaskAdminClientProps {
    tasks: any[]
    companies: any[]
    pendingCompletions: any[]
}

type TabType = 'BASIC' | 'PREMIUM' | 'APPROVALS' | 'COMPANIES'

export default function TaskAdminClient({ tasks: initialTasks, companies, pendingCompletions }: TaskAdminClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState<TabType>('BASIC')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<any>(null)
    const [defaultType, setDefaultType] = useState<string>("BASIC")
    
    // Manage local tasks for immediate (optimistic) UI updates
    const [localTasks, setLocalTasks] = useState(initialTasks)

    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab === 'approvals') {
            setActiveTab('APPROVALS')
        }
    }, [searchParams])

    useEffect(() => {
        setLocalTasks(initialTasks)
    }, [initialTasks])

    const handleDelete = async (id: string) => {
        if (!confirm("Permanently delete this task?")) return
        
        // Optimistic update: remove immediately from UI
        setLocalTasks(prev => prev.filter((t: any) => t.id !== id))
        
        startTransition(async () => {
            const res = await deleteTask(id)
            if (!res?.success) {
                // Rollback if failed
                setLocalTasks(initialTasks)
                alert(res?.error || "Failed to delete task")
            } else {
                router.refresh()
            }
        })
    }

    const handleSuccess = (updatedTask: any) => {
        setIsModalOpen(false)
        
        // Immediate UI Update
        setLocalTasks(prev => {
            const exists = prev.find((t: any) => t.id === updatedTask.id)
            if (exists) {
                // Update existing
                return prev.map((t: any) => t.id === updatedTask.id ? updatedTask : t)
            } else {
                // Prepend new
                return [updatedTask, ...prev]
            }
        })

        // Background Sync
        router.refresh()
    }

    const openCreateModal = (type: string) => {
        setDefaultType(type)
        setEditingTask(null)
        setIsModalOpen(true)
    }

    // Categorization Logic
    const basicTasks = localTasks.filter((t: any) => t.type === 'BASIC' || !['PREMIUM'].includes(t.type))
    const premiumTasks = localTasks.filter((t: any) => t.type === 'PREMIUM')

    const tabs = [
        { id: 'BASIC', label: 'Basic Tasks', icon: ClipboardDocumentListIcon, count: basicTasks.length },
        { id: 'PREMIUM', label: 'Premium Tasks', icon: ShieldCheckIcon, count: premiumTasks.length },
        { id: 'APPROVALS', label: 'Verification Approvals', icon: UserGroupIcon, count: pendingCompletions.length },
        { id: 'COMPANIES', label: 'Partner Companies', icon: BuildingOfficeIcon, count: companies.length },
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="space-y-2 text-center md:text-left">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Task Ecosystem</h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 font-medium tracking-tight">Manage standard rewards, premium activations, and user submissions.</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-nowrap overflow-x-auto pb-4 md:pb-0 gap-2 px-1 scrollbar-hide">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap border-2 rotate-0 ${
                                isActive 
                                ? "bg-white dark:bg-slate-900 border-indigo-600 text-indigo-600 shadow-xl shadow-indigo-500/5 scale-105 z-10" 
                                : "bg-white/50 dark:bg-slate-800/30 border-transparent text-gray-400 hover:bg-white dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-slate-200"
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`px-2 py-1 rounded-lg text-[9px] ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-gray-500'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden min-h-[450px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        {activeTab === 'BASIC' && (
                            <div className="space-y-0">
                                <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-gray-50 dark:border-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                                            <ClipboardDocumentListIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-widest">Standard Rewards</h3>
                                            <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-tight">Public earning tasks for all users</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => openCreateModal("BASIC")}
                                        className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" /> Add Basic Task
                                    </button>
                                </div>
                                <TasksTable tasks={basicTasks} onEdit={(t) => { setEditingTask(t); setIsModalOpen(true) }} onDelete={handleDelete} />
                            </div>
                        )}
                        {activeTab === 'PREMIUM' && (
                            <div className="space-y-0">
                                <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-gray-50 dark:border-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                            <ShieldCheckIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-widest">Exclusive Pools</h3>
                                            <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-tight">Premium high-yield activations</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => openCreateModal("PREMIUM")}
                                        className="flex items-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" /> Add Premium Task
                                    </button>
                                </div>
                                <TasksTable tasks={premiumTasks} onEdit={(t) => { setEditingTask(t); setIsModalOpen(true) }} onDelete={handleDelete} />
                            </div>
                        )}
                        {activeTab === 'APPROVALS' && (
                            <ApprovalsPanel completions={pendingCompletions} />
                        )}
                        {activeTab === 'COMPANIES' && (
                            <div className="p-12 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                                Partner Companies Management - coming soon in this view.
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Modals */}
            {isModalOpen && (
                <TaskModal 
                    task={editingTask} 
                    companies={companies} 
                    defaultType={defaultType}
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={handleSuccess} 
                />
            )}
        </div>
    )
}
