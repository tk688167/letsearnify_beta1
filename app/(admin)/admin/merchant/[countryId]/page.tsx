"use client"
export const dynamic = "force-dynamic";
// Force Rebuild: v4
import { useState, useEffect, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { 

  PlusIcon, 
  TrashIcon, 
  PencilIcon, 
  BanknotesIcon,
  CreditCardIcon,
  DocumentTextIcon,
  BuildingLibraryIcon
} from "@heroicons/react/24/outline"
import { getPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, getCountries } from "@/app/actions/admin/merchant"
import toast, { Toaster } from "react-hot-toast"
import Link from "next/link"

export default function CountryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const countryId = params.countryId as string
  
  const [methods, setMethods] = useState<any[]>([])
  const [countryName, setCountryName] = useState("")
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  
  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState<any>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    accountName: "",
    instructions: ""
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const methodsRes = await getPaymentMethods(countryId)
      if (methodsRes.success) {
         setMethods(methodsRes.data as any[])
      } else {
         toast.error("Failed to load methods")
      }

      const countriesRes = await getCountries()
      if (countriesRes.success && countriesRes.data) {
         const c = countriesRes.data.find((c: any) => c.id === countryId)
         if (c) setCountryName(c.name)
      }
    } catch (e) {
      console.error(e)
      toast.error("Error loading data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [countryId])

  const openAddModal = () => {
    setEditingMethod(null)
    setFormData({ name: "", accountNumber: "", accountName: "", instructions: "" })
    setShowModal(true)
  }

  const openEditModal = (method: any) => {
    setEditingMethod(method)
    setFormData({
      name: method.name,
      accountNumber: method.accountNumber || "",
      accountName: method.accountName || "",
      instructions: method.instructions || ""
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.accountNumber || !formData.accountName) return;

    startTransition(async () => {
       if (editingMethod) {
          const res = await updatePaymentMethod(editingMethod.id, formData)
          if (res.success) {
             setShowModal(false)
             fetchData()
             toast.success("Method updated")
          } else {
             toast.error(res.error || "Update failed")
          }
       } else {
          const res = await addPaymentMethod(countryId, formData)
          if (res.success) {
             setShowModal(false)
             fetchData()
             toast.success("Method added")
          } else {
             toast.error(res.error || "Addition failed")
          }
       }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this payment method?")) return
    const toastId = toast.loading("Deleting...")
    startTransition(async () => {
       const res = await deletePaymentMethod(id)
       if (res.success) {
          fetchData()
          toast.success("Deleted", { id: toastId })
       }
       else {
          toast.error(res.error || "Delete failed", { id: toastId })
       }
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
       <Toaster position="top-right"/>
       
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Merchant &rsaquo; Configuration</div>
              <h1 className="text-2xl font-black text-gray-900">
                 {loading ? "Loading..." : `${countryName} Payment Methods`}
              </h1>
           </div>
           
           <button 
              onClick={openAddModal}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition font-bold shadow-lg shadow-gray-200"
           >
              <PlusIcon className="w-5 h-5" />
              Add Payment Method
           </button>
       </div>

       {/* List */}
       {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse">Loading payment methods...</div>
       ) : methods.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
             <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BanknotesIcon className="w-10 h-10 text-blue-400"/>
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">No Payment Methods Configured</h3>
             <p className="text-gray-500 max-w-sm mx-auto mb-8">
                Add local payment methods (like JazzCash, EasyPaisa, or Bank Accounts) for users to deposit into.
             </p>
             <button 
                onClick={openAddModal}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 shadow-sm"
             >
                Add First Method
             </button>
          </div>
       ) : (
          <div className="space-y-4">
             {methods.map((method) => (
                <div key={method.id} className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-6">
                   
                   {/* Icon */}
                   <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100/50">
                      <BuildingLibraryIcon className="w-8 h-8"/>
                   </div>

                   {/* Details */}
                   <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                         <h3 className="font-bold text-gray-900 text-lg">{method.name}</h3>
                         <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-md">Active</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                         <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                            <DocumentTextIcon className="w-4 h-4 text-gray-400"/>
                            <span>Holder: <span className="font-semibold text-gray-700">{method.accountName}</span></span>
                         </div>
                         <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                            <CreditCardIcon className="w-4 h-4 text-gray-400"/>
                            <span>Account/Wallet: <span className="font-mono font-bold text-gray-700">{method.accountNumber}</span></span>
                         </div>
                      </div>
                      
                      {method.instructions && (
                         <div className="text-xs text-gray-400 italic truncate max-w-xl group-hover:text-gray-500 transition-colors">
                            "{method.instructions}"
                         </div>
                      )}
                   </div>

                   {/* Actions */}
                   <div className="flex gap-2 self-end md:self-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                       <button 
                         onClick={() => openEditModal(method)}
                         className="p-2.5 bg-gray-50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition border border-gray-200 hover:border-blue-100"
                         title="Edit details"
                       >
                          <PencilIcon className="w-5 h-5"/>
                       </button>
                       <button 
                         onClick={() => handleDelete(method.id)}
                         className="p-2.5 bg-gray-50 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-gray-200 hover:border-red-100"
                         title="Delete method"
                       >
                          <TrashIcon className="w-5 h-5"/>
                       </button>
                   </div>
                </div>
             ))}
          </div>
       )}

       {/* Modal */}
       {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-3xl w-full max-w-lg p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 border border-gray-100">
                <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-extrabold text-gray-900">
                      {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
                   </h2>
                   <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
                      Deposit Details
                   </div>
                </div>
                
                <div className="space-y-5">
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Service Name</label>
                      <input 
                         type="text" 
                         placeholder="e.g. JazzCash, EasyPaisa, SadaPay, Meezan Bank"
                         className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 bg-gray-50 focus:bg-white transition-all font-medium"
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                      <p className="text-xs text-gray-400 mt-1">The name of the bank or wallet service.</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">Account Holder Name</label>
                         <input 
                            type="text" 
                            placeholder="e.g. Ali Khan"
                            className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 bg-gray-50 focus:bg-white transition-all"
                            value={formData.accountName}
                            onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                         />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Account / Wallet Number</label>
                          <input 
                             type="text" 
                             placeholder="e.g. 03001234567 or IBAN"
                             className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 bg-gray-50 focus:bg-white transition-all font-mono font-bold"
                             value={formData.accountNumber}
                             onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                          />
                      </div>
                   </div>

                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Deposit Instructions (Optional)</label>
                      <textarea 
                         placeholder="e.g. Please send the exact amount and upload the screenshot of the transaction ID."
                         className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 bg-gray-50 focus:bg-white transition-all min-h-[100px]"
                         value={formData.instructions}
                         onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                      />
                      <p className="text-xs text-gray-400 mt-2 ml-1">These instructions will be shown to the user when they select this method.</p>
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
                      disabled={isPending || !formData.name || !formData.accountNumber}
                      className="flex-1 py-4 bg-gray-900 rounded-2xl font-bold text-white hover:bg-black disabled:opacity-50 transition shadow-lg shadow-gray-200"
                   >
                      {isPending ? "Saving..." : "Save Method"}
                   </button>
                </div>
             </div>
          </div>
       )}
    </div>
  )
}
