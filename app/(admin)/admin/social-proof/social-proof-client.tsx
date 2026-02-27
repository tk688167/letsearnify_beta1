"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { 
    ChartBarIcon, 
    PhotoIcon, 
    ArrowPathIcon,
    TrashIcon,
    PlusIcon,
    BanknotesIcon
} from "@heroicons/react/24/outline"
import { addPayoutProof, deletePayoutProof } from "@/app/actions/admin/social-proof"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Props = {
    initialStats: any
    initialProofs: any[]
    activityLogs: any[]
    historyData: any[] | null
}

export default function SocialProofClient({ initialStats, initialProofs, activityLogs, historyData }: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [activeTab, setActiveTab] = useState<'users' | 'liquidity' | 'payouts'>('users')
    
    // Proof Form State
    const [isAddProofOpen, setIsAddProofOpen] = useState(false)
    const [newProof, setNewProof] = useState({
        userName: "",
        amount: "",
        method: "USDT TRC20",
        imageUrl: "" 
    })

    // --- HANDLERS ---

    const handleRefresh = () => {
        startTransition(() => {
            router.refresh()
        })
    }

    const handleAddProof = (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(async () => {
             if (!newProof.imageUrl || !newProof.amount) return alert("Please fill all fields")

             const res = await addPayoutProof({
                 imageUrl: newProof.imageUrl,
                 amount: parseFloat(newProof.amount),
                 userName: newProof.userName,
                 method: newProof.method
             })

             if (res.success) {
                 alert("Proof added!")
                 setIsAddProofOpen(false)
                 setNewProof({ userName: "", amount: "", method: "USDT TRC20", imageUrl: "" })
                 router.refresh()
             } else {
                 alert("Failed to add proof")
             }
        })
    }

    const handleDeleteProof = (id: string) => {
        if (!confirm("Delete this proof?")) return
        startTransition(async () => {
             await deletePayoutProof(id)
             router.refresh()
        })
    }

    // Calculate System Balance
    const systemBalance = (initialStats.totalDeposited || 0) - (initialStats.totalPayouts || 0)

    return (
        <div className="space-y-4 md:space-y-6 pb-8 md:pb-12">
            
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-serif font-bold text-gray-900 dark:text-white">Platform Analytics</h1>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 mt-1">Real-time system metrics and historical trends.</p>
                </div>
                <button 
                    onClick={handleRefresh}
                    disabled={isPending}
                    className="px-4 py-2 md:py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm text-sm"
                >
                    <ArrowPathIcon className={`w-4 h-4 md:w-5 md:h-5 ${isPending ? 'animate-spin' : ''}`} />
                    Refresh Data
                </button>
            </div>

            {/* ── PART 1: LIVE STATS ── */}
            <section className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-slate-800/60 shadow-sm transition-colors">
                <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-100 dark:border-slate-800/60">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <ChartBarIcon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div>
                         <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-tight">Live System Status</h2>
                         <p className="text-[10px] md:text-xs text-gray-500 dark:text-slate-400">Real-time snapshot.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
                    <StatBox 
                        label="System Balance" 
                        value={`$${systemBalance.toLocaleString()}`} 
                        color="text-gray-900 dark:text-white" 
                        bg="bg-gray-100 dark:bg-slate-800/50 border-transparent dark:border-slate-700/50" 
                    />
                    <StatBox 
                        label="Total Users" 
                        value={initialStats.totalUsers} 
                        color="text-indigo-600 dark:text-indigo-400" 
                        bg="bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20" 
                    />
                    <StatBox 
                        label="Active Members" 
                        value={initialStats.activeOnline} 
                        color="text-emerald-600 dark:text-emerald-400" 
                        bg="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" 
                    />
                    <StatBox 
                        label="Total Liquidity" 
                        value={`$${initialStats.totalDeposited.toLocaleString()}`} 
                        color="text-blue-600 dark:text-blue-400" 
                        bg="bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20" 
                    />
                    <StatBox 
                        label="Total Payouts" 
                        value={`$${initialStats.totalPayouts.toLocaleString()}`} 
                        color="text-pink-600 dark:text-pink-400" 
                        bg="bg-pink-50 dark:bg-pink-500/10 border-pink-100 dark:border-pink-500/20" 
                    />
                </div>
            </section>

             {/* ── PART 2: HISTORICAL TRENDS ── */}
             {historyData && (
                <section className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-slate-800/60 shadow-sm transition-colors min-h-[350px]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-100 dark:border-slate-800/60">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                                <BanknotesIcon className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <div>
                                <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-tight">Growth History</h2>
                                <p className="text-[10px] md:text-xs text-gray-500 dark:text-slate-400">30-Day performance trends.</p>
                            </div>
                        </div>
                        
                        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto hide-scrollbar">
                            {['users', 'liquidity', 'payouts'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all capitalize whitespace-nowrap ${
                                        activeTab === tab 
                                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' 
                                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[250px] md:h-[300px] w-full -ml-4 md:ml-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={
                                            activeTab === 'users' ? '#6366f1' : 
                                            activeTab === 'liquidity' ? '#3b82f6' : '#ec4899'
                                        } stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor={
                                             activeTab === 'users' ? '#6366f1' : 
                                             activeTab === 'liquidity' ? '#3b82f6' : '#ec4899'
                                        } stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{fontSize: 10, fill: '#64748b'}} 
                                    tickLine={false}
                                    axisLine={false} 
                                    minTickGap={30}
                                />
                                <YAxis 
                                    tick={{fontSize: 10, fill: '#64748b'}} 
                                    tickLine={false}
                                    axisLine={false}
                                    width={45}
                                    tickFormatter={(value) => activeTab === 'users' ? value : `$${value}`}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        borderRadius: '12px', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                                    labelStyle={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey={activeTab === 'users' ? 'users' : activeTab === 'liquidity' ? 'deposits' : 'payouts'} 
                                    stroke={
                                        activeTab === 'users' ? '#6366f1' : 
                                        activeTab === 'liquidity' ? '#3b82f6' : '#ec4899'
                                    } 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorValue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>
             )}

            {/* ── PART 3: ACTIVITY LOGS ── */}
            <section className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-slate-800/60 shadow-sm transition-colors">
                <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-100 dark:border-slate-800/60">
                     <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                        <ArrowPathIcon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div>
                         <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-tight">Recent Activity</h2>
                         <p className="text-[10px] md:text-xs text-gray-500 dark:text-slate-400">Latest system events.</p>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {activityLogs.length === 0 ? (
                        <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 italic text-center py-4">No recent activity found.</p>
                    ) : (
                        activityLogs.map((log: any) => (
                            <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700/60 gap-2">
                                <div className="flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                                        log.type === 'USER_JOIN' ? 'bg-indigo-500' : 
                                        log.type === 'DEPOSIT' ? 'bg-emerald-500' : 'bg-red-500'
                                    }`}></span>
                                    <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-slate-300 line-clamp-2 sm:line-clamp-1">{log.description}</span>
                                </div>
                                <span className="text-[10px] md:text-xs text-gray-400 dark:text-slate-500 sm:shrink-0 pl-5 sm:pl-0" suppressHydrationWarning>
                                    {new Date(log.date).toLocaleString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* ── PART 4: PAYOUT PROOFS ── */}
            <section className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-slate-800/60 shadow-sm transition-colors">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                            <PhotoIcon className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-tight">Payout Proofs</h2>
                            <p className="text-[10px] md:text-xs text-gray-500 dark:text-slate-400">Marketing payout screenshots.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsAddProofOpen(true)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-xl hover:bg-black dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add New Proof
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {initialProofs.map((proof: any) => (
                        <div key={proof.id} className="relative group bg-gray-50 dark:bg-slate-800/50 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700/60 hover:border-gray-300 dark:hover:border-slate-600 transition-colors">
                            {/* Image Preview */}
                            <div className="aspect-[3/4] bg-gray-200 dark:bg-slate-800 w-full relative">
                                <img src={proof.imageUrl} alt="Proof" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <button 
                                        onClick={() => handleDeleteProof(proof.id)}
                                        className="p-2.5 bg-white/10 hover:bg-red-500 text-white rounded-full hover:scale-110 transition-all shadow-lg"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            {/* Details */}
                            <div className="p-3">
                                <div className="font-bold text-gray-900 dark:text-white text-xs truncate">{proof.userName}</div>
                                <div className="text-[11px] md:text-xs text-green-600 dark:text-green-400 font-bold font-mono mt-0.5">${proof.amount.toFixed(2)}</div>
                                <div className="text-[9px] text-gray-400 dark:text-slate-500 mt-1 uppercase tracking-wider">{proof.method}</div>
                            </div>
                        </div>
                    ))}
                    
                    {initialProofs.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400 dark:text-slate-500 text-xs md:text-sm italic">
                            No proofs added yet.
                        </div>
                    )}
                </div>
            </section>

            {/* ── ADD PROOF MODAL ── */}
            {isAddProofOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-5 md:p-6 space-y-4 shadow-2xl border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 fade-in-0 duration-200">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Fake Proof</h3>
                        
                        <div className="space-y-3 md:space-y-4">
                            <div>
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">User Name</label>
                                <input 
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg mt-1.5 focus:ring-2 focus:ring-blue-500/50 outline-none placeholder:text-gray-400 text-sm md:text-base transition-colors"
                                    placeholder="e.g. Ali K."
                                    value={newProof.userName}
                                    onChange={e => setNewProof({...newProof, userName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Amount ($)</label>
                                <input 
                                    type="number"
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg mt-1.5 focus:ring-2 focus:ring-blue-500/50 outline-none placeholder:text-gray-400 text-sm md:text-base transition-colors"
                                    placeholder="e.g. 500"
                                    value={newProof.amount}
                                    onChange={e => setNewProof({...newProof, amount: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Image URL</label>
                                <input 
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg mt-1.5 focus:ring-2 focus:ring-blue-500/50 outline-none placeholder:text-gray-400 text-xs md:text-sm transition-colors"
                                    placeholder="https://..."
                                    value={newProof.imageUrl}
                                    onChange={e => setNewProof({...newProof, imageUrl: e.target.value})}
                                />
                                <p className="text-[9px] md:text-[10px] text-gray-400 dark:text-slate-500 mt-1.5">Paste a direct link to an image (e.g. from Imgur).</p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-3">
                             <button 
                                onClick={() => setIsAddProofOpen(false)} 
                                className="flex-1 py-2.5 text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-colors"
                             >
                                Cancel
                            </button>
                             <button 
                                onClick={handleAddProof} 
                                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                             >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatBox({ label, value, color, bg }: any) {
    return (
        <div className={`p-3 md:p-4 rounded-xl ${bg} border`}>
            <p className={`text-xl md:text-2xl font-black ${color} truncate`}>{value}</p>
            <p className="text-[9px] md:text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase mt-0.5 md:mt-1 truncate">{label}</p>
        </div>
    )
}
