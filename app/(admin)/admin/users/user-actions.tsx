"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { generateImpersonationToken } from "@/app/actions/admin/impersonate"
import { PencilSquareIcon, XMarkIcon, UserGroupIcon, TrashIcon, EyeIcon, ArrowPathIcon, ShieldCheckIcon } from "@heroicons/react/24/outline"
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
      <div className="flex items-center gap-1">
        {user.role === 'ADMIN' && (
            <button 
                onClick={handleImpersonate}
                disabled={impersonateLoading}
                className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors disabled:opacity-50" 
                title="Log in as this Admin"
            >
                <EyeIcon className={`w-4 h-4 md:w-5 md:h-5 ${impersonateLoading ? 'animate-pulse' : ''}`} />
            </button>
        )}
        <Link 
            href={`/admin/users/${user.id}/tree`}
            className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-lg transition-colors" 
            title="View Referral Tree"
        >
            <UserGroupIcon className="w-4 h-4 md:w-5 md:h-5" />
        </Link>
        <button 
            onClick={() => setIsOpen(true)}
            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" 
            title="Edit User"
        >
            <PencilSquareIcon className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button 
            onClick={() => setIsDeleteOpen(true)}
            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" 
            title="Delete User"
        >
            <TrashIcon className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800/95 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700/60 backdrop-blur-md">
             <div className="p-8 text-center space-y-5">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-red-100 dark:border-red-500/20 shadow-sm">
                   <TrashIcon className="w-8 h-8 text-red-500 dark:text-red-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">Delete User</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                       Are you sure you want to delete <span className="font-bold text-gray-800 dark:text-gray-200">{user.email}</span>? <br/>
                       This action is <span className="font-bold text-red-500 dark:text-red-400">PERMANENT</span> and cannot be undone.
                    </p>
                </div>
             </div>
             <div className="bg-gray-50/80 dark:bg-gray-900/50 px-6 py-5 flex gap-3 border-t border-gray-100 dark:border-gray-700/60">
                <button 
                   onClick={() => setIsDeleteOpen(false)}
                   className="flex-1 py-2.5 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors text-sm"
                >
                   Cancel
                </button>
                <button 
                   onClick={handleDelete}
                   disabled={deleteLoading}
                   className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white font-bold rounded-xl shadow border border-transparent dark:border-red-500/30 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed text-sm flex justify-center items-center"
                >
                   {deleteLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "Delete User"}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800/95 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] border border-gray-100 dark:border-gray-700/60 backdrop-blur-md">
             
             {/* Header */}
             <div className="px-6 py-5 flex justify-between items-center bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700/60">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Edit User Details</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                   <XMarkIcon className="w-5 h-5" />
                </button>
             </div>

             {/* Form */}
             <form action={handleUpdate} className="p-6 space-y-8">
                <input type="hidden" name="userId" value={user.id} />
                
                {/* Personal Details - Read Only */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100/80 dark:border-gray-700 pb-2.5">
                    Personal & Account Info
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">Name</label>
                        <div className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-medium">
                           {user.name || "N/A"}
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">Role</label>
                         <div className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center gap-2">
                           {user.role === 'ADMIN' && <ShieldCheckIcon className="w-4 h-4 text-purple-500" />}
                           {user.role}
                        </div>
                     </div>
                     <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">Email</label>
                        <div className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-medium font-mono break-all truncate">
                           {user.email || "N/A"}
                        </div>
                     </div>
                  </div>
                </div>

                {/* Financial Management - Editable */}
                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest border-b border-blue-100 dark:border-blue-900/30 pb-2.5 flex justify-between items-center">
                      <span>Growth & Finance</span>
                      <span className="max-[300px]:hidden px-1.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-[9px] font-bold border border-blue-100 dark:border-blue-500/20">EDITABLE</span>
                   </h4>
                   
                   {/* Balance */}
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest px-1">User Balance ($)</label>
                      <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold">$</span>
                         <input 
                           name="balance"
                           type="number"
                           step="0.01"
                           min="0"
                           defaultValue={user.balance}
                           className="w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30 outline-none transition-all font-mono font-bold text-lg text-gray-900 dark:text-white shadow-sm"
                           required
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* ARN Tokens */}
                      <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest px-1">ARN Tokens</label>
                          <input 
                              name="arnBalance"
                              type="number"
                              min="0"
                              defaultValue={user.arnBalance || 0}
                              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/50 dark:focus:ring-amber-500/30 outline-none transition-all font-bold text-gray-900 dark:text-white shadow-sm font-mono"
                              required
                           />
                      </div>
                      
                      {/* Active Members */}
                      <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest px-1">Active Members</label>
                          <input 
                              name="activeMembers"
                              type="number"
                              min="0"
                              defaultValue={user.activeMembers || 0}
                              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30 outline-none transition-all font-bold text-gray-900 dark:text-white shadow-sm font-mono"
                              required
                           />
                      </div>
                      
                      {/* Tier */}
                      <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest px-1">Tier</label>
                          <select 
                            name="tier" 
                            defaultValue={user.tier || "NEWBIE"}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30 outline-none transition-all font-bold text-gray-900 dark:text-white shadow-sm"
                          >
                             {TIERS.map(t => (
                                <option key={t} value={t}>{t}</option>
                             ))}
                          </select>
                      </div>
                   </div>
                   
                   <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-2 flex items-center justify-center gap-1.5">
                      <ShieldCheckIcon className="w-3.5 h-3.5" />
                      Updates logged securely in the Admin Audit Trail
                   </p>
                </div>

                <div className="pt-4 flex gap-3 border-t border-gray-100 dark:border-gray-700/60">
                   <button 
                     type="button" 
                     onClick={() => setIsOpen(false)}
                     className="flex-1 py-3 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-sm"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit" 
                     disabled={loading}
                     className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold rounded-xl shadow border border-transparent dark:border-blue-500/30 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed text-sm flex justify-center items-center"
                   >
                     {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "Save Changes"}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </>
  )
}
