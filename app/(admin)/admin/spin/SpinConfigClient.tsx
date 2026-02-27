"use client"

import { useState } from "react"
import { SpinReward } from "@/lib/spin-config"
import { toggleSpinReward, deleteSpinReward, upsertSpinReward } from "@/app/actions/admin/spin-rewards"
import { PencilSquareIcon, TrashIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"
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
        if (confirm("Are you sure?")) {
            await deleteSpinReward(id)
            router.refresh()
        }
    }

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-gray-800 dark:text-white">{spinType} Wheel Segments</h2>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-bold"
                >
                    <PlusIcon className="w-4 h-4" />
                    Add Segment
                </button>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 divide-y divide-gray-100 dark:divide-slate-800 shadow-sm">
                {rewards.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-400 dark:text-slate-600 italic">No segments found.</div>
                ) : rewards.map((r) => (
                    <div key={r.id} className="p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm shrink-0" style={{ background: r.color }} />
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{r.label}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded">{r.type}</span>
                                <span className="text-[10px] text-gray-500 dark:text-slate-500">val: {r.value} · prob: {r.probability}</span>
                            </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                            <button onClick={() => handleEdit(r)} className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                                <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                        <tr>
                            <th className="px-4 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Color</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Label</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Value</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Prob.</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {rewards.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30">
                                <td className="px-4 py-3">
                                    <div className="w-7 h-7 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm" style={{ background: r.color }} />
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.label}</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded text-xs font-bold">{r.type}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{r.value}</td>
                                <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{r.probability}</td>
                                <td className="px-4 py-3 text-right flex justify-end gap-1.5">
                                    <button onClick={() => handleEdit(r)} className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {rewards.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-slate-600 italic">No segments found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit / Create Modal */}
            {isEditing && formData && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">{formData.id ? "Edit Segment" : "New Segment"}</h3>
                            <button onClick={() => setIsEditing(false)} className="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Label</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                                        value={formData.label}
                                        onChange={e => setFormData({...formData, label: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Type</label>
                                        <select
                                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                                            value={formData.type}
                                            onChange={e => setFormData({...formData, type: e.target.value})}
                                        >
                                            <option value="ARN">ARN Tokens</option>
                                            <option value="BONUS_SPIN">Bonus Spin</option>
                                            <option value="MONEY">Real Money</option>
                                            <option value="SURPRISE">Surprise Gift</option>
                                            <option value="TRY_AGAIN">Try Again</option>
                                            <option value="EMPTY">Empty</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Value</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                                            value={formData.value}
                                            onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Probability (0–1)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                                            value={formData.probability}
                                            onChange={e => setFormData({...formData, probability: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Text Color</label>
                                        <input
                                            type="color"
                                            className="w-full h-10 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer"
                                            value={formData.textColor}
                                            onChange={e => setFormData({...formData, textColor: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Background Color / Gradient</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                                        placeholder="#ffffff or linear-gradient(...)"
                                        value={formData.color}
                                        onChange={e => setFormData({...formData, color: e.target.value})}
                                    />
                                    <div className="mt-1.5 text-xs text-gray-400 dark:text-slate-500 flex items-center gap-2">
                                        Preview: <span className="inline-block w-4 h-4 rounded border border-gray-200 dark:border-slate-700 align-middle" style={{background: formData.color}} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg font-medium">Cancel</button>
                                <button onClick={handleSave} className="px-4 py-2 text-sm bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-700">Save Segment</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
