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
        <div className="space-y-8 pb-12">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Platform Analytics</h1>
                    <p className="text-gray-500 mt-2">Real-time system metrics and historical trends.</p>
                </div>
                <button 
                    onClick={handleRefresh}
                    disabled={isPending}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                    <ArrowPathIcon className={`w-5 h-5 ${isPending ? 'animate-spin' : ''}`} />
                    Refresh Data
                </button>
            </div>

            {/* PART 1: LIVE STATS */}
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <ChartBarIcon className="w-5 h-5" />
                    </div>
                    <div>
                         <h2 className="text-lg font-bold text-gray-900">Live System Status</h2>
                         <p className="text-xs text-gray-500">Real-time snapshot.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <StatBox label="System Balance" value={`$${systemBalance.toLocaleString()}`} color="text-gray-900" bg="bg-gray-100" />
                    <StatBox label="Total Users" value={initialStats.totalUsers} color="text-indigo-600" bg="bg-indigo-50" />
                    <StatBox label="Active Members" value={initialStats.activeOnline} color="text-emerald-600" bg="bg-emerald-50" />
                    <StatBox label="Total Liquidity" value={`$${initialStats.totalDeposited.toLocaleString()}`} color="text-blue-600" bg="bg-blue-50" />
                    <StatBox label="Total Payouts" value={`$${initialStats.totalPayouts.toLocaleString()}`} color="text-pink-600" bg="bg-pink-50" />
                </div>
            </section>

             {/* PART 2: HISTORICAL TRENDS */}
             {historyData && (
                <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center">
                                <BanknotesIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Growth History</h2>
                                <p className="text-xs text-gray-500">30-Day performance trends.</p>
                            </div>
                        </div>
                        
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            {['users', 'liquidity', 'payouts'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                                        activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historyData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={
                                            activeTab === 'users' ? '#6366f1' : 
                                            activeTab === 'liquidity' ? '#3b82f6' : '#ec4899'
                                        } stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor={
                                             activeTab === 'users' ? '#6366f1' : 
                                             activeTab === 'liquidity' ? '#3b82f6' : '#ec4899'
                                        } stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{fontSize: 10, fill: '#9ca3af'}} 
                                    tickLine={false}
                                    axisLine={false} 
                                    minTickGap={30}
                                />
                                <YAxis 
                                    tick={{fontSize: 10, fill: '#9ca3af'}} 
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => activeTab === 'users' ? value : `$${value}`}
                                />
                                <Tooltip 
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
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

            {/* PART 3: ACTIVITY LOGS */}
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                     <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <ArrowPathIcon className="w-5 h-5" />
                    </div>
                    <div>
                         <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                         <p className="text-xs text-gray-500">Latest system events.</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {activityLogs.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No recent activity found.</p>
                    ) : (
                        activityLogs.map((log: any) => (
                            <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full ${
                                        log.type === 'USER_JOIN' ? 'bg-indigo-500' : 
                                        log.type === 'DEPOSIT' ? 'bg-emerald-500' : 'bg-red-500'
                                    }`}></span>
                                    <span className="text-sm font-medium text-gray-700">{log.description}</span>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(log.date).toLocaleString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* PART 4: PAYOUT PROOFS */}
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                            <PhotoIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Payout Proofs</h2>
                            <p className="text-xs text-gray-500">Fake payout screenshots to display.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsAddProofOpen(true)}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all flex items-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add New Proof
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {initialProofs.map((proof: any) => (
                        <div key={proof.id} className="relative group bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                            {/* Image Preview */}
                            <div className="aspect-[3/4] bg-gray-200 w-full relative">
                                <img src={proof.imageUrl} alt="Proof" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        onClick={() => handleDeleteProof(proof.id)}
                                        className="p-2 bg-white text-red-600 rounded-full hover:scale-110 transition-transform"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            {/* Details */}
                            <div className="p-3">
                                <div className="font-bold text-gray-900 text-sm">{proof.userName}</div>
                                <div className="text-xs text-green-600 font-bold font-mono">${proof.amount.toFixed(2)}</div>
                                <div className="text-[10px] text-gray-400 mt-1">{proof.method}</div>
                            </div>
                        </div>
                    ))}
                    
                    {initialProofs.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400 text-sm">
                            No proofs added yet.
                        </div>
                    )}
                </div>
            </section>

            {/* ADD PROOF MODAL */}
            {isAddProofOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-lg font-bold">Add Fake Proof</h3>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">User Name</label>
                            <input 
                                className="w-full p-2 border rounded-lg mt-1"
                                placeholder="e.g. Ali K."
                                value={newProof.userName}
                                onChange={e => setNewProof({...newProof, userName: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Amount ($)</label>
                            <input 
                                type="number"
                                className="w-full p-2 border rounded-lg mt-1"
                                placeholder="e.g. 500"
                                value={newProof.amount}
                                onChange={e => setNewProof({...newProof, amount: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Image URL</label>
                            <input 
                                className="w-full p-2 border rounded-lg mt-1 text-xs"
                                placeholder="https://..."
                                value={newProof.imageUrl}
                                onChange={e => setNewProof({...newProof, imageUrl: e.target.value})}
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Paste a direct link to an image (e.g. from Imgur).</p>
                        </div>

                        <div className="flex gap-2 pt-2">
                             <button onClick={() => setIsAddProofOpen(false)} className="flex-1 py-2 text-gray-500 font-bold">Cancel</button>
                             <button onClick={handleAddProof} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold">Add</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatBox({ label, value, color, bg }: any) {
    return (
        <div className={`p-4 rounded-xl ${bg} border border-transparent`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs font-bold text-gray-500 uppercase mt-1">{label}</p>
        </div>
    )
}
