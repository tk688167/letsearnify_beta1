"use client"

import { useState, useTransition, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { formatCurrency, cn } from "@/lib/utils"
import { deposit, transferToPool } from "@/lib/actions"
import { submitWithdrawal } from "@/app/actions/wallet" // New Action
import { 
  BanknotesIcon, 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon, 
  ArrowPathIcon,
  CreditCardIcon,
  QrCodeIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline"
import { QRCode } from "./qr-code"

// CONSTANTS REMOVED - using dynamic props now

export default function WalletClient({ user, transactions, platformWallets, merchantSettings }: { user: any, transactions: any[], platformWallets: any[], merchantSettings: any[] }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalletContent user={user} transactions={transactions} platformWallets={platformWallets} merchantSettings={merchantSettings} />
    </Suspense>
  )
}

function WalletContent({ user, transactions, platformWallets, merchantSettings }: { user: any, transactions: any[], platformWallets: any[], merchantSettings: any[] }) {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab")
  
  const [balance, setBalance] = useState(user.balance)
  const [activeTab, setActiveTab] = useState(initialTab && ["deposit", "withdraw", "transfer"].includes(initialTab) ? initialTab : "deposit")
  const [amount, setAmount] = useState("")
  // For Deposits:
  const [depositMethod, setDepositMethod] = useState<"TRC20" | "CARD" | "MERCHANT">("TRC20")
  const [cryptoNetwork, setCryptoNetwork] = useState<"TRC20">("TRC20")
  const [txHash, setTxHash] = useState("")
  
  // Merchant State
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null)
  
  // Helper to find wallet data
  const currentWallet = platformWallets.find(w => w.network === cryptoNetwork) || { address: "Loading...", qrCodePath: "" }

  
  // For Withdraws/Transfers:
  const [method, setMethod] = useState("TRC20") // Legacy, keeping for Transfer
  const [withdrawalMethod, setWithdrawalMethod] = useState<"TRC20" | "MERCHANT" | "STRIPE">("TRC20") // New withdrawal state
  const [details, setDetails] = useState("")

  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const copyAddress = () => {
     navigator.clipboard.writeText(currentWallet.address)
     setMessage({ type: 'success', text: "Address copied to clipboard!" })
     setTimeout(() => setMessage(null), 2000)
  }

  const handleAction = () => {
    setMessage(null)
    const val = parseFloat(amount)
    if (isNaN(val) || val <= 0) {
       setMessage({ type: 'error', text: "Please enter a valid amount." })
       return
    }

    startTransition(async () => {
      try {
        let res: any
        if (activeTab === "deposit") {
           // For TRC20 (others use separate form)
           if (!txHash) {
             throw new Error("Please enter the Transaction Hash.")
           }
           res = await deposit(val, "CRYPTO", { network: "TRC20", txHash }) as any
        } else if (activeTab === "withdraw") {
           if (!details) {
             throw new Error("Please provide withdrawal destination details.")
           }
           
           // Use FormData as expected by the new action
           const formData = new FormData();
           formData.append("amount", val.toString());
           formData.append("address", details); // 'details' holds the address input

           res = await submitWithdrawal(formData);
           
           if (res?.success) {
               setDetails("");
               setMessage({ type: 'success', text: "Withdrawal request submitted for approval." });
               setAmount("");
               // Note: We do NOT deduct balance immediately for withdrawals based on new logic.
               // Existing logic for deposits/transfers below might need adjustment if shared structure.
               return; 
           }
        } else if (activeTab === "transfer") {
           res = await transferToPool(val, method) // method acts as poolName here
        }

        if (res?.success) {
           setMessage({ type: 'success', text: res.message || "Transaction successful!" })
           setAmount("")
           setTxHash("")
           // Optimistic update
           if (activeTab === "deposit") setBalance((curr: number) => curr + val)
           // Only for transfer we deduct immediately
           else if (activeTab === "transfer") setBalance((curr: number) => curr - val)
        } else {
           setMessage({ type: 'error', text: res?.message || res?.error || "Transaction failed." })
        }
      } catch (err: any) {
         setMessage({ type: 'error', text: err.message || "Transaction failed." })
      }
    })
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
       {/* LEFT COLUMN: BALANCE & ACTIONS */}
       <div className="lg:col-span-2 space-y-8">
          
          {/* Main Balance Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden transform hover:scale-[1.01] transition-transform duration-500">
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <h2 className="text-blue-200 font-medium tracking-wider uppercase text-sm mb-1">Total Balance</h2>
                      <div className="text-5xl md:text-6xl font-bold font-serif tracking-tight">
                         {formatCurrency(balance)}
                      </div>
                   </div>
                   <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                      <BanknotesIcon className="w-8 h-8 text-white" />
                   </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                   <ActionButton 
                      label="Deposit" 
                      icon={ArrowDownTrayIcon} 
                      isActive={activeTab === "deposit"} 
                      onClick={() => { setActiveTab("deposit"); setMessage(null); }} 
                   />
                   <ActionButton 
                      label="Withdraw" 
                      icon={ArrowUpTrayIcon} 
                      isActive={activeTab === "withdraw"} 
                      onClick={() => { setActiveTab("withdraw"); setMessage(null); }} 
                   />
                   <ActionButton 
                      label="Transfer" 
                      icon={ArrowPathIcon} 
                      isActive={activeTab === "transfer"} 
                      onClick={() => { setActiveTab("transfer"); setMessage(null); }} 
                   />
                </div>
             </div>
             {/* Decorative Background */}
             <div className="absolute -right-20 -bottom-20 opacity-10">
                <div className="w-96 h-96 rounded-full border-[40px] border-white blur-3xl"></div>
             </div>
          </div>

          {/* Action Form Panel */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h3 className="text-xl font-bold font-serif text-gray-900 mb-6 capitalize">{activeTab} Funds</h3>
             
             {/* Zero Fee Message */}
             {(activeTab === "deposit" || activeTab === "withdraw") && (
                <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm font-bold rounded-xl flex items-center gap-2 border border-green-100">
                   <ShieldCheckIcon className="w-5 h-5"/>
                   <span>Zero Fees: We cover all network transaction costs.</span>
                </div>
             )}

             <div className="space-y-6">
                
                {/* DEPOSIT FORM */}
                {activeTab === "deposit" && (
                   <>
                       <div className="space-y-4 mb-8">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Method</h4>
                          
                          {/* 1. TRC-20 */}
                          <button 
                             onClick={() => setDepositMethod("TRC20")}
                             className={cn("w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group", 
                                depositMethod === "TRC20" ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-gray-100 bg-white hover:border-gray-200"
                             )}
                          >
                              <div className="flex items-center gap-4">
                                  <div className={cn("p-3 rounded-lg transition-colors", depositMethod === "TRC20" ? "bg-white text-blue-600 shadow-sm" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100")}>
                                      <QrCodeIcon className="w-6 h-6"/>
                                  </div>
                                  <div className="text-left">
                                      <div className={cn("font-bold transition-colors", depositMethod === "TRC20" ? "text-blue-900" : "text-gray-900")}>TRC-20 Crypto</div>
                                      <div className="text-xs text-gray-500">Automated • Instant</div>
                                  </div>
                              </div>
                              {depositMethod === "TRC20" && <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm"></div>}
                          </button>

                          {/* 2. Merchant Deposit (Inline) */}
                          <button 
                              onClick={() => setDepositMethod("MERCHANT")}
                              className={cn("w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group", 
                                depositMethod === "MERCHANT" ? "border-green-500 bg-green-50 ring-1 ring-green-500" : "border-gray-100 bg-white hover:border-gray-200"
                             )}
                          >
                              <div className="flex items-center gap-4">
                                  <div className={cn("p-3 rounded-lg transition-colors", depositMethod === "MERCHANT" ? "bg-white text-green-600 shadow-sm" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100")}>
                                      <BanknotesIcon className="w-6 h-6"/>
                                  </div>
                                  <div className="text-left">
                                      <div className={cn("font-bold transition-colors", depositMethod === "MERCHANT" ? "text-green-900" : "text-gray-900")}>Merchant Deposit</div>
                                      <div className="text-xs text-gray-500">Available for all countries</div>
                                  </div>
                              </div>
                              {depositMethod === "MERCHANT" && <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>}
                          </button>

                          {/* 3. Pay By Card */}
                          <button 
                             onClick={() => setDepositMethod("CARD")}
                             className={cn("w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group", 
                                depositMethod === "CARD" ? "border-gray-900 bg-gray-50" : "border-gray-100 bg-white hover:border-gray-200"
                             )}
                          >
                              <div className="flex items-center gap-4">
                                  <div className={cn("p-3 rounded-lg transition-colors", depositMethod === "CARD" ? "bg-white text-gray-900 shadow-sm" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100")}>
                                      <CreditCardIcon className="w-6 h-6"/>
                                  </div>
                                  <div className="text-left">
                                      <div className="font-bold text-gray-900">Pay By Card</div>
                                      <div className="text-xs text-gray-500">Visa / Mastercard</div>
                                  </div>
                              </div>
                              {depositMethod === "CARD" && <div className="w-4 h-4 rounded-full bg-gray-900 shadow-sm"></div>}
                          </button>
                      </div>

                       {depositMethod === "TRC20" && (
                          <div className="space-y-6">
                             {/* Re-using simplified existing crypto logic for Manual TRC20 */}
                             <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="w-full md:w-auto flex-shrink-0">
                                   <QRCode 
                                     network="TRC20" 
                                     imagePath={currentWallet.qrCodePath || "/qr-trc20.png"} 
                                   />
                                </div>
                                <div className="w-full space-y-4">
                                   <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Wallet Address</div>
                                   <div className="flex items-center gap-2">
                                      <div className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs md:text-sm text-gray-600 break-all">
                                         {currentWallet?.address || "Loading..."}
                                      </div>
                                      <button onClick={copyAddress} className="p-4 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors">
                                         <DocumentDuplicateIcon className="w-5 h-5"/>
                                      </button>
                                   </div>
                                   <div className="text-xs text-blue-600 font-medium">
                                      * Only send TRC20 (USDT) to this address.
                                   </div>
                                </div>
                             </div>
                             
                             <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Transaction Hash (TXID)</label>
                                <input 
                                   type="text" 
                                   value={txHash}
                                   onChange={(e) => setTxHash(e.target.value)}
                                   placeholder="Paste your transaction hash here..."
                                   className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                                />
                             </div>
                             
                             {/* TRC20 Amount Input */}
                             <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount ($)</label>
                                <div className="relative">
                                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                   <input 
                                      type="number" 
                                      value={amount}
                                      onChange={(e) => setAmount(e.target.value)}
                                      placeholder="0.00"
                                      className="w-full pl-8 pr-4 py-4 text-xl font-bold rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-gray-50 focus:bg-white"
                                   />
                                </div>
                             </div>

                          </div>
                       )}

                       {depositMethod === "MERCHANT" && (() => {
                          // Deduplication Logic: Ensure strictly ONE entry per country name
                          // Prioritize ACTIVE status.
                          const uniqueCountriesMap = new Map();
                          
                          [...merchantSettings].forEach(country => {
                             const normalizedName = country.name.toLowerCase().trim();
                             const existing = uniqueCountriesMap.get(normalizedName);
                             
                             if (!existing) {
                                uniqueCountriesMap.set(normalizedName, country);
                             } else {
                                // If current is ACTIVE and existing is NOT, replace it.
                                if (country.status === "ACTIVE" && existing.status !== "ACTIVE") {
                                   uniqueCountriesMap.set(normalizedName, country);
                                }
                                // Else keep existing (which is either active or first seen)
                             }
                          });

                          const sortedCountries = Array.from(uniqueCountriesMap.values())
                             // Show ALL countries, sorted by Active first
                             .sort((a, b) => {
                                 if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1
                                 if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1
                                 return 0
                             })
                          
                          const selectedCountry = merchantSettings.find((c: any) => c.id === selectedCountryId)

                          return (
                             <div className="space-y-6">
                                {/* TRC-20 Guidance */}
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
                                   <ShieldCheckIcon className="w-6 h-6 flex-shrink-0 text-blue-600"/>
                                   <div>
                                      <strong>Need Manual Help?</strong>
                                      <p className="mt-1 opacity-80">
                                         Select your country below to find a local merchant. 
                                         If unavailable, please use <strong>TRC-20 Crypto</strong> as it is automated and works worldwide.
                                      </p>
                                   </div>
                                </div>

                                {/* Country List */}
                                <div className="grid grid-cols-2 gap-3">
                                   {sortedCountries.length > 0 ? sortedCountries.map((country: any) => (
                                     <button
                                       key={country.id}
                                       onClick={() => setSelectedCountryId(country.id)}
                                       className={cn(
                                          "p-3 rounded-xl border text-left transition-all relative overflow-hidden",
                                          country.id === selectedCountryId 
                                            ? "bg-green-50 border-green-500 ring-1 ring-green-500 text-green-900" 
                                            : "bg-white border-gray-100 hover:border-green-200 text-gray-500",
                                          country.status !== "ACTIVE" && "opacity-80 bg-gray-50 hover:bg-gray-100"
                                       )}
                                     >
                                         <div className="font-bold text-sm">{country.name}</div>
                                         <div className={cn("text-[10px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded w-fit",
                                             country.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                                         )}>
                                             {country.status === "ACTIVE" ? "Active" : "Coming Soon"}
                                         </div>
                                     </button>
                                   )) : (
                                     <div className="col-span-2 text-center text-gray-400 italic text-sm py-4">No active merchants found.</div>
                                   )}
                                </div>

                                {/* Modals */}
                                {selectedCountry && (
                                   <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                                       <div className={cn("bg-white rounded-3xl w-[90%] md:w-full shadow-2xl animate-in zoom-in-95 duration-200 relative scrollbar-hide",
                                            selectedCountry.status === "ACTIVE" ? "max-w-lg max-h-[85vh] overflow-y-auto" : "max-w-sm"
                                       )}>
                                           {/* Close Button */}
                                           <button 
                                              onClick={() => setSelectedCountryId(null)}
                                              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors z-10"
                                           >
                                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                              </svg>
                                           </button>

                                           <div className="p-8">
                                              {selectedCountry.status === "ACTIVE" ? (
                                                // ACTIVE MERCHANT CONTENT
                                                <div className="space-y-6">
                                                    <div className="text-center">
                                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Merchant Deposit</h3>
                                                        <div className="text-sm text-gray-500 font-medium bg-green-50 text-green-700 px-3 py-1 rounded-full w-fit mx-auto">
                                                            {selectedCountry.name}
                                                        </div>
                                                    </div>

                                                    {/* Intro Description */}
                                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-4 md:p-6 rounded-2xl text-green-900 text-center shadow-sm">
                                                        <p className="font-medium text-base md:text-lg leading-relaxed">
                                                           {selectedCountry.description || "Merchant will handle all your deposits conveniently. Contact via WhatsApp to complete your purchase, and your deposit will be credited safely."}
                                                        </p>
                                                    </div>

                                                    {/* Contacts (Simpler "Authorized Merchant") */}
                                                    <div className="space-y-3">
                                                       {selectedCountry.contacts.length > 0 ? selectedCountry.contacts.map((contact: any) => {
                                                           const msg = encodeURIComponent("Hello, I want to make a merchant deposit on LetsEarnify. Please guide me.")
                                                           return (
                                                              <div key={contact.id} className="bg-gray-900 text-white rounded-2xl p-5 flex flex-col items-center text-center gap-5 shadow-xl shadow-gray-200 border border-gray-800 relative overflow-hidden group">
                                                                 {/* Shine effect */}
                                                                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer z-0"></div>
                                                                 
                                                                 <div className="relative z-10 flex flex-col items-center gap-3">
                                                                     <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-green-400">
                                                                         <ShieldCheckIcon className="w-8 h-8"/>
                                                                     </div>
                                                                     <div>
                                                                        <div className="font-bold text-xl">Authorized Merchant</div>
                                                                        <div className="text-sm text-gray-400">Official Partner • Instant Support</div>
                                                                     </div>
                                                                 </div>
                                                                 
                                                                 <a 
                                                                    href={`https://wa.me/${contact.phone.replace(/\+/g, "").replace(/\s/g, "")}?text=${msg}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer" 
                                                                    className="relative z-10 w-full py-4 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                                                                 >
                                                                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                                                    Chat on WhatsApp
                                                                 </a>
                                                              </div>
                                                           )
                                                       }) : <div className="text-gray-400 italic text-sm text-center">No active merchants found.</div>}
                                                    </div>
                                                    
                                                    {/* Disclaimer */}
                                                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-xs text-orange-800 flex gap-2">
                                                        <ShieldCheckIcon className="w-5 h-5 flex-shrink-0"/>
                                                        <div>
                                                            <strong>Important:</strong> 
                                                            <span className="opacity-90 ml-1">
                                                                {selectedCountry.instruction || "Merchant deposits are manual only. Please follow the instructions provided by the merchant carefully."}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                              ) : (
                                                  // COMING SOON CONTENT
                                                  <div className="text-center py-6">
                                                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                                          <BanknotesIcon className="w-8 h-8"/>
                                                      </div>
                                                      <h3 className="text-lg font-bold text-gray-900 mb-2">Unavailable in {selectedCountry.name}</h3>
                                                      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                                          Merchant deposit is not yet available for this region. Please use <strong>TRC-20 Crypto</strong> to deposit funds instantly.
                                                      </p>
                                                      <button 
                                                          onClick={() => { setSelectedCountryId(null); setDepositMethod("TRC20"); }}
                                                          className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                                                      >
                                                          Use TRC-20 Instead
                                                      </button>
                                                  </div>
                                              )}
                                           </div>
                                       </div>
                                   </div>
                                )}
                             </div>
                          )
                       })()}

                       {depositMethod === "CARD" && (
                          /* Credit Card Coming Soon */
                          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                             <CreditCardIcon className="w-12 h-12 text-gray-300 mx-auto mb-2"/>
                             <h4 className="font-bold text-gray-900">Coming Soon</h4>
                             <p className="text-sm text-gray-500">Bank payments are currently unavailable.</p>
                          </div>
                       )}
                    </>
                )}

                {/* WITHDRAW FORM */}
                {activeTab === "withdraw" && (() => {
                   const maxWithdrawal = balance * 0.10;
                   
                   let cooldownMsg = null;
                   // @ts-ignore
                   if (user.lastWithdrawalTime) {
                       // @ts-ignore
                       const lastTime = new Date(user.lastWithdrawalTime).getTime();
                       const nextTime = lastTime + (24 * 60 * 60 * 1000);
                       if (Date.now() < nextTime) {
                           const remainingMs = nextTime - Date.now();
                           const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
                           const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
                           cooldownMsg = `Next withdrawal available in: ${remainingHours}h ${remainingMins}m`;
                       }
                   }

                   const isOverLimit = amount && parseFloat(amount) > maxWithdrawal;

                   return (
                   <div className="space-y-4">
                       {/* Rule Banner */}
                       <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-xs text-orange-800 space-y-1">
                          <div className="font-bold flex items-center gap-2">
                             <span>⚠️ Withdrawal Rules</span>
                          </div>
                          <ul className="list-disc list-inside opacity-80 pl-1">
                             <li>Maximum Amount: <span className="font-bold">{formatCurrency(maxWithdrawal)}</span> (10% of balance)</li>
                             <li>Frequency: Once every 24 hours</li>
                          </ul>
                       </div>

                       {cooldownMsg && (
                           <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm font-bold text-red-600 flex items-center gap-2">
                               <span>⏳ {cooldownMsg}</span>
                           </div>
                       )}

                       {/* Withdrawal Method Selection */}
                       <div className="space-y-4 mb-4">
                           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Method</h4>
                          
                          {/* 1. TRC-20 */}
                          <button 
                             onClick={() => setWithdrawalMethod("TRC20")}
                             className={cn("w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group", 
                                withdrawalMethod === "TRC20" ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-gray-100 bg-white hover:border-gray-200"
                             )}
                          >
                              <div className="flex items-center gap-4">
                                  <div className={cn("p-3 rounded-lg transition-colors", withdrawalMethod === "TRC20" ? "bg-white text-blue-600 shadow-sm" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100")}>
                                      <QrCodeIcon className="w-6 h-6"/>
                                  </div>
                                  <div className="text-left">
                                      <div className={cn("font-bold transition-colors", withdrawalMethod === "TRC20" ? "text-blue-900" : "text-gray-900")}>TRC-20 Crypto</div>
                                      <div className="text-xs text-gray-500">Automated • Global</div>
                                  </div>
                              </div>
                              {withdrawalMethod === "TRC20" && <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm"></div>}
                          </button>

                          {/* 2. Merchant Withdrawal (Inline) */}
                          <button 
                              onClick={() => setWithdrawalMethod("MERCHANT")}
                              className={cn("w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group", 
                                withdrawalMethod === "MERCHANT" ? "border-green-500 bg-green-50 ring-1 ring-green-500" : "border-gray-100 bg-white hover:border-gray-200"
                             )}
                          >
                              <div className="flex items-center gap-4">
                                  <div className={cn("p-3 rounded-lg transition-colors", withdrawalMethod === "MERCHANT" ? "bg-white text-green-600 shadow-sm" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100")}>
                                      <BanknotesIcon className="w-6 h-6"/>
                                  </div>
                                  <div className="text-left">
                                      <div className={cn("font-bold transition-colors", withdrawalMethod === "MERCHANT" ? "text-green-900" : "text-gray-900")}>Merchant Withdrawal</div>
                                      <div className="text-xs text-gray-500">Available for all countries</div>
                                  </div>
                              </div>
                              {withdrawalMethod === "MERCHANT" && <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>}
                          </button>
                          
                          {/* 3. Pay By Card (Coming Soon) */}
                          <button 
                              onClick={() => setWithdrawalMethod("STRIPE")}
                              className={cn("w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group", 
                                withdrawalMethod === "STRIPE" ? "border-gray-900 bg-gray-50" : "border-gray-100 bg-white hover:border-gray-200"
                             )}
                          >
                              <div className="flex items-center gap-4">
                                  <div className={cn("p-3 rounded-lg transition-colors", withdrawalMethod === "STRIPE" ? "bg-white text-gray-900 shadow-sm" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100")}>
                                      <CreditCardIcon className="w-6 h-6"/>
                                  </div>
                                  <div className="text-left">
                                      <div className="font-bold text-gray-900">Pay By Card</div>
                                      <div className="text-xs text-gray-500">Visa / Mastercard</div>
                                  </div>
                              </div>
                              {withdrawalMethod === "STRIPE" && <div className="w-4 h-4 rounded-full bg-gray-900 shadow-sm"></div>}
                          </button>
                       </div>

                       {/* MERCHANT MODAL LOGIC FOR WITHDRAWAL */}
                       {withdrawalMethod === "MERCHANT" && (() => {
                          // 1. DEDUPLICATE & PREPARE DATA
                          const uniqueCountriesMap = new Map();
                          [...merchantSettings].forEach(country => {
                             const normalizedName = country.name.toLowerCase().trim();
                             const existing = uniqueCountriesMap.get(normalizedName);
                             if (!existing) {
                                uniqueCountriesMap.set(normalizedName, country);
                             } else {
                                if (country.status === "ACTIVE" && existing.status !== "ACTIVE") {
                                   uniqueCountriesMap.set(normalizedName, country);
                                }
                             }
                          });

                          // 2. OVERRIDE LOGIC FOR WITHDRAWAL SPECIFICALLY
                          // Requirement: Force "Pakistan" to be treated as "Coming Soon" (Inactive) for withdrawals.
                          const allCountries = Array.from(uniqueCountriesMap.values()).map((c: any) => {
                              const isPakistan = c.name.toLowerCase().trim() === "pakistan";
                              if (isPakistan) {
                                  // Create a copy with status overridden to something not ACTIVE
                                  return { ...c, status: "COMING_SOON_OVERRIDE" }; 
                              }
                              return c;
                          });

                          // 3. SEPARATE LISTS
                          const activeCountries = allCountries.filter((c: any) => c.status === "ACTIVE");
                          const comingSoonCountries = allCountries.filter((c: any) => c.status !== "ACTIVE");

                          // 4. SELECTED COUNTRY LOOKUP (Must match the overridden list)
                          const selectedCountry = selectedCountryId 
                              ? allCountries.find((c: any) => c.id === selectedCountryId) 
                              : null;

                           return (
                              <div className="space-y-6">
                                 {/* Guidance */}
                                 <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3 text-sm text-green-800">
                                    <BanknotesIcon className="w-6 h-6 flex-shrink-0 text-green-600"/>
                                    <div>
                                       <strong>Select Your Country</strong>
                                       <p className="mt-1 opacity-80">
                                          Choose your country below to find a local merchant for withdrawal. 
                                       </p>
                                    </div>
                                 </div>

                                 {/* ACTIVE MERCHANTS SECTION */}
                                 {activeCountries.length > 0 && (
                                     <div className="space-y-3">
                                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Active Merchants</h4>
                                         <div className="grid grid-cols-2 gap-3">
                                            {activeCountries.map((country: any) => (
                                              <button
                                                key={country.id}
                                                onClick={() => setSelectedCountryId(country.id)}
                                                className={cn(
                                                   "p-3 rounded-xl border text-left transition-all relative overflow-hidden",
                                                   country.id === selectedCountryId 
                                                     ? "bg-green-50 border-green-500 ring-1 ring-green-500 text-green-900" 
                                                     : "bg-white border-gray-100 hover:border-green-200 text-gray-500"
                                                )}
                                              >
                                                  <div className="font-bold text-sm block truncate pr-2">{country.name}</div>
                                                  <div className="text-[10px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded w-fit bg-green-100 text-green-700">
                                                      Active
                                                  </div>
                                              </button>
                                            ))}
                                         </div>
                                     </div>
                                 )}

                                 {/* COMING SOON SECTION */}
                                 <div className="space-y-3">
                                     {activeCountries.length > 0 && <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Coming Soon / Other</h4>}
                                     <div className="grid grid-cols-2 gap-3">
                                        {comingSoonCountries.length > 0 ? comingSoonCountries.map((country: any) => (
                                          <button
                                            key={country.id}
                                            onClick={() => setSelectedCountryId(country.id)}
                                            className={cn(
                                               "p-3 rounded-xl border text-left transition-all relative overflow-hidden bg-gray-50 border-gray-100 opacity-80 hover:opacity-100",
                                               country.id === selectedCountryId && "ring-1 ring-gray-300 bg-gray-100"
                                            )}
                                          >
                                              <div className="font-bold text-sm text-gray-500 block truncate pr-2">{country.name}</div>
                                              <div className="text-[10px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded w-fit bg-gray-200 text-gray-500">
                                                  Coming Soon
                                              </div>
                                          </button>
                                        )) : (
                                          <div className="col-span-2 text-center text-gray-400 italic text-sm py-4">No other countries found.</div>
                                        )}
                                     </div>
                                 </div>

                                 {/* Modals */}
                                {selectedCountry && (
                                   <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                                       <div className={cn("bg-white rounded-3xl w-[90%] md:w-full shadow-2xl animate-in zoom-in-95 duration-200 relative scrollbar-hide",
                                            selectedCountry.status === "ACTIVE" ? "max-w-lg max-h-[85vh] overflow-y-auto" : "max-w-sm"
                                       )}>
                                           <button 
                                              onClick={() => setSelectedCountryId(null)}
                                              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors z-10"
                                           >
                                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                           </button>
                                           
                                           <div className="p-8">
                                              {selectedCountry.status === "ACTIVE" ? (
                                                  // ACTIVE MERCHANT CONTENT
                                                  <div className="space-y-6">
                                                      <div className="text-center">
                                                          <h3 className="text-xl font-bold text-gray-900 mb-2">Merchant Withdrawal</h3>
                                                          <div className="text-sm text-gray-500 font-medium bg-green-50 text-green-700 px-3 py-1 rounded-full w-fit mx-auto">
                                                              {selectedCountry.name}
                                                          </div>
                                                      </div>
                                                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-4 md:p-6 rounded-2xl text-green-900 text-center shadow-sm">
                                                          <p className="font-medium text-base md:text-lg leading-relaxed">
                                                             {selectedCountry.withdrawalDescription || "Merchant will handle all your withdrawals conveniently. Contact via WhatsApp to process your withdrawal, and your funds will be credited safely."}
                                                          </p>
                                                      </div>
                                                      <div className="space-y-3">
                                                         {selectedCountry.contacts.length > 0 ? selectedCountry.contacts.map((contact: any) => {
                                                             const msg = encodeURIComponent("Hello, I want to make a merchant withdrawal from LetsEarnify. Please process my request.")
                                                             return (
                                                                <div key={contact.id} className="w-full">
                                                                   <a 
                                                                      href={`https://wa.me/${contact.phone.replace(/\+/g, "").replace(/\s/g, "")}?text=${msg}`}
                                                                      target="_blank"
                                                                      rel="noopener noreferrer" 
                                                                      className="w-full py-4 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-base transition-all hover:scale-[1.02] shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                                                                   >
                                                                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                                                      Withdraw via WhatsApp
                                                                   </a>
                                                                </div>
                                                             )
                                                         }) : <div className="text-gray-400 italic text-center">No contact found.</div>}
                                                      </div>
                                                      <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-xs text-orange-800 flex gap-2">
                                                          <ShieldCheckIcon className="w-5 h-5 flex-shrink-0"/>
                                                          <div>
                                                              <strong>Important:</strong> 
                                                              <span className="opacity-90 ml-1">
                                                                  {selectedCountry.withdrawalInstruction || "Merchant withdrawals are manual only. Please follow the instructions carefully."}
                                                              </span>
                                                          </div>
                                                      </div>
                                                  </div>
                                              ) : (
                                                  // COMING SOON CONTENT
                                                  <div className="text-center py-6">
                                                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                                          <BanknotesIcon className="w-8 h-8"/>
                                                      </div>
                                                      <h3 className="text-lg font-bold text-gray-900 mb-2">Unavailable in {selectedCountry.name}</h3>
                                                      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                                          Merchant withdrawal is not yet available for this region. Please use <strong>TRC-20 Crypto</strong> to withdraw your funds securely.
                                                      </p>
                                                      <button 
                                                          onClick={() => { setSelectedCountryId(null); setWithdrawalMethod("TRC20"); }}
                                                          className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                                                      >
                                                          Use TRC-20 Instead
                                                      </button>
                                                  </div>
                                              )}
                                           </div>
                                       </div>
                                   </div>
                                )}
                              </div>
                           )
                       })()}

                       {/* INPUTS FOR STRIPE (COMING SOON) */}
                       {withdrawalMethod === "STRIPE" && (
                          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 animate-in fade-in zoom-in-95 duration-200">
                             <CreditCardIcon className="w-12 h-12 text-gray-300 mx-auto mb-2"/>
                             <h4 className="font-bold text-gray-900">Coming Soon</h4>
                             <p className="text-sm text-gray-500">Card withdrawals are currently unavailable.</p>
                          </div>
                       )}

                       {/* INPUTS FOR TRC-20 */}
                       {withdrawalMethod === "TRC20" && (
                         <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                            <div>
                                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                   Destination Address (TRC-20)
                                 </label>
                                 <input 
                                    type="text" 
                                    disabled={!!cooldownMsg}
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    placeholder="Enter your USDT TRC-20 wallet address..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                 />
                              </div>

                            {/* Amount Input (Shared) */}
                            <div>
                               <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                   Withdrawal Amount ($)
                               </label>
                               <div className="relative">
                                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                   <input 
                                      type="number" 
                                      disabled={!!cooldownMsg}
                                      value={amount}
                                      onChange={(e) => setAmount(e.target.value)}
                                      placeholder={`Max ${formatCurrency(maxWithdrawal)}`}
                                      className={`w-full pl-8 pr-4 py-3 rounded-xl border outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                          isOverLimit
                                          ? "border-red-300 bg-red-50 text-red-700 focus:border-red-500" 
                                          : "border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500"
                                      }`}
                                    />
                               </div>
                            </div>
                            
                            <button 
                               onClick={handleAction}
                               disabled={isPending || !!cooldownMsg || !amount || isOverLimit || parseFloat(amount) <= 0}
                               className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-xl shadow-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                {isPending ? "Processing..." : `Confirm Withdrawal`}
                             </button>
                         </div>
                       )}

                   </div>
                   )
                })()}

                {/* TRANSFER FORM */}
                {activeTab === "transfer" && (
                     <div className="grid grid-cols-2 gap-4">
                        <SelectionCard 
                           selected={method === "Classic Pool"}
                           onClick={() => setMethod("Classic Pool")}
                           title="Classic Pool"
                           icon={<BanknotesIcon className="w-6 h-6"/>}
                        />
                        <SelectionCard 
                           selected={method === "Premium Pool"}
                           onClick={() => setMethod("Premium Pool")}
                           title="Premium Pool"
           icon={<BanknotesIcon className="w-6 h-6"/>}
                        />
                     </div>
                )}

                {/* Amount Input (Common - Only for TRC20, others have their own form) */}
                {depositMethod === "TRC20" && (
                   <div>
                      {/* Already rendered in TRC20 block above to fix layout coupling, removing duplicates if needed or moving logic down.
                          Original code had it at bottom. I moved it UP into the TRC20 conditional block in previous replacement. 
                          So I should REMOVE it from here to avoid duplicate input. 
                       */}
                   </div>
                )}

                {/* Messages */}
                {message && (
                   <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {message.text}
                   </div>
                )}

                {/* Submit Button (Shared for Deposit/Transfer, Hidden for Withdraw) */}
                {((activeTab === "deposit" && depositMethod === "TRC20") || activeTab === "transfer") && (
                   <button 
                     onClick={handleAction}
                     disabled={isPending}
                     className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-xl shadow-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                      {isPending 
                        ? (activeTab === "deposit" ? "Verifying Transaction..." : "Processing...") 
                        : `Confirm ${activeTab}`}
                   </button>
                )}
             </div>
          </div>
       </div>

       {/* RIGHT COLUMN: HISTORY */}
       <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 h-fit lg:sticky lg:top-8">
          <h3 className="text-xl font-bold font-serif text-gray-900 mb-6">Recent Activity</h3>
          
          <div className="space-y-4">
             {transactions.length === 0 ? (
                <div className="text-center py-10 text-gray-400">No transactions yet.</div>
             ) : (
                 transactions.map((tx) => {
                    // Status Logic
                    let label = tx.type === 'DEPOSIT' ? 'Deposit Request' : 
                                tx.type === 'WITHDRAWAL' ? 'Withdrawal Request' : tx.type;
                    let colorClass = "text-gray-900";
                    let statusColor = "bg-gray-100 text-gray-600"; // Icon bg

                    if (tx.status === 'COMPLETED' || tx.status === 'APPROVED') {
                        // Approved State
                        colorClass = "text-green-600";
                        statusColor = "bg-green-100 text-green-600";
                        
                        if (tx.type === 'DEPOSIT') label = "Deposit Approved";
                        else if (tx.type === 'WITHDRAWAL') label = "Withdrawal Approved";
                        else label = "Approved";

                    } else if (tx.status === 'FAILED' || tx.status === 'REJECTED') {
                        // Rejected State
                        colorClass = "text-red-600";
                        statusColor = "bg-red-100 text-red-600";

                        if (tx.type === 'DEPOSIT') label = "Deposit Rejected";
                        else if (tx.type === 'WITHDRAWAL') label = "Withdrawal Rejected";
                        else label = "Rejected";

                    } else {
                        // Pending / Default State
                        if (tx.type === 'DEPOSIT') {
                             statusColor = "bg-green-50 text-green-600"; 
                             colorClass = "text-gray-600"; // Neutral text for pending
                        } else if (tx.type === 'WITHDRAWAL') {
                             statusColor = "bg-red-50 text-red-500";
                             colorClass = "text-gray-600";
                        } else {
                             // Fallback
                             statusColor = "bg-blue-50 text-blue-500";
                        }
                    }

                    return (
                   <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${statusColor}`}>
                            {tx.type === 'DEPOSIT' && <ArrowDownTrayIcon className="w-5 h-5" />}
                            {tx.type === 'WITHDRAWAL' && <ArrowUpTrayIcon className="w-5 h-5" />}
                            {tx.type === 'INVESTMENT' && <ArrowPathIcon className="w-5 h-5" />}
                         </div>
                         <div className="min-w-0">
                            <div className={`font-bold text-sm transition-colors truncate pr-2 ${colorClass}`} title={label}>
                                {label}
                            </div>
                            <div className="text-xs text-gray-400" suppressHydrationWarning>{new Date(tx.createdAt).toLocaleDateString()}</div>
                            {tx.method && <div className="text-[10px] text-gray-400 truncate w-32" title={tx.method}>{tx.method}</div>}
                         </div>
                      </div>
                      <div className={`font-bold whitespace-nowrap ${
                         tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-gray-900'
                      }`}>
                         {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
                   </div>
                   )
                 })
             )}
          </div>
       </div>
    </div>
  )
}

function ActionButton({ label, icon: Icon, isActive, onClick }: any) {
   return (
      <button 
         onClick={onClick}
         className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            isActive 
               ? "bg-white text-blue-600 shadow-lg" 
               : "bg-white/10 text-white hover:bg-white/20"
         }`}
      >
         <Icon className="w-5 h-5" />
         {label}
      </button>
   )
}

function SelectionCard({ selected, onClick, title, icon }: any) {
   return (
      <div 
         onClick={onClick}
         className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center h-full justify-center ${
            selected 
               ? "border-blue-500 bg-blue-50 text-blue-700" 
               : "border-gray-100 bg-white text-gray-500 hover:border-blue-200"
         }`}
      >
         {icon}
         <div className="text-xs font-bold uppercase tracking-wide">{title}</div>
      </div>
   )
}
