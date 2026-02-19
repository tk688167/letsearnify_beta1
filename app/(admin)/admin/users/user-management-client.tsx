"use client"

import { useState } from "react"
import { UserCircleIcon, ShieldCheckIcon, MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import UserActions from "@/app/(admin)/admin/users/user-actions"
import { formatUserId } from "@/lib/utils"

type User = {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: string | Date
  balance: number
  tier: string
  arnBalance: number
  activeMembers: number
  memberId: string
}

type UserManagementClientProps = {
  initialUsers: User[]
  initialTotal: number
}

export default function UserManagementClient({ initialUsers, initialTotal }: UserManagementClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [totalUsers, setTotalUsers] = useState(initialTotal)
  const [isLoading, setIsLoading] = useState(false)
  
  // Search State
  const [query, setQuery] = useState("")
  // const [page, setPage] = useState(1) // Removed client-side page state
  const [limit] = useState(2000) // Match server limit

  const fetchUsers = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        // page: "1", // Always page 1
        limit: limit.toString()
      })
      
      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch")
      
      const data = await res.json()
      setUsers(data.users)
      setTotalUsers(data.total)
      // setPage(data.page)
    } catch (error) {
      console.error("Search error:", error)
      alert("Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(query)
  }

  const handleReset = () => {
    setQuery("")
    fetchUsers("")
  }

  return (
    <div>
       <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
          <div>
             <h1 className="text-3xl font-serif font-bold text-gray-900">User Management</h1>
             <p className="text-gray-500 mt-1">View and manage all registered users.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 text-sm font-bold text-gray-700">
                Total Users: {totalUsers}
             </div>
          </div>
       </div>

       {/* Search Bar Component */}
       <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
             <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Search by Name, Email, or User ID (e.g. LEU-123)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-800"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
             </div>
             
             <div className="flex gap-2">
                 <button 
                    type="button"
                    onClick={handleReset}
                    disabled={isLoading}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                    <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Reset</span>
                 </button>
                 <button 
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                    {isLoading ? (
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                        <MagnifyingGlassIcon className="w-5 h-5" />
                    )}
                    <span>Search</span>
                 </button>
             </div>
          </form>
       </div>

       {/* Mobile Card View */}
       <div className="md:hidden space-y-4">
          {isLoading && (
              <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex flex-col items-center gap-3">
                      <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin" />
                      <span className="text-sm font-bold text-blue-600">Loading users...</span>
                  </div>
              </div>
          )}

          {!isLoading && users.length === 0 && (
             <div className="text-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-col items-center gap-2">
                    <UserCircleIcon className="w-12 h-12 text-gray-200" />
                    <p className="font-bold text-gray-500">No users found</p>
                </div>
             </div>
          )}

          {!isLoading && users.map((user) => (
             <div key={user.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 relative overflow-hidden">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {user.name?.charAt(0) || "U"}
                      </div>
                      <div>
                          <div className="font-bold text-gray-900">{user.name || "Unnamed"}</div>
                          <div className="text-xs text-gray-500 font-mono">{formatUserId(user.memberId)}</div>
                      </div>
                   </div>
                   <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role}
                   </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                        <span className="text-xs text-gray-400 block mb-0.5 uppercase tracking-wider font-bold">Balance</span>
                        <div className="font-mono font-bold text-gray-900">${user.balance.toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                        <span className="text-xs text-gray-400 block mb-0.5 uppercase tracking-wider font-bold">ARN Tokens</span>
                        <div className="font-mono font-bold text-gray-900">{(user.arnBalance || 0).toFixed(0)}</div>
                    </div>
                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                        <span className="text-xs text-gray-400 block mb-0.5 uppercase tracking-wider font-bold">Tier</span>
                        <div className="font-bold text-gray-900 text-xs">{user.tier}</div>
                    </div>
                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                        <span className="text-xs text-gray-400 block mb-0.5 uppercase tracking-wider font-bold">Members</span>
                        <div className="font-bold text-gray-900">{user.activeMembers}</div>
                    </div>
                </div>

                <div className="pt-2 border-t border-gray-50 flex justify-end">
                    <UserActions user={{
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        balance: user.balance,
                        arnBalance: user.arnBalance, // Passing arnBalance as points if UserActions expects points, or need to update UserActions too.
                        activeMembers: user.activeMembers,
                        tier: user.tier
                    }} />
                </div>
             </div>
          ))}
       </div>

       {/* Check if UserActions needs to be updated. The opacity hover effect in table needs to be removed for mobile or handled differently. 
           Wait, UserActions is a client component which might return a button or dropdown. 
           In the card view, I just placed it. In table view, it's opacity-0 group-hover:opacity-100.
       */}

       {/* Desktop Table View */}
       <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden relative min-h-[400px]">
          
          {isLoading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                      <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin" />
                      <span className="text-sm font-bold text-blue-600">Loading users...</span>
                  </div>
              </div>
          )}

          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                      <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Role & Tier</th>
                      <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Balance</th>
                      <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">ARN Tokens</th>
                      <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Active Members</th>
                      <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {users.length === 0 ? (
                       <tr>
                           <td colSpan={6} className="p-12 text-center text-gray-400">
                               <div className="flex flex-col items-center gap-2">
                                   <UserCircleIcon className="w-12 h-12 text-gray-200" />
                                   <p className="font-bold text-gray-500">No users found</p>
                                   <p className="text-sm">Try using a different search term.</p>
                               </div>
                           </td>
                       </tr>
                   ) : (
                       users.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                             <td className="p-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                      <UserCircleIcon className="w-6 h-6" />
                                   </div>
                                   <div>
                                      <div className="font-bold text-gray-900">{user.name || "Unnamed"}</div>
                                      <div className="text-xs text-gray-500 font-mono mb-1">{user.email}</div>
                                      <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-mono">
                                        {formatUserId(user.memberId)}
                                      </span>
                                   </div>
                                </div>
                             </td>
                             <td className="p-6">
                                <div className="flex flex-col gap-1 items-start">
                                   <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                                      {user.role === 'ADMIN' && <ShieldCheckIcon className="w-3 h-3" />}
                                      {user.role}
                                   </span>
                                   <span className="text-[10px] font-bold text-gray-400 px-2 uppercase tracking-wide">
                                      {user.tier}
                                   </span>
                                </div>
                             </td>
                             <td className="p-6 font-mono font-bold text-gray-900">
                                ${user.balance.toFixed(2)}
                             </td>
                             <td className="p-6">
                                 <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">
                                    {(user.arnBalance || 0).toFixed(0)} ARN
                                 </span>
                             </td>
                             <td className="p-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 min-w-[3rem] text-center">
                                        {user.activeMembers || 0}
                                    </span>
                                 </div>
                              </td>
                              <td className="p-6 text-right">
                                 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <UserActions user={{
                                        id: user.id,
                                        name: user.name,
                                        email: user.email,
                                        role: user.role,
                                        balance: user.balance,
                                        arnBalance: user.arnBalance,
                                        activeMembers: user.activeMembers,
                                        tier: user.tier
                                    }} />
                                 </div>
                              </td>
                           </tr>
                        ))
                    )}
                 </tbody>
              </table>
           </div>
       </div>
    </div>
  )
}
