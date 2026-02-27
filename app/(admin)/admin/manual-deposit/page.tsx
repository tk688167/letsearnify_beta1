"use client"
export const dynamic = "force-dynamic";

import { useState } from "react"
import { MagnifyingGlassIcon, BanknotesIcon, ShieldCheckIcon, UserIcon } from "@heroicons/react/24/outline"
import { processManualDeposit } from "@/app/actions/admin/manual-deposit"
import Link from "next/link"

export default function ManualDepositPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    // Search Handler
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setSearching(true)
        try {
            // Re-use existing search API or server action if available
            // For now, using a simple client-side fetch to a potential search endpoint
            // Or easier: Just a simple server action call to find users? 
            // Let's use a direct fetch to the users API route which likely supports search
            const res = await fetch(`/api/admin/users?q=${searchQuery}`)
            if (res.ok) {
                const data = await res.json()
                setSearchResults(data.users || [])
                setSelectedUser(null)
            }
        } catch (error) {
            console.error("Search failed", error)
        } finally {
            setSearching(false)
        }
    }

    // Deposit Handler
    const handleDeposit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedUser) return

        if(!confirm(`CONFIRM DEPOSIT\n\nUser: ${selectedUser.email}\nAmount: Will be entered next...\n\nProceed?`)) return;

        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const amount = parseFloat(formData.get("amount") as string)
        const note = formData.get("note") as string

        const res = await processManualDeposit(selectedUser.id, amount, note)
        
        if (res.success) {
            alert("SUCCESS! Deposit added and user features unlocked.")
            setSelectedUser(null) // Reset form
            setSearchResults([]) // Clear search
            setSearchQuery("")
        } else {
            alert("ERROR: " + res.error)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            
            {/* Header */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                <div>
                   <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <BanknotesIcon className="w-6 h-6 text-green-600 dark:text-green-400"/>
                      Manual Merchant Deposit
                   </h1>
                   <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                      Credit user accounts with equivalent USD from local merchant payments.
                      <br/> <span className="text-red-500 dark:text-red-400 font-bold">Warning: This unlocks all Real Money features for the user.</span>
                   </p>
                </div>
            </div>

            {/* Search Section */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500"/>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search user by Email or ID..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-slate-600"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={searching}
                        className="px-5 py-2.5 bg-gray-900 dark:bg-slate-100 text-white dark:text-gray-900 font-bold rounded-xl hover:bg-black dark:hover:bg-white transition-all disabled:opacity-50 text-sm"
                    >
                        {searching ? "Searching..." : "Find"}
                    </button>
                </form>

                {searchResults.length > 0 && (
                     <div className="mt-5 border-t border-gray-100 dark:border-slate-800 pt-5">
                        <h3 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Results</h3>
                        <div className="grid gap-2">
                            {searchResults.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between
                                        ${selectedUser?.id === user.id
                                            ? "bg-green-50 dark:bg-green-500/10 border-green-500 dark:border-green-500/50 ring-1 ring-green-500"
                                            : "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400">
                                            <UserIcon className="w-4 h-4"/>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white text-sm">{user.name || "No Name"}</div>
                                            <div className="text-xs text-gray-500 dark:text-slate-400 font-mono">{user.email}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Balance</div>
                                        <div className="font-mono font-bold text-gray-900 dark:text-white text-sm">${user.balance.toFixed(2)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                )}
            </div>

            {/* Credit Form - Only visible when user selected */}
            {selectedUser && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-lg border border-green-200 dark:border-green-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ShieldCheckIcon className="w-24 h-24 text-green-600"/>
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-base font-bold text-green-800 dark:text-green-400 mb-5 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">$</span>
                            Credit Amount
                        </h3>

                        <form onSubmit={handleDeposit} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Deposit Amount (USD)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 font-bold">$</span>
                                        <input
                                            name="amount"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            required
                                            className="w-full pl-7 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-50 outline-none transition-all font-mono font-bold text-lg"
                                        />
                                    </div>
                                    <p className="text-[10px] text-green-600 dark:text-green-400 font-bold">* This will trigger automatic feature unlocking.</p>
                                </div>
                                <div className="space-y-1.5">
                                     <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Admin Note</label>
                                     <input
                                        name="note"
                                        type="text"
                                        placeholder="e.g. Paid via JazzCash Trx: 8273..."
                                        required
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-50 outline-none transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-slate-600"
                                     />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                {loading ? (
                                    <span className="animate-pulse">Processing Transaction...</span>
                                ) : (
                                    <>
                                        <ShieldCheckIcon className="w-4 h-4"/>
                                        Confirm &amp; Credit Funds
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}
