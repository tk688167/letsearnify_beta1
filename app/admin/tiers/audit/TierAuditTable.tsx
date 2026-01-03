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
    points: number
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                      <tr key={user.id} className={user.isMismatch ? "bg-red-50/50" : ""}>
                         <td className="p-4">
                            <div className="font-bold text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                         </td>
                         <td className="p-4">
                            <div className="text-sm">
                               <span className="font-medium text-blue-600">{user.points} pts</span>
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
                                 className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-2"
                               >
                                  <WrenchIcon className="w-3 h-3" />
                                  Fix
                               </button>
                            )}
                            
                            <button 
                                 onClick={() => handleReset(user.id)}
                                 disabled={loading === user.id}
                                 className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 hover:text-red-600 flex items-center gap-2"
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
    )
}
