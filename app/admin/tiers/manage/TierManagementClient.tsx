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
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
       <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
             <ServerStackIcon className="w-8 h-8" />
          </div>
          <div>
             <h1 className="text-3xl font-bold text-gray-900">Tier Management</h1>
             <p className="text-gray-500">Configure entry requirements for "Your Journey".</p>
          </div>
       </div>

       <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                   <th className="p-6">Tier Name</th>
                   <th className="p-6">Required Points</th>
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
                              className="w-24 px-3 py-2 border rounded-lg"
                              value={formData.points}
                              onChange={e => setFormData({...formData, points: Number(e.target.value)})}
                            />
                         ) : (
                            <span className="font-mono text-gray-600">{tier.points.toLocaleString()} PTS</span>
                         )}
                      </td>

                      <td className="p-6">
                         {editingId === tier.id ? (
                            <input 
                              type="number" 
                              className="w-24 px-3 py-2 border rounded-lg"
                              value={formData.members}
                              onChange={e => setFormData({...formData, members: Number(e.target.value)})}
                            />
                         ) : (
                            <span className="font-mono text-gray-600">{tier.members.toLocaleString()} Members</span>
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
