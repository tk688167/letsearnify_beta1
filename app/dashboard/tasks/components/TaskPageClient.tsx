"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    BriefcaseIcon, 
    GlobeAltIcon, 
    CheckCircleIcon, 
    ArrowTopRightOnSquareIcon,
    BanknotesIcon,
    InformationCircleIcon
} from "@heroicons/react/24/outline"

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
    const [activeTab, setActiveTab] = useState<'tasks' | 'surveys'>('tasks')
    const [showGuide, setShowGuide] = useState(true)

    // Calculate potential earnings from platform tasks
    const totalPotential = platformTasks.reduce((acc, t) => acc + t.reward, 0)

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto">
            
            {/* 1. Hero / Stats Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 text-white p-8 md:p-12 shadow-2xl">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-fuchsia-600/20 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/2 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Live Earning Center
                        </div>
                        <h1 className="text-3xl md:text-5xl font-serif font-bold mb-3 leading-tight">
                            Task <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300">Marketplace</span>
                        </h1>
                        <p className="text-gray-400 max-w-lg text-lg leading-relaxed">
                            Turn your spare time into real cash. Complete simple tasks or take surveys to boost your balance instantly.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center gap-6 min-w-[280px] shadow-lg">
                         <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center text-green-400 border border-green-500/10">
                             <BanknotesIcon className="w-8 h-8" />
                         </div>
                         <div>
                             <div className="text-sm text-gray-400 font-medium mb-1">Potential Earnings</div>
                             <div className="text-4xl font-bold font-mono text-white tracking-tight">
                                 ${totalPotential.toFixed(2)}<span className="text-lg text-gray-500 font-normal">+</span>
                             </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* 2. Navigation & Guide Toggle */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
                <div className="flex p-1.5 bg-white border border-gray-100 rounded-2xl w-full md:w-fit shadow-sm">
                    <button 
                        onClick={() => setActiveTab('tasks')}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'tasks' 
                            ? 'bg-gray-900 text-white shadow-md' 
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <BriefcaseIcon className="w-5 h-5" />
                        Quick Tasks
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ml-1 ${activeTab === 'tasks' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                            {platformTasks.length}
                        </span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('surveys')}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'surveys' 
                            ? 'bg-gray-900 text-white shadow-md' 
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <GlobeAltIcon className="w-5 h-5" />
                        Survey Wall
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ml-1 uppercase ${activeTab === 'surveys' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}>
                            HOT
                        </span>
                    </button>
                </div>

                <button 
                    onClick={() => setShowGuide(!showGuide)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                >
                    <InformationCircleIcon className="w-5 h-5" />
                    {showGuide ? "Hide Guide" : "How it Works"}
                </button>
            </div>

            {/* 3. How It Works (Collapsible) */}
            <AnimatePresence>
                {showGuide && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex gap-4 items-start">
                                <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm border border-indigo-200">1</span>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Select a Task</h4>
                                    <p className="text-xs text-gray-500 mt-1">Browse available tasks or surveys based on reward amount.</p>
                                </div>
                            </div>
                            <div className="bg-fuchsia-50/50 border border-fuchsia-100 rounded-2xl p-4 flex gap-4 items-start">
                                <span className="flex-shrink-0 w-8 h-8 bg-fuchsia-100 text-fuchsia-600 rounded-full flex items-center justify-center font-bold text-sm border border-fuchsia-200">2</span>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Complete Action</h4>
                                    <p className="text-xs text-gray-500 mt-1">Follow instructions carefully (e.g., watch video, fill survey).</p>
                                </div>
                            </div>
                            <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 flex gap-4 items-start">
                                <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm border border-green-200">3</span>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Get Paid</h4>
                                    <p className="text-xs text-gray-500 mt-1">Rewards are automatically credited to your wallet balance.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 4. Content Area */}
            <AnimatePresence mode="wait">
                {activeTab === 'tasks' ? (
                    <motion.div 
                        key="tasks"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {platformTasks.length > 0 ? platformTasks.map((task) => (
                            <div key={task.id} className="group bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                                
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-full uppercase tracking-wider border border-gray-100 self-start">
                                                {task.type}
                                            </span>
                                            {task.company && (
                                                <div className="flex items-center gap-1.5 mt-1">
                                                     {task.company.logoUrl && <img src={task.company.logoUrl} alt="" className="w-4 h-4 rounded-full object-cover"/>}
                                                     <span className="text-xs text-gray-400 font-medium">{task.company.name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 font-mono text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                                            <span className="text-sm">$</span><span className="text-lg">{task.reward.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    
                                    <h3 className="font-bold text-gray-900 text-xl mb-3 leading-tight group-hover:text-indigo-600 transition-colors">
                                        {task.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-6 leading-relaxed line-clamp-3">
                                        {task.description}
                                    </p>
                                </div>
                                
                                {task.link ? (
                                    <a 
                                      href={task.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-gray-200 group-hover:shadow-indigo-200"
                                    >
                                        Start Now
                                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                    </a>
                                ) : (
                                    <button disabled className="w-full py-4 bg-gray-50 text-gray-400 rounded-xl font-bold cursor-not-allowed border border-gray-100 flex items-center justify-center gap-2">
                                        <InformationCircleIcon className="w-5 h-5" />
                                        Unavailable
                                    </button>
                                )}
                            </div>
                        )) : (
                            <div className="col-span-full py-24 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircleIcon className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Caught Up!</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    There are no quick tasks available right now. 
                                    <br/>Try the <button onClick={() => setActiveTab('surveys')} className="text-indigo-600 font-bold hover:underline">Survey Wall</button> for more opportunities.
                                </p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="surveys"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100 overflow-hidden"
                    >
                        <div className="bg-white px-6 md:px-8 py-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                           <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                  <GlobeAltIcon className="w-6 h-6" />
                               </div>
                               <div>
                                   <h2 className="text-base font-bold text-gray-900">
                                       Global Survey Partners
                                   </h2>
                                   <p className="text-xs text-gray-500">
                                       High-paying offers • Verified Rewards
                                   </p>
                               </div>
                           </div>
                           <div className="text-xs font-mono bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 text-gray-500">
                              User ID: <span className="text-gray-900 font-bold">{user.id}</span>
                           </div>
                        </div>

                        <div className="w-full h-[800px] md:h-[1200px] bg-gray-50 relative">
                             {/* Loading Skeleton underneath */}
                             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 z-0">
                                 <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-4" />
                                 <p className="font-medium">Connecting to Survey Partners...</p>
                             </div>
                             <iframe 
                                src={cfxUrl}
                                title="Surveys"
                                className="w-full h-full relative z-10"
                                frameBorder="0"
                                allow="camera; microphone; geolocation"
                             />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
