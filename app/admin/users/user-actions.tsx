"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PencilSquareIcon, XMarkIcon, UserGroupIcon } from "@heroicons/react/24/outline"
import { updateUserAsAdmin } from "@/lib/actions"

type UserActionsProps = {
  user: {
    id: string
    name: string | null
    email: string | null
    role: string
    balance: number
    points?: number
    tier?: string
  }
}

const TIERS = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "EMERALD"];

export default function UserActions({ user }: UserActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpdate = async (formData: FormData) => {
    setLoading(true)
    try {
      // Append ID since hidden input might be spoofed (though this is client side anyway)
      // or we can just rely on the form having a hidden input.
      await updateUserAsAdmin(formData)
      setIsOpen(false)
      // Optional: Show success toast
    } catch (error) {
      console.error("Update failed", error)
      alert("Failed to update user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Link 
        href={`/admin/users/${user.id}/tree`}
        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" 
        title="View Referral Tree"
      >
        <UserGroupIcon className="w-5 h-5" />
      </Link>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
        title="Edit User"
      >
        <PencilSquareIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
             
             {/* Header */}
             <div className="px-6 py-4 flex justify-between items-center bg-gray-50 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Edit User Details</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                   <XMarkIcon className="w-6 h-6" />
                </button>
             </div>

             {/* Form */}
             <form action={handleUpdate} className="p-6 space-y-6">
                <input type="hidden" name="userId" value={user.id} />
                
                {/* Personal Details - Read Only */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                    Personal & Account Info
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Name</label>
                        <div className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 text-sm font-medium">
                           {user.name || "N/A"}
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Role</label>
                         <div className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 text-sm font-medium">
                           {user.role}
                        </div>
                     </div>
                     <div className="col-span-2 space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                        <div className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 text-sm font-medium font-mono">
                           {user.email || "N/A"}
                        </div>
                     </div>
                  </div>
                </div>

                {/* Financial Management - Editable */}
                <div className="space-y-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                   <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest flex items-center gap-2">
                      Growth & Finance
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">EDITABLE</span>
                   </h4>
                   
                   {/* Balance */}
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">User Balance ($)</label>
                      <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                         <input 
                           name="balance"
                           type="number"
                           step="0.01"
                           min="0"
                           defaultValue={user.balance}
                           className="w-full pl-8 pr-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono font-bold text-lg text-gray-900 shadow-sm"
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      {/* Points */}
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Points</label>
                          <input 
                              name="points"
                              type="number"
                              min="0"
                              defaultValue={user.points || 0}
                              className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                           />
                      </div>
                      
                      {/* Tier */}
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Tier</label>
                          <select 
                            name="tier" 
                            defaultValue={user.tier || "BRONZE"}
                            className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                          >
                             {TIERS.map(t => (
                                <option key={t} value={t}>{t}</option>
                             ))}
                          </select>
                      </div>
                   </div>
                   
                   <p className="text-xs text-blue-600/80 mt-1">
                      Updates will be logged in the Admin Audit Trail.
                   </p>
                </div>

                <div className="pt-2 flex gap-3">
                   <button 
                     type="button" 
                     onClick={() => setIsOpen(false)}
                     className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit" 
                     disabled={loading}
                     className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                   >
                     {loading ? "Saving..." : "Save Changes"}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </>
  )
}
