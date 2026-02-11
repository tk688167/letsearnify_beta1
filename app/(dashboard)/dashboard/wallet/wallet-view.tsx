"use client"

import { useState, useTransition, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { formatCurrency, cn } from "@/lib/utils"
import { deposit, transferToPool } from "@/lib/actions"
import { submitWithdrawal } from "@/app/actions/wallet"
import { submitMerchantDeposit, submitMerchantWithdrawal } from "@/app/actions/user/merchant-transaction"
import { 
  BanknotesIcon, 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon, 
  ArrowPathIcon,
  CreditCardIcon,
  QrCodeIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  CheckIcon,
  ChevronRightIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ArrowLeftIcon,
  PhotoIcon,
  CheckCircleIcon,
  MapPinIcon
} from "@heroicons/react/24/outline"
import { QRCode } from "./qr-code"

// Force rebuild for hydration fix
export default function WalletClient({ user, transactions, platformWallets, merchantSettings }: { user: any, transactions: any[], platformWallets: any[], merchantSettings: any[] }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 animate-pulse">Loading Wallet...</div>}>
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
  const [selectedCountry, setSelectedCountry] = useState<any>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  
  // Helper to find wallet data
  const currentWallet = platformWallets.find(w => w.network === cryptoNetwork) || { address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", qrCodePath: "" }

  
  // For Withdraws/Transfers:
  const [method, setMethod] = useState("TRC20") 
  const [withdrawalMethod, setWithdrawalMethod] = useState<"TRC20" | "MERCHANT" | "STRIPE">("TRC20") 
  const [details, setDetails] = useState("")

  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Reset merchant state when switching tabs or methods
  useEffect(() => {
     setSelectedCountry(null)
     setSelectedPaymentMethod(null)
     setScreenshot(null)
     setAccountNumber("")
     setAccountName("")
     setAmount("")
     setMessage(null)
  }, [activeTab, depositMethod, withdrawalMethod])

  const copyAddress = () => {
     if (currentWallet.address) {
         navigator.clipboard.writeText(currentWallet.address)
         setMessage({ type: 'success', text: "Address copied!" })
         setTimeout(() => setMessage(null), 2000)
     }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshot(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
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
        
        // --- DEPOSIT FLOW ---
        if (activeTab === "deposit") {
           if (depositMethod === "TRC20") {
               if (!txHash) throw new Error("Please enter the Transaction Hash.")
               res = await deposit(val, "CRYPTO", { network: "TRC20", txHash }) as any
           } else if (depositMethod === "MERCHANT") {
               if (!selectedCountry || !selectedPaymentMethod) throw new Error("Please select country and payment method.")
               if (!screenshot) throw new Error("Please upload payment proof.")
               
               res = await submitMerchantDeposit({
                   countryCode: selectedCountry.code,
                   paymentMethodId: selectedPaymentMethod.id,
                   amount: val,
                   screenshot
               })
           }
        } 
        
        // --- WITHDRAW FLOW ---
        else if (activeTab === "withdraw") {
           if (withdrawalMethod === "TRC20") {
               if (!details) throw new Error("Please provide withdrawal destination details.")
               const formData = new FormData();
               formData.append("amount", val.toString());
               formData.append("address", details); 
               res = await submitWithdrawal(formData);
           } else if (withdrawalMethod === "MERCHANT") {
               if (!selectedCountry || !selectedPaymentMethod) throw new Error("Please select country and payment method.")
               if (!accountNumber || !accountName) throw new Error("Please provide your account details.")
               
               res = await submitMerchantWithdrawal({
                   countryCode: selectedCountry.code,
                   paymentMethodId: selectedPaymentMethod.id,
                   amount: val,
                   accountNumber,
                   accountName
               })
           }
        } 
        
        // --- TRANSFER FLOW ---
        else if (activeTab === "transfer") {
           res = await transferToPool(val, method) 
        }

        if (res?.success) {
           setMessage({ type: 'success', text: res.message || "Transaction successful!" })
           setAmount("")
           setTxHash("")
           setScreenshot(null)
           if (activeTab === "deposit") setBalance((curr: number) => curr + val)
           else if (activeTab === "transfer") setBalance((curr: number) => curr - val)
        } else {
           setMessage({ type: 'error', text: res?.message || res?.error || "Transaction failed." })
        }
      } catch (err: any) {
         setMessage({ type: 'error', text: err.message || "Transaction failed." })
      }
    })
  }

  // --- Render Helpers ---

  const ActionTab = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
      <button 
          onClick={() => { setActiveTab(id); setMessage(null); }}
          className={cn(
              "flex-1 flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 border backdrop-blur-sm min-w-[80px]",
              activeTab === id 
                  ? "bg-white text-blue-600 border-white shadow-lg shadow-black/5 scale-[1.02]" 
                  : "bg-white/10 text-blue-50 border-white/10 hover:bg-white/20 hover:border-white/20"
          )}
      >
          <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", activeTab === id ? "text-blue-600" : "text-blue-100")} />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide">{label}</span>
      </button>
  )

  const MethodOption = ({ id, label, icon: Icon, sub, selected, onClick, color = "blue" }: any) => {
      const isSelected = selected === id;
      const colorStyles: any = {
          blue: isSelected ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "hover:border-blue-200",
          green: isSelected ? "border-green-500 bg-green-50 ring-1 ring-green-500" : "hover:border-green-200",
          gray: isSelected ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900" : "hover:border-gray-300"
      }
      return (
        <button 
            onClick={onClick}
            className={cn(
                "w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group bg-white",
                colorStyles[color],
                !isSelected && "border-gray-100"
            )}
        >
            <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl transition-colors", 
                    isSelected ? "bg-white shadow-sm" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                )}>
                    <Icon className={cn("w-6 h-6", isSelected ? `text-${color}-600` : "text-gray-400")}/>
                </div>
                <div className="text-left">
                    <div className={cn("font-bold text-sm md:text-base transition-colors", isSelected ? `text-${color}-900` : "text-gray-900")}>{label}</div>
                    <div className="text-xs text-gray-500 font-medium">{sub}</div>
                </div>
            </div>
            {isSelected && <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", `bg-${color}-500`)}><CheckIcon className="w-3 h-3 text-white"/></div>}
        </button>
      )
  }

  // --- Merchant UI Render Function ---
  const renderMerchantUI = (type: 'DEPOSIT' | 'WITHDRAWAL') => {
      // 1. Country Selection
      if (!selectedCountry) {
          return (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between mb-2">
                       <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                           <MapPinIcon className="w-4 h-4"/> Select Country
                       </h3>
                  </div>
                  {merchantSettings.length === 0 ? (
                      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                          <p className="text-gray-500 text-sm">No merchant countries available.</p>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {merchantSettings.map(country => {
                              const isComingSoon = country.status === "COMING_SOON"
                              return (
                              <button
                                  key={country.id}
                                  onClick={() => {
                                      if (isComingSoon) {
                                          setMessage({ type: 'error', text: "This country is coming soon!" })
                                          return
                                      }
                                      setSelectedCountry(country)
                                  }}
                                  className={cn(
                                      "flex items-center gap-3 p-4 bg-white border rounded-xl transition-all group text-left relative overflow-hidden",
                                      isComingSoon 
                                          ? "border-gray-100 opacity-70 cursor-not-allowed grayscale-[0.5]" 
                                          : "border-gray-100 hover:border-green-500 hover:shadow-md"
                                  )}
                              >
                                  <div className={cn(
                                      "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors",
                                      isComingSoon 
                                          ? "bg-gray-100 text-gray-500" 
                                          : "bg-gray-50 text-gray-700 group-hover:bg-green-50 group-hover:text-green-600"
                                  )}>
                                      {country.code}
                                  </div>
                                  <div>
                                      <div className="font-bold text-gray-900 flex items-center gap-2">
                                          {country.name}
                                          {isComingSoon && (
                                              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                  Soon
                                              </span>
                                          )}
                                      </div>
                                      <div className="text-xs text-gray-500">{country.methods ? country.methods.length : 0} Methods</div>
                                  </div>
                                  {!isComingSoon && <ChevronRightIcon className="w-4 h-4 ml-auto text-gray-300 group-hover:text-green-500"/>}
                              </button>
                              )
                          })}
                      </div>
                  )}
              </div>
          )
      }

      // 2. Method Selection
      if (!selectedPaymentMethod) {
          return (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <button onClick={() => setSelectedCountry(null)} className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2">
                      <ArrowLeftIcon className="w-3 h-3"/> Back to Countries
                  </button>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
                      Select Payment Method in {selectedCountry.name}
                  </h3>
                  
                  {selectedCountry.methods && selectedCountry.methods.length > 0 ? (
                      <div className="space-y-3">
                          {selectedCountry.methods.map((method: any) => (
                              <button
                                  key={method.id}
                                  onClick={() => setSelectedPaymentMethod(method)}
                                  className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50/10 transition-all group bg-white"
                              >
                                  <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-3">
                                          <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                              <BanknotesIcon className="w-6 h-6"/>
                                          </div>
                                          <div>
                                              <div className="font-bold text-gray-900 text-lg">{method.name}</div>
                                              <div className="text-xs text-gray-500">{method.accountName}</div>
                                          </div>
                                      </div>
                                      <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs font-mono font-bold group-hover:bg-white border border-transparent group-hover:border-green-200">
                                          {method.accountNumber}
                                      </div>
                                  </div>
                              </button>
                          ))}
                      </div>
                  ) : (
                      <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <p className="text-sm text-gray-500">No payment methods configured for this country.</p>
                      </div>
                  )}
              </div>
          )
      }

      // 3. Action Form
      const rate = selectedCountry.currency === 'PKR' ? 300 : (selectedCountry.exchangeRate || 1);
      const val = parseFloat(amount);
      const totalPayable = !isNaN(val) ? val * rate : 0;

      return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              {/* Header with Back Button */}
              <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedPaymentMethod(null)} 
                    className="group flex items-center gap-2 px-3 py-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                  >
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-gray-300 shadow-sm">
                        <ArrowLeftIcon className="w-4 h-4"/> 
                      </div>
                      <span className="font-bold text-sm">Back</span>
                  </button>
                  <div className="h-6 w-px bg-gray-200"></div>
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                     <span className="text-gray-400 font-medium">Deposit via</span> {selectedPaymentMethod.name}
                  </h3>
              </div>

              {type === 'DEPOSIT' ? (
                  <div className="space-y-8">
                      {/* Premium Account Details Card */}
                      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white shadow-2xl p-8">
                          {/* Decorative Elements */}
                          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
                          
                          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                              <div className="space-y-6 flex-1">
                                  <div>
                                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Account Title</p>
                                      <p className="text-xl md:text-2xl font-medium tracking-tight text-white">{selectedPaymentMethod.accountName}</p>
                                  </div>
                                  
                                  <div>
                                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Account Number / IBAN</p>
                                      <div className="flex items-center gap-3">
                                          <p className="text-2xl md:text-3xl font-mono font-bold text-white tracking-wider">
                                              {selectedPaymentMethod.accountNumber}
                                          </p>
                                          <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(selectedPaymentMethod.accountNumber)
                                                setMessage({ type: 'success', text: "Account number copied!" })
                                                setTimeout(() => setMessage(null), 2000)
                                            }}
                                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 hover:border-white/30 backdrop-blur-md"
                                            title="Copy Account Number"
                                          >
                                              <DocumentDuplicateIcon className="w-5 h-5"/>
                                          </button>
                                      </div>
                                  </div>
                              </div>

                              <div className="hidden md:block">
                                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-md">
                                      <BanknotesIcon className="w-8 h-8 text-blue-200"/>
                                  </div>
                              </div>
                          </div>
                      </div>

                       {/* Instructions (if any) */}
                       {selectedPaymentMethod.instructions && (
                          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4 items-start">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="text-blue-600 font-bold text-xs">i</span>
                              </div>
                              <div className="text-sm text-blue-800 leading-relaxed">
                                  <span className="font-bold block mb-1">Instructions:</span> 
                                  {selectedPaymentMethod.instructions}
                              </div>
                          </div>
                       )}

                      <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-8">
                          <h4 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-4">Transaction Details</h4>
                          
                          <div className="space-y-8">
                              {/* Amount Input Section */}
                              <div className="space-y-6">
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Amount to Deposit (USD)</label>
                                      <div className="relative group">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                          <input 
                                              type="number" 
                                              value={amount}
                                              onChange={(e) => setAmount(e.target.value)}
                                              className="w-full pl-8 pr-4 py-4 rounded-xl border border-gray-200 outline-none focus:border-green-500 font-bold text-xl transition-all bg-gray-50 focus:bg-white"
                                              placeholder="0.00"
                                          />
                                      </div>
                                  </div>
                                  
                                  {/* Professional Currency Conversation Card - ALWAYS VISIBLE */}
                                  <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                      {/* Header */}
                                      <div className="bg-gray-100 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Conversion Details</span>
                                          <span className="text-xs font-bold bg-white text-gray-600 px-2 py-1 rounded border border-gray-200 shadow-sm">
                                              Rate: 1 USD = {rate} {selectedCountry.currency}
                                          </span>
                                      </div>

                                      {/* Body */}
                                      <div className="p-5 space-y-4">
                                          {/* Breakdown */}
                                          <div className="space-y-2 text-sm">
                                              <div className="flex justify-between text-gray-500">
                                                  <span>Base Amount ({amount || '0'} USD)</span>
                                                  <span className="font-mono font-medium">
                                                      {totalPayable.toLocaleString()} {selectedCountry.currency}
                                                  </span>
                                              </div>
                                              <div className="h-px bg-gray-200 my-2"></div>
                                          </div>

                                          {/* Total */}
                                          <div>
                                              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Payable Amount</p>
                                              <div className="flex items-baseline gap-2">
                                                  <span className="text-3xl font-black text-gray-900 tracking-tight">
                                                      {totalPayable.toLocaleString()}
                                                  </span>
                                                  <span className="text-lg font-bold text-gray-500">{selectedCountry.currency}</span>
                                              </div>
                                          </div>
                                          
                                          {/* Note */}
                                          <div className="flex gap-2 items-start bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                              <div className="w-1 h-10 bg-blue-400 rounded-full shrink-0"></div>
                                              <p className="text-xs text-blue-700 leading-relaxed">
                                                  <span className="font-bold">Important:</span> Please transfer exactly <span className="font-bold">{totalPayable.toLocaleString()} {selectedCountry.currency}</span> to the details above.
                                              </p>
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              {/* Full Width Proof of Payment Upload */}
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Proof of Payment</label>
                                  <div className="relative group">
                                      <input 
                                          type="file" 
                                          accept="image/*"
                                          onChange={handleFileUpload}
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                      />
                                      <div className={`w-full min-h-[200px] rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 p-8 text-center ${
                                          screenshot 
                                          ? "border-green-500 bg-green-50/30 ring-4 ring-green-500/10" 
                                          : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 group-hover:scale-[1.01]"
                                      }`}>
                                          {screenshot ? (
                                              <div className="animate-in zoom-in duration-300">
                                                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                      <CheckCircleIcon className="w-8 h-8 text-green-600"/>
                                                  </div>
                                                  <h5 className="font-bold text-green-800 text-lg mb-1">Receipt Attached Successfully</h5>
                                                  <p className="text-green-600 text-sm opacity-80">Click or Drag to replace file</p>
                                              </div>
                                          ) : (
                                              <div className="space-y-2">
                                                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md transition-all group-hover:bg-blue-200">
                                                      <ArrowUpTrayIcon className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform"/>
                                                  </div>
                                                  <h5 className="font-bold text-gray-900 text-lg">Upload Payment Screenshot</h5>
                                                  <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                                      Click to browse or drag and drop your receipt here. 
                                                      <br/><span className="text-xs opacity-70">(Supports JPG, PNG, PDF)</span>
                                                  </p>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          </div>
                          
                          <button 
                            onClick={handleAction} 
                            disabled={!amount || !screenshot || isPending} 
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg mt-4"
                          >
                              {isPending ? "Submitting Request..." : "Submit Deposit Request"}
                          </button>
                      </div>
                  </div>
              ) : (
                  // WITHDRAWAL FORM
                  <div className="space-y-8">
                       <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
                          <div className="grid grid-cols-1 gap-6">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Your {selectedPaymentMethod.name} Account Number</label>
                                  <input 
                                      type="text" 
                                      value={accountNumber}
                                      onChange={(e) => setAccountNumber(e.target.value)}
                                      className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-green-500 bg-gray-50 focus:bg-white font-mono font-bold transition-all"
                                      placeholder={`Enter your ${selectedPaymentMethod.name} number`}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Account Title / Name</label>
                                  <input 
                                      type="text" 
                                      value={accountName}
                                      onChange={(e) => setAccountName(e.target.value)}
                                      className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-all"
                                      placeholder="Name on account"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Amount (USD)</label>
                                  <input 
                                      type="number" 
                                      value={amount}
                                      onChange={(e) => setAmount(e.target.value)}
                                      className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-green-500 font-bold text-xl bg-gray-50 focus:bg-white transition-all"
                                      placeholder="0.00"
                                  />
                                  <p className="text-xs text-gray-500 mt-2 font-medium">Available: ${user.balance.toFixed(2)}</p>
                              </div>
                          </div>

                          <button onClick={handleAction} disabled={!amount || !accountNumber || !accountName || isPending} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg">
                              {isPending ? "Processing..." : "Submit Withdrawal Request"}
                          </button>
                      </div>
                  </div>
              )}
          </div>
      )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 md:gap-8 min-h-screen pb-12">
       
       {/* MAIN CONTENT AREA */}
       <div className="flex-1 space-y-6 md:space-y-8 min-w-0">
          
           {/* 1. TOTAL BALANCE CARD */}
           <div className="w-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] p-5 sm:p-8 md:p-10 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
              {/* Dynamic Background */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-overlay"></div>
              <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-indigo-900/20 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
              
              <div className="relative z-10">
                 <div className="flex flex-col sm:flex-row justify-between items-start mb-6 md:mb-10 gap-4">
                    <div>
                       <h2 className="text-blue-100 font-bold tracking-widest uppercase text-xs md:text-sm mb-2 flex items-center gap-2">
                           <BanknotesIcon className="w-4 h-4 text-blue-200"/> Total ARN Tokens
                       </h2>
                       <div className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif tracking-tight text-white drop-shadow-md break-all leading-none">
                          {user.arnBalance?.toFixed(2) || "0.00"} <span className="text-2xl lg:text-3xl text-blue-200">ARN</span>
                       </div>
                       <div className="mt-2 text-blue-100 font-medium text-sm">
                           ≈ {formatCurrency((user.arnBalance || 0) / 10)} USD
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* ACTION GRID (Responsive) */}
           <div className="grid grid-cols-3 md:flex md:gap-4 gap-3 animate-in fade-in slide-in-from-top-2">
               {[
                   { id: 'deposit', label: 'Deposit', icon: ArrowDownTrayIcon, color: 'text-blue-600' },
                   { id: 'withdraw', label: 'Swap & Withdraw', icon: ArrowUpTrayIcon, color: 'text-purple-600' },
                   { id: 'transfer', label: 'Transfer', icon: ArrowPathIcon, color: 'text-orange-600' },
               ].map((item) => (
                   <button
                       key={item.id}
                       onClick={() => { setActiveTab(item.id); setMessage(null); }}
                       className={cn(
                           "flex flex-col md:flex-row items-center justify-center gap-2 p-3 md:px-8 md:py-4 rounded-2xl border transition-all duration-200 flex-1 md:flex-none",
                           activeTab === item.id 
                               ? "bg-white border-blue-500 ring-2 ring-blue-100 shadow-lg scale-[1.02]" 
                               : "bg-white border-gray-100 hover:bg-gray-50 shadow-sm hover:shadow-md"
                       )}
                   >
                       <item.icon className={cn("w-6 h-6", activeTab === item.id ? item.color : "text-gray-400")} />
                       <span className={cn("text-[10px] md:text-sm font-bold uppercase tracking-wider", activeTab === item.id ? "text-gray-900" : "text-gray-500")}>
                           {item.label}
                       </span>
                   </button>
               ))}
           </div>

           {/* 2. ACTION FORM PANEL */}
           <div className="bg-white rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-100/50 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold font-serif text-gray-900 capitalize flex items-center gap-3">
                      {activeTab === 'deposit' && <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><ArrowDownTrayIcon className="w-6 h-6"/></div>}
                      {activeTab === 'withdraw' && <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><ArrowUpTrayIcon className="w-6 h-6"/></div>}
                      {activeTab === 'transfer' && <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><ArrowPathIcon className="w-6 h-6"/></div>}
                      {activeTab === 'withdraw' ? 'Swap & Withdraw' : `${activeTab} ${activeTab === 'deposit' ? 'USD' : 'Funds'}`}
                  </h3>
                  {(activeTab === 'deposit') && (
                     <div className="hidden sm:flex px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-full items-center gap-1.5 border border-green-100">
                        <ShieldCheckIcon className="w-4 h-4"/>
                        <span>1 USD = 10 ARN</span>
                     </div>
                  )}
              </div>

              {/* NOTIFICATIONS */}
              {message && (
                 <div className={cn("p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
                     message.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                 )}>
                    {message.type === 'success' ? <CheckIcon className="w-5 h-5"/> : <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-red-600">!</div>}
                    {message.text}
                 </div>
              )}


              <div className="space-y-6">
                 
                 {/* === DEPOSIT === */}
                 {activeTab === "deposit" && (
                    <div className="space-y-8 animate-in fade-in">
                        
                        {/* Method Selector */}
                        <div className="space-y-3">
                           <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Select Method</label>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                               <MethodOption id="TRC20" label="TRC-20 Crypto" sub="Automated • Instant" icon={QrCodeIcon} selected={depositMethod} onClick={() => setDepositMethod("TRC20")} color="blue"/>
                               <MethodOption id="MERCHANT" label="Merchant Deposit" sub="Local Agents" icon={BanknotesIcon} selected={depositMethod} onClick={() => setDepositMethod("MERCHANT")} color="green"/>
                               <div className="md:col-span-2">
                                 <MethodOption id="CARD" label="Debit / Credit Card" sub="Visa • Mastercard" icon={CreditCardIcon} selected={depositMethod} onClick={() => setDepositMethod("CARD")} color="gray"/>
                               </div>
                           </div>
                        </div>

                        {/* TRC-20 Form */}
                        {depositMethod === "TRC20" && (
                           <div className="bg-gray-50/50 rounded-2xl p-4 md:p-6 border border-gray-100 space-y-6">
                              {/* QR & Address */}
                              <div className="flex flex-col md:flex-row gap-6">
                                 <div className="flex-shrink-0 mx-auto md:mx-0">
                                    <QRCode network="TRC20" imagePath={currentWallet.qrCodePath || "/qr-trc20.png"} />
                                 </div>
                                 <div className="flex-1 space-y-4 min-w-0">
                                    <div className="space-y-2">
                                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Wallet Address</label>
                                       <div className="flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-xl">
                                          <div className="flex-1 px-3 py-2 font-mono text-xs md:text-sm text-gray-600 truncate">
                                             {currentWallet?.address}
                                          </div>
                                          <button onClick={copyAddress} className="p-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors">
                                             <DocumentDuplicateIcon className="w-4 h-4"/>
                                          </button>
                                       </div>
                                    </div>
                                    <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg leading-relaxed">
                                       <strong>Note:</strong> Deposits are automatically converted to ARN Tokens (1 USD = 10 ARN).
                                    </div>
                                 </div>
                              </div>

                              {/* Inputs */}
                              <div className="space-y-4">
                                 <div>
                                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Transaction ID (Hash)</label>
                                     <input 
                                        type="text" 
                                        value={txHash}
                                        onChange={(e) => setTxHash(e.target.value)}
                                        placeholder="Paste your transaction hash..."
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all bg-white font-mono text-sm"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount (USD)</label>
                                     <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                        <input 
                                           type="number" 
                                           value={amount}
                                           onChange={(e) => setAmount(e.target.value)}
                                           placeholder="0.00"
                                           className="w-full pl-8 pr-4 py-3.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all bg-white font-bold text-lg"
                                        />
                                     </div>
                                     {amount && !isNaN(parseFloat(amount)) && (
                                         <div className="mt-2 text-xs font-bold text-blue-600">
                                             You receive: {(parseFloat(amount) * 10).toFixed(0)} ARN
                                         </div>
                                     )}
                                 </div>
                                 <button onClick={handleAction} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.98]">
                                     Submit Deposit
                                 </button>
                              </div>
                           </div>
                        )}

                        {/* Merchant Form - NEW INTEGRATION */}
                        {depositMethod === "MERCHANT" && renderMerchantUI("DEPOSIT")}
                        
                        {/* Card Form */}
                        {depositMethod === "CARD" && (
                            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <CreditCardIcon className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                                <h4 className="font-bold text-gray-900">Coming Soon</h4>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">Direct card payments are currently under maintenance. Please use TRC-20 or a Merchant.</p>
                            </div>
                        )}
                    </div>
                 )}


                 {/* === WITHDRAW === */}
                 {activeTab === "withdraw" && (
                    <div className="space-y-8 animate-in fade-in">
                        {/* Method Selector */}
                        <div className="space-y-3">
                           <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Withdrawal Method</label>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                               <MethodOption id="TRC20" label="TRC-20 Crypto" sub="Global • Fast" icon={QrCodeIcon} selected={withdrawalMethod} onClick={() => setWithdrawalMethod("TRC20")} color="blue"/>
                               <MethodOption id="MERCHANT" label="Merchant Withdrawal" sub="Local Agents" icon={BanknotesIcon} selected={withdrawalMethod} onClick={() => setWithdrawalMethod("MERCHANT")} color="green"/>
                           </div>
                        </div>
                        
                        {/* TRC20 Withdraw */}
                        {withdrawalMethod === "TRC20" && (
                             <div className="space-y-4">
                                 <div>
                                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Destination Address</label>
                                     <input 
                                        type="text" 
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                        placeholder="Enter USDT TRC-20 address..."
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50/50 transition-all bg-white font-mono text-sm"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount to Swap (ARN)</label>
                                     <div className="relative">
                                        <input 
                                           type="number" 
                                           value={amount}
                                           onChange={(e) => setAmount(e.target.value)}
                                           placeholder="0"
                                           className="w-full px-4 py-3.5 rounded-xl border border-gray-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50/50 transition-all bg-white font-bold text-lg"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">ARN</span>
                                     </div>
                                     <div className="flex justify-between mt-2 px-1">
                                        <span className="text-xs text-gray-400 font-medium">Available: {user.arnBalance?.toFixed(2) || 0} ARN</span>
                                        <span className="text-xs font-bold text-purple-600">
                                            {amount && !isNaN(parseFloat(amount)) ? `You receive: $${(parseFloat(amount) / 10).toFixed(2)}` : 'You receive: $0.00'}
                                        </span>
                                     </div>
                                 </div>
                                 <button onClick={handleAction} className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg shadow-gray-900/10 transition-all hover:scale-[1.01] active:scale-[0.98]">
                                     Swap & Withdraw (USD)
                                 </button>
                             </div>
                        )}

                        {/* Merchant Withdraw - NEW INTEGRATION */}
                        {withdrawalMethod === "MERCHANT" && renderMerchantUI("WITHDRAWAL")}
                    </div>
                 )}


                {/* === TRANSFER === */}
                {activeTab === "transfer" && (
                   <div className="space-y-8 animate-in fade-in">
                       <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl text-orange-800 text-sm leading-relaxed">
                          <strong className="block mb-1 text-orange-900">Invest in Mudaraba Pools</strong>
                          Transfer funds from your main wallet to an investment pool to start earning halal profits.
                       </div>

                       <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input 
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-3.5 rounded-xl border border-gray-200 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50/50 transition-all bg-white font-bold text-lg"
                                />
                            </div>
                        </div>

                        <button onClick={handleAction} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01] active:scale-[0.98]">
                            Transfer to Pool
                        </button>
                   </div>
                )}

             </div>
          </div>

       </div>

       {/* RIGHT COLUMN: HISTORY */}
       <div className="lg:w-80 xl:w-96 flex-shrink-0 animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-100/50 p-6 sticky top-24">
              <h3 className="text-lg font-bold font-serif text-gray-900 mb-6 flex items-center justify-between">
                  Recent Activity
              </h3>
              
              <div className="space-y-4">
                  {transactions.length === 0 ? (
                      <div className="text-center py-12">
                          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                              <ArrowPathIcon className="w-6 h-6"/>
                          </div>
                          <p className="text-sm text-gray-400 font-medium">No transactions yet</p>
                      </div>
                  ) : (
                      transactions.slice(0, 5).map((tx, i) => (
                          <div key={tx.id || i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-default">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                                      {tx.type === 'DEPOSIT' ? <ArrowDownTrayIcon className="w-5 h-5 text-green-600"/> : 
                                       tx.type === 'WITHDRAWAL' ? <ArrowUpTrayIcon className="w-5 h-5 text-purple-600"/> : <ArrowPathIcon className="w-5 h-5 text-orange-600"/>}
                                  </div>
                                  <div>
                                      <div className="text-xs font-bold text-gray-900">{tx.type}</div>
                                      <div className="text-[10px] text-gray-400" suppressHydrationWarning>{new Date(tx.createdAt).toLocaleDateString()}</div>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className={cn("text-sm font-bold", 
                                      tx.type === 'DEPOSIT' ? "text-green-600" : "text-gray-900"
                                  )}>
                                      {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                                  </div>
                                  <div className={cn("text-[10px] uppercase font-bold tracking-wider",
                                      tx.status === 'COMPLETED' ? "text-green-500" : 
                                      tx.status === 'FAILED' ? "text-red-500" : "text-amber-500"
                                  )}>{tx.status}</div>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
       </div>

    </div>
  )
}
