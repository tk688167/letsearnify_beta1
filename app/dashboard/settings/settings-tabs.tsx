"use client"

import { useState } from "react"
import { User, PaymentMethod } from "@prisma/client"
import { updateProfile, addPaymentMethod } from "@/lib/actions"
import { 
  UserCircleIcon, 
  ShieldCheckIcon, 
  CreditCardIcon, 
  DocumentTextIcon, 
  Cog6ToothIcon
} from "@heroicons/react/24/outline"
// Reusing parts of the Edit Form logic but adapted for tabs
import EditForm from "../profile/edit/edit-form" 

// Type extension to include payment methods
type UserWithMethods = User & { paymentMethods: PaymentMethod[] }

export default function SettingsTabs({ user }: { user: UserWithMethods }) {
  const [activeTab, setActiveTab] = useState("general")
  const [isAddingPayment, setIsAddingPayment] = useState(false)

  const tabs = [
    { id: "general", label: "General", icon: UserCircleIcon },
    { id: "security", label: "Security", icon: ShieldCheckIcon },
    { id: "payments", label: "Payment Methods", icon: CreditCardIcon },
    { id: "verification", label: "Verification (KYC)", icon: DocumentTextIcon },
    { id: "preferences", label: "Preferences", icon: Cog6ToothIcon },
  ]

  return (
    <div>
      {/* Mobile Tab Dropdown could go here, for now using responsive flex */}
      <div className="flex overflow-x-auto pb-4 gap-2 mb-8 border-b border-gray-100 no-scrollbar">
        {tabs.map((tab) => {
           const Icon = tab.icon
           const isActive = activeTab === tab.id
           return (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                 isActive 
                   ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                   : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
               }`}
             >
               <Icon className="w-4 h-4" />
               {tab.label}
             </button>
           )
        })}
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-10 min-h-[500px]">
        
        {/* GENERAL TAB */}
        {activeTab === "general" && (
           <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold font-serif mb-6 text-gray-900">Profile Information</h2>
              {/* We can render the EditForm here, slightly modified or passed directly. 
                  EditForm is fully self-contained with its own form action. */}
              <EditForm user={user} />
           </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
           <div className="max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold font-serif mb-6 text-gray-900">Security Settings</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-yellow-800 text-sm mb-6">
                  <strong>Note:</strong> Password changes are handled in the General tab for convenience, but advanced security is here.
                </div>
                
                <form action={async (formData) => { await updateProfile(formData) }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Security Question</label>
                    <select name="securityQuestion" defaultValue={user.securityQuestion || ""} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                       <option value="" disabled>Select a question</option>
                       <option value="pet">What was the name of your first pet?</option>
                       <option value="school">What elementary school did you attend?</option>
                       <option value="city">In what city were you born?</option>
                    </select>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Answer</label>
                     <input 
                       name="securityAnswer"
                       defaultValue={user.securityAnswer || ""}
                       type="text" 
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                       placeholder="Your answer..."
                     />
                  </div>
                  <button className="px-6 py-2 bg-gray-900 text-white font-bold rounded-xl text-sm">Save Security Info</button>
                </form>

                <div className="pt-6 border-t border-gray-100">
                   <h3 className="font-bold text-gray-900 mb-2">Two-Factor Authentication</h3>
                   <p className="text-gray-500 text-sm mb-4">Protect your account with an extra layer of security.</p>
                   <button className="px-6 py-2 bg-gray-100 text-gray-400 font-bold rounded-xl text-sm cursor-not-allowed">Enable 2FA (Coming Soon)</button>
                </div>
              </div>
           </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === "payments" && (
           <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-serif text-gray-900">Linked Payment Methods</h2>
                <button 
                  onClick={() => setIsAddingPayment(!isAddingPayment)}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors"
                >
                  + Add New
                </button>
              </div>

              {isAddingPayment && (
                 <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <form action={async (formData) => {
                        await addPaymentMethod(formData)
                        setIsAddingPayment(false)
                    }}>
                       <h3 className="font-bold mb-4">Add Method (Simulated)</h3>
                       <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <select name="type" className="px-4 py-3 rounded-xl border border-gray-200">
                             <option value="CARD">Credit/Debit Card</option>
                             <option value="BANK">Bank Account</option>
                          </select>
                          <input name="details" placeholder="Last 4 digits or IBAN" className="px-4 py-3 rounded-xl border border-gray-200" required />
                       </div>
                       <div className="flex gap-2">
                         <button className="px-6 py-2 bg-gray-900 text-white font-bold rounded-xl text-sm">Save</button>
                         <button type="button" onClick={() => setIsAddingPayment(false)} className="px-6 py-2 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl text-sm">Cancel</button>
                       </div>
                    </form>
                 </div>
              )}

              <div className="space-y-4">
                 {user.paymentMethods.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                       <CreditCardIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                       <p>No payment methods linked yet.</p>
                    </div>
                 ) : (
                    user.paymentMethods.map(method => (
                       <div key={method.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <CreditCardIcon className="w-6 h-6" />
                             </div>
                             <div>
                                <div className="font-bold text-gray-900">{method.title}</div>
                                <div className="text-xs text-gray-500 uppercase">{method.type} • {method.details}</div>
                             </div>
                          </div>
                          <button className="text-xs font-bold text-red-500 px-3 py-1 bg-red-50 rounded-lg">Remove</button>
                       </div>
                    ))
                 )}
              </div>
           </div>
        )}

        {/* VERIFICATION TAB */}
        {activeTab === "verification" && (
           <div className="max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold font-serif mb-6 text-gray-900">Identity Verification (KYC)</h2>
              
              <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl mb-8">
                 <div className="flex items-center gap-3 mb-2">
                    <ShieldCheckIcon className={`w-6 h-6 ${user.kycStatus === 'VERIFIED' ? 'text-green-600' : 'text-blue-600'}`} />
                    <span className="font-bold text-gray-900 uppercase tracking-widest text-sm">Current Status: {user.kycStatus.replace("_", " ")}</span>
                 </div>
                 <p className="text-sm text-blue-800/70">
                    {user.kycStatus === 'VERIFIED' 
                       ? "Your account is fully verified. You have access to all features." 
                       : "Verify your identity to unlock higher withdrawal limits and investment pools."}
                 </p>
              </div>

              {user.kycStatus !== 'VERIFIED' && (
                 <div className="space-y-6">
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Government ID Type</label>
                       <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                          <option>Passport</option>
                          <option>National ID</option>
                          <option>Driver's License</option>
                       </select>
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                       <DocumentTextIcon className="w-10 h-10 text-gray-300 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
                       <p className="font-bold text-gray-600">Click to Upload Document</p>
                       <p className="text-xs text-gray-400 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                    </div>
                    <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20">Submit for Review</button>
                 </div>
              )}
           </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === "preferences" && (
           <div className="max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold font-serif mb-6 text-gray-900">Preferences</h2>
              <form action={async (formData) => { await updateProfile(formData) }} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Currency</label>
                       <select name="currency" defaultValue={user.currency} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Language</label>
                       <select name="language" defaultValue={user.language} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                       </select>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Notifications</h3>
                    <div className="space-y-4">
                       <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50">
                          <span className="font-medium text-gray-700">Email Alerts</span>
                          <input type="checkbox" className="w-5 h-5 rounded text-blue-600" defaultChecked />
                       </label>
                       <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50">
                          <span className="font-medium text-gray-700">Login Notifications</span>
                          <input type="checkbox" className="w-5 h-5 rounded text-blue-600" defaultChecked />
                       </label>
                    </div>
                 </div>
                 
                 <button className="px-6 py-2 bg-gray-900 text-white font-bold rounded-xl text-sm">Save Preferences</button>
              </form>
           </div>
        )}

      </div>
    </div>
  )
}
