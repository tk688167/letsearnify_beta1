"use client"

import { useState } from "react"
import { UserCircleIcon, ShieldCheckIcon, MagnifyingGlassIcon, ArrowPathIcon, UserGroupIcon } from "@heroicons/react/24/outline"
import UserActions from "@/app/(admin)/admin/users/user-actions"
import { formatUserId, cn } from "@/lib/utils"

type User = {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: string | Date
  balance: number
  tier: string
  arnBalance: number
  lockedArnBalance?: number
  activeMembers: number
  memberId: string
  isActiveMember: boolean
  totalDeposit?: number
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
       <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 md:mb-10">
          <div>
             <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">User Management</h1>
             <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">View and expertly manage all registered platform users.</p>
          </div>
          <div className="flex items-center">
             <div className="bg-white dark:bg-gray-800/50 px-5 py-2.5 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700/50 text-sm font-bold text-gray-700 dark:text-gray-200 backdrop-blur-sm flex items-center gap-2">
                <UserGroupIcon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span>Total Users: {totalUsers.toLocaleString()}</span>
             </div>
          </div>
       </div>

       {/* Search Bar Component */}
       <div className="bg-white dark:bg-gray-800/80 p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm backdrop-blur-md mb-6 md:mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 md:gap-3">
             <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Search by Name, Email, or User ID..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30 outline-none transition-all font-medium text-gray-800 dark:text-gray-100 text-sm md:text-base placeholder-gray-400 dark:placeholder-gray-500"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
             </div>
             
             <div className="flex gap-2">
                 <button 
                    type="button"
                    onClick={handleReset}
                    disabled={isLoading}
                    className="flex-1 md:flex-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                 >
                    <ArrowPathIcon className={`w-4 h-4 md:w-5 md:h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Reset</span>
                 </button>
                 <button 
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-5 md:px-8 py-2.5 md:py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                 >
                    {isLoading ? (
                        <ArrowPathIcon className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    ) : (
                        <MagnifyingGlassIcon className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                    <span>Search</span>
                 </button>
             </div>
          </form>
       </div>

       {/* Mobile Card View (Premium Single Row) */}
       <div className="md:hidden space-y-3">
          {isLoading && (
              <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex flex-col items-center gap-3">
                      <ArrowPathIcon className="w-8 h-8 text-blue-600 dark:text-blue-500 animate-spin" />
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-500">Loading users...</span>
                  </div>
              </div>
          )}

          {!isLoading && users.length === 0 && (
             <div className="text-center p-8 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                    <UserCircleIcon className="w-12 h-12 text-gray-200 dark:text-gray-700" />
                    <p className="font-bold text-gray-500 dark:text-gray-400 text-sm">No users found</p>
                </div>
             </div>
          )}

          {!isLoading && users.map((user) => (
             <div key={user.id} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/80">

                {/* Main Row: avatar + info + actions */}
                <div className="flex items-center gap-3 px-3 py-3">

                   {/* Avatar */}
                   <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-tr from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-200/50 dark:border-blue-700/30 shadow-sm">
                       {user.name?.charAt(0)?.toUpperCase() || "U"}
                   </div>

                   {/* Name + meta — grows but never overflows */}
                   <div className="flex-1 min-w-0">
                       {/* Name: full width, truncates cleanly */}
                       <div className="font-bold text-sm text-gray-900 dark:text-white leading-tight truncate">
                           {user.name || "Unnamed User"}
                       </div>
                       {/* Compact sub-line: member ID · role · tier */}
                       <div className="flex items-center gap-1.5 mt-0.5 overflow-hidden">
                           <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 shrink-0">
                               {formatUserId(user.memberId)}
                           </span>
                           <span className="text-gray-300 dark:text-gray-600 text-[10px]">·</span>
                           <span className={`text-[9px] font-bold uppercase tracking-wide shrink-0 ${user.role === 'ADMIN' ? 'text-purple-500 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`}>
                               {user.role}
                           </span>
                           <span className="text-gray-300 dark:text-gray-600 text-[10px]">·</span>
                           <span className={cn("text-[9px] font-bold uppercase truncate", user.isActiveMember ? "text-green-500" : "text-red-500")}>
                               {user.isActiveMember ? "Active" : "Locked"}
                           </span>
                       </div>
                   </div>

                   {/* Actions — pinned right, never shrinks */}
                   <div className="shrink-0">
                       <UserActions user={{
                           id: user.id,
                           name: user.name,
                           email: user.email,
                           role: user.role,
                           balance: user.balance,
                           arnBalance: user.arnBalance,
                           lockedArnBalance: user.lockedArnBalance,
                           activeMembers: user.activeMembers,
                           tier: user.tier,
                           totalDeposit: user.totalDeposit,
                           isActiveMember: user.isActiveMember
                       }} onUpdated={(updatedUser) => {
                           setUsers(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
                       }} />
                   </div>
                </div>

                {/* Metrics Strip */}
                <div className="flex items-stretch divide-x divide-gray-100 dark:divide-gray-700/60 border-t border-gray-100 dark:border-gray-700/60 bg-gray-50/60 dark:bg-gray-900/20">
                    <div className="flex flex-col flex-1 px-3 py-2 border-r border-gray-100 dark:border-gray-700/60">
                        <div className="flex items-center gap-1"><span className="text-[8px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-bold">Balance</span></div>
                        <div className="font-mono font-bold text-gray-900 dark:text-gray-100 text-[11px] mt-0.5">${user.balance.toFixed(2)}</div>
                    </div>
                    <div className="flex flex-col flex-1 px-3 py-2 border-r border-gray-100 dark:border-gray-700/60">
                        <div className="flex items-center gap-1"><span className="text-[8px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-bold">Total Dep.</span></div>
                        <div className="font-mono font-bold text-green-600 dark:text-green-500 text-[11px] mt-0.5">${(user.totalDeposit || 0).toFixed(2)}</div>
                    </div>
                    <div className="flex flex-col flex-1 px-3 py-2 border-r border-gray-100 dark:border-gray-700/60">
                        <span className="text-[8px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-bold">Tokens</span>
                        <div className="font-mono font-bold text-amber-600 dark:text-amber-500 text-[11px] mt-0.5">{((user.balance || 0) * 10).toFixed(2)} <span className="text-[8px] opacity-60">ARN</span></div>
                        {user.lockedArnBalance && user.lockedArnBalance > 0 ? (
                            <div className="text-[9px] text-orange-500 font-bold mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">+{user.lockedArnBalance.toFixed(2)} Locked</div>
                        ) : null}
                    </div>
                    <div className="flex flex-col items-center px-3 py-2">
                        <span className="text-[8px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-bold">Active</span>
                        <div className="font-bold text-gray-700 dark:text-gray-300 text-xs mt-0.5 font-mono">{user.activeMembers || 0}</div>
                    </div>
                </div>

             </div>
          ))}
       </div>

       {/* Check if UserActions needs to be updated. The opacity hover effect in table needs to be removed for mobile or handled differently. 
           Wait, UserActions is a client component which might return a button or dropdown. 
           In the card view, I just placed it. In table view, it's opacity-0 group-hover:opacity-100.
       */}

       {/* Desktop Table View */}
       <div className="hidden md:block bg-white dark:bg-gray-800/80 rounded-[2rem] border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden relative min-h-[400px] backdrop-blur-sm">
          
          {isLoading && (
              <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-[2px] z-10 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                      <ArrowPathIcon className="w-8 h-8 text-blue-600 dark:text-blue-500 animate-spin" />
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-500 tracking-wide">Loading records...</span>
                  </div>
              </div>
          )}

          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700/60">
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">User</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Role & Tier</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Balance</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Total Deposited</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">ARN Tokens</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Active Members</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                   {users.length === 0 ? (
                       <tr>
                           <td colSpan={6} className="p-16 text-center">
                               <div className="flex flex-col items-center justify-center gap-3">
                                   <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-2">
                                       <UserCircleIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                   </div>
                                   <p className="font-bold text-gray-900 dark:text-gray-200">No matching users</p>
                                   <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search query.</p>
                               </div>
                           </td>
                       </tr>
                   ) : (
                       users.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all duration-200 group">
                             <td className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                   <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm border border-blue-200/50 dark:border-blue-700/30 shrink-0">
                                      <UserCircleIcon className="w-6 h-6 opacity-80" />
                                   </div>
                                   <div>
                                      <div className="font-bold text-gray-900 dark:text-white tracking-tight">{user.name || "Unnamed"}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5 mb-1.5 truncate max-w-[150px] lg:max-w-[200px]">{user.email}</div>
                                      <span className="text-[10px] font-extrabold bg-gray-100 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-mono tracking-wider">
                                        {formatUserId(user.memberId)}
                                      </span>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-5 align-middle">
                                <div className="flex flex-col gap-1.5 items-start">
                                   <span className={`px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${user.role === 'ADMIN' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/30' : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-200/60 dark:border-gray-700'}`}>
                                      {user.role === 'ADMIN' && <ShieldCheckIcon className="w-3.5 h-3.5" />}
                                      {user.role}
                                   </span>
                                   <div className="flex items-center gap-2">
                                       <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">
                                          {user.tier}
                                       </span>
                                       <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border", user.isActiveMember ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200/60 dark:border-green-800/30" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-800/30")}>
                                          {user.isActiveMember ? "Active" : "Locked"}
                                       </span>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-5 font-mono font-bold text-gray-900 dark:text-gray-100 align-middle text-sm">
                                ${user.balance.toFixed(2)}
                             </td>
                             <td className="px-6 py-5 align-middle">
                                <span className="font-mono font-bold text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded text-[13px] border border-green-100 dark:border-green-800/30">
                                   ${(user.totalDeposit || 0).toFixed(2)}
                                </span>
                             </td>
                             <td className="px-6 py-5 align-middle">
                                 <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 rounded text-[11px] font-bold border border-amber-100 dark:border-amber-900/30 font-mono">
                                    {((user.balance || 0) * 10).toFixed(2)} <span className="text-[9px] text-amber-600/60 dark:text-amber-500/60 ml-0.5">ARN</span>
                                 </span>
                                 {user.lockedArnBalance && user.lockedArnBalance > 0 ? (
                                    <div className="mt-1 text-[10px] text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded border border-orange-100 font-bold w-max">
                                        +{user.lockedArnBalance.toFixed(2)} Locked
                                    </div>
                                 ) : null}
                             </td>
                             <td className="px-6 py-5 align-middle">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 px-3 py-1 rounded border border-gray-200 dark:border-gray-700 min-w-[3rem] text-center font-mono">
                                        {user.activeMembers || 0}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-6 py-5 align-middle text-right">
                                 <div className="flex justify-end gap-1.5 opacity-100">
                                    <UserActions user={{
                                        id: user.id,
                                        name: user.name,
                                        email: user.email,
                                        role: user.role,
                                        balance: user.balance,
                                        arnBalance: user.arnBalance,
                                        lockedArnBalance: user.lockedArnBalance,
                                        activeMembers: user.activeMembers,
                                        tier: user.tier,
                                        totalDeposit: user.totalDeposit,
                                        isActiveMember: user.isActiveMember
                                    }} onUpdated={(updatedUser) => {
                                        setUsers(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
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
