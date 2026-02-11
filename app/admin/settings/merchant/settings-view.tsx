"use client"

import { useState, useTransition } from "react"
import { 
    PencilSquareIcon,
    CheckIcon,
    XMarkIcon
} from "@heroicons/react/24/outline"
import { updatePaymentMethodDetails } from "@/app/actions/admin/merchant-settings"

export default function MerchantSettingsPage({ countries }: { countries: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [editingMethod, setEditingMethod] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        accountNumber: "",
        accountName: "",
        instructions: ""
    })

    const handleEditMethod = (method: any) => {
        setEditingMethod(method.id)
        setFormData({
            accountNumber: method.accountNumber || "",
            accountName: method.accountName || "",
            instructions: method.instructions || ""
        })
    }

    const handleSaveMethod = (methodId: string) => {
        startTransition(async () => {
            await updatePaymentMethodDetails(
                methodId,
                formData.accountNumber,
                formData.accountName,
                formData.instructions
            )
            setEditingMethod(null)
        })
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Merchant Settings</h1>
                <p className="text-gray-500">Manage payment methods and account details for each country</p>
            </div>

            {/* COUNTRIES LIST */}
            <div className="space-y-6">
                {countries.map(country => (
                    <div key={country.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        
                        {/* Country Header */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
                                        {country.code}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{country.name}</h2>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            country.status === "ACTIVE" ? 
                                            "bg-green-100 text-green-700" : 
                                            "bg-gray-100 text-gray-600"
                                        }`}>
                                            {country.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                                Payment Methods
                            </h3>

                            {country.methods.length === 0 ? (
                                <p className="text-gray-400 text-sm py-8 text-center">No payment methods added yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {country.methods.map((method: any) => (
                                        <div key={method.id} className="border border-gray-200 rounded-xl p-4">
                                            
                                            {editingMethod === method.id ? (
                                                /* EDIT MODE */
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-lg font-bold text-gray-900">
                                                            Edit {method.name}
                                                        </h4>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleSaveMethod(method.id)}
                                                                disabled={isPending}
                                                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                                                            >
                                                                <CheckIcon className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingMethod(null)}
                                                                className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                                            >
                                                                <XMarkIcon className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Account Number *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.accountNumber}
                                                            onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                                                            placeholder="e.g., 0300-1234567"
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Account Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.accountName}
                                                            onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                                                            placeholder="e.g., John Doe"
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Instructions (Optional)
                                                        </label>
                                                        <textarea
                                                            value={formData.instructions}
                                                            onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                                                            placeholder="Additional instructions for users..."
                                                            rows={3}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                /* VIEW MODE */
                                                <div>
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h4 className="text-lg font-bold text-gray-900 mb-1">
                                                                {method.name}
                                                            </h4>
                                                            {method.accountNumber && method.accountName ? (
                                                                <div className="text-sm text-gray-600 space-y-1">
                                                                    <p><span className="font-semibold">Account:</span> {method.accountNumber}</p>
                                                                    <p><span className="font-semibold">Name:</span> {method.accountName}</p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-orange-600 font-medium">
                                                                    ⚠️ Account details not set
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleEditMethod(method)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <PencilSquareIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>

                                                    {method.instructions && (
                                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                            <p className="text-xs text-gray-600">{method.instructions}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Box */}
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-bold text-blue-900 mb-2">📌 Important</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Add account details for each payment method users will see</li>
                    <li>Account number and name are required for users to make payments</li>
                    <li>Instructions are optional but helpful for complex payment methods</li>
                </ul>
            </div>
        </div>
    )
}
