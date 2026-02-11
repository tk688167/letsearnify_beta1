"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline"

export default function AdminStatsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  const [stats, setStats] = useState({
    totalUsers: "",
    totalDeposited: "",
    totalWithdrawn: "",
    totalRewards: "",
    serviceStatus: "",
    partnersCount: ""
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/platform-stats")
      if (res.ok) {
        const data = await res.json()
        setStats({
            totalUsers: data.totalUsers || "",
            totalDeposited: data.totalDeposited || "",
            totalWithdrawn: data.totalWithdrawn || "",
            totalRewards: data.totalRewards || "",
            serviceStatus: data.serviceStatus || "Active",
            partnersCount: data.partnersCount || ""
        })
      }
    } catch (error) {
      console.error("Failed to fetch stats", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStats(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/platform-stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stats)
      })

      if (res.ok) {
        setLastUpdated(new Date())
        // Optional: Show toast here
        alert("Stats updated successfully!")
      } else {
        alert("Failed to update stats")
      }
    } catch (error) {
      console.error("Update error", error)
      alert("Error updating stats")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-10 text-center">Loading stats...</div>

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Platform Statistics</h1>
        <p className="text-gray-500 mt-1">Manage the global statistics displayed on the landing page and dashboard.</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Users */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Total Users</label>
                    <input 
                        type="text" 
                        name="totalUsers"
                        value={stats.totalUsers} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        placeholder="e.g. 120,000+"
                    />
                    <p className="text-xs text-gray-400 mt-1">Displayed on Landing & Welcome pages.</p>
                </div>

                {/* Total Deposited */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Total Deposited</label>
                    <input 
                        type="text" 
                        name="totalDeposited"
                        value={stats.totalDeposited} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        placeholder="e.g. $5,240,000"
                    />
                </div>

                {/* Total Withdrawn */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Total Withdrawn</label>
                    <input 
                        type="text" 
                        name="totalWithdrawn"
                        value={stats.totalWithdrawn} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        placeholder="e.g. $1,850,000"
                    />
                </div>

                {/* Total Rewards */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Total Rewards Distributed</label>
                    <input 
                        type="text" 
                        name="totalRewards"
                        value={stats.totalRewards} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        placeholder="e.g. $950,000"
                    />
                </div>

                {/* Service Status */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Service Status</label>
                    <input 
                        type="text" 
                        name="serviceStatus"
                        value={stats.serviceStatus} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        placeholder="e.g. Active or 24/7 Online"
                    />
                </div>

                {/* Partners Count */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Partners / Collaborations</label>
                    <input 
                        type="text" 
                        name="partnersCount"
                        value={stats.partnersCount} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        placeholder="e.g. 50+"
                    />
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <div>
                    {lastUpdated && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircleIcon className="w-4 h-4" />
                            Updated at {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <button 
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {saving ? (
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                        <span>Save Changes</span>
                    )}
                </button>
            </div>

        </form>
      </div>
    </div>
  )
}
