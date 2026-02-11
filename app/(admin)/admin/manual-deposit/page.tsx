"use client"

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
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                   <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <BanknotesIcon className="w-8 h-8 text-green-600"/>
                      Manual Merchant Deposit
                   </h1>
                   <p className="text-sm text-gray-500 mt-1">
                      Credit user accounts with equivalent USD amounts from local merchant payments.
                      <br/> <span className="text-red-500 font-bold">Warning: This unlocks all Real Money features for the user.</span>
                   </p>
                </div>
            </div>

            {/* Search Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search user by Email or ID..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={searching}
                        className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50"
                    >
                        {searching ? "Searching..." : "Find User"}
                    </button>
                </form>

                {/* Results Grid */}
                {searchResults.length > 0 && (
                     <div className="mt-6 border-t border-gray-100 pt-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Search Results</h3>
                        <div className="grid gap-3">
                            {searchResults.map(user => (
                                <div 
                                    key={user.id} 
                                    onClick={() => setSelectedUser(user)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group
                                        ${selectedUser?.id === user.id 
                                            ? "bg-green-50 border-green-500 ring-1 ring-green-500" 
                                            : "bg-white border-gray-100 hover:border-blue-300"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <UserIcon className="w-5 h-5"/>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{user.name || "No Name"}</div>
                                            <div className="text-xs text-gray-500 font-mono">{user.email}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-gray-400 uppercase">Current Balance</div>
                                        <div className="font-mono font-bold text-gray-900">${user.balance.toFixed(2)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                )}
            </div>

            {/* Credit Form - Only visible when user selected */}
            {selectedUser && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-200 relative overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ShieldCheckIcon className="w-32 h-32 text-green-600"/>
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-green-800 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                $
                            </span>
                            Credit Amount
                        </h3>

                        <form onSubmit={handleDeposit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Deposit Amount (USD)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                        <input 
                                            name="amount" 
                                            type="number" 
                                            step="0.01" 
                                            placeholder="0.00"
                                            required 
                                            className="w-full pl-8 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all font-mono font-bold text-xl"
                                        />
                                    </div>
                                    <p className="text-[10px] text-green-600 font-bold">
                                        * This will trigger automatic feature unlocking.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Admin Note</label>
                                     <input 
                                        name="note" 
                                        type="text" 
                                        placeholder="e.g. Paid via JazzCash Trx: 8273..."
                                        required 
                                        className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all"
                                     />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-xl shadow-green-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <span className="animate-pulse">Processing Transaction...</span>
                                ) : (
                                    <>
                                        <ShieldCheckIcon className="w-5 h-5"/>
                                        Confirm & Credit Funds
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
