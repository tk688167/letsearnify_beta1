"use client"

import { useState, useTransition } from "react"
import { resetWithdrawalTimer } from "@/app/actions/admin/timer"
import { ArrowPathIcon, ClockIcon } from "@heroicons/react/24/outline"

export default function CooldownManager({ users }: { users: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleReset = (userId: string) => {
        setLoadingId(userId)
        setMessage(null)
        startTransition(async () => {
            try {
                const res = await resetWithdrawalTimer(userId)
                if (res.success) {
                    setMessage({ type: 'success', text: "Timer reset successfully." })
                } else {
                    setMessage({ type: 'error', text: res.error || "Failed to reset." })
                }
            } catch (error) {
                setMessage({ type: 'error', text: "An error occurred." })
            } finally {
                setLoadingId(null)
            }
        })
    }
    
    // Clear message helper
    if (message) {
        setTimeout(() => setMessage(null), 3000)
    }

    if (users.length === 0) return null; // Don't show if no one is on cooldown

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 font-serif">Active Withdrawal Cooldowns</h3>
                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">{users.length} Active</span>
             </div>
             
             {message && (
                <div className={`p-3 text-center text-xs font-bold ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

             <div className="overflow-x-auto max-h-60 overflow-y-auto">
                 <table className="w-full text-sm text-left">
                     <thead className="bg-white text-gray-400 font-bold uppercase text-[10px]">
                         <tr>
                             <th className="px-6 py-2">User</th>
                             <th className="px-6 py-2">Last Withdrawal</th>
                             <th className="px-6 py-2">Cooldown Ends In</th>
                             <th className="px-6 py-2 text-right">Action</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                         {users.map((user) => {
                             const lastTime = new Date(user.lastWithdrawalTime).getTime();
                             const nextTime = lastTime + (24 * 60 * 60 * 1000);
                             const minutesRemaining = Math.max(0, Math.ceil((nextTime - Date.now()) / (1000 * 60)));
                             const hours = Math.floor(minutesRemaining / 60);
                             const mins = minutesRemaining % 60;
                             
                             return (
                                 <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                     <td className="px-6 py-3 font-medium text-gray-900">
                                         {user.email}
                                     </td>
                                     <td className="px-6 py-3 text-gray-500 text-xs">
                                         {new Date(user.lastWithdrawalTime).toLocaleString()}
                                     </td>
                                     <td className="px-6 py-3 font-mono text-orange-600 font-bold text-xs">
                                         {hours}h {mins}m
                                     </td>
                                     <td className="px-6 py-3 text-right">
                                         <button
                                             onClick={() => handleReset(user.id)}
                                             disabled={!!loadingId}
                                             className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                         >
                                             {loadingId === user.id ? <ClockIcon className="w-4 h-4 animate-spin"/> : <ArrowPathIcon className="w-4 h-4" />}
                                             Reset Timer
                                         </button>
                                     </td>
                                 </tr>
                             )
                         })}
                     </tbody>
                 </table>
             </div>
        </div>
    )
}
