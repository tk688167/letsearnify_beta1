import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { UserCircleIcon, ShieldCheckIcon, TrashIcon } from "@heroicons/react/24/outline"
import UserActions from "./user-actions"

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      balance: true,
      tier: true,
      points: true
    }
  })

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gray-50/50">
       <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-3xl font-serif font-bold text-gray-900">User Management</h1>
             <p className="text-gray-500 mt-1">View and manage all registered users.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 text-sm font-bold text-gray-700">
             Total Users: {users.length}
          </div>
       </div>

       <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                      <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Role & Tier</th>
                      <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Balance</th>
                      <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Points</th>
                      <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                         <td className="p-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                  <UserCircleIcon className="w-6 h-6" />
                               </div>
                               <div>
                                  <div className="font-bold text-gray-900">{user.name || "Unnamed"}</div>
                                  <div className="text-xs text-gray-500 font-mono">{user.email}</div>
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
                                {user.points.toFixed(0)} PTS
                             </span>
                         </td>
                         <td className="p-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <UserActions user={{
                                   id: user.id,
                                   name: user.name,
                                   email: user.email,
                                   role: user.role,
                                   balance: user.balance,
                                   points: user.points,
                                   tier: user.tier
                               }} />
                               <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                                  <TrashIcon className="w-5 h-5" />
                               </button>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  )
}
