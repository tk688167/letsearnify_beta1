"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { generateImpersonationToken } from "@/app/actions/admin/impersonate"
import { PencilSquareIcon, XMarkIcon, UserGroupIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline"
import { updateUserAsAdmin } from "@/lib/actions"

type UserActionsProps = {
  user: {
    id: string
    name: string | null
    email: string | null
    role: string
    balance: number
    arnBalance?: number
    activeMembers?: number
    tier?: string
  }
}

const TIERS = ["NEWBIE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "EMERALD"];

export default function UserActions({ user }: UserActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Impersonation State
  const [impersonateLoading, setImpersonateLoading] = useState(false)
  
  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  const router = useRouter()

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
        const res = await fetch(`/api/admin/users/${user.id}`, {
            method: 'DELETE',
        })
        const data = await res.json()
        
        if (!res.ok) throw new Error(data.error || "Failed to delete")

        alert("User deleted successfully")
        setIsDeleteOpen(false)
        router.refresh()
    } catch (error: any) {
        console.error("Delete failed", error)
        alert(error.message || "Failed to delete user")
    } finally {
        setDeleteLoading(false)
    }
  }

  const handleUpdate = async (formData: FormData) => {
    setLoading(true)
    try {
      await updateUserAsAdmin(formData)
      setIsOpen(false)
    } catch (error) {
      console.error("Update failed", error)
      alert("Failed to update user")
    } finally {
      setLoading(false)
    }
  }

  const handleImpersonate = async () => {
    if (!confirm(`Are you sure you want to log in as ${user.name || user.email}? You will be logged out of your admin account.`)) return

    setImpersonateLoading(true)
    try {
        const res = await generateImpersonationToken(user.id)
        
        if (!res.success || !res.token) {
            throw new Error(res.error || "Failed to generate token")
        }

        // Use standard NextAuth client signIn with the custom credentials provider
        await signIn("impersonation", {
            token: res.token,
            callbackUrl: "/dashboard",
            redirect: true,
        })

    } catch (error: any) {
        console.error("Impersonation failed:", error)
        alert(error.message || "Failed to switch user")
        setImpersonateLoading(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        {user.role === 'ADMIN' && (
            <button 
                onClick={handleImpersonate}
                disabled={impersonateLoading}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50" 
                title="Log in as this Admin"
            >
                <EyeIcon className={`w-5 h-5 ${impersonateLoading ? 'animate-pulse' : ''}`} />
            </button>
        )}
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
        <button 
            onClick={() => setIsDeleteOpen(true)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
            title="Delete User"
        >
            <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <TrashIcon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Delete User?</h3>
                <p className="text-sm text-gray-500">
                   Are you sure you want to delete <span className="font-bold text-gray-700">{user.email}</span>? 
                   <br/>This action is <span className="font-bold text-red-600">PERMANENT</span> and cannot be undone.
                </p>
             </div>
             <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-100">
                <button 
                   onClick={() => setIsDeleteOpen(false)}
                   className="flex-1 py-2.5 text-gray-700 font-bold hover:bg-gray-200 rounded-xl transition-colors"
                >
                   Cancel
                </button>
                <button 
                   onClick={handleDelete}
                   disabled={deleteLoading}
                   className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                   {deleteLoading ? "Deleting..." : "Delete User"}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
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
                           required
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      {/* ARN Tokens */}
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">ARN Tokens</label>
                          <input 
                              name="arnBalance"
                              type="number"
                              min="0"
                              defaultValue={user.arnBalance || 0}
                              className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                              required
                           />
                      </div>
                      
                      {/* Active Members */}
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Active Members</label>
                          <input 
                              name="activeMembers"
                              type="number"
                              min="0"
                              defaultValue={user.activeMembers || 0}
                              className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                              required
                           />
                      </div>
                      
                      {/* Tier */}
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Tier</label>
                          <select 
                            name="tier" 
                            defaultValue={user.tier || "NEWBIE"}
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
