"use client"
export const dynamic = "force-dynamic";
// Force Rebuild: v5
import { useState, useEffect, useTransition, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon, 
  BanknotesIcon,
  CreditCardIcon,
  DocumentTextIcon,
  BuildingLibraryIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ChevronUpDownIcon
} from "@heroicons/react/24/outline"
import { getPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, getCountries } from "@/app/actions/admin/merchant"
import toast, { Toaster } from "react-hot-toast"

const COUNTRY_SERVICES: Record<string, string[]> = {
  "PK": [
    "JazzCash", "EasyPaisa", "SadaPay", "NayaPay", "Meezan Bank", 
    "Habib Bank (HBL)", "United Bank (UBL)", "Allied Bank (ABL)", 
    "MCB Bank", "National Bank (NBP)", "Bank Alfalah", 
    "Standard Chartered", "Askari Bank", "Faysal Bank", "Bank of Punjab",
    "Bank Islami", "AL Habib", "Dubai Islamic", "JS Bank", "Soneri Bank"
  ],
  "IN": [
    "Google Pay", "PhonePe", "Paytm", "State Bank of India (SBI)", 
    "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra", 
    "Bank of Baroda", "Punjab National Bank"
  ],
  "BD": [
    "bKash", "Nagad", "Rocket", "Upay", "Dutch-Bangla Bank", 
    "Sonali Bank", "Islami Bank", "BRAC Bank"
  ],
  "AE": ["Emirates NBD", "ADCB", "First Abu Dhabi Bank", "Dubai Islamic Bank"],
  "SA": ["Al Rajhi Bank", "SNB (AlAhli)", "Riyad Bank", "Banque Saudi Fransi"],
  "GB": ["HSBC", "Barclays", "Revolut", "Monzo", "Lloyds", "NatWest"],
  "US": ["Chase", "Bank of America", "Wells Fargo", "Citi", "Capital One"]
}

export default function CountryDetailPage() {
  const params = useParams()
  const countryId = params.countryId as string
  
  const [methods, setMethods] = useState<any[]>([])
  const [countryName, setCountryName] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  
  // Modal & Search State
  const [showModal, setShowModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    accountName: "",
    iban: "",
    instructions: ""
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const methodsRes = await getPaymentMethods(countryId)
      if (methodsRes.success) {
         setMethods(methodsRes.data as any[])
      }

      const countriesRes = await getCountries()
      if (countriesRes.success && countriesRes.data) {
         const c = countriesRes.data.find((c: any) => c.id === countryId)
         if (c) {
           setCountryName(c.name)
           setCountryCode(c.code)
         }
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
    setFormData({ name: "", accountNumber: "", accountName: "", iban: "", instructions: "" })
    setSearchQuery("")
    setShowModal(true)
  }

  const openEditModal = (method: any) => {
    setEditingMethod(method)
    setFormData({
      name: method.name,
      accountNumber: method.accountNumber || "",
      accountName: method.accountName || "",
      iban: method.iban || "",
      instructions: method.instructions || ""
    })
    setSearchQuery(method.name)
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

  const filteredServices = COUNTRY_SERVICES[countryCode] 
    ? COUNTRY_SERVICES[countryCode].filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
       <Toaster position="top-right"/>
       
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-3xl shadow-sm border border-border">
           <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Merchant &rsaquo; Configuration</div>
              <h1 className="text-2xl font-black text-foreground">
                 {loading ? "Loading..." : `${countryName} Payment Methods`}
              </h1>
           </div>
           
           <button 
              onClick={openAddModal}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 transition font-bold shadow-lg shadow-primary/10"
           >
              <PlusIcon className="w-5 h-5" />
              Add Payment Method
           </button>
       </div>

       {/* List */}
       {loading ? (
          <div className="text-center py-20 text-muted-foreground animate-pulse">Loading payment methods...</div>
       ) : methods.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-dashed border-border">
             <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BanknotesIcon className="w-10 h-10 text-primary"/>
             </div>
             <h3 className="text-xl font-bold text-foreground mb-2">No Payment Methods Configured</h3>
             <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                Add local payment methods (like JazzCash, EasyPaisa, or Bank Accounts) for users to deposit into.
             </p>
             <button 
                onClick={openAddModal}
                className="px-6 py-3 bg-background border border-border text-foreground font-bold rounded-xl hover:bg-muted shadow-sm transition-colors"
             >
                Add First Method
             </button>
          </div>
       ) : (
          <div className="space-y-4">
             {methods.map((method) => (
                <div key={method.id} className="group bg-card rounded-2xl border border-border p-5 hover:shadow-lg hover:border-primary/50 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-6">
                   
                   {/* Icon */}
                   <div className="w-16 h-16 bg-gradient-to-br from-primary/5 to-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0 border border-primary/20">
                      <BuildingLibraryIcon className="w-8 h-8"/>
                   </div>

                   {/* Details */}
                   <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                         <h3 className="font-bold text-foreground text-lg">{method.name}</h3>
                         <span className="text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-md border border-green-500/20">Active</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                         <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1.5 rounded-xl border border-border/50">
                            <DocumentTextIcon className="w-4 h-4 text-muted-foreground/60"/>
                            <span>Holder: <span className="font-semibold text-foreground">{method.accountName}</span></span>
                         </div>
                         <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1.5 rounded-xl border border-border/50">
                            <CreditCardIcon className="w-4 h-4 text-muted-foreground/60"/>
                            <span>Account: <span className="font-mono font-bold text-foreground">{method.accountNumber}</span></span>
                         </div>
                         {method.iban && (
                           <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1.5 rounded-xl border border-border/50">
                              <BuildingLibraryIcon className="w-4 h-4 text-muted-foreground/60"/>
                              <span>IBAN: <span className="font-mono font-bold text-foreground text-xs">{method.iban}</span></span>
                           </div>
                         )}
                      </div>
                      
                      {method.instructions && (
                         <div className="text-xs text-muted-foreground italic truncate max-w-xl group-hover:text-foreground transition-colors mt-2">
                            &ldquo;{method.instructions}&rdquo;
                         </div>
                      )}
                   </div>

                   {/* Actions */}
                   <div className="flex gap-2 self-end md:self-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 md:translate-x-2 group-hover:translate-x-0">
                       <button 
                         onClick={() => openEditModal(method)}
                         className="p-2.5 bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition border border-border hover:border-primary/30"
                         title="Edit details"
                       >
                          <PencilIcon className="w-5 h-5"/>
                       </button>
                       <button 
                         onClick={() => handleDelete(method.id)}
                         className="p-2.5 bg-muted text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition border border-border hover:border-red-500/30"
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-card rounded-3xl w-full max-w-lg p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 border border-border overflow-visible">
                <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-extrabold text-foreground">
                      {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
                   </h2>
                   <div className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-[10px] font-bold uppercase tracking-widest border border-border">
                      Deposit Details
                   </div>
                </div>
                
                <div className="space-y-5">
                   {/* searchable Service Name */}
                   <div className="relative" ref={searchRef}>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 pl-1">Service Name</label>
                      <div className="relative">
                        <input 
                           type="text" 
                           placeholder="Search service (e.g. JazzCash, HBL)"
                           className="w-full p-4 rounded-2xl border border-border outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-background transition-all font-bold text-foreground placeholder:font-normal placeholder:text-muted-foreground/40 pr-12"
                           value={searchQuery}
                           onFocus={() => setIsSearchOpen(true)}
                           onChange={(e) => {
                             setSearchQuery(e.target.value)
                             setFormData({...formData, name: e.target.value})
                             setIsSearchOpen(true)
                           }}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                           <ChevronUpDownIcon className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Dropdown Results */}
                      {isSearchOpen && filteredServices.length > 0 && (
                        <div className="absolute z-[60] left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                           {filteredServices.map((service, idx) => (
                             <button
                                key={idx}
                                className="w-full text-left px-5 py-3.5 hover:bg-muted transition-colors flex items-center justify-between group"
                                onClick={() => {
                                  setFormData({...formData, name: service})
                                  setSearchQuery(service)
                                  setIsSearchOpen(false)
                                }}
                             >
                                <span className="font-bold text-foreground group-hover:text-primary transition-colors">{service}</span>
                                {formData.name === service && <CheckIcon className="w-5 h-5 text-primary" />}
                             </button>
                           ))}
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1.5 px-1">Select from common services or type manually.</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                         <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 pl-1">Account Holder</label>
                         <input 
                            type="text" 
                            placeholder="Full Name"
                            className="w-full p-4 rounded-2xl border border-border outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-background transition-all font-bold text-foreground placeholder:font-normal placeholder:text-muted-foreground/40"
                            value={formData.accountName}
                            onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                         />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 pl-1">Account Number</label>
                          <input 
                             type="text" 
                             placeholder="Account No."
                             className="w-full p-4 rounded-2xl border border-border outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-background transition-all font-mono font-bold text-foreground placeholder:font-normal placeholder:text-muted-foreground/40"
                             value={formData.accountNumber}
                             onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                          />
                      </div>
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 pl-1">IBAN Number (Optional)</label>
                      <input 
                         type="text" 
                         placeholder="PK00 BANK 0123 4567 89..."
                         className="w-full p-4 rounded-2xl border border-border outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-background transition-all font-mono font-bold text-foreground placeholder:font-normal placeholder:text-muted-foreground/40"
                         value={formData.iban}
                         onChange={(e) => setFormData({...formData, iban: e.target.value})}
                      />
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 pl-1">Instructions (Optional)</label>
                      <textarea 
                         placeholder="e.g. Please send screenshot after payment."
                         className="w-full p-4 rounded-2xl border border-border outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-background transition-all min-h-[80px] text-foreground font-medium placeholder:font-normal placeholder:text-muted-foreground/40"
                         value={formData.instructions}
                         onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                      />
                   </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-border">
                   <button 
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-4 bg-muted rounded-2xl font-bold hover:bg-muted/80 text-muted-foreground transition active:scale-[0.98]"
                   >
                      Cancel
                   </button>
                   <button 
                      onClick={handleSubmit}
                      disabled={isPending || !formData.name || !formData.accountNumber}
                      className="flex-1 py-4 bg-primary rounded-2xl font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-primary/10 active:scale-[0.98]"
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
