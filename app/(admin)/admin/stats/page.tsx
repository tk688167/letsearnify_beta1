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

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />
        <div className="text-sm font-bold text-gray-500 dark:text-slate-400">Loading statistics...</div>
    </div>
  )

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl md:text-2xl font-serif font-bold text-gray-900 dark:text-white tracking-tight">Platform Statistics</h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 mt-1">
          Manage the global statistics displayed on the landing page and dashboard.
        </p>
      </div>

      {/* ── Main Form Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/60 shadow-sm p-4 md:p-6 max-w-4xl transition-colors">
        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                {/* Total Users */}
                <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">Total Users</label>
                    <input 
                        type="text" 
                        name="totalUsers"
                        value={stats.totalUsers} 
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/60 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30 outline-none font-medium placeholder:text-gray-400 dark:placeholder:text-slate-500 text-sm md:text-base transition-colors"
                        placeholder="e.g. 120,000+"
                    />
                    <p className="text-[10px] md:text-xs text-gray-400 dark:text-slate-500 mt-1.5 font-medium">Displayed on Landing & Welcome pages.</p>
                </div>

                {/* Total Deposited */}
                <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">Total Deposited</label>
                    <input 
                        type="text" 
                        name="totalDeposited"
                        value={stats.totalDeposited} 
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/60 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30 outline-none font-medium placeholder:text-gray-400 dark:placeholder:text-slate-500 text-sm md:text-base transition-colors"
                        placeholder="e.g. $5,240,000"
                    />
                </div>

                {/* Total Withdrawn */}
                <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">Total Withdrawn</label>
                    <input 
                        type="text" 
                        name="totalWithdrawn"
                        value={stats.totalWithdrawn} 
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/60 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30 outline-none font-medium placeholder:text-gray-400 dark:placeholder:text-slate-500 text-sm md:text-base transition-colors"
                        placeholder="e.g. $1,850,000"
                    />
                </div>

                {/* Total Rewards */}
                <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">Total Rewards Distributed</label>
                    <input 
                        type="text" 
                        name="totalRewards"
                        value={stats.totalRewards} 
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/60 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30 outline-none font-medium placeholder:text-gray-400 dark:placeholder:text-slate-500 text-sm md:text-base transition-colors"
                        placeholder="e.g. $950,000"
                    />
                </div>

                {/* Service Status */}
                <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">Service Status</label>
                    <input 
                        type="text" 
                        name="serviceStatus"
                        value={stats.serviceStatus} 
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/60 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30 outline-none font-medium placeholder:text-gray-400 dark:placeholder:text-slate-500 text-sm md:text-base transition-colors"
                        placeholder="e.g. Active or 24/7 Online"
                    />
                </div>

                {/* Partners Count */}
                <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">Partners / Collaborations</label>
                    <input 
                        type="text" 
                        name="partnersCount"
                        value={stats.partnersCount} 
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/60 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30 outline-none font-medium placeholder:text-gray-400 dark:placeholder:text-slate-500 text-sm md:text-base transition-colors"
                        placeholder="e.g. 50+"
                    />
                </div>
            </div>

            {/* ── Footer Actions ── */}
            <div className="pt-4 md:pt-5 border-t border-gray-100 dark:border-slate-800/60 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-auto text-center sm:text-left">
                    {lastUpdated && (
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center sm:justify-start gap-1">
                            <CheckCircleIcon className="w-4 h-4" />
                            Updated at {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <button 
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-2.5 md:py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                >
                    {saving ? (
                        <>
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            <span>Saving...</span>
                        </>
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
