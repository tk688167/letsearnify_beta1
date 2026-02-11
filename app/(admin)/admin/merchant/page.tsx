"use client"
// Force Rebuild: v4
import { useState, useEffect, useTransition } from "react"
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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
       <Toaster position="top-right" />
       
       {/* Header Section */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Merchant Settings</h1>
            <p className="text-gray-500 mt-1">Manage supported countries and payment gateways for deposits/withdrawals.</p>
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-200"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Country
          </button>
       </div>

       {/* Search & Filter */}
       <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm max-w-xl">
          <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search countries..." 
            className="flex-1 outline-none text-gray-700 placeholder-gray-400 font-medium"
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
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
             <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="w-10 h-10 text-gray-300"/>
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">No Countries Configured</h3>
             <p className="text-gray-500 max-w-sm mx-auto mb-8">
                Start by adding a country to enable merchant deposits and withdrawals.
             </p>
             <button 
                onClick={openAddModal}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 shadow-sm transition"
             >
                Add First Country
             </button>
          </div>
       )}

       {/* Countries Grid */}
       {!loading && countries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredCountries.map((country: any) => (
                <div key={country.id} className="group bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-xl hover:border-blue-100 transition-all duration-300 relative overflow-hidden">
                   
                   {/* Status Indicator Bar */}
                   <div className={`absolute top-0 left-0 w-full h-1.5 ${country.status === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-400'}`} />

                   <div className="flex justify-between items-start mb-6 mt-2">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-gray-50 text-2xl flex items-center justify-center rounded-2xl font-black text-gray-700 border border-gray-100 shadow-inner">
                            {country.code}
                         </div>
                         <div>
                            <h3 className="font-bold text-gray-900 text-xl">{country.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <CurrencyDollarIcon className="w-3 h-3"/> {country.currency}
                               </span>
                               {country.status === "ACTIVE" ? (
                                  <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/> Active
                                  </span>
                               ) : (
                                  <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">
                                    Coming Soon
                                  </span>
                               )}
                            </div>
                         </div>
                      </div>
                      
                      {/* Action Menu */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                          <button 
                            onClick={() => openEditModal(country)}
                            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                            title="Edit Country"
                          >
                             <PencilIcon className="w-5 h-5"/>
                          </button>
                          <button 
                            onClick={() => handleDelete(country.id)}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                            title="Delete Country"
                          >
                             <TrashIcon className="w-5 h-5"/>
                          </button>
                      </div>
                   </div>

                   <div className="space-y-4">
                       <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                          <span className="font-medium">Payment Gateways</span>
                          <span className="bg-white px-2.5 py-0.5 rounded-lg border border-gray-200 text-gray-900 font-bold shadow-sm">
                             {country._count?.methods || 0}
                          </span>
                       </div>

                       <Link 
                         href={`/admin/merchant/${country.id}`}
                         className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200"
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
             <div className="bg-white rounded-3xl w-full max-w-lg p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 border border-gray-100">
                <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-extrabold text-gray-900">
                     {editingCountry ? "Edit Settings" : "Add Country"}
                   </h2>
                   <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                      Configuration
                   </div>
                </div>
                
                <div className="space-y-5">
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
                                value={formData.exchangeRate}
                                onChange={(e) => setFormData({...formData, exchangeRate: parseFloat(e.target.value)})}
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
                                value={formData.serviceFee}
                                onChange={(e) => setFormData({...formData, serviceFee: parseFloat(e.target.value)})}
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
