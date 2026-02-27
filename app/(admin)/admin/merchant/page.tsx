"use client"
export const dynamic = "force-dynamic";
// Force Rebuild: v4
import { useState, useEffect, useTransition, useRef } from "react"
import { 
  PlusIcon, 
  TrashIcon, 
  MapPinIcon, 
  CurrencyDollarIcon, 
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { createCountry, deleteCountry, updateCountry, getCountries } from "@/app/actions/admin/merchant"
import { useRouter } from "next/navigation"
import toast, { Toaster } from "react-hot-toast"
import { getAllCountries } from "@/app/actions/admin/merchant-settings"
import { ChevronUpDownIcon, ArrowPathIcon } from "@heroicons/react/24/outline"

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
            const filtered = allCountries.filter(c => 
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
                    className="w-full p-4 pr-10 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer"
                    placeholder={isLoading ? "Loading countries..." : "Select a country to auto-fill..."}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                    // Show dropdown on focus even if empty query (shows all)
                    onFocus={() => setIsOpen(true)}
                    disabled={isLoading}
                />
                <div className="absolute right-4 top-4 text-gray-400 pointer-events-none">
                    {isLoading ? (
                        <ArrowPathIcon className="w-5 h-5 animate-spin"/>
                    ) : (
                        <ChevronUpDownIcon className="w-5 h-5"/>
                    )}
                </div>
             </div>

            {isOpen && !isLoading && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
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

export default function AdminMerchantPage() {
  const [countries, setCountries] = useState<any[]>([])
  const [filteredCountries, setFilteredCountries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState("")

  // Form State
  const [showModal, setShowModal] = useState(false)
  const [editingCountry, setEditingCountry] = useState<any>(null)
  const [formData, setFormData] = useState({ 
      name: "", 
      code: "", 
      currency: "", 
      status: "ACTIVE",
      exchangeRate: 1.0,
      serviceFee: 0.0
  })

  const fetchCountries = async () => {
    setLoading(true)
    try {
      const res = await getCountries()
      if (res.success) {
        setCountries(res.data as any[])
        setFilteredCountries(res.data as any[])
      } else {
        toast.error("Failed to load countries")
      }
    } catch (e) {
      console.error(e)
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCountries()
  }, [])

  useEffect(() => {
    if (!searchQuery) {
      setFilteredCountries(countries)
    } else {
      const lower = searchQuery.toLowerCase()
      setFilteredCountries(countries.filter(c => 
        c.name.toLowerCase().includes(lower) || 
        c.code.toLowerCase().includes(lower)
      ))
    }
  }, [searchQuery, countries])

  const openAddModal = () => {
    setEditingCountry(null)
    setFormData({ name: "", code: "", currency: "", status: "ACTIVE", exchangeRate: 1.0, serviceFee: 0.0 })
    setShowModal(true)
  }

  const openEditModal = (country: any) => {
    setEditingCountry(country)
    setFormData({
      name: country.name,
      code: country.code,
      currency: country.currency,
      status: country.status,
      exchangeRate: country.exchangeRate || 1.0,
      serviceFee: country.serviceFee || 0.0
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) return

    startTransition(async () => {
      if (editingCountry) {
        const res = await updateCountry(editingCountry.id, formData)
        if (res.success) {
          setShowModal(false)
          fetchCountries()
          toast.success("Country updated successfully")
        } else {
          toast.error(res.error || "Update failed")
        }
      } else {
        const res = await createCountry(formData)
        if (res.success) {
          setShowModal(false)
          fetchCountries()
          toast.success("Country added successfully")
        } else {
          toast.error(res.error || "Creation failed")
        }
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all payment methods associated with this country.")) return

    const toastId = toast.loading("Deleting...")
    startTransition(async () => {
       const res = await deleteCountry(id)
       if (res.success) {
         fetchCountries()
         toast.success("Country deleted", { id: toastId })
       } else {
         toast.error(res.error || "Delete failed", { id: toastId })
       }
    })
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
       <Toaster position="top-right" />
       
       {/* Header Section */}
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Merchant Settings</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Manage supported countries and payment gateways.</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 transition font-bold text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add Country
          </button>
       </div>

       {/* Search & Filter */}
       <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 dark:text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search countries..."
            className="flex-1 outline-none bg-transparent text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-600 font-medium text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
       </div>

       {/* Loading State */}
       {loading && (
          <div className="text-center py-20 text-gray-500 font-medium animate-pulse">
            Loading merchant configurations...
          </div>
       )}

       {/* Empty State */}
       {!loading && countries.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
             <div className="bg-gray-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="w-8 h-8 text-gray-300 dark:text-slate-600"/>
             </div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Countries Configured</h3>
             <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm mx-auto mb-6">Start by adding a country to enable merchant deposits and withdrawals.</p>
             <button onClick={openAddModal} className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 text-sm transition">
                Add First Country
             </button>
          </div>
       )}

       {/* Countries Grid */}
       {!loading && countries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
             {filteredCountries.map((country: any) => (
                <div key={country.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden">

                   <div className={`absolute top-0 left-0 w-full h-1 ${country.status === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-400'}`} />

                   <div className="flex justify-between items-start mb-4 mt-1">
                      <div className="flex items-center gap-3">
                         <div className="w-11 h-11 bg-gray-50 dark:bg-slate-800 text-xl flex items-center justify-center rounded-xl font-black text-gray-700 dark:text-slate-200 border border-gray-100 dark:border-slate-700">
                            {country.code}
                         </div>
                         <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-base">{country.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                               <span className="text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <CurrencyDollarIcon className="w-2.5 h-2.5"/> {country.currency}
                               </span>
                               {country.status === "ACTIVE" ? (
                                  <span className="text-[10px] font-bold bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"/> Active
                                  </span>
                               ) : (
                                  <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">
                                    Coming Soon
                                  </span>
                               )}
                            </div>
                         </div>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => openEditModal(country)} className="p-2 text-gray-400 dark:text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition" title="Edit">
                             <PencilIcon className="w-4 h-4"/>
                          </button>
                          <button onClick={() => handleDelete(country.id)} className="p-2 text-gray-400 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition" title="Delete">
                             <TrashIcon className="w-4 h-4"/>
                          </button>
                      </div>
                   </div>

                   <div className="space-y-3">
                       <div className="flex items-center justify-between text-sm text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                          <span className="font-medium text-xs">Payment Gateways</span>
                          <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-bold text-sm shadow-sm">
                             {country._count?.methods || 0}
                          </span>
                       </div>

                       <Link
                         href={`/admin/merchant/${country.id}`}
                         className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 dark:bg-slate-100 text-white dark:text-gray-900 font-bold rounded-xl hover:bg-black dark:hover:bg-white transition-all text-sm"
                       >
                          Manage Gateways
                       </Link>
                   </div>
                </div>
             ))}
          </div>
       )}

       {/* Add/Edit Modal */}
       {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-extrabold text-gray-900">
                     {editingCountry ? "Edit Settings" : "Add Country"}
                   </h2>
                   <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                      Configuration
                   </div>
                </div>
                
                <div className="space-y-5">

                  
                    {/* Country Search & Auto-fill */}
                    <div className="relative z-50">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Search Country</label>
                        <CountryAutocomplete 
                            onSelect={(c) => {
                                setFormData({
                                    ...formData,
                                    name: c.name,
                                    code: c.code,
                                    currency: c.currency,
                                    // Fetch rate immediately
                                })
                                // Fetch exchange rate
                                import("@/app/actions/admin/merchant-settings").then(mod => {
                                    mod.fetchExchangeRate(c.currency).then(rate => {
                                        setFormData(prev => ({ ...prev, exchangeRate: rate }))
                                    })
                                })
                            }}
                        />
                        <p className="text-xs text-gray-400 mt-1">Select from list to auto-fill details.</p>
                    </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">Country Name</label>
                     <input 
                        type="text" 
                        placeholder="e.g. Pakistan"
                        className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-gray-50 focus:bg-white transition-all font-medium"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Code (ISO)</label>
                        <input 
                           type="text" 
                           placeholder="PK"
                           className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 uppercase font-mono bg-gray-50 focus:bg-white transition-all text-center font-bold"
                           value={formData.code}
                           onChange={(e) => setFormData({...formData, code: e.target.value})}
                           maxLength={2}
                        />
                     </div>
                     <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">Currency</label>
                         <input 
                            type="text" 
                            placeholder="PKR"
                            className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 uppercase font-mono bg-gray-50 focus:bg-white transition-all text-center font-bold"
                            value={formData.currency}
                            onChange={(e) => setFormData({...formData, currency: e.target.value})}
                            maxLength={3}
                         />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Exchange Rate</label>
                          <div className="relative">
                            <input 
                                type="number" 
                                placeholder="280.0"
                                className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold bg-gray-50 focus:bg-white transition-all"
                                value={isNaN(formData.exchangeRate) ? "" : formData.exchangeRate}
                                onChange={(e) => {
                                   const val = parseFloat(e.target.value)
                                   setFormData({...formData, exchangeRate: isNaN(val) ? 0 : val})
                                }}
                                step="0.01"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">/ USD</span>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Fixed Fee</label>
                          <div className="relative">
                            <input 
                                type="number" 
                                placeholder="20"
                                className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold bg-gray-50 focus:bg-white transition-all"
                                value={isNaN(formData.serviceFee) ? "" : formData.serviceFee}
                                onChange={(e) => {
                                   const val = parseFloat(e.target.value)
                                   setFormData({...formData, serviceFee: isNaN(val) ? 0 : val})
                                }}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{formData.currency || 'Curr'}</span>
                          </div>
                      </div>
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">Visibility Status</label>
                     <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 rounded-2xl">
                        <button
                          className={`py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                            formData.status === "ACTIVE" 
                            ? "bg-white text-green-700 shadow-md ring-1 ring-black/5" 
                            : "text-gray-500 hover:bg-gray-200"
                          }`}
                          onClick={() => setFormData({...formData, status: "ACTIVE"})}
                        >
                          {formData.status === "ACTIVE" && <CheckBadgeIcon className="w-5 h-5"/>}
                          Active
                        </button>
                        <button
                          className={`py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                            formData.status === "COMING_SOON" 
                            ? "bg-white text-amber-700 shadow-md ring-1 ring-black/5" 
                            : "text-gray-500 hover:bg-gray-200"
                          }`}
                          onClick={() => setFormData({...formData, status: "COMING_SOON"})}
                        >
                          {formData.status === "COMING_SOON" && <CheckBadgeIcon className="w-5 h-5"/>}
                          Coming Soon
                        </button>
                     </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                   <button 
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-4 bg-gray-50 rounded-2xl font-bold hover:bg-gray-100 text-gray-600 transition"
                   >
                      Cancel
                   </button>
                   <button 
                      onClick={handleSubmit}
                      disabled={isPending || !formData.name || !formData.code}
                      className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-500/20"
                   >
                      {isPending ? "Saving..." : (editingCountry ? "Save Changes" : "Create Country")}
                   </button>
                </div>
             </div>
          </div>
       )}
    </div>
  )
}
