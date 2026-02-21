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
  XMarkIcon,
  ArrowLeftIcon,
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

  // Merchant Modal State
  const [merchantModalOpen, setMerchantModalOpen] = useState(false)
  const [merchantModalType, setMerchantModalType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT')

  const closeMerchantModal = () => {
    setMerchantModalOpen(false)
    setSelectedCountry(null)
    setSelectedPaymentMethod(null)
    setScreenshot(null)
    setAccountNumber("")
    setAccountName("")
    setAmount("")
    setMessage(null)
  }
  
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
                  ? "bg-card text-blue-600 border-border shadow-lg shadow-black/5 scale-[1.02]" 
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
          blue: isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500" : "hover:border-blue-200 dark:hover:border-blue-700",
          green: isSelected ? "border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500" : "hover:border-green-200 dark:hover:border-green-700",
          gray: isSelected ? "border-border bg-muted ring-1 ring-border" : "hover:border-border"
      }
      return (
        <button 
            onClick={onClick}
            className={cn(
                "w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group bg-card hover:bg-accent/5",
                colorStyles[color],
                !isSelected && "border-border"
            )}
        >
            <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl transition-colors", 
                    isSelected ? "bg-card shadow-sm" : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                )}>
                    <Icon className={cn("w-6 h-6", isSelected ? `text-${color}-600` : "text-gray-400")}/>
                </div>
                <div className="text-left">
                    <div className={cn("font-bold text-sm md:text-base transition-colors", isSelected ? `text-${color}-600 dark:text-${color}-400` : "text-foreground")}>{label}</div>
                    <div className="text-xs text-muted-foreground font-medium">{sub}</div>
                </div>
            </div>
            {isSelected && <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", `bg-${color}-500`)}><CheckIcon className="w-3 h-3 text-white"/></div>}
        </button>
      )
  }

  // --- Merchant UI Render Function (Redesigned) ---
  const renderMerchantUI = (type: 'DEPOSIT' | 'WITHDRAWAL') => {

    // ── STEP 1: Country Selection ──────────────────────────────────────────────
    if (!selectedCountry) {
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Step Header */}
          <div className="flex items-center gap-3 pb-1">
            <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-black shrink-0">1</div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Step 1 of 3</p>
              <h3 className="text-base font-bold text-foreground">Select Your Country</h3>
            </div>
          </div>

          {merchantSettings.length === 0 ? (
            <div className="p-10 text-center bg-muted/30 rounded-2xl border border-dashed border-border">
              <MapPinIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3"/>
              <p className="text-muted-foreground text-sm font-medium">No merchant countries available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {merchantSettings.map(country => {
                const isComingSoon = country.status === "COMING_SOON"
                const methodCount = country.methods?.length || 0
                return (
                  <button
                    key={country.id}
                    onClick={() => {
                      if (isComingSoon) { setMessage({ type: 'error', text: "This country is coming soon!" }); return }
                      setSelectedCountry(country)
                    }}
                    className={cn(
                      "flex items-center gap-4 p-4 sm:p-5 bg-card border-2 rounded-2xl transition-all text-left group relative overflow-hidden",
                      isComingSoon
                        ? "border-border opacity-60 cursor-not-allowed"
                        : "border-border hover:border-green-500 hover:shadow-lg hover:shadow-green-500/10 active:scale-[0.98]"
                    )}
                  >
                    {/* Country Code Avatar */}
                    <div className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-lg font-black shrink-0 transition-colors",
                      isComingSoon
                        ? "bg-muted text-muted-foreground"
                        : "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/20 text-green-700 dark:text-green-400 group-hover:from-green-100 group-hover:to-emerald-200 dark:group-hover:from-green-900/40 dark:group-hover:to-emerald-900/30"
                    )}>
                      {country.code}
                    </div>

                    {/* Country Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground text-sm sm:text-base">{country.name}</span>
                        {isComingSoon && (
                          <span className="text-[9px] font-black bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200 dark:border-amber-700/30">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        {methodCount} payment {methodCount === 1 ? "method" : "methods"} • {country.currency}
                      </p>
                    </div>

                    {/* Arrow */}
                    {!isComingSoon && (
                      <ChevronRightIcon className="w-5 h-5 text-muted-foreground group-hover:text-green-500 transition-colors shrink-0 group-hover:translate-x-0.5 transition-transform"/>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    // ── STEP 2: Payment Method Selection ──────────────────────────────────────
    if (!selectedPaymentMethod) {
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Breadcrumb Nav */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <button onClick={() => setSelectedCountry(null)} className="hover:text-foreground font-medium transition-colors flex items-center gap-1">
              <ArrowLeftIcon className="w-3 h-3"/> All Countries
            </button>
            <ChevronRightIcon className="w-3 h-3 shrink-0"/>
            <span className="font-bold text-foreground">{selectedCountry.name}</span>
          </div>

          {/* Step Header */}
          <div className="flex items-center gap-3 pb-1">
            <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-black shrink-0">2</div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Step 2 of 3</p>
              <h3 className="text-base font-bold text-foreground">Choose Payment Method</h3>
            </div>
          </div>

          {selectedCountry.methods && selectedCountry.methods.length > 0 ? (
            <div className="space-y-3">
              {selectedCountry.methods.map((method: any, idx: number) => {
                const gradients = [
                  "from-green-500 to-emerald-600",
                  "from-blue-500 to-indigo-600",
                  "from-violet-500 to-purple-600",
                  "from-orange-500 to-amber-600",
                ]
                const grad = gradients[idx % gradients.length]
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method)}
                    className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-border hover:border-green-500 hover:shadow-lg hover:shadow-green-500/10 transition-all group bg-card active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md shrink-0`}>
                        <BanknotesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white"/>
                      </div>

                      {/* Name + Account */}
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-foreground text-sm sm:text-base">{method.name}</div>
                        <div className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5 truncate">
                          {method.accountName}
                        </div>
                      </div>

                      {/* Number + Arrow */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="hidden sm:block text-right">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Account</div>
                          <div className="text-xs font-mono font-bold text-foreground">{method.accountNumber}</div>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-muted-foreground group-hover:text-green-500 transition-colors group-hover:translate-x-0.5 transition-transform"/>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-muted/30 rounded-2xl border border-dashed border-border">
              <BanknotesIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3"/>
              <p className="text-sm text-muted-foreground font-medium">No payment methods configured for {selectedCountry.name}.</p>
            </div>
          )}
        </div>
      )
    }

    // ── STEP 3: Action Form ────────────────────────────────────────────────────
    const rate = selectedCountry.currency === 'PKR' ? 300 : (selectedCountry.exchangeRate || 1)
    const val = parseFloat(amount)
    const totalPayable = !isNaN(val) && val > 0 ? val * rate : 0

    return (
      <div className="space-y-5 animate-in fade-in duration-300">

        {/* Breadcrumb Nav */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <button onClick={() => setSelectedCountry(null)} className="hover:text-foreground font-medium transition-colors flex items-center gap-1">
            <ArrowLeftIcon className="w-3 h-3"/> Countries
          </button>
          <ChevronRightIcon className="w-3 h-3 shrink-0"/>
          <button onClick={() => setSelectedPaymentMethod(null)} className="hover:text-foreground font-medium transition-colors">
            {selectedCountry.name}
          </button>
          <ChevronRightIcon className="w-3 h-3 shrink-0"/>
          <span className="font-bold text-foreground">{selectedPaymentMethod.name}</span>
        </div>

        {/* Step Header */}
        <div className="flex items-center gap-3 pb-1">
          <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-black shrink-0">3</div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Step 3 of 3</p>
            <h3 className="text-base font-bold text-foreground">
              {type === 'DEPOSIT' ? 'Complete Your Deposit' : 'Enter Withdrawal Details'}
            </h3>
          </div>
        </div>

        {type === 'DEPOSIT' ? (
          <div className="space-y-4 sm:space-y-5">

            {/* ── Account Details Card ──────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-2xl p-5 sm:p-6">
              {/* Subtle glow */}
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-green-500/10 rounded-full blur-3xl pointer-events-none"/>
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"/>

              <div className="relative z-10 space-y-4">
                {/* Header row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                      <BanknotesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-300"/>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Via</p>
                      <p className="text-sm sm:text-base font-black text-white truncate">{selectedPaymentMethod.name}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black bg-green-500/20 text-green-300 border border-green-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                    {selectedCountry.currency}
                  </span>
                </div>

                <div className="h-px bg-white/10"/>

                {/* Account Title */}
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Holder</p>
                  <p className="text-base sm:text-lg font-bold text-white">{selectedPaymentMethod.accountName}</p>
                </div>

                {/* Account Number */}
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Account Number / IBAN</p>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <p className="text-lg sm:text-2xl font-mono font-black text-white tracking-wider break-all flex-1 min-w-0">
                      {selectedPaymentMethod.accountNumber}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedPaymentMethod.accountNumber)
                        setMessage({ type: 'success', text: "Account number copied!" })
                        setTimeout(() => setMessage(null), 2000)
                      }}
                      className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 hover:border-white/30 shrink-0"
                      title="Copy Account Number"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Instructions ─────────────────────────────── */}
            {selectedPaymentMethod.instructions && (
              <div className="flex gap-3 items-start p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white font-black text-[10px]">i</span>
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  <span className="font-bold block mb-0.5">Instructions</span>
                  {selectedPaymentMethod.instructions}
                </div>
              </div>
            )}

            {/* ── Transaction Details ───────────────────────── */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-4 sm:px-5 py-3 bg-muted/40 border-b border-border">
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Transaction Details</h4>
              </div>

              <div className="p-4 sm:p-5 space-y-5">
                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Amount to Deposit (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-lg">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-3.5 rounded-xl border-2 border-input outline-none focus:border-green-500 font-black text-xl transition-all bg-muted/30 focus:bg-card text-foreground placeholder:text-muted-foreground/40"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Live Conversion */}
                {val > 0 && (
                  <div className="rounded-xl bg-muted/40 border border-border overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex justify-between items-center px-4 py-2.5 bg-muted/60 border-b border-border">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Conversion</span>
                      <span className="text-[10px] font-bold bg-card text-foreground px-2 py-0.5 rounded border border-border">
                        1 USD = {rate} {selectedCountry.currency}
                      </span>
                    </div>
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">You Pay</p>
                        <p className="text-2xl sm:text-3xl font-black text-foreground">{totalPayable.toLocaleString()} <span className="text-sm font-bold text-muted-foreground">{selectedCountry.currency}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Exchange</p>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">{val} USD × {rate}</p>
                      </div>
                    </div>
                    <div className="mx-4 mb-4 flex gap-2 items-start bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800/30">
                      <div className="w-1 h-8 bg-amber-500 rounded-full shrink-0 mt-0.5"/>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                        <span className="font-bold">Transfer exactly </span>{totalPayable.toLocaleString()} {selectedCountry.currency} to the account above.
                      </p>
                    </div>
                  </div>
                )}

                {/* Proof of Payment Upload */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Proof of Payment</label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <div className={`w-full min-h-[160px] sm:min-h-[180px] rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-3 p-6 text-center ${
                      screenshot
                        ? "border-green-500 bg-green-50/10 dark:bg-green-900/10"
                        : "border-border bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/40"
                    }`}>
                      {screenshot ? (
                        <div className="animate-in zoom-in duration-300 space-y-2">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <CheckCircleIcon className="w-7 h-7 text-green-600 dark:text-green-400"/>
                          </div>
                          <p className="font-black text-green-700 dark:text-green-400 text-sm">Receipt Attached!</p>
                          <p className="text-green-600 dark:text-green-500 text-xs">Tap to replace</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                            <ArrowUpTrayIcon className="w-6 h-6 text-blue-600 dark:text-blue-400"/>
                          </div>
                          <p className="font-bold text-foreground text-sm">Upload Payment Screenshot</p>
                          <p className="text-muted-foreground text-xs">JPG, PNG or PDF • Tap to browse</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleAction}
                  disabled={!amount || !screenshot || isPending}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg active:scale-[0.98]"
                >
                  {isPending ? "Submitting..." : "Confirm & Submit Deposit"}
                </button>
              </div>
            </div>

          </div>
        ) : (
          // ── WITHDRAWAL FORM ──────────────────────────────────────────────────
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 bg-muted/40 border-b border-border">
              <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Withdrawal Details</h4>
            </div>
            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Your {selectedPaymentMethod.name} Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full p-3.5 rounded-xl border-2 border-input outline-none focus:border-green-500 bg-muted/30 focus:bg-card font-mono font-bold transition-all text-foreground text-sm"
                  placeholder={`Enter your ${selectedPaymentMethod.name} number`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Account Title / Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full p-3.5 rounded-xl border-2 border-input outline-none focus:border-green-500 bg-muted/30 focus:bg-card transition-all text-foreground text-sm"
                  placeholder="Name on account"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3.5 rounded-xl border-2 border-input outline-none focus:border-green-500 font-black text-xl bg-muted/30 focus:bg-card transition-all text-foreground"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">Available: ${user.arnBalance?.toFixed(2) || "0.00"} ARN</p>
              </div>
              <button
                onClick={handleAction}
                disabled={!amount || !accountNumber || !accountName || isPending}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg active:scale-[0.98]"
              >
                {isPending ? "Processing..." : "Confirm Withdrawal Request"}
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
                               ? "bg-card border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30 shadow-lg scale-[1.02]" 
                               : "bg-card border-border hover:bg-muted/50 shadow-sm hover:shadow-md"
                       )}
                   >
                       <item.icon className={cn("w-6 h-6", activeTab === item.id ? item.color : "text-gray-400")} />
                       <span className={cn("text-[10px] md:text-sm font-bold uppercase tracking-wider", activeTab === item.id ? "text-foreground" : "text-muted-foreground")}>
                           {item.label}
                       </span>
                   </button>
               ))}
           </div>

           {/* 2. ACTION FORM PANEL */}
           <div className="bg-card rounded-[2rem] border border-border shadow-lg shadow-black/5 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold font-serif text-foreground capitalize flex items-center gap-3">
                      {activeTab === 'deposit' && <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><ArrowDownTrayIcon className="w-6 h-6"/></div>}
                      {activeTab === 'withdraw' && <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><ArrowUpTrayIcon className="w-6 h-6"/></div>}
                      {activeTab === 'transfer' && <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><ArrowPathIcon className="w-6 h-6"/></div>}
                      {activeTab === 'withdraw' ? 'Swap & Withdraw' : `${activeTab} ${activeTab === 'deposit' ? 'USD' : 'Funds'}`}
                  </h3>
                  {(activeTab === 'deposit') && (
                     <div className="hidden sm:flex px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold rounded-full items-center gap-1.5 border border-green-100 dark:border-green-800">
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
                               <MethodOption id="MERCHANT" label="Merchant Deposit" sub="Local Agents" icon={BanknotesIcon} selected={depositMethod} onClick={() => { setMerchantModalType('DEPOSIT'); setMerchantModalOpen(true) }} color="green"/>
                               <div className="md:col-span-2">
                                 <MethodOption id="CARD" label="Debit / Credit Card" sub="Visa • Mastercard" icon={CreditCardIcon} selected={depositMethod} onClick={() => setDepositMethod("CARD")} color="gray"/>
                               </div>
                           </div>
                        </div>

                        {/* TRC-20 Form */}
                        {depositMethod === "TRC20" && (
                           <div className="bg-muted/30 rounded-2xl p-4 md:p-6 border border-border space-y-6">
                              {/* QR & Address */}
                              <div className="flex flex-col md:flex-row gap-6">
                                 <div className="flex-shrink-0 mx-auto md:mx-0">
                                    <QRCode network="TRC20" imagePath={currentWallet.qrCodePath || "/qr-trc20.png"} />
                                 </div>
                                 <div className="flex-1 space-y-4 min-w-0">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Wallet Address</label>
                                       <div className="flex items-center gap-2 p-1 bg-card border border-border rounded-xl">
                                          <div className="flex-1 px-3 py-2 font-mono text-xs md:text-sm text-foreground truncate">
                                             {currentWallet?.address}
                                          </div>
                                          <button onClick={copyAddress} className="p-2 bg-foreground text-background rounded-lg hover:opacity-80 transition-colors shrink-0">
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
                                     <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Transaction ID (Hash)</label>
                                     <input 
                                        type="text" 
                                        value={txHash}
                                        onChange={(e) => setTxHash(e.target.value)}
                                        placeholder="Paste your transaction hash..."
                                        className="w-full px-4 py-3.5 rounded-xl border border-input outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all bg-card font-mono text-sm text-foreground"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Amount (USD)</label>
                                     <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                                        <input 
                                           type="number" 
                                           value={amount}
                                           onChange={(e) => setAmount(e.target.value)}
                                           placeholder="0.00"
                                           className="w-full pl-8 pr-4 py-3.5 rounded-xl border border-input outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all bg-card font-bold text-lg text-foreground"
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

                        {/* Merchant — opens modal */}
                        
                        {/* Card Form */}
                        {depositMethod === "CARD" && (
                            <div className="p-8 text-center bg-muted/30 rounded-2xl border border-dashed border-border">
                                <CreditCardIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3"/>
                                <h4 className="font-bold text-foreground">Coming Soon</h4>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">Direct card payments are currently under maintenance. Please use TRC-20 or a Merchant.</p>
                            </div>
                        )}
                    </div>
                 )}


                 {/* === WITHDRAW === */}
                 {activeTab === "withdraw" && (
                    <div className="space-y-8 animate-in fade-in">
                        {/* Method Selector */}
                        <div className="space-y-3">
                           <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Withdrawal Method</label>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                               <MethodOption id="TRC20" label="TRC-20 Crypto" sub="Global • Fast" icon={QrCodeIcon} selected={withdrawalMethod} onClick={() => setWithdrawalMethod("TRC20")} color="blue"/>
                               <MethodOption id="MERCHANT" label="Merchant Withdrawal" sub="Local Agents" icon={BanknotesIcon} selected={withdrawalMethod} onClick={() => { setMerchantModalType('WITHDRAWAL'); setMerchantModalOpen(true) }} color="green"/>
                           </div>
                        </div>
                        
                        {/* TRC20 Withdraw */}
                        {withdrawalMethod === "TRC20" && (
                             <div className="space-y-4">
                                 <div>
                                     <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Destination Address</label>
                                     <input 
                                        type="text" 
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                        placeholder="Enter USDT TRC-20 address..."
                                        className="w-full px-4 py-3.5 rounded-xl border border-input outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50/50 transition-all bg-card font-mono text-sm text-foreground"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Amount to Swap (ARN)</label>
                                     <div className="relative">
                                        <input 
                                           type="number" 
                                           value={amount}
                                           onChange={(e) => setAmount(e.target.value)}
                                           placeholder="0"
                                           className="w-full px-4 py-3.5 rounded-xl border border-input outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50/50 transition-all bg-card font-bold text-lg text-foreground"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">ARN</span>
                                     </div>
                                     <div className="flex justify-between mt-2 px-1">
                                        <span className="text-xs text-muted-foreground font-medium">Available: {user.arnBalance?.toFixed(2) || 0} ARN</span>
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
       <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
          <div className="bg-card rounded-2xl border border-border shadow-md p-5 sm:p-6 lg:sticky lg:top-24">
              <h3 className="text-base sm:text-lg font-bold font-serif text-foreground mb-5 flex items-center justify-between">
                  Recent Activity
              </h3>
              
              <div className="space-y-2 sm:space-y-3">
                  {transactions.length === 0 ? (
                      <div className="text-center py-10">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                              <ArrowPathIcon className="w-6 h-6"/>
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">No transactions yet</p>
                      </div>
                  ) : (
                      transactions.slice(0, 5).map((tx, i) => (
                          <div key={tx.id || i} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors cursor-default">
                              <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center shadow-sm shrink-0">
                                      {tx.type === 'DEPOSIT' ? <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400"/> : 
                                       tx.type === 'WITHDRAWAL' ? <ArrowUpTrayIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400"/> : <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400"/>}
                                  </div>
                                  <div className="min-w-0">
                                      <div className="text-xs font-bold text-foreground">{tx.type}</div>
                                      <div className="text-[10px] text-muted-foreground" suppressHydrationWarning>{new Date(tx.createdAt).toLocaleDateString()}</div>
                                  </div>
                              </div>
                              <div className="text-right shrink-0">
                                  <div className={cn("text-sm font-bold", 
                                      tx.type === 'DEPOSIT' ? "text-green-600 dark:text-green-400" : "text-foreground"
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

      {/* ════════════════════════════ MERCHANT MODAL ════════════════════════════ */}
      {merchantModalOpen && (
        <>
          {/* Backdrop — starts below nav bar, never covers it */}
          <div
            className="fixed inset-x-0 top-[64px] bottom-[64px] md:bottom-0 z-[45] bg-black/60 backdrop-blur-[3px] animate-in fade-in duration-200"
            onClick={closeMerchantModal}
          />

          {/* Panel — slides down from below top nav, stops above bottom nav on mobile */}
          <div className="fixed inset-x-0 top-[64px] z-[46] flex flex-col sm:inset-auto sm:top-4 sm:right-4 sm:left-auto animate-in slide-in-from-top-4 duration-300">
            <div
              className="w-full sm:w-[440px] bg-background rounded-b-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-border sm:max-h-[calc(100vh-80px)]"
              style={{ maxHeight: 'calc(100vh - 128px)' }}
            >

              {/* ── Sticky Modal Header ─────────────────────────────────── */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border shrink-0 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  {/* Step indicator dots */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map(step => {
                      const currentStep = !selectedCountry ? 1 : !selectedPaymentMethod ? 2 : 3
                      return (
                        <div
                          key={step}
                          className={cn(
                            "rounded-full transition-all duration-300",
                            step === currentStep
                              ? "w-5 h-2 bg-green-500"
                              : step < currentStep
                              ? "w-2 h-2 bg-green-500/50"
                              : "w-2 h-2 bg-muted-foreground/25"
                          )}
                        />
                      )
                    })}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {merchantModalType === 'DEPOSIT' ? 'Merchant Deposit' : 'Merchant Withdrawal'}
                    </p>
                    <h2 className="text-sm font-black text-foreground">
                      {!selectedCountry ? 'Select Country' : !selectedPaymentMethod ? 'Payment Method' : merchantModalType === 'DEPOSIT' ? 'Deposit Details' : 'Withdrawal Details'}
                    </h2>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={closeMerchantModal}
                  className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
                >
                  <XMarkIcon className="w-4 h-4"/>
                </button>
              </div>

              {/* ── Scrollable Body ──────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 overscroll-contain">
                {renderMerchantUI(merchantModalType)}
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  )
}
