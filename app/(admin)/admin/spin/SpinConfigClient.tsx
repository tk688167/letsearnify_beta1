"use client"

import { useState } from "react"
import { SpinReward } from "@/lib/spin-config"
import { toggleSpinReward, deleteSpinReward, upsertSpinReward, resetSpinToDefaults } from "@/app/actions/admin/spin-rewards"
import { PencilSquareIcon, TrashIcon, PlusIcon, XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"

type RewardFormData = {
    id?: string
    label: string
    value: number
    type: string
    probability: number
    color: string
    textColor: string
    spinType: "FREE" | "PREMIUM"
}

export default function SpinConfigClient({ initialRewards, spinType }: { initialRewards: any[], spinType: "FREE" | "PREMIUM" }) {
    const [rewards, setRewards] = useState(initialRewards)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<RewardFormData | null>(null)
    const router = useRouter()

    const handleEdit = (reward: any) => {
        setFormData({ ...reward, textColor: reward.textColor || "#000000" })
        setIsEditing(true)
    }

    const handleCreate = () => {
        setFormData({ label: "", value: 0, type: "ARN", probability: 0.1, color: "#ffffff", textColor: "#000000", spinType })
        setIsEditing(true)
    }

    const handleSave = async () => {
        if (!formData) return
        await upsertSpinReward(formData)
        setIsEditing(false)
        router.refresh()
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this segment?")) {
            await deleteSpinReward(id)
            router.refresh()
        }
    }

    const handleReset = async () => {
        if (confirm(`Are you sure? This will delete ALL current ${spinType} segments and replace them with the recommended balanced layout.`)) {
            const res = await resetSpinToDefaults(spinType)
            if (res.success) {
                router.refresh()
            } else {
                alert("Failed to reset: " + res.error)
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-indigo-600 dark:bg-indigo-500 rounded-full" />
                        {spinType} Wheel Segments
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage individual prize segments and their appearance on the wheel.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleReset}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        Reset Defaults
                    </button>
                    <button
                        onClick={handleCreate}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all text-sm font-bold shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Segment
                    </button>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {rewards.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-sm text-slate-400 dark:text-slate-600 italic">No segments found. Start by adding one!</p>
                    </div>
                ) : rewards.map((r) => (
                    <div key={r.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all active:scale-[0.98]">
                        <div className="w-12 h-12 rounded-full border-4 border-slate-50 dark:border-slate-800 shadow-inner shrink-0 overflow-hidden relative" style={{ background: r.color }}>
                             <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white truncate">{r.label}</div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100/50 dark:border-indigo-500/20 uppercase tracking-wider">{r.type.replace("_", " ")}</span>
                                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-500">Value: {r.value} · Prob: {(r.probability * 100).toFixed(2)}%</span>
                            </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                            <button onClick={() => handleEdit(r)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden backdrop-blur-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/50">
                        <tr>
                            <th className="pl-6 pr-4 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Visual</th>
                            <th className="px-4 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Label</th>
                            <th className="px-4 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Reward Type</th>
                            <th className="px-4 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Value</th>
                            <th className="px-4 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Probability</th>
                            <th className="pl-4 pr-6 py-4 text-right text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {rewards.map((r) => (
                            <tr key={r.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="pl-6 pr-4 py-4">
                                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-md ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden relative" style={{ background: r.color }}>
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                                    </div>
                                </td>
                                <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">{r.label}</td>
                                <td className="px-4 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold border border-indigo-100/50 dark:border-indigo-500/20 uppercase tracking-wider">
                                        {r.type.replace("_", " ")}
                                    </span>
                                </td>
                                <td className="px-4 py-4 font-mono text-slate-600 dark:text-slate-300">{r.value}</td>
                                <td className="px-4 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden ring-1 ring-slate-200/50 dark:ring-slate-700/50">
                                            <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, r.probability * 100)}%` }} />
                                        </div>
                                        <span className="text-slate-500 dark:text-slate-400 font-medium font-mono text-xs w-12 text-left">{(r.probability * 100).toFixed(1)}%</span>
                                    </div>
                                </td>
                                <td className="pl-4 pr-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(r)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-white dark:hover:bg-slate-700 shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-600 transition-all">
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-white dark:hover:bg-slate-700 shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-600 transition-all">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {rewards.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center text-slate-400 dark:text-slate-600 italic">No segments found in this wheel.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit / Create Modal */}
            {isEditing && formData && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-xl border border-white/20 dark:border-slate-800/50 max-h-[90vh] overflow-y-auto transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formData.id ? "Edit Segment" : "New Segment"}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize the reward details and appearance.</p>
                            </div>
                            <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-full shadow-sm hover:shadow transition-all">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Label Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 50 ARN Tokens"
                                        className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-3.5 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                                        value={formData.label}
                                        onChange={e => setFormData({...formData, label: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Reward Type</label>
                                        <select
                                            className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-3.5 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                                            value={formData.type}
                                            onChange={e => setFormData({...formData, type: e.target.value})}
                                        >
                                            <option value="ARN">ARN Token</option>
                                            <option value="BONUS_SPIN">Bonus Spin</option>
                                            <option value="SERIES_SPIN">Series Spin</option>
                                            <option value="TRY_AGAIN">Try Again</option>
                                            <option value="SURPRISE">Surprise Bonus</option>
                                            <option value="MONEY">Real Money</option>
                                            <option value="EMPTY">Empty</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Numeric Value</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-3.5 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono"
                                            value={isNaN(formData.value) ? "" : formData.value}
                                            onChange={e => setFormData({...formData, value: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Probability (0.01 = 1%)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.0001"
                                                className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-3.5 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono"
                                                value={isNaN(formData.probability) ? "" : formData.probability}
                                                onChange={e => setFormData({...formData, probability: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0})}
                                            />
                                            <span className="absolute right-4 top-3.5 text-slate-400 font-mono text-xs">{(formData.probability * 100).toFixed(2)}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Text Color</label>
                                        <div className="flex items-center gap-2 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-2">
                                            <input
                                                type="color"
                                                className="w-10 h-9 rounded-xl cursor-pointer bg-transparent border-none"
                                                value={formData.textColor}
                                                onChange={e => setFormData({...formData, textColor: e.target.value})}
                                            />
                                            <span className="font-mono text-xs uppercase text-slate-500">{formData.textColor}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Background Color / CSS Gradient</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-3.5 pl-14 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono"
                                            placeholder="#ffffff or linear-gradient(...)"
                                            value={formData.color}
                                            onChange={e => setFormData({...formData, color: e.target.value})}
                                        />
                                        <div className="absolute left-3 top-2.5 w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800" style={{background: formData.color}} />
                                    </div>
                                    <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed pl-1">
                                        Use HEX codes or complex CSS gradients for a premium metallic or glowing effect.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                                <button onClick={() => setIsEditing(false)} className="flex-1 py-3.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-2xl transition-all active:scale-95">Cancel</button>
                                <button onClick={handleSave} className="flex-[2] py-3.5 text-sm font-bold text-white bg-indigo-600 dark:bg-indigo-500 rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-indigo-500/40 transition-all active:scale-95 focus:ring-4 focus:ring-indigo-500/50">
                                    {formData.id ? "Update Segment" : "Create Segment"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
