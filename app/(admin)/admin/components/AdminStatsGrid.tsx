
"use client"

import { useEffect, useState } from "react"
import { getAdminDashboardStats, AdminDashboardStats } from "@/app/actions/admin/stats"
import { 
    UserGroupIcon, 
    BanknotesIcon, 
    UserPlusIcon, 
    CheckBadgeIcon 
} from "@heroicons/react/24/outline"
import { StatsCard } from "./StatsCard"

export function AdminStatsGrid() {
    const [stats, setStats] = useState<AdminDashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminDashboardStats()
                setStats(data)
            } catch (err) {
                console.error("Failed to load admin stats", err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
        
        // Optional: Polling every 30s
        const interval = setInterval(fetchStats, 30000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 md:h-28 bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
                ))}
            </div>
        )
    }

    if (!stats) return null

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StatsCard
                title="Total Users"
                value={stats.totalUsers.toLocaleString()}
                icon={<UserGroupIcon className="w-5 h-5"/>}
                color="blue"
                trend="Registered"
                compact
            />
            <StatsCard
                title="Deposited"
                value={`$${stats.totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<BanknotesIcon className="w-5 h-5"/>}
                color="emerald"
                trend="All Time"
                compact
            />
             <StatsCard
                title="Signups"
                value={stats.totalSignups.toLocaleString()}
                icon={<UserPlusIcon className="w-5 h-5"/>}
                color="purple"
                trend="Accounts"
                compact
            />
            <StatsCard
                title="Depositors"
                value={stats.totalUsersDeposited.toLocaleString()}
                icon={<CheckBadgeIcon className="w-5 h-5"/>}
                color="amber"
                trend={`${((stats.totalUsersDeposited / stats.totalUsers) * 100).toFixed(1)}%`}
                compact
            />
        </div>
    )
}
