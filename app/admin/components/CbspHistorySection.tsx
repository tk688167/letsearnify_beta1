"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
    MagnifyingGlassIcon, 
    ArrowPathIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowDownIcon,
    ArrowUpIcon
} from "@heroicons/react/24/outline"
import { updateCbspPercentage } from "@/app/actions/admin/pools"

export default function CbspHistorySection() {
    const [data, setData] = useState<any[]>([])
    const [totals, setTotals] = useState({ totalDeposits: 0, totalPoolContribution: 0 })
    const [loading, setLoading] = useState(true)
    
    // Percentage Config State
    const [percentage, setPercentage] = useState(4.0)
    const [isEditing, setIsEditing] = useState(false)
    const [newPercentage, setNewPercentage] = useState(4.0)

    // Filters
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [sortBy, setSortBy] = useState("createdAt")
    const [sortOrder, setSortOrder] = useState("desc")

    useEffect(() => {
        fetchData()
    }, [page, search, sortBy, sortOrder])

    const fetchData = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search,
                sortBy,
                sortOrder
            })
            const res = await fetch(`/api/admin/cbsp-history?${params}`)
            const json = await res.json()
            if (res.ok) {
                setData(json.data)
                setTotals(json.totals)
                if (json.config?.percentage !== undefined) {
                    setPercentage(json.config.percentage)
                    setNewPercentage(json.config.percentage)
                }
                setTotalPages(json.meta.totalPages)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortBy(field)
            setSortOrder("desc")
        }
    }

    return (
        <div className="space-y-8">
            {/* Header / Totals */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <h3 className="text-blue-100 font-medium mb-1">Total System Deposits</h3>
                    <div className="text-4xl font-bold">${totals.totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <p className="text-sm text-blue-200 mt-2">Source of CBSP Funding</p>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <h3 className="text-purple-100 font-medium mb-1">Total CBSP Pool</h3>
                    <div className="text-4xl font-bold">${totals.totalPoolContribution.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <p className="text-sm text-purple-200 mt-2">Cumulative Contributions</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden flex flex-col justify-between">
                     <div>
                        <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-1">Contribution Rate</h3>
                        <div className="flex items-end gap-2">
                             {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        value={newPercentage}
                                        onChange={e => setNewPercentage(parseFloat(e.target.value))}
                                        className="w-24 text-3xl font-bold bg-gray-50 dark:bg-gray-700 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        autoFocus
                                    />
                                    <span className="text-xl font-bold text-gray-400">%</span>
                                </div>
                             ) : (
                                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                                    {percentage}%
                                </div>
                             )}
                        </div>
                        <p className="text-sm text-gray-400 mt-2">Taken from every deposit</p>
                     </div>
                     
                     <div className="mt-4">
                        {isEditing ? (
                            <div className="flex gap-2">
                                <button 
                                    onClick={async () => {
                                        const res = await updateCbspPercentage(newPercentage);
                                        if (res.success) {
                                            setPercentage(newPercentage);
                                            setIsEditing(false);
                                        } else {
                                            alert(res.error);
                                        }
                                    }}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
                                >
                                    Save
                                </button>
                                <button 
                                    onClick={() => { setIsEditing(false); setNewPercentage(percentage); }}
                                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="text-sm text-blue-600 font-bold hover:underline"
                            >
                                Edit Percentage
                            </button>
                        )}
                     </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contribution History</h2>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-grow md:flex-grow-0">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search user..."
                                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <button onClick={fetchData} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                            <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('userId')}>
                                    User
                                </th>
                                <th className="px-6 py-4 font-medium text-right cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('depositAmount')}>
                                    Deposit {sortBy === 'depositAmount' && (sortOrder === 'asc' ? <ArrowUpIcon className="w-4 h-4 inline" /> : <ArrowDownIcon className="w-4 h-4 inline" />)}
                                </th>
                                <th className="px-6 py-4 font-medium text-right cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('contributionAmount')}>
                                    Contribution {sortBy === 'contributionAmount' && (sortOrder === 'asc' ? <ArrowUpIcon className="w-4 h-4 inline" /> : <ArrowDownIcon className="w-4 h-4 inline" />)}
                                </th>
                                <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('createdAt')}>
                                    Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? <ArrowUpIcon className="w-4 h-4 inline" /> : <ArrowDownIcon className="w-4 h-4 inline" />)}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        Loading records...
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No contributions found.
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{item.user?.name || "Unknown"}</div>
                                            <div className="text-xs text-gray-500">{item.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-gray-700 dark:text-gray-300">
                                            ${item.depositAmount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-green-600 dark:text-green-400">
                                            +${item.contributionAmount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
