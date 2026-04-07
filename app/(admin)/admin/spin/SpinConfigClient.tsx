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

// --- Automatic Styling Engine ---
const TRY_AGAIN_STYLE = { color: "#f3f4f6", textColor: "#4b5563" };
const DARK_TRY_AGAIN_STYLE = { color: "#1f2937", textColor: "#9ca3af" };

const BASIC_STYLES = [
    { color: "#eef2ff", textColor: "#4f46e5" }, // Indigo
    { color: "#fff7ed", textColor: "#ea580c" }, // Orange
    { color: "#ecfdf5", textColor: "#059669" }, // Emerald
    { color: "#fdf2f8", textColor: "#db2777" }, // Pink
    { color: "#f0f9ff", textColor: "#0284c7" }, // Blue
    { color: "#faf5ff", textColor: "#9333ea" }, // Purple
];

const PREMIUM_STYLES = [
    { color: "linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)", textColor: "#92400e" }, // Gold
    { color: "linear-gradient(135deg, #dcfce7 0%, #22c55e 100%)", textColor: "#14532d" }, // Emerald
    { color: "linear-gradient(135deg, #d1edff 0%, #3b82f6 100%)", textColor: "#1e3a8a" }, // Azure
    { color: "linear-gradient(135deg, #fee2e2 0%, #ef4444 100%)", textColor: "#7f1d1d" }, // Ruby
    { color: "linear-gradient(135deg, #f3e8ff 0%, #a855f7 100%)", textColor: "#581c87" }, // Amethyst
    { color: "linear-gradient(135deg, #f0fdfa 0%, #14b8a6 100%)", textColor: "#134e4a" }, // Teal
];

const getAutoStyle = (index: number, spinType: "FREE" | "PREMIUM", rewardType: string) => {
    if (rewardType === "TRY_AGAIN" || rewardType === "EMPTY") {
        return spinType === "PREMIUM" ? DARK_TRY_AGAIN_STYLE : TRY_AGAIN_STYLE;
    }
    const palette = spinType === "PREMIUM" ? PREMIUM_STYLES : BASIC_STYLES;
    return palette[index % palette.length];
};

export default function SpinConfigClient({ initialRewards, spinType }: { initialRewards: any[], spinType: "FREE" | "PREMIUM" }) {
    const [rewards, setRewards] = useState(initialRewards)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<RewardFormData | null>(null)
    const router = useRouter()

    const handleEdit = (reward: any) => {
        setFormData({ ...reward })
        setIsEditing(true)
    }

    const handleCreate = () => {
        setFormData({ label: "", value: 0, type: "ARN", probability: 0.1, color: "AUTO", textColor: "AUTO", spinType })
        setIsEditing(true)
    }

    const handleSave = async () => {
        if (!formData) return
        
        // Auto-assign styles if it's a new segment or manual override is removed
        const index = formData.id ? rewards.findIndex(r => r.id === formData.id) : rewards.length;
        const autoStyle = getAutoStyle(index, spinType, formData.type);
        
        const finalData = {
            ...formData,
            color: autoStyle.color,
            textColor: autoStyle.textColor
        };

        const res = await upsertSpinReward(finalData) as { success: boolean, error?: string };
        if (res.success) {
            setIsEditing(false)
            router.refresh()
        } else {
            alert("Error: " + (res.error || "Failed to save segment"))
        }
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
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Focus on tasks and rewards — styling is handled automatically.</p>
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
                        <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-800 shadow-inner shrink-0 overflow-hidden relative" style={{ background: r.color }}>
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
                            <th className="px-4 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Task Label</th>
                            <th className="px-4 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Reward Type</th>
                            <th className="px-4 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Numeric Value</th>
                            <th className="px-4 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Probability</th>
                            <th className="pl-4 pr-6 py-4 text-right text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {rewards.map((r) => (
                            <tr key={r.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="pl-6 pr-4 py-4">
                                    <div className="w-10 h-10 rounded-full border-2 border-slate-50 dark:border-slate-800 shadow-md ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden relative" style={{ background: r.color }}>
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                                    </div>
                                </td>
                                <td className="px-4 py-4 font-bold text-slate-900 dark:text-white uppercase tracking-tight">{r.label}</td>
                                <td className="px-4 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold border border-indigo-100/50 dark:border-indigo-500/20 uppercase tracking-wider">
                                        {r.type.replace("_", " ")}
                                    </span>
                                </td>
                                <td className="px-4 py-4 font-mono text-slate-600 dark:text-slate-300 font-bold">{r.value}</td>
                                <td className="px-4 py-4 text-center text-xs font-black text-slate-900 dark:text-slate-200">
                                   {(r.probability * 100).toFixed(1)}%
                                </td>
                                <td className="pl-4 pr-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(r)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-white dark:hover:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 transition-all">
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-white dark:hover:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 transition-all">
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
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Spin Wheel Segment</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Admin styling is enabled: all visual traits are handled automatically.</p>
                            </div>
                            <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-full shadow-sm hover:shadow transition-all">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Task Input (Segment Label)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 50 ARN Tokens"
                                        className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-3.5 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                                        value={formData.label}
                                        onChange={e => {
                                            const newVal = e.target.value;
                                            const match = newVal.match(/(\d+(\.\d+)?)/);
                                            setFormData({
                                                ...formData,
                                                label: newVal,
                                                value: match ? parseFloat(match[0]) : formData.value
                                            });
                                        }}
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
                                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Credit Amount (Auto-filled)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-3.5 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono font-bold"
                                            value={isNaN(formData.value) ? "" : formData.value}
                                            onChange={e => setFormData({...formData, value: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0})}
                                        />
                                    </div>
                                </div>

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
                                        <span className="absolute right-4 top-3.5 text-slate-400 font-mono text-xs font-bold">{(formData.probability * 100).toFixed(2)}% chance</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                                <button onClick={() => setIsEditing(false)} className="flex-1 py-3.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-2xl transition-all active:scale-95">Cancel</button>
                                <button onClick={handleSave} className="flex-[2] py-3.5 text-sm font-bold text-white bg-indigo-600 dark:bg-indigo-500 rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-indigo-500/40 transition-all active:scale-95 focus:ring-4 focus:ring-indigo-500/50 uppercase tracking-tighter">
                                    {formData.id ? "Apply Task Changes" : "Save Segment"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
