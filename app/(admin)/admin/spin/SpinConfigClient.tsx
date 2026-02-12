"use client"

import { useState } from "react"
import { SpinReward } from "@/lib/spin-config" // Reuse type or infer
import { toggleSpinReward, deleteSpinReward, upsertSpinReward } from "@/app/actions/admin/spin-rewards"
import { PencilSquareIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"

// We need a slight looser type for the form since ID is optional
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
        setFormData({
            ...reward,
            textColor: reward.textColor || "#000000"
        })
        setIsEditing(true)
    }

    const handleCreate = () => {
        setFormData({
            label: "",
            value: 0,
            type: "ARN",
            probability: 0.1,
            color: "#ffffff",
            textColor: "#000000",
            spinType: spinType
        })
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">{spinType} Wheel Segments</h2>
                <button 
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Segment
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-4 py-3">Color</th>
                            <th className="px-4 py-3">Label</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Value</th>
                            <th className="px-4 py-3">Prob.</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rewards.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div 
                                        className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                                        style={{ background: r.color }}
                                    ></div>
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">{r.label}</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-bold">{r.type}</span>
                                </td>
                                <td className="px-4 py-3">{r.value}</td>
                                <td className="px-4 py-3 text-gray-500">{r.probability}</td>
                                <td className="px-4 py-3 text-right flex justify-end gap-2">
                                    <button onClick={() => handleEdit(r)} className="p-1 text-gray-400 hover:text-indigo-600">
                                        <PencilSquareIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(r.id)} className="p-1 text-gray-400 hover:text-red-600">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {rewards.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 italic">No segments found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Simple Modal */}
            {isEditing && formData && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">{formData.id ? "Edit Segment" : "New Segment"}</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 mb-1">Label</label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded-lg p-2" 
                                    value={formData.label}
                                    onChange={e => setFormData({...formData, label: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Type</label>
                                <select 
                                    className="w-full border rounded-lg p-2"
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
                                <label className="block text-xs font-bold text-gray-500 mb-1">Value (Amount)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    className="w-full border rounded-lg p-2"
                                    value={formData.value}
                                    onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Probability (0-1)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    className="w-full border rounded-lg p-2"
                                    value={formData.probability}
                                    onChange={e => setFormData({...formData, probability: parseFloat(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Text Color</label>
                                <input 
                                    type="color" 
                                    className="w-full h-10 border rounded-lg"
                                    value={formData.textColor}
                                    onChange={e => setFormData({...formData, textColor: e.target.value})}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 mb-1">Background Color / Gradient</label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded-lg p-2"
                                    placeholder="#ffffff or linear-gradient(...)"
                                    value={formData.color}
                                    onChange={e => setFormData({...formData, color: e.target.value})}
                                />
                                <div className="mt-2 text-xs text-gray-400">
                                    Preview: <span className="inline-block w-4 h-4 rounded-sm border align-middle bg-gray-100" style={{background: formData.color}}></span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Save Segment</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
