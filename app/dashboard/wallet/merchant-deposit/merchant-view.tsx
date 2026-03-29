"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeftIcon, ChatBubbleLeftRightIcon, ShieldCheckIcon, BanknotesIcon, GlobeAsiaAustraliaIcon } from "@heroicons/react/24/outline"

export default function MerchantDepositClient({ initialCountries }: { initialCountries: any[] }) {
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null)

  // Sort: Active first, then others
  const sortedCountries = [...initialCountries].sort((a, b) => {
      if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1
      if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1
      return 0
  })

  const selectedCountry = initialCountries.find(c => c.id === selectedCountryId)

  const whatsappMessage = encodeURIComponent("Hello, I want to make a merchant deposit on LetsEarnify. Please guide me.")

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/wallet?tab=deposit" className="p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900">Merchant Assisted Deposits</h1>
          <p className="text-gray-500 text-sm">Local deposits via authorized merchants in selected countries</p>
        </div>
      </div>

      {/* TRC-20 GUIDANCE - ALWAYS VISIBLE */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex items-start gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                  <ShieldCheckIcon className="w-8 h-8 text-white"/>
              </div>
              <div className="space-y-2">
                  <h3 className="font-bold text-lg">TRC-20 Crypto Deposits are Fully Working</h3>
                  <p className="text-blue-100 text-sm leading-relaxed max-w-2xl">
                      If you cannot deposit through a local merchant in your country, please use the TRC-20 Crypto deposit option. 
                      It is automated, instant, and available worldwide.
                  </p>
                  <Link href="/dashboard/wallet?tab=deposit" className="inline-block mt-2 px-4 py-2 bg-white text-blue-700 font-bold rounded-lg text-sm hover:bg-blue-50 transition-colors">
                      Go to Crypto Deposit
                  </Link>
              </div>
          </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
          
          {/* COUNTRY LIST */}
          <div className="md:col-span-1 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Select Country</h3>
              <div className="grid gap-3">
                  {sortedCountries.map((country) => (
                      <button
                        key={country.id}
                        onClick={() => setSelectedCountryId(country.status === "ACTIVE" ? country.id : null)}
                        className={`w-full p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                            country.id === selectedCountryId 
                            ? "bg-green-50 border-green-500 ring-1 ring-green-500" 
                            : "bg-white border-gray-100 hover:border-gray-200"
                        } ${country.status !== "ACTIVE" ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                          <div className="flex items-center justify-between pointer-events-none">
                              <div>
                                  <div className="font-bold text-gray-900">{country.name}</div>
                                  <div className={`text-[10px] font-bold uppercase mt-1 px-2 py-0.5 rounded w-fit ${
                                      country.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                  }`}>
                                      {country.status === "ACTIVE" ? "Active" : "Coming Soon"}
                                  </div>
                              </div>
                              {country.status === "ACTIVE" && (
                                  <div className={`w-4 h-4 rounded-full border-2 ${country.id === selectedCountryId ? "border-green-600 bg-green-600" : "border-gray-300"}`}></div>
                              )}
                          </div>
                      </button>
                  ))}
                  
                  {sortedCountries.length === 0 && (
                      <div className="text-center p-6 bg-gray-50 rounded-xl text-gray-400 text-sm">
                          No countries configured.
                      </div>
                  )}
              </div>
          </div>

          {/* DETAILS PANEL */}
          <div className="md:col-span-2">
              {selectedCountry ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      
                      {/* METHODS */}
                      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                              <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                              Supported Payment Methods ({selectedCountry.name})
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                              {selectedCountry.methods.length > 0 ? selectedCountry.methods.map((m: any) => (
                                  <div key={m.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-bold text-gray-700 flex items-center gap-2">
                                      <BanknotesIcon className="w-5 h-5 text-gray-400"/>
                                      {m.name}
                                  </div>
                              )) : (
                                  <div className="col-span-2 text-gray-400 text-sm italic">No specific methods listed. Ask merchant.</div>
                              )}
                          </div>
                          <p className="mt-4 text-xs text-center text-gray-400">
                             * Account numbers are provided privately via WhatsApp to ensure security.
                          </p>
                      </div>

                      {/* CONTACTS */}
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                          <h2 className="text-xl font-bold font-serif mb-6 relative z-10">Authorized Merchants</h2>
                          
                          <div className="grid gap-4 relative z-10">
                              {selectedCountry.contacts.length > 0 ? selectedCountry.contacts.map((contact: any) => (
                                  <div key={contact.id} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/15 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                      <div>
                                          <div className="font-bold">{contact.name}</div>
                                          <div className="text-sm text-gray-400 font-mono">{contact.phone}</div>
                                      </div>
                                      <a 
                                          href={`https://wa.me/${contact.phone.replace(/\+/g, "").replace(/\s/g, "")}?text=${whatsappMessage}`}
                                          target="_blank"
                                          rel="noopener noreferrer" 
                                          className="flex items-center justify-center px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-green-900/20 gap-2 whitespace-nowrap"
                                      >
                                          <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                          <span>Chat on WhatsApp</span>
                                      </a>
                                  </div>
                              )) : (
                                  <div className="text-gray-400 italic">No merchants currently active.</div>
                              )}
                          </div>
                      </div>

                      {/* INSTRUCTIONS */}
                      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                           <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                                Deposit Process
                           </h3>
                           <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:h-[85%] before:w-0.5 before:bg-gray-100">
                                {[
                                   "Select your country",
                                   "Contact a merchant via WhatsApp button above",
                                   "Receive payment instructions securely",
                                   "Send payment and share screenshot",
                                   "Admin manually verifies and credits your wallet"
                                 ].map((step, i) => (
                                   <div key={i} className="relative pl-10">
                                     <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-2 border-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 z-10 shadow-sm">
                                       {i + 1}
                                     </div>
                                     <p className="text-gray-600 font-medium text-sm pt-1.5">{step}</p>
                                   </div>
                                 ))}
                           </div>
                      </div>

                  </div>
              ) : (
                  <div className="h-full flex flex-col items-center justify-center p-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center space-y-4 min-h-[400px]">
                      <GlobeAsiaAustraliaIcon className="w-16 h-16 text-gray-300"/>
                      <div>
                          <h3 className="font-bold text-gray-900 text-lg">Select a Country</h3>
                          <p className="text-gray-500 text-sm max-w-xs mx-auto">
                              Choose your country from the list to see available payment methods and authorized merchants.
                          </p>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  )
}
