"use client"

import { useState } from "react"
import { searchUserForSpinReset, resetFreeSpinTimer, resetPremiumSpinTimer } from "@/app/actions/admin/spin-timers"
import { MagnifyingGlassIcon, ClockIcon, LockClosedIcon } from "@heroicons/react/24/outline"
import toast from "react-hot-toast"

export default function TimerControlsClient() {
    const [userId, setUserId] = useState("")
    const [searching, setSearching] = useState(false)
    const [resettingFree, setResettingFree] = useState(false)
    const [resettingPremium, setResettingPremium] = useState(false)
    const [userResult, setUserResult] = useState<any>(null)

    const handleSearch = async () => {
        if (!userId.trim()) {
            toast.error("Please enter a search term")
            return
        }

        setSearching(true)
        setUserResult(null)

        try {
            const result = await searchUserForSpinReset(userId)
            
            if (result.success) {
                setUserResult(result.user)
                toast.success("User found")
            } else {
                toast.error(result.message || "User not found")
            }
        } catch (error) {
            toast.error("An error occurred while searching")
            console.error(error)
        } finally {
            setSearching(false)
        }
    }

    const handleResetFreeSpin = async () => {
        if (!userResult?.id) return

        setResettingFree(true)

        try {
            const result = await resetFreeSpinTimer(userResult.id)
            
            if (result.success) {
                toast.success(result.message || "Free Spin timer reset successfully")
                // Refresh user data
                await handleSearch()
            } else {
                toast.error(result.message || "Failed to reset timer")
            }
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        } finally {
            setResettingFree(false)
        }
    }

    const handleResetPremiumSpin = async () => {
        if (!userResult?.id) return

        setResettingPremium(true)

        try {
            const result = await resetPremiumSpinTimer(userResult.id)
            
            if (result.success) {
                toast.success(result.message || "Premium Spin timer reset successfully")
                // Refresh user data
                await handleSearch()
            } else {
                toast.error(result.message || "Failed to reset timer")
            }
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        } finally {
            setResettingPremium(false)
        }
    }

    return (
        <div className="space-y-5">
            {/* Search Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Search User</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Search by User ID, Member ID, Email, or Name</p>

                <div className="flex gap-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Enter User ID, Email, or Name..."
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-slate-600 transition-all"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={searching || !userId.trim()}
                        className="px-5 py-2.5 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm"
                    >
                        <MagnifyingGlassIcon className="w-4 h-4" />
                        {searching ? "Searching..." : "Search"}
                    </button>
                </div>
            </div>

            {/* User Result Section */}
            {userResult && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm space-y-5">
                    {/* User Info */}
                    <div className="pb-5 border-b border-gray-100 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">User Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500 dark:text-slate-400">Name:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">{userResult.name || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-slate-400">Email:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">{userResult.email || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-slate-400">User ID:</span>
                                <span className="ml-2 font-mono text-xs text-gray-700 dark:text-slate-300">{userResult.id}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-slate-400">Status:</span>
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    userResult.isActiveMember
                                        ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                                        : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"
                                }`}>
                                    {userResult.isActiveMember ? "Active Member" : "Free User"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Free Spin Status */}
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                                    <ClockIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    Free Spin Timer (48 hours)
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                    Status: <span className={`font-semibold ${
                                        userResult.freeSpinStatus === "Available" ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
                                    }`}>
                                        {userResult.freeSpinStatus}
                                    </span>
                                    {userResult.freeSpinHoursRemaining > 0 && (
                                        <span className="ml-2 text-gray-500 dark:text-slate-500">({userResult.freeSpinHoursRemaining}h remaining)</span>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={handleResetFreeSpin}
                                disabled={resettingFree}
                                className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-all text-sm"
                            >
                                {resettingFree ? "Resetting..." : "Reset Timer"}
                            </button>
                        </div>
                    </div>

                    {/* Premium Spin Status */}
                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                                    {userResult.isActiveMember ? (
                                        <ClockIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    ) : (
                                        <LockClosedIcon className="w-4 h-4 text-gray-400 dark:text-slate-600" />
                                    )}
                                    Premium Spin Timer (24 hours)
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                    Status: <span className={`font-semibold ${
                                        userResult.premiumSpinStatus === "Available" ? "text-green-600 dark:text-green-400" :
                                        userResult.premiumSpinStatus.includes("Locked") ? "text-gray-400 dark:text-slate-500" : "text-orange-600 dark:text-orange-400"
                                    }`}>
                                        {userResult.premiumSpinStatus}
                                    </span>
                                    {userResult.premiumSpinHoursRemaining > 0 && (
                                        <span className="ml-2 text-gray-500 dark:text-slate-500">({userResult.premiumSpinHoursRemaining}h remaining)</span>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={handleResetPremiumSpin}
                                disabled={resettingPremium || !userResult.isActiveMember}
                                className="px-4 py-2 bg-amber-600 dark:bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-all text-sm"
                            >
                                {resettingPremium ? "Resetting..." : "Reset Timer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Help Text */}
            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4">
                <p className="text-xs text-blue-900 dark:text-blue-300">
                    <strong>Search Tips:</strong> You can search by User ID, Member ID, Email (partial match), or Name (partial match). The search is case-insensitive.
                </p>
                <p className="text-xs text-blue-900 dark:text-blue-300 mt-1.5">
                    <strong>Note:</strong> Resetting a timer will allow the user to spin immediately. Use this feature carefully for customer support or testing purposes only.
                </p>
            </div>
        </div>
    )
}
