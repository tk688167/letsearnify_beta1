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
    CheckIcon,
    PhoneIcon,
    BuildingStorefrontIcon,
    ArrowPathIcon,
    SparklesIcon
} from "@heroicons/react/24/outline"
import { 
    addCountry, 
    updateCountryStatus, 
    deleteCountry, 
    addPaymentMethod, 
    deletePaymentMethod,
    addMerchantContact,
    deleteMerchantContact,
    updateCountryDetails,
    fetchCountryConfig,
    syncAllExchangeRates
} from "@/app/actions/admin/merchant-settings"

// --- NEW COMPONENT: CountryAutocomplete ---
import { useEffect, useRef } from "react"
import { getAllCountries } from "@/app/actions/admin/merchant-settings"
import { ChevronUpDownIcon } from "@heroicons/react/24/outline"

function CountryAutocomplete({ onSelect }: { onSelect: (c: any) => void }) {
    const [query, setQuery] = useState("")
    const [allCountries, setAllCountries] = useState<any[]>([])
    const [filteredCountries, setFilteredCountries] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Fetch all countries on mount
        getAllCountries().then(data => {
            setAllCountries(data)
            setFilteredCountries(data)
            setIsLoading(false)
        })

        // Click outside listener
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        if (query === "") {
            setFilteredCountries(allCountries)
        } else {
            const lowerQuery = query.toLowerCase()
            const filtered = allCountries.filter((c: any) => 
                c.name.toLowerCase().includes(lowerQuery) || 
                c.code.toLowerCase().includes(lowerQuery)
            )
            setFilteredCountries(filtered)
        }
    }, [query, allCountries])

    return (
        <div className="relative" ref={wrapperRef}>
             <div className="relative">
                <input 
                    className="w-full p-3 pr-10 mt-1 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
                    placeholder={isLoading ? "Loading countries..." : "Select a country..."}
                    value={query}
                    onChange={(e: any) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                    disabled={isLoading}
                />
                <div className="absolute right-3 top-4 text-gray-400 pointer-events-none">
                    {isLoading ? (
                        <ArrowPathIcon className="w-4 h-4 animate-spin"/>
                    ) : (
                        <ChevronUpDownIcon className="w-4 h-4"/>
                    )}
                </div>
             </div>

            {isOpen && !isLoading && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {filteredCountries.length > 0 ? (
                        filteredCountries.map((c: any) => (
                            <div 
                                key={c.code}
                                className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b border-gray-50 last:border-0"
                                onClick={() => {
                                    setQuery(c.name)
                                    onSelect(c)
                                    setIsOpen(false)
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <img src={c.flag} alt={c.code} className="w-6 h-4 object-cover rounded shadow-sm" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{c.name}</div>
                                        <div className="text-xs text-gray-500">{c.code} • {c.currency}</div>
                                    </div>
                                </div>
                                <PlusIcon className="w-4 h-4 text-gray-300"/>
                            </div>
                        ))
                    ) : (
                         <div className="p-4 text-center text-sm text-gray-500">
                            No country found.
                         </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function MerchantSettingsPage({ countries }: { countries: any[] }) {
    const [isPending, startTransition] = useTransition()
    
    // UI State
    const [isAddCountryOpen, setIsAddCountryOpen] = useState(false)
    const [expandedCountryId, setExpandedCountryId] = useState<string | null>(null)
    const [isFetchingConfig, setIsFetchingConfig] = useState(false)
    
    // Forms
    const [newCountry, setNewCountry] = useState({ 
        name: "", 
        code: "", 
        currency: "", 
        exchangeRate: 1.0, 
        status: "COMING_SOON" as "ACTIVE" | "COMING_SOON" 
    })
    
    // Quick Add States
    const [quickMethod, setQuickMethod] = useState<{id: string, val: string} | null>(null)
    const [quickContact, setQuickContact] = useState<{id: string, name: string, phone: string} | null>(null)

    // Handlers
    const handleNameBlur = async () => {
        if (!newCountry.name) return
        
        setIsFetchingConfig(true)
        const result = await fetchCountryConfig(newCountry.name)
        setIsFetchingConfig(false)

        if (result?.success && result.data) {
            setNewCountry(prev => ({
                ...prev,
                name: result.data.name, // Use official name
                code: result.data.code,
                currency: result.data.currency,
                exchangeRate: result.data.exchangeRate
            }))
        } else if (result?.error) {
           // Optionally show error toast
           alert(result.error)
        }
    }

    const handleAddCountry = () => {
        if (!newCountry.name || !newCountry.code) return
        startTransition(async () => {
            await addCountry(
                newCountry.name, 
                newCountry.code, 
                newCountry.currency || "USD", 
                Number(newCountry.exchangeRate), 
                newCountry.status
            )
            setNewCountry({ name: "", code: "", currency: "", exchangeRate: 1.0, status: "COMING_SOON" })
            setIsAddCountryOpen(false)
        })
    }

    const handleSyncRates = () => {
        if(!confirm("This will update exchange rates for all ACTIVE countries based on current market data. Continue?")) return
        startTransition(async () => {
            const res = await syncAllExchangeRates()
            if (res.success) {
                alert(`Successfully synced rates for ${res.updated} countries.`)
            } else {
                alert("Failed to sync rates: " + res.error)
            }
        })
    }

    const toggleStatus = (id: string, currentStatus: string) => {
        startTransition(async () => {
            await updateCountryStatus(id, currentStatus === "ACTIVE" ? "COMING_SOON" : "ACTIVE")
        })
    }

    const handleDeleteCountry = (id: string) => {
        if (confirm("Are you sure? This will delete all associated merchants and methods.")) {
            startTransition(async () => {
                await deleteCountry(id)
            })
        }
    }

    // Computed Stats
    const activeCountries = countries.filter((c: any) => c.status === "ACTIVE").length
    const totalMethods = countries.reduce((acc: number, c: any) => acc + c.methods.length, 0)

    return (
        <div className="space-y-8 pb-12">
            
            {/* HEADER & STATS */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Merchant Settings</h1>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">Manage supported countries, payment methods, and real-time exchange rates.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                     <div className="flex-1 sm:flex-initial px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                            <GlobeAltIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Countries</div>
                            <div className="text-xl font-bold text-gray-900">{activeCountries} <span className="text-gray-300 text-sm font-normal">/ {countries.length}</span></div>
                        </div>
                     </div>
                     <div className="flex-1 sm:flex-initial px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <BanknotesIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Methods</div>
                            <div className="text-xl font-bold text-gray-900">{totalMethods}</div>
                        </div>
                     </div>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                <div className="pl-2 sm:pl-4 text-sm font-bold text-gray-700 text-center sm:text-left">
                    Showing <span className="text-black">{countries.length}</span> Regions
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleSyncRates}
                        disabled={isPending}
                        className="flex justify-center items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm disabled:opacity-50"
                        title="Update all exchange rates"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
                        Sync Rates
                    </button>
                    <button 
                        onClick={() => setIsAddCountryOpen(true)}
                        className="flex justify-center items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-gray-900/20 font-bold text-sm"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Country
                    </button>
                </div>
            </div>

            {/* COUNTRIES GRID (MASONRY-STYLE) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {countries.map((country) => (
                    <div 
                        key={country.id} 
                        className={`group relative bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden flex flex-col ${
                            country.status === "ACTIVE" 
                            ? "border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5" 
                            : "border-gray-100 bg-gray-50/50 opacity-80 hover:opacity-100"
                        }`}
                    >
                        {/* CARD HEADER */}
                        <div className="p-4 md:p-6 pb-4 flex justify-between items-start border-b border-gray-50">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner font-bold ${
                                    country.status === "ACTIVE" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"
                                }`}>
                                    {country.code}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{country.name}</h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <div onClick={() => toggleStatus(country.id, country.status)} className={`cursor-pointer px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border select-none transition-colors ${
                                            country.status === "ACTIVE" 
                                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                                            : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                                        }`}>
                                            {country.status === "ACTIVE" ? "Active Region" : "Coming Soon"}
                                        </div>
                                        {country.currency && (
                                            <div className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold border border-gray-200">
                                                {country.currency} @ {country.exchangeRate}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => setExpandedCountryId(country.id)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                    title="Edit Details"
                                >
                                    <PencilSquareIcon className="w-5 h-5"/>
                                </button>
                                <button 
                                    onClick={() => handleDeleteCountry(country.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    title="Delete"
                                >
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>

                        {/* CARD BODY */}
                        <div className="p-4 md:p-6 space-y-6 flex-1">
                            
                            {/* Payment Methods */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                                    <span>Payment Methods</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {country.methods.map((method: any) => (
                                        <div key={method.id} className="group/tag inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600">
                                            {method.name}
                                            <button 
                                                onClick={() => startTransition(async () => { await deletePaymentMethod(method.id) })}
                                                className="hover:text-red-500 block md:hidden md:group-hover/tag:block"
                                            >
                                                <XMarkIcon className="w-3 h-3"/>
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {/* Add Quick Method Input */}
                                    {quickMethod?.id === country.id ? (
                                        <div className="inline-flex items-center gap-1">
                                            <input 
                                                autoFocus
                                                className="w-24 px-2 py-1 text-xs border border-blue-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="Name..."
                                                value={quickMethod?.val || ''}
                                                onChange={e => setQuickMethod({ id: country.id, val: e.target.value })}
                                                onKeyDown={e => {
                                                    if(e.key === 'Enter' && quickMethod?.val) {
                                                        startTransition(async () => {
                                                            await addPaymentMethod(country.id, quickMethod?.val || '')
                                                            setQuickMethod(null)
                                                        })
                                                    }
                                                    if(e.key === 'Escape') setQuickMethod(null)
                                                }}
                                            />
                                            <button 
                                                 onClick={() => {
                                                    if(quickMethod?.val) {
                                                        startTransition(async () => {
                                                            await addPaymentMethod(country.id, quickMethod?.val || '')
                                                            setQuickMethod(null)
                                                        })
                                                    }
                                                 }}
                                                 className="p-1 bg-green-100 text-green-700 rounded-md"
                                            >
                                                <CheckIcon className="w-3 h-3"/>
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setQuickMethod({ id: country.id, val: "" })}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                                        >
                                            <PlusIcon className="w-3 h-3"/> Add
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Contact Numbers */}
                            <div className="pt-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                                    <span>Merchant Contacts</span>
                                </h4>
                                <div className="space-y-2">
                                    {country.contacts.map((contact: any) => (
                                        <div key={contact.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100 hover:border-gray-300 transition-colors group/contact">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                                                    <BuildingStorefrontIcon className="w-4 h-4"/>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-gray-900">{contact.name}</div>
                                                    <div className="text-[10px] font-mono text-gray-500">{contact.phone}</div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => startTransition(async () => { await deleteMerchantContact(contact.id) })}
                                                className="p-1.5 text-gray-400 hover:text-red-600 opacity-100 md:opacity-0 md:group-hover/contact:opacity-100 transition-opacity"
                                            >
                                                <XMarkIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add Contact Form Inline */}
                                    {quickContact?.id === country.id ? (
                                        <div className="flex flex-col gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100 animate-in fade-in zoom-in-95">
                                            <input 
                                                autoFocus
                                                placeholder="Merchant Name"
                                                className="w-full bg-white p-2 text-xs rounded-lg border border-blue-200 outline-none"
                                                value={quickContact?.name || ''}
                                                onChange={e => setQuickContact({ id: country.id, name: e.target.value, phone: quickContact?.phone || '' })}
                                            />
                                            <div className="flex gap-2">
                                                <input 
                                                    placeholder="Phone Number"
                                                    className="w-full bg-white p-2 text-xs rounded-lg border border-blue-200 outline-none font-mono"
                                                    value={quickContact?.phone || ''}
                                                    onChange={e => setQuickContact({ id: country.id, name: quickContact?.name || '', phone: e.target.value })}
                                                />
                                                <button 
                                                    onClick={() => {
                                                        if(quickContact?.name && quickContact?.phone) {
                                                            startTransition(async () => {
                                                                await addMerchantContact(country.id, quickContact?.name || '', quickContact?.phone || '')
                                                                setQuickContact(null)
                                                            })
                                                        }
                                                    }}
                                                    className="px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-xs"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setQuickContact({ id: country.id, name: "", phone: "" })}
                                            className="w-full py-2 border border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <PlusIcon className="w-3 h-3"/> Add Contact
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </div>


            {/* ADD COUNTRY MODAL */}
            {isAddCountryOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl mx-auto">
                        <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                Add Region 
                                {isFetchingConfig && <span className="text-xs font-normal text-blue-600 flex items-center gap-1 animate-pulse"><SparklesIcon className="w-3 h-3"/> Fetching...</span>}
                            </h3>
                            <button onClick={() => setIsAddCountryOpen(false)}><XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600"/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="relative">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Country Search</label>
                                <CountryAutocomplete 
                                    onSelect={(country) => {
                                        setNewCountry({
                                            name: country.name,
                                            code: country.code,
                                            currency: country.currency,
                                            exchangeRate: 1.0, // Will fetch real rate next
                                            status: "COMING_SOON"
                                        })
                                        // Trigger rate fetch
                                        setIsFetchingConfig(true)
                                        import("@/app/actions/admin/merchant-settings").then(mod => {
                                            mod.fetchExchangeRate(country.currency).then(rate => {
                                                setNewCountry(prev => ({ ...prev, exchangeRate: rate }))
                                                setIsFetchingConfig(false)
                                            })
                                        })
                                    }}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Code</label>
                                    <input 
                                        className="w-full p-3 mt-1 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50"
                                        placeholder="CA"
                                        value={newCountry.code}
                                        onChange={e => setNewCountry({...newCountry, code: e.target.value.toUpperCase()})}
                                        maxLength={3}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Currency</label>
                                    <input 
                                        className="w-full p-3 mt-1 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50"
                                        placeholder="CAD"
                                        value={newCountry.currency}
                                        onChange={e => setNewCountry({...newCountry, currency: e.target.value.toUpperCase()})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Exchange Rate</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        className="w-full p-3 mt-1 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900"
                                        placeholder="1.0"
                                        value={newCountry.exchangeRate}
                                        onChange={e => setNewCountry({...newCountry, exchangeRate: parseFloat(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status</label>
                                    <select 
                                        className="w-full p-3 mt-1 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                                        value={newCountry.status}
                                        onChange={e => setNewCountry({...newCountry, status: e.target.value as any})}
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="COMING_SOON">Coming Soon</option>
                                    </select>
                                </div>
                            </div>

                            <button 
                                onClick={handleAddCountry}
                                disabled={!newCountry.name || !newCountry.code || isPending}
                                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black disabled:opacity-50 transition-all mt-4"
                            >
                                {isPending ? "Creating..." : "Create Region"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT DETAIL MODAL */}
            {expandedCountryId && (() => {
                const country = countries.find((c: any) => c.id === expandedCountryId)
                if(!country) return null
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                        <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl h-[85vh] flex flex-col mx-auto">
                           <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        Edit Details: {country.name}
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-md">{country.code}</span>
                                    </h3>
                                </div>
                                <button onClick={() => setExpandedCountryId(null)}><XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600"/></button>
                            </div>
                            
                            <div className="p-8 overflow-y-auto space-y-8 flex-1">
                                
                                {/* Configuration Section */}
                                <section className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">Configuration</h4>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Currency Code</label>
                                            <input 
                                                className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                defaultValue={country.currency || "USD"}
                                                onBlur={(e: any) => startTransition(async () => { await updateCountryDetails(country.id, { currency: e.target.value }) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Exchange Rate (to USD)</label>
                                            <input 
                                                type="number"
                                                step="0.01"
                                                className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                defaultValue={country.exchangeRate || 1.0}
                                                onBlur={(e: any) => startTransition(async () => { await updateCountryDetails(country.id, { exchangeRate: parseFloat(e.target.value) }) })}
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Instructions Section */}
                                <section className="space-y-6">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">Deposit Instructions</h4>
                                    
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
                                        <textarea 
                                            className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                                            defaultValue={country.description || ""}
                                            placeholder="Standard deposit description..."
                                            onBlur={(e: any) => startTransition(async () => { await updateCountryDetails(country.id, { description: e.target.value }) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Important Warning</label>
                                        <textarea 
                                            className="w-full p-3 text-sm border border-orange-100 bg-orange-50/30 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-orange-900 placeholder:text-orange-300 min-h-[80px]"
                                            defaultValue={country.instruction || ""}
                                            placeholder="Warning message for users..."
                                            onBlur={(e: any) => startTransition(async () => { await updateCountryDetails(country.id, { instruction: e.target.value }) })}
                                        />
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">Withdrawal Instructions</h4>
                                    
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
                                        <textarea 
                                            className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                                            defaultValue={country.withdrawalDescription || ""}
                                            placeholder="Standard withdrawal description..."
                                            onBlur={(e: any) => startTransition(async () => { await updateCountryDetails(country.id, { withdrawalDescription: e.target.value }) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Important Warning</label>
                                        <textarea 
                                            className="w-full p-3 text-sm border border-red-100 bg-red-50/30 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-red-900 placeholder:text-red-300 min-h-[80px]"
                                            defaultValue={country.withdrawalInstruction || ""}
                                            placeholder="Warning message for withdrawals..."
                                            onBlur={(e: any) => startTransition(async () => { await updateCountryDetails(country.id, { withdrawalInstruction: e.target.value }) })}
                                        />
                                    </div>
                                </section>
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
                                <button 
                                    onClick={() => setExpandedCountryId(null)}
                                    className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })()}

        </div>
    )
}
