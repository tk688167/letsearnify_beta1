"use client"

import { useState } from "react"
import { updatePool } from "@/app/actions/admin/pools"
import { CheckCircleIcon, CurrencyDollarIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"

type Pool = {
    name: string;
    balance: number;
    percentage: number;
}

export function PoolManagerCard({ pool }: { pool: Pool }) {
    const [amount, setAmount] = useState(pool.balance)
    const [percentage, setPercentage] = useState(pool.percentage)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const isPercentageEditable = pool.name === "CBSP" || pool.name === "Royalty"

    async function handleSave() {
        setLoading(true)
        setMessage(null)

        try {
            const res = await updatePool({ 
                name: pool.name, 
                amount: Number(amount), 
                percentage: isPercentageEditable ? Number(percentage) : undefined 
            })

            if (res.error) {
                setMessage({ type: 'error', text: res.error })
            } else {
                setMessage({ type: 'success', text: "Pool updated successfully" })
            }
        } catch (err) {
            setMessage({ type: 'error', text: "An unexpected error occurred" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-800 font-serif">{pool.name} Pool</h3>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    pool.name === 'CBSP' ? 'bg-blue-100 text-blue-600' :
                    pool.name === 'Royalty' ? 'bg-purple-100 text-purple-600' :
                    pool.name === 'Reward' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                }`}>
                    <CurrencyDollarIcon className="w-5 h-5" />
                </div>
            </div>

            <div className="space-y-4">
                {/* Amount Field */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pool Amount ($)</label>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                        placeholder="0.00"
                    />
                </div>

                {/* Percentage Field (Conditional) */}
                {isPercentageEditable && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Allocation (%)</label>
                        <input 
                            type="number" 
                            step="0.1"
                            max="100"
                            value={percentage}
                            onChange={(e) => setPercentage(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono"
                            placeholder="0.0"
                        />
                    </div>
                )}
            </div>

            {/* Actions & Feedback */}
            <div className="mt-2 text-right">
                 {message && (
                    <div className={`text-xs font-bold mb-3 flex items-center justify-end gap-1 ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                        {message.type === 'success' ? <CheckCircleIcon className="w-4 h-4"/> : <ExclamationTriangleIcon className="w-4 h-4"/>}
                        {message.text}
                    </div>
                 )}
                 <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {loading ? "Saving..." : "Update Pool"}
                 </button>
            </div>
        </div>
    )
}
