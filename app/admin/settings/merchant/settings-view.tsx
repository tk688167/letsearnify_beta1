"use client"

import { useState, useTransition } from "react"
import { 
    PlusIcon, 
    TrashIcon, 
    CheckCircleIcon, 
    NoSymbolIcon, 
    PencilSquareIcon,
    GlobeAltIcon,
    BanknotesIcon,
    UserGroupIcon,
    XMarkIcon,
    CheckIcon
} from "@heroicons/react/24/outline"
import { 
    addCountry, 
    updateCountryStatus, 
    deleteCountry, 
    addPaymentMethod, 
    deletePaymentMethod,
    updatePaymentMethod,
    addMerchantContact,
    deleteMerchantContact,
    updateMerchantContact,
    updateCountryDetails
} from "@/app/actions/admin/merchant-settings"

export default function MerchantSettingsPage({ countries }: { countries: any[] }) {
    const [isPending, startTransition] = useTransition()
    
    // State
    const [activeTab, setActiveTab] = useState<string>(countries.length > 0 ? countries[0].id : "manage")
    
    // Forms State
    const [newCountry, setNewCountry] = useState({ name: "", code: "" })
    const [newMethod, setNewMethod] = useState("")
    const [newContact, setNewContact] = useState({ name: "", phone: "" })
    
    // Editing State
    const [editingContact, setEditingContact] = useState<string | null>(null)
    const [editContactForm, setEditContactForm] = useState({ name: "", phone: "" })
    
    const [editingMethod, setEditingMethod] = useState<string | null>(null)
    const [editMethodForm, setEditMethodForm] = useState("")

    // Handlers
    const handleAddCountry = () => {
        if (!newCountry.name || !newCountry.code) return
        startTransition(async () => {
            await addCountry(newCountry.name, newCountry.code)
            setNewCountry({ name: "", code: "" })
            // Optional: Switch to new country tab logic could be added here if we returned the ID
        })
    }

    const activeCountry = countries.find(c => c.id === activeTab)

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold font-serif text-gray-900">Merchant Settings</h1>
            </div>

            {/* TABS NAVIGATION */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2">
                <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 scrollbar-hide">
                    <button
                        onClick={() => setActiveTab("manage")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                            activeTab === "manage" 
                                ? "bg-gray-900 text-white shadow-lg shadow-gray-200" 
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                        <GlobeAltIcon className="w-5 h-5"/>
                        Manage Countries
                    </button>
                    
                    <div className="w-px bg-gray-200 mx-2 hidden md:block"></div>

                    {countries.map(country => (
                        <button
                            key={country.id}
                            onClick={() => setActiveTab(country.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                                activeTab === country.id 
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                                    : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                            }`}
                        >
                            <span>{country.name}</span>
                            <span className={`w-2 h-2 rounded-full ${country.status === "ACTIVE" ? "bg-green-400" : "bg-yellow-400"}`}></span>
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm min-h-[500px]">
                
                {/* 1. MANAGE COUNTRIES TAB */}
                {activeTab === "manage" && (
                    <div className="p-6 md:p-8 space-y-8">
                        {/* Add New */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Add New Country</h3>
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                    <label className="text-xs font-bold text-gray-400 mb-1 block">Country Name</label>
                                    <input 
                                        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="e.g. United Kingdom"
                                        value={newCountry.name} 
                                        onChange={e => setNewCountry({...newCountry, name: e.target.value})}
                                    />
                                </div>
                                <div className="md:w-32 w-full">
                                    <label className="text-xs font-bold text-gray-400 mb-1 block">Code</label>
                                    <input 
                                        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="e.g. UK"
                                        value={newCountry.code} 
                                        onChange={e => setNewCountry({...newCountry, code: e.target.value})}
                                    />
                                </div>
                                <button 
                                    onClick={handleAddCountry} 
                                    disabled={isPending || !newCountry.name || !newCountry.code}
                                    className="p-3 bg-gray-900 text-white rounded-xl hover:bg-black disabled:opacity-50 transition-colors w-full md:w-auto flex justify-center"
                                >
                                    <PlusIcon className="w-6 h-6"/>
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Existing Countries</h3>
                            <div className="grid gap-4">
                                {countries.map((country) => (
                                    <div key={country.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors bg-white hover:shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                {country.code}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{country.name}</div>
                                                <div className={`text-xs font-bold px-2 py-0.5 rounded-md w-fit mt-1 ${country.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                    {country.status === "ACTIVE" ? "Active" : "Coming Soon"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => startTransition(async () => { await updateCountryStatus(country.id, country.status === "ACTIVE" ? "COMING_SOON" : "ACTIVE") })}
                                                className={`p-2 rounded-xl border transition-all ${
                                                    country.status === "ACTIVE" 
                                                        ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" 
                                                        : "bg-green-50 text-green-600 border-green-100 hover:bg-green-100"
                                                }`}
                                                title={country.status === "ACTIVE" ? "Deactivate" : "Activate"}
                                            >
                                                {country.status === "ACTIVE" ? <NoSymbolIcon className="w-5 h-5"/> : <CheckCircleIcon className="w-5 h-5"/>}
                                            </button>
                                            <button 
                                                onClick={() => { if(confirm("Delete country? This will verify delete all associated data.")) startTransition(async () => { await deleteCountry(country.id) }) }}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {countries.length === 0 && <div className="text-center text-gray-400 py-8 italic">No countries added yet.</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. SPECIFIC COUNTRY TAB */}
                {activeCountry && activeTab === activeCountry.id && (
                    <div className="p-6 md:p-8 animate-in fade-in duration-300">
                        {/* Header Stats */}
                        <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{activeCountry.name} Settings</h2>
                                <p className="text-gray-500 text-sm">Manage merchants, payment methods, and display text.</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${activeCountry.status === "ACTIVE" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                                {activeCountry.status === "ACTIVE" ? "Active" : "Coming Soon"}
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-10">
                            
                            {/* LEFT COL: CONTENT */}
                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <BanknotesIcon className="w-5 h-5"/>
                                        Descriptions
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Deposit Description</label>
                                            <textarea 
                                                className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                                                defaultValue={activeCountry.description || ""}
                                                placeholder="Merchant will handle all your deposits..."
                                                onBlur={(e) => startTransition(async () => { await updateCountryDetails(activeCountry.id, { description: e.target.value }) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Deposit Warning / Instruction</label>
                                            <textarea 
                                                className="w-full p-3 text-sm border border-orange-100 bg-orange-50/30 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-orange-900 placeholder:text-orange-300 min-h-[80px]"
                                                defaultValue={activeCountry.instruction || ""}
                                                placeholder="Important instructions..."
                                                onBlur={(e) => startTransition(async () => { await updateCountryDetails(activeCountry.id, { instruction: e.target.value }) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Withdrawal Description</label>
                                            <textarea 
                                                className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                                                defaultValue={activeCountry.withdrawalDescription || ""}
                                                placeholder="Merchant will handle all your withdrawals..."
                                                onBlur={(e) => startTransition(async () => { await updateCountryDetails(activeCountry.id, { withdrawalDescription: e.target.value }) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Withdrawal Warning / Instruction</label>
                                            <textarea 
                                                className="w-full p-3 text-sm border border-red-100 bg-red-50/30 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-red-900 placeholder:text-red-300 min-h-[80px]"
                                                defaultValue={activeCountry.withdrawalInstruction || ""}
                                                placeholder="Important withdrawal instructions..."
                                                onBlur={(e) => startTransition(async () => { await updateCountryDetails(activeCountry.id, { withdrawalInstruction: e.target.value }) })}
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* RIGHT COL: TABLES */}
                            <div className="space-y-10">
                                
                                {/* MERCHANTS TABLE */}
                                <section>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <UserGroupIcon className="w-5 h-5"/>
                                        Merchants
                                    </h3>
                                    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                                                <tr>
                                                    <th className="p-4 w-1/3">Name</th>
                                                    <th className="p-4 w-1/3">Phone</th>
                                                    <th className="p-4 w-1/3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {/* Existing Rows */}
                                                {activeCountry.contacts.map((contact: any) => (
                                                    <tr key={contact.id} className="group hover:bg-blue-50/50 transition-colors">
                                                        {editingContact === contact.id ? (
                                                            // EDIT MODE
                                                            <>
                                                                <td className="p-2">
                                                                    <input 
                                                                        className="w-full p-2 border rounded-lg text-xs" 
                                                                        value={editContactForm.name}
                                                                        onChange={e => setEditContactForm({...editContactForm, name: e.target.value})}
                                                                        autoFocus
                                                                    />
                                                                </td>
                                                                <td className="p-2">
                                                                    <input 
                                                                        className="w-full p-2 border rounded-lg text-xs" 
                                                                        value={editContactForm.phone}
                                                                        onChange={e => setEditContactForm({...editContactForm, phone: e.target.value})}
                                                                    />
                                                                </td>
                                                                <td className="p-2 text-right flex justify-end gap-1">
                                                                    <button 
                                                                        onClick={() => startTransition(async () => {
                                                                            await updateMerchantContact(contact.id, editContactForm.name, editContactForm.phone)
                                                                            setEditingContact(null)
                                                                        })}
                                                                        className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                                                    >
                                                                        <CheckIcon className="w-4 h-4"/>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => setEditingContact(null)}
                                                                        className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                                                                    >
                                                                        <XMarkIcon className="w-4 h-4"/>
                                                                    </button>
                                                                </td>
                                                            </>
                                                        ) : (
                                                            // VIEW MODE
                                                            <>
                                                                <td className="p-4 font-medium text-gray-900">{contact.name}</td>
                                                                <td className="p-4 text-gray-500 font-mono text-xs">{contact.phone}</td>
                                                                <td className="p-4 text-right">
                                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button 
                                                                            onClick={() => {
                                                                                setEditingContact(contact.id)
                                                                                setEditContactForm({ name: contact.name, phone: contact.phone })
                                                                            }}
                                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                        >
                                                                            <PencilSquareIcon className="w-4 h-4"/>
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => { if(confirm("Remove this merchant?")) startTransition(async () => { await deleteMerchantContact(contact.id) }) }}
                                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                                                        >
                                                                            <TrashIcon className="w-4 h-4"/>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </>
                                                        )}
                                                    </tr>
                                                ))}

                                                {/* Add Row */}
                                                <tr className="bg-gray-50/50">
                                                    <td className="p-2">
                                                        <input 
                                                            className="w-full p-2 border border-gray-200 bg-white rounded-lg text-xs" 
                                                            placeholder="New Name"
                                                            value={newContact.name}
                                                            onChange={e => setNewContact({...newContact, name: e.target.value})}
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input 
                                                            className="w-full p-2 border border-gray-200 bg-white rounded-lg text-xs" 
                                                            placeholder="New Phone"
                                                            value={newContact.phone}
                                                            onChange={e => setNewContact({...newContact, phone: e.target.value})}
                                                        />
                                                    </td>
                                                    <td className="p-2 text-right">
                                                        <button 
                                                            onClick={() => startTransition(async () => {
                                                                if(!newContact.name || !newContact.phone) return;
                                                                await addMerchantContact(activeCountry.id, newContact.name, newContact.phone)
                                                                setNewContact({ name: "", phone: "" })
                                                            })}
                                                            className="p-2 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50"
                                                            disabled={!newContact.name || !newContact.phone}
                                                        >
                                                            <PlusIcon className="w-4 h-4"/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                                {/* PAYMENT METHODS TABLE */}
                                <section>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <GlobeAltIcon className="w-5 h-5"/>
                                        Payment Methods
                                    </h3>
                                    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                                                <tr>
                                                    <th className="p-4 w-2/3">Method Name</th>
                                                    <th className="p-4 w-1/3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {/* Existing Rows */}
                                                {activeCountry.methods.map((method: any) => (
                                                    <tr key={method.id} className="group hover:bg-blue-50/50 transition-colors">
                                                        {editingMethod === method.id ? (
                                                            // EDIT MODE
                                                            <>
                                                                <td className="p-2">
                                                                    <input 
                                                                        className="w-full p-2 border rounded-lg text-xs" 
                                                                        value={editMethodForm}
                                                                        onChange={e => setEditMethodForm(e.target.value)}
                                                                        autoFocus
                                                                    />
                                                                </td>
                                                                <td className="p-2 text-right flex justify-end gap-1">
                                                                    <button 
                                                                        onClick={() => startTransition(async () => {
                                                                            await updatePaymentMethod(method.id, editMethodForm)
                                                                            setEditingMethod(null)
                                                                        })}
                                                                        className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                                                    >
                                                                        <CheckIcon className="w-4 h-4"/>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => setEditingMethod(null)}
                                                                        className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                                                                    >
                                                                        <XMarkIcon className="w-4 h-4"/>
                                                                    </button>
                                                                </td>
                                                            </>
                                                        ) : (
                                                            // VIEW MODE
                                                            <>
                                                                <td className="p-4 font-medium text-gray-900">{method.name}</td>
                                                                <td className="p-4 text-right">
                                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button 
                                                                            onClick={() => {
                                                                                setEditingMethod(method.id)
                                                                                setEditMethodForm(method.name)
                                                                            }}
                                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                        >
                                                                            <PencilSquareIcon className="w-4 h-4"/>
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => { if(confirm("Remove this method?")) startTransition(async () => { await deletePaymentMethod(method.id) }) }}
                                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                                                        >
                                                                            <TrashIcon className="w-4 h-4"/>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </>
                                                        )}
                                                    </tr>
                                                ))}

                                                {/* Add Row */}
                                                <tr className="bg-gray-50/50">
                                                    <td className="p-2">
                                                        <input 
                                                            className="w-full p-2 border border-gray-200 bg-white rounded-lg text-xs" 
                                                            placeholder="New Method (e.g. EasyPaisa)"
                                                            value={newMethod}
                                                            onChange={e => setNewMethod(e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="p-2 text-right">
                                                        <button 
                                                            onClick={() => startTransition(async () => {
                                                                if(!newMethod) return;
                                                                await addPaymentMethod(activeCountry.id, newMethod)
                                                                setNewMethod("")
                                                            })}
                                                            className="p-2 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50"
                                                            disabled={!newMethod}
                                                        >
                                                            <PlusIcon className="w-4 h-4"/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
