"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { updateTierConfig } from "@/app/actions/admin/tiers"
import { toast } from "react-hot-toast"
import { 
  CheckCircleIcon, 
  PencilSquareIcon,
  ServerStackIcon
} from "@heroicons/react/24/outline"

type TierConfig = {
  id: string
  tier: string
  points: number
  members: number
  levels: number[]
}

export default function TierManagementPage({ tiers }: { tiers: TierConfig[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Local state for editing form
  const [formData, setFormData] = useState<Partial<TierConfig>>({})

  const handleEdit = (tier: TierConfig) => {
    setEditingId(tier.id)
    setFormData(tier)
  }

  const handleSave = async () => {
     if (!editingId || !formData) return

     try {
       await updateTierConfig(editingId, {
          points: Number(formData.points),
          members: Number(formData.members)
       })
       toast.success("Tier updated successfully")
       setEditingId(null)
       // Optimistic update or router.refresh() handled by parent/action
       window.location.reload() // Simple refresh for now
     } catch (e) {
       toast.error("Failed to update tier")
     }
  }

  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-8 max-w-7xl mx-auto">
       <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
               <ServerStackIcon className="w-8 h-8" />
            </div>
            <div>
               <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tier Management</h1>
               <p className="text-sm md:text-base text-gray-500">Configure entry requirements for "Your Journey".</p>
            </div>
          </div>
          <button 
             onClick={() => window.location.reload()} 
             className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
               <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
             </svg>
             Refresh
          </button>
       </div>

       {/* Mobile Card Layout */}
       <div className="md:hidden space-y-4">
          {tiers.map((tier) => (
             <div key={tier.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                   <h3 className="font-bold text-lg text-gray-900">{tier.tier}</h3>
                   {editingId !== tier.id && (
                      <button onClick={() => handleEdit(tier)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                         <PencilSquareIcon className="w-5 h-5" />
                      </button>
                   )}
                </div>

                <div className="space-y-3">
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Required ARN</label>
                      {editingId === tier.id ? (
                         <input 
                            type="number" 
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            value={formData.points}
                            onChange={e => setFormData({...formData, points: Number(e.target.value)})}
                         />
                      ) : (
                         <div className="font-mono text-gray-700 font-medium">{tier.points.toLocaleString()} ARN</div>
                      )}
                   </div>
                   
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Required Members</label>
                      {editingId === tier.id ? (
                         <input 
                            type="number" 
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            value={formData.members}
                            onChange={e => setFormData({...formData, members: Number(e.target.value)})}
                         />
                      ) : (
                         <div className="font-mono text-gray-700 font-medium">{tier.members.toLocaleString()} Members</div>
                      )}
                   </div>
                </div>

                {editingId === tier.id && (
                   <div className="flex gap-2 pt-2">
                      <button onClick={handleSave} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 shadow-sm shadow-emerald-200">Save Changes</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200">Cancel</button>
                   </div>
                )}
             </div>
          ))}
       </div>

       {/* Desktop Table Layout */}
       <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                   <th className="p-6">Tier Name</th>
                   <th className="p-6">Required ARN</th>
                   <th className="p-6">Required Members</th>
                   <th className="p-6 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
                {tiers.map((tier) => (
                   <tr key={tier.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-6 font-bold text-gray-900">{tier.tier}</td>
                      
                      <td className="p-6">
                         {editingId === tier.id ? (
                            <input 
                               type="number" 
                               className="w-32 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                               value={formData.points}
                               onChange={e => setFormData({...formData, points: Number(e.target.value)})}
                            />
                         ) : (
                            <span className="font-mono text-gray-600 text-base">{tier.points.toLocaleString()} ARN</span>
                         )}
                      </td>

                      <td className="p-6">
                         {editingId === tier.id ? (
                            <input 
                               type="number" 
                               className="w-32 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                               value={formData.members}
                               onChange={e => setFormData({...formData, members: Number(e.target.value)})}
                            />
                         ) : (
                            <span className="font-mono text-gray-600 text-base">{tier.members.toLocaleString()} Members</span>
                         )}
                      </td>

                      <td className="p-6 text-right">
                         {editingId === tier.id ? (
                            <div className="flex justify-end gap-2">
                               <button onClick={handleSave} className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold text-xs hover:bg-emerald-600">Save</button>
                               <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold text-xs hover:bg-gray-300">Cancel</button>
                            </div>
                         ) : (
                            <button onClick={() => handleEdit(tier)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                               <PencilSquareIcon className="w-5 h-5" />
                            </button>
                         )}
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  )
}
