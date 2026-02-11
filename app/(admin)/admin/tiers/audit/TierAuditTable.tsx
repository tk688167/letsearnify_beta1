"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowPathIcon, WrenchIcon, ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline"

type AuditUser = {
    id: string
    name: string | null
    email: string | null
    tier: string
    tierStatus: string
    arnBalance: number
    activeMembers: number
    expectedTier: string
    isMismatch: boolean
}

export default function TierAuditTable({ users }: { users: AuditUser[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    const handleFix = async (userId: string, targetTier: string) => {
        if (!confirm(`Fix user to ${targetTier}?`)) return
        setLoading(userId)
        try {
            await fetch('/api/admin/fix-tier-mismatch', {
                method: 'POST',
                body: JSON.stringify({ userId, targetTier, targetStatus: 'CURRENT' })
            })
            router.refresh()
        } catch (e) {
            alert('Failed to fix')
        } finally {
            setLoading(null)
        }
    }

    const handleReset = async (userId: string) => {
        if (!confirm("⚠️ DANGER: Completely RESET this user to Newbie/0?")) return
        setLoading(userId)
        try {
            await fetch('/api/admin/reset-user-progress', {
                method: 'POST',
                body: JSON.stringify({ userId })
            })
            router.refresh()
        } catch (e) {
            alert('Failed to reset')
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="space-y-4">
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {users.map(user => (
                    <div key={user.id} className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
                        user.isMismatch ? "bg-red-50/50 border-red-100" : "bg-white border-gray-100"
                    }`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-bold text-gray-900">{user.name}</div>
                                <div className="text-xs text-gray-500 break-all">{user.email}</div>
                            </div>
                            <div className="text-right">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                    user.isMismatch ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                    {user.tier}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50/50 p-3 rounded-xl">
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase">ARN Tokens</div>
                                <div className="font-medium text-blue-600">{user.arnBalance}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase">Active Mbrs</div>
                                <div className="font-medium text-purple-600">{user.activeMembers}</div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Expected: <span className="font-bold text-gray-900">{user.expectedTier}</span></span>
                            {user.isMismatch && <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                             {user.isMismatch && (
                               <button 
                                 onClick={() => handleFix(user.id, user.expectedTier)}
                                 disabled={loading === user.id}
                                 className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 flex items-center justify-center gap-2 transition shadow-sm"
                               >
                                  <WrenchIcon className="w-3 h-3" />
                                  Fix Tier
                               </button>
                            )}
                            <button 
                                 onClick={() => handleReset(user.id)}
                                 disabled={loading === user.id}
                                 className="flex-1 px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center gap-2 transition shadow-sm"
                            >
                                <ArrowPathIcon className={`w-3 h-3 ${loading === user.id ? 'animate-spin' : ''}`} />
                                Reset
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                           <th className="p-4 font-semibold text-gray-700">User</th>
                           <th className="p-4 font-semibold text-gray-700">Stats</th>
                           <th className="p-4 font-semibold text-gray-700">Current Tier</th>
                           <th className="p-4 font-semibold text-gray-700">Expected Tier</th>
                           <th className="p-4 font-semibold text-gray-700 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {users.map(user => (
                              <tr key={user.id} className={user.isMismatch ? "bg-red-50/50" : "hover:bg-gray-50/30 transition-colors"}>
                                 <td className="p-4">
                                    <div className="font-bold text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                 </td>
                                 <td className="p-4">
                                    <div className="text-sm">
                                       <span className="font-medium text-blue-600">{user.arnBalance} ARN</span>
                                       <span className="text-gray-300 mx-2">|</span>
                                       <span className="font-medium text-purple-600">{user.activeMembers} active</span>
                                    </div>
                                 </td>
                                 <td className="p-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                       user.isMismatch ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                       {user.tier} 
                                       <span className="opacity-70">({user.tierStatus})</span>
                                    </span>
                                 </td>
                                 <td className="p-4">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                                       {user.expectedTier}
                                    </span>
                                 </td>
                                 <td className="p-4 text-right flex items-center justify-end gap-2">
                                    {user.isMismatch && (
                                       <button 
                                         onClick={() => handleFix(user.id, user.expectedTier)}
                                         disabled={loading === user.id}
                                         className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-2 transition shadow-sm hover:shadow"
                                       >
                                          <WrenchIcon className="w-3 h-3" />
                                          Fix
                                       </button>
                                    )}
                                    
                                    <button 
                                         onClick={() => handleReset(user.id)}
                                         disabled={loading === user.id}
                                         className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition shadow-sm hover:shadow flex items-center gap-2"
                                    >
                                        <ArrowPathIcon className={`w-3 h-3 ${loading === user.id ? 'animate-spin' : ''}`} />
                                        Reset
                                    </button>
                                 </td>
                              </tr>
                           )
                        )}
                     </tbody>
                  </table>
                </div>
            </div>
        </div>
    )
}
