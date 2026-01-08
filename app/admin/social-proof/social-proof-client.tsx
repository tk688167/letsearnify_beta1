"use client"

import { useState, useTransition } from "react"
import { 
    ChartBarIcon, 
    PhotoIcon, 
    ArrowPathIcon,
    TrashIcon,
    PlusIcon
} from "@heroicons/react/24/outline"
import { updateSocialProofStats, addPayoutProof, deletePayoutProof } from "@/app/actions/admin/social-proof"

type Props = {
    initialStats: any
    initialProofs: any[]
}

export default function SocialProofClient({ initialStats, initialProofs }: Props) {
    const [isPending, startTransition] = useTransition()
    
    // Stats Form State
    const [stats, setStats] = useState({
        totalUsers: initialStats?.totalUsers || 0,
        totalDeposited: initialStats?.totalDeposited || 0,
        totalPayouts: initialStats?.totalPayouts || 0,
        activeOnline: initialStats?.activeOnline || 0
    })

    // Proof Form State
    const [isAddProofOpen, setIsAddProofOpen] = useState(false)
    const [newProof, setNewProof] = useState({
        userName: "",
        amount: "",
        method: "USDT TRC20",
        imageUrl: "" // In a real app, this would be a file upload. Here we use URL.
    })

    // --- HANDLERS ---

    const handleStatsUpdate = (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(async () => {
            const res = await updateSocialProofStats({
                totalUsers: parseInt(String(stats.totalUsers)),
                totalDeposited: parseFloat(String(stats.totalDeposited)),
                totalPayouts: parseFloat(String(stats.totalPayouts)),
                activeOnline: parseInt(String(stats.activeOnline))
            })
            if (res.success) alert("Stats updated successfully!")
            else alert("Failed to update stats")
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
            } else {
                alert("Failed to add proof")
            }
        })
    }

    const handleDeleteProof = (id: string) => {
        if (!confirm("Delete this proof?")) return
        startTransition(async () => {
             await deletePayoutProof(id)
        })
    }

    return (
        <div className="space-y-8 pb-12">
            
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Social Proof & Fake Stats</h1>
                <p className="text-gray-500 mt-2">Manage the platform's credibility signals.</p>
            </div>

            {/* PART 1: GLOBAL STATS */}
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ChartBarIcon className="w-5 h-5" />
                    </div>
                    <div>
                         <h2 className="text-lg font-bold text-gray-900">Platform Statistics</h2>
                         <p className="text-xs text-gray-500">These numbers appear on the Landing & Welcome pages.</p>
                    </div>
                </div>

                <form onSubmit={handleStatsUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total Users</label>
                        <input 
                            type="number" 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
                            value={stats.totalUsers}
                            onChange={e => setStats({...stats, totalUsers: parseInt(e.target.value) || 0})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Active Online</label>
                        <input 
                            type="number" 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
                            value={stats.activeOnline}
                            onChange={e => setStats({...stats, activeOnline: parseInt(e.target.value) || 0})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total Deposited ($)</label>
                        <input 
                            type="number" 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-green-600"
                            value={stats.totalDeposited}
                            onChange={e => setStats({...stats, totalDeposited: parseFloat(e.target.value) || 0})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total Payouts ($)</label>
                        <input 
                            type="number" 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-blue-600"
                            value={stats.totalPayouts}
                            onChange={e => setStats({...stats, totalPayouts: parseFloat(e.target.value) || 0})}
                        />
                    </div>
                    
                    <div className="md:col-span-2 flex justify-end">
                        <button 
                            disabled={isPending}
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isPending && <ArrowPathIcon className="w-5 h-5 animate-spin"/>}
                            Save Statistics
                        </button>
                    </div>
                </form>
            </section>

            {/* PART 2: PAYOUT PROOFS */}
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
