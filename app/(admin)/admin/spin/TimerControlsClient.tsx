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
        <div className="space-y-6">
            {/* Search Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Search User</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Search by User ID, Member ID, Email, or Name
                </p>
                
                <div className="flex gap-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Enter User ID, Email, or Name..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={searching || !userId.trim()}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        <MagnifyingGlassIcon className="w-5 h-5" />
                        {searching ? "Searching..." : "Search"}
                    </button>
                </div>
            </div>

            {/* User Result Section */}
            {userResult && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
                    {/* User Info */}
                    <div className="pb-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">User Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Name:</span>
                                <span className="ml-2 font-medium text-gray-900">{userResult.name || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Email:</span>
                                <span className="ml-2 font-medium text-gray-900">{userResult.email || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">User ID:</span>
                                <span className="ml-2 font-mono text-xs text-gray-700">{userResult.id}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Status:</span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                                    userResult.isActiveMember 
                                        ? "bg-green-100 text-green-700" 
                                        : "bg-gray-100 text-gray-600"
                                }`}>
                                    {userResult.isActiveMember ? "Active Member" : "Free User"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Free Spin Status */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    <ClockIcon className="w-5 h-5 text-indigo-600" />
                                    Free Spin Timer (48 hours)
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    Status: <span className={`font-semibold ${
                                        userResult.freeSpinStatus === "Available" ? "text-green-600" : "text-orange-600"
                                    }`}>
                                        {userResult.freeSpinStatus}
                                    </span>
                                    {userResult.freeSpinHoursRemaining > 0 && (
                                        <span className="ml-2 text-gray-600">
                                            ({userResult.freeSpinHoursRemaining}h remaining)
                                        </span>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={handleResetFreeSpin}
                                disabled={resettingFree}
                                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm"
                            >
                                {resettingFree ? "Resetting..." : "Reset Timer"}
                            </button>
                        </div>
                    </div>

                    {/* Premium Spin Status */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    {userResult.isActiveMember ? (
                                        <ClockIcon className="w-5 h-5 text-amber-600" />
                                    ) : (
                                        <LockClosedIcon className="w-5 h-5 text-gray-400" />
                                    )}
                                    Premium Spin Timer (24 hours)
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    Status: <span className={`font-semibold ${
                                        userResult.premiumSpinStatus === "Available" ? "text-green-600" : 
                                        userResult.premiumSpinStatus.includes("Locked") ? "text-gray-400" : "text-orange-600"
                                    }`}>
                                        {userResult.premiumSpinStatus}
                                    </span>
                                    {userResult.premiumSpinHoursRemaining > 0 && (
                                        <span className="ml-2 text-gray-600">
                                            ({userResult.premiumSpinHoursRemaining}h remaining)
                                        </span>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={handleResetPremiumSpin}
                                disabled={resettingPremium || !userResult.isActiveMember}
                                className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm"
                            >
                                {resettingPremium ? "Resetting..." : "Reset Timer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                    <strong>Search Tips:</strong> You can search by User ID, Member ID, Email (partial match), or Name (partial match). The search is case-insensitive.
                </p>
                <p className="text-sm text-blue-900 mt-2">
                    <strong>Note:</strong> Resetting a timer will allow the user to spin immediately. Use this feature carefully for customer support or testing purposes only.
                </p>
            </div>
        </div>
    )
}
