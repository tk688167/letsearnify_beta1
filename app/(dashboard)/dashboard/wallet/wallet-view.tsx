"use client"

import { useState, useTransition, useEffect, Suspense, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { deposit, transferFunds } from "@/lib/actions"
import { submitWithdrawal } from "@/app/actions/wallet"

import { submitMerchantDeposit, submitMerchantWithdrawal } from "@/app/actions/user/merchant-transaction"
import { useCurrency } from "@/app/components/providers/CurrencyProvider"
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
  MapPinIcon,
  ChartPieIcon,
  FunnelIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline"
import { LockClosedIcon } from "@heroicons/react/24/solid"
import { QRCode } from "./qr-code"
import toast, { Toaster } from "react-hot-toast"

// ─── Brand logo helper ──────────────────────────────────────────────
const BRAND_LOGOS: Record<string, string> = {
  "jazzcash": "/jazzcash.webp",
  "jazz cash": "/jazzcash.webp",
  "easypaisa": "/easypaisa.webp",
  "easy paisa": "/easypaisa.webp",
}
const FALLBACK_GRADS = ["from-blue-500 to-indigo-600", "from-green-500 to-emerald-600", "from-purple-500 to-violet-600", "from-orange-500 to-amber-600"]

// ─── Country flags by code ──────────────────────────────────────────
const COUNTRY_FLAGS: Record<string, string> = {
  PK: "🇵🇰", IN: "🇮🇳", BD: "🇧🇩", AE: "🇦🇪", US: "🇺🇸", GB: "🇬🇧",
  SA: "🇸🇦", TR: "🇹🇷", NG: "🇳🇬", EG: "🇪🇬", KE: "🇰🇪", MY: "🇲🇾",
  ID: "🇮🇩", PH: "🇵🇭", LK: "🇱🇰", NP: "🇳🇵", QA: "🇶🇦", KW: "🇰🇼",
  BH: "🇧🇭", OM: "🇴🇲", CA: "🇨🇦", AU: "🇦🇺", DE: "🇩🇪", FR: "🇫🇷",
}

function getBrandLogo(name: string) {
  const key = name.toLowerCase().trim()
  const match = Object.entries(BRAND_LOGOS).find(([k]) => key.includes(k))
  return match ? match[1] : null
}

function PaymentMethodIcon({ name, idx, size = "w-12 h-12", imgSize = "w-10 h-10" }: { name: string, idx?: number, size?: string, imgSize?: string }) {
  const logo = getBrandLogo(name)
  const grad = FALLBACK_GRADS[(idx || 0) % FALLBACK_GRADS.length]
  return (
    <div className={`${size} rounded-xl ${logo ? 'bg-white border border-border' : `bg-gradient-to-br ${grad}`} flex items-center justify-center shadow-md shrink-0 overflow-hidden`}>
      {logo ? (
        <img src={logo} alt={name} className={`${imgSize} object-contain`} />
      ) : (
        <BanknotesIcon className="w-6 h-6 text-white"/>
      )}
    </div>
  )
}

function PaymentMethodIconDark({ name }: { name: string }) {
  const logo = getBrandLogo(name)
  return (
    <div className={`w-10 h-10 rounded-xl ${logo ? 'bg-white' : 'bg-white/10 border border-white/10'} flex items-center justify-center shrink-0 overflow-hidden`}>
      {logo ? (
        <img src={logo} alt={name} className="w-8 h-8 object-contain" />
      ) : (
        <BanknotesIcon className="w-5 h-5 text-green-300"/>
      )}
    </div>
  )
}

// ─── Main Export ─────────────────────────────────────────────────────

export default function WalletClient({ user, transactions, platformWallets, merchantSettings }: { user: any, transactions: any[], platformWallets: any[], merchantSettings: any[] }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading Wallet...</div>}>
      <WalletContent user={user} transactions={transactions} platformWallets={platformWallets} merchantSettings={merchantSettings} />
    </Suspense>
  )
}

function WalletContent({ user, transactions, platformWallets, merchantSettings }: { user: any, transactions: any[], platformWallets: any[], merchantSettings: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab")
  
  const { formatCurrency, userCurrency, convertFromUSD } = useCurrency()
  
  const [balance, setBalance] = useState(user.balance)
  const [activeTab, setActiveTab] = useState(initialTab && ["deposit", "withdraw", "transfer"].includes(initialTab) ? initialTab : "deposit")
  const [amount, setAmount] = useState("")
  const [depositMethod, setDepositMethod] = useState<"TRC20" | "CARD" | "MERCHANT">("TRC20")
  const [cryptoNetwork, setCryptoNetwork] = useState<"TRC20">("TRC20")
  const [txHash, setTxHash] = useState("")
  
  const [selectedCountry, setSelectedCountry] = useState<any>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false)
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")

  const [merchantModalOpen, setMerchantModalOpen] = useState(false)
  const [merchantModalType, setMerchantModalType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT')
  const [countrySearch, setCountrySearch] = useState("")

  const closeMerchantModal = () => {
    setMerchantModalOpen(false)
    setSelectedCountry(null)
    setSelectedPaymentMethod(null)
    setScreenshot(null)
    setAccountNumber("")
    setAccountName("")
    setAmount("")
    setMessage(null)
    setCountrySearch("")
  }
  
  const currentWallet = platformWallets.find(w => w.network === cryptoNetwork) || { address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", qrCodePath: "" }

  const [method, setMethod] = useState("TRC20") 
  const [withdrawalMethod, setWithdrawalMethod] = useState<"TRC20" | "MERCHANT" | "STRIPE">("TRC20") 
  const [details, setDetails] = useState("")

  const [transferSource, setTransferSource] = useState<"WALLET" | "MUDARABAH" | "DAILY_EARNING">("WALLET")
  const [transferDestination, setTransferDestination] = useState<"WALLET" | "MUDARABAH" | "DAILY_EARNING">("MUDARABAH")

  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isUnlocking, setIsUnlocking] = useState(false)

  const [filterRange, setFilterRange] = useState<'7d' | '30d' | 'custom'>('7d')
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")

  const filteredTransactions = useMemo(() => {
     let filtered = transactions;
     if (filterRange === '7d') { const d = new Date(); d.setDate(d.getDate() - 7); filtered = filtered.filter(tx => new Date(tx.createdAt) >= d) }
     else if (filterRange === '30d') { const d = new Date(); d.setDate(d.getDate() - 30); filtered = filtered.filter(tx => new Date(tx.createdAt) >= d) }
     else if (filterRange === 'custom') {
        if (customStart) filtered = filtered.filter(tx => new Date(tx.createdAt) >= new Date(customStart))
        if (customEnd) { const e = new Date(customEnd); e.setHours(23, 59, 59, 999); filtered = filtered.filter(tx => new Date(tx.createdAt) <= e) }
     }
     return filtered;
  }, [transactions, filterRange, customStart, customEnd])

  useEffect(() => {
     setSelectedCountry(null); setSelectedPaymentMethod(null); setScreenshot(null)
     setAccountNumber(""); setAccountName(""); setAmount(""); setMessage(null)
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
    if (!file) return

    // ── Validate file type ──────────────────────────────────────────
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: "Invalid file type. Please upload a JPG, PNG, WEBP or GIF image." })
      e.target.value = ""
      return
    }

    // ── Validate file size (max 15 MB before compression) ───────────
    const MAX_RAW_SIZE_MB = 15
    if (file.size > MAX_RAW_SIZE_MB * 1024 * 1024) {
      setMessage({ type: 'error', text: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed is ${MAX_RAW_SIZE_MB} MB.` })
      e.target.value = ""
      return
    }

    setMessage(null)
    setIsUploadingScreenshot(true)

    // ── Compress to JPEG via canvas (max 1200px, quality 0.75) ───────
    const reader = new FileReader()
    reader.onloadend = () => {
      const img = new Image()
      img.onload = () => {
        try {
          const MAX_DIM = 1200
          let { width, height } = img
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) { height = Math.round((height * MAX_DIM) / width); width = MAX_DIM }
            else { width = Math.round((width * MAX_DIM) / height); height = MAX_DIM }
          }
          const canvas = document.createElement("canvas")
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          if (!ctx) throw new Error("Canvas not supported")
          ctx.drawImage(img, 0, 0, width, height)
          const compressed = canvas.toDataURL("image/jpeg", 0.75)
          setScreenshot(compressed)
        } catch {
          // Fallback: use original as-is (already validated type & size)
          setScreenshot(reader.result as string)
        } finally {
          setIsUploadingScreenshot(false)
        }
      }
      img.onerror = () => {
        setMessage({ type: 'error', text: "Could not read the image file. Please try a different image." })
        e.target.value = ""
        setIsUploadingScreenshot(false)
      }
      img.src = reader.result as string
    }
    reader.onerror = () => {
      setMessage({ type: 'error', text: "Failed to read the file. Please try again." })
      e.target.value = ""
      setIsUploadingScreenshot(false)
    }
    reader.readAsDataURL(file)
  }

  const handleUnlockAccount = async () => {
    if (balance < 1.0) { setMessage({ type: 'error', text: "Insufficient balance to unlock. Please deposit at least $1.00 USD."}); return }
    setIsUnlocking(true); setMessage(null)
    try {
      const res = await fetch("/api/user/unlock", { method: "POST" }); const data = await res.json()
      if (data.success) { setMessage({ type: 'success', text: "Your account has been successfully unlocked!" }); setBalance((prev: number) => prev - 1.0); router.refresh() }
      else { setMessage({ type: 'error', text: data.error || "Failed to unlock account." }) }
    } catch (err: any) { setMessage({ type: 'error', text: "A network error occurred." }) }
    finally { setIsUnlocking(false) }
  }

  const handleAction = () => {
    setMessage(null)
    const val = parseFloat(amount)
    if (isNaN(val) || val <= 0) { setMessage({ type: 'error', text: "Please enter a valid amount." }); return }
    startTransition(async () => {
      try {
        let res: any
        if (activeTab === "deposit") {
           if (depositMethod === "TRC20") { if (!txHash) throw new Error("Please enter the Transaction Hash."); res = await deposit(val, "CRYPTO", { network: "TRC20", txHash }) as any }
           else if (depositMethod === "MERCHANT") { if (!selectedCountry || !selectedPaymentMethod) throw new Error("Please select country and payment method."); if (!screenshot) throw new Error("Please upload payment proof."); res = await submitMerchantDeposit({ countryCode: selectedCountry.code, paymentMethodId: selectedPaymentMethod.id, amount: val, screenshot }) }
        } else if (activeTab === "withdraw") {
           if (withdrawalMethod === "TRC20") { if (!details) throw new Error("Please provide withdrawal destination details."); const formData = new FormData(); formData.append("amount", val.toString()); formData.append("address", details); res = await submitWithdrawal(formData) }
           else if (withdrawalMethod === "MERCHANT") { if (!selectedCountry || !selectedPaymentMethod) throw new Error("Please select country and payment method."); if (!accountNumber || !accountName) throw new Error("Please provide your account details."); res = await submitMerchantWithdrawal({ countryCode: selectedCountry.code, paymentMethodId: selectedPaymentMethod.id, amount: val, accountNumber, accountName }) }
        } else if (activeTab === "transfer") { res = await transferFunds(val, transferSource, transferDestination) }
        if (res?.success) { 
          const isMerchant = (activeTab === "deposit" && depositMethod === "MERCHANT") || (activeTab === "withdraw" && withdrawalMethod === "MERCHANT")
          if (isMerchant) {
            // Close modal and show toast — balance won't change until admin approves
            closeMerchantModal()
            toast.success("Payment submitted! Your deposit is pending admin verification.", { duration: 5000, icon: "⏳" })
            router.refresh()
          } else {
            setMessage({ type: 'success', text: res.message || "Transaction successful!" })
            setAmount(""); setTxHash(""); setScreenshot(null)
            if (activeTab === "deposit") setBalance((curr: number) => curr + val)
          }
        }
        else { setMessage({ type: 'error', text: res?.message || res?.error || "Transaction failed." }) }
      } catch (err: any) { setMessage({ type: 'error', text: err.message || "Transaction failed." }) }
    })
  }

  // ─── Render Helpers ───────────────────────────────────────────────

  const MethodOption = ({ id, label, icon: Icon, sub, selected, onClick, color = "blue" }: any) => {
      const isSelected = selected === id;
      const colorStyles: any = {
          blue: isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500" : "hover:border-blue-200 dark:hover:border-blue-700",
          green: isSelected ? "border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500" : "hover:border-green-200 dark:hover:border-green-700",
          gray: isSelected ? "border-border bg-muted ring-1 ring-border" : "hover:border-border"
      }
      return (
        <button onClick={onClick} className={cn("w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group bg-card hover:bg-accent/5", colorStyles[color], !isSelected && "border-border")}>
            <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl transition-colors", isSelected ? "bg-card shadow-sm" : "bg-muted/50 text-muted-foreground group-hover:bg-muted")}>
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

  // ─── Merchant Modal Content ───────────────────────────────────────

  const renderMerchantContent = (type: 'DEPOSIT' | 'WITHDRAWAL') => {

    // ── STEP 1: Country Selection ──
    if (!selectedCountry) {
      const filteredCountries = merchantSettings.filter(c => 
        !countrySearch || c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.toLowerCase().includes(countrySearch.toLowerCase())
      )
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="text-center pb-1">
            <div className="text-4xl mb-3">🌍</div>
            <h3 className="text-lg font-bold text-foreground">Select Your Country</h3>
            <p className="text-sm text-muted-foreground mt-1">Choose where you&apos;ll be sending payment from</p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
            <input
              type="text"
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              placeholder="Search countries..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-muted/30 focus:bg-card focus:border-green-500 outline-none text-sm text-foreground placeholder:text-muted-foreground/50 transition-all"
            />
          </div>

          {merchantSettings.length === 0 ? (
            <div className="p-10 text-center bg-muted/30 rounded-2xl border border-dashed border-border">
              <MapPinIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3"/>
              <p className="text-muted-foreground text-sm font-medium">No countries available yet.</p>
            </div>
          ) : filteredCountries.length === 0 ? (
            <div className="p-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground text-sm font-medium">No countries match &quot;{countrySearch}&quot;</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredCountries.map(country => {
                const isComingSoon = country.status === "COMING_SOON"
                const flag = COUNTRY_FLAGS[country.code?.toUpperCase()] || "🏳️"
                return (
                  <button key={country.id} onClick={() => { if (isComingSoon) { setMessage({ type: 'error', text: `${country.name} is coming soon!` }); return } setSelectedCountry(country); setMessage(null); setCountrySearch("") }}
                    className={cn("flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border transition-all text-left w-full group",
                      isComingSoon
                        ? "bg-muted/20 border-border opacity-50 cursor-not-allowed"
                        : "bg-card border-border hover:border-green-500 hover:shadow-sm hover:bg-green-50/10 dark:hover:bg-green-900/10 active:scale-[0.99]"
                    )}>
                    <div className="text-2xl sm:text-3xl shrink-0 group-hover:scale-105 transition-transform">{flag}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                         <div className="flex flex-row items-center gap-2 min-w-0">
                            <span className={cn("font-bold text-sm truncate", isComingSoon ? "text-muted-foreground" : "text-foreground")}>{country.name}</span>
                            <span className="text-[10px] font-bold text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">{country.code || country.name.substring(0,3).toUpperCase()}</span>
                         </div>
                         {isComingSoon ? (
                             <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Soon</span>
                         ) : (
                             <ChevronRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-green-500 transition-colors shrink-0"/>
                         )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    // ── STEP 2: Payment Method Selection ──
    if (!selectedPaymentMethod) {
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <button onClick={() => { setSelectedCountry(null); setMessage(null) }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
            <ArrowLeftIcon className="w-3.5 h-3.5"/> Back to countries
          </button>
          <div className="text-center pb-2">
            <div className="text-4xl mb-3">{COUNTRY_FLAGS[selectedCountry.code?.toUpperCase()] || "🏳️"}</div>
            <h3 className="text-lg font-bold text-foreground">Choose Payment Method</h3>
            <p className="text-sm text-muted-foreground mt-1">Pay via {selectedCountry.name} local transfer</p>
          </div>
          {selectedCountry.methods && selectedCountry.methods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedCountry.methods.map((m: any, idx: number) => (
                <button key={m.id} onClick={() => { setSelectedPaymentMethod(m); setMessage(null) }}
                  className="w-full text-left p-3.5 sm:p-4 rounded-xl border-2 border-border hover:border-green-500 hover:shadow-md hover:shadow-green-500/10 transition-all group bg-card flex items-center justify-between gap-3 active:scale-[0.99]">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0"><PaymentMethodIcon name={m.name} idx={idx} /></div>
                    <div className="min-w-0">
                      <div className="font-bold text-foreground text-sm truncate">{m.name}</div>
                      <div className="text-[10px] text-muted-foreground font-medium truncate mt-0.5 uppercase tracking-wider">{m.accountName}</div>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-green-500 transition-colors shrink-0"/>
                </button>
              ))}
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

    // ── STEP 3: Action Form ──
    const rate = selectedCountry.currency === 'PKR' ? 300 : (selectedCountry.exchangeRate || 1)
    const val = parseFloat(amount)
    const totalPayable = !isNaN(val) && val > 0 ? val * rate : 0

    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        <button onClick={() => { setSelectedPaymentMethod(null); setMessage(null) }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
          <ArrowLeftIcon className="w-3.5 h-3.5"/> Back to methods
        </button>

        {type === 'DEPOSIT' ? (
          <div className="space-y-5">
            {/* Account Details Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-2xl p-5">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-green-500/10 rounded-full blur-3xl pointer-events-none"/>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <PaymentMethodIconDark name={selectedPaymentMethod.name} />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Send Payment To</p>
                      <p className="text-base font-bold text-white truncate">{selectedPaymentMethod.name}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold bg-green-500/20 text-green-300 border border-green-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">{selectedCountry.currency}</span>
                </div>
                <div className="h-px bg-white/10"/>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Holder</p>
                  <p className="text-lg font-bold text-white">{selectedPaymentMethod.accountName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Account Number</p>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-mono font-bold text-white tracking-wider break-all flex-1 min-w-0">{selectedPaymentMethod.accountNumber}</p>
                    <button onClick={() => { navigator.clipboard.writeText(selectedPaymentMethod.accountNumber); setMessage({ type: 'success', text: "Account number copied!" }); setTimeout(() => setMessage(null), 2000) }}
                      className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 shrink-0">
                      <DocumentDuplicateIcon className="w-5 h-5"/>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {selectedPaymentMethod.instructions && (
              <div className="flex gap-3 items-start p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5"><span className="text-white font-bold text-[10px]">i</span></div>
                <div className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed"><span className="font-bold block mb-0.5">Instructions</span>{selectedPaymentMethod.instructions}</div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">$</span>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-3.5 rounded-xl border-2 border-input outline-none focus:border-green-500 font-bold text-xl transition-all bg-muted/30 focus:bg-card text-foreground placeholder:text-muted-foreground/40" placeholder="0.00"/>
              </div>
            </div>

            {val > 0 && (
              <div className="rounded-xl bg-muted/40 border border-border overflow-hidden animate-in fade-in duration-200">
                <div className="flex justify-between items-center px-4 py-2.5 bg-muted/60 border-b border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Conversion</span>
                  <span className="text-[10px] font-bold bg-card text-foreground px-2 py-0.5 rounded border border-border">1 USD = {rate} {selectedCountry.currency}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">You Pay</p><p className="text-2xl font-bold text-foreground">{totalPayable.toLocaleString()} <span className="text-sm font-bold text-muted-foreground">{selectedCountry.currency}</span></p></div>
                    <div className="text-right"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">You Get</p><p className="text-sm font-bold text-green-600 dark:text-green-400">{(val * 10).toFixed(0)} ARN</p></div>
                  </div>
                  <div className="flex gap-2 items-start bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800/30">
                    <div className="w-1 h-8 bg-amber-500 rounded-full shrink-0 mt-0.5"/>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed"><span className="font-bold">Transfer exactly </span>{totalPayable.toLocaleString()} {selectedCountry.currency} to the account above.</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Payment Proof</label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileUpload}
                  disabled={isUploadingScreenshot}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed"
                />
                <div className={cn(
                  "w-full rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center p-2 text-center overflow-hidden",
                  isUploadingScreenshot ? "border-border min-h-[140px] bg-muted/30 animate-pulse" :
                  screenshot ? "border-green-500 bg-green-50 dark:bg-green-900/10 shadow-sm" :
                  "border-dashed border-border min-h-[140px] bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/40"
                )}>
                  {isUploadingScreenshot ? (
                    <div className="space-y-2 py-6">
                      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"/>
                      <p className="text-muted-foreground text-sm font-medium">Processing image...</p>
                    </div>
                  ) : screenshot ? (
                    <div className="w-full flex items-center gap-3 bg-card p-2 rounded-xl">
                      <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-border bg-black/5">
                        <img src={screenshot} alt="Proof" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-bold text-green-700 dark:text-green-400 text-sm truncate">Screenshot Uploaded ✓</p>
                        <p className="text-muted-foreground text-[10px] uppercase tracking-widest mt-0.5">Tap to replace image</p>
                      </div>
                      <CheckCircleIcon className="w-6 h-6 text-green-500 shrink-0 mx-2" />
                    </div>
                  ) : (
                    <div className="space-y-1.5 py-6">
                       <ArrowUpTrayIcon className="w-8 h-8 text-muted-foreground mx-auto"/>
                       <p className="font-bold text-foreground text-sm">Upload Screenshot Image</p>
                       <p className="text-muted-foreground text-xs">JPG, PNG or WEBP formats (max 15 MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button onClick={handleAction} disabled={!amount || !screenshot || isPending || isUploadingScreenshot}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base active:scale-[0.98]">
              {isPending ? "Submitting..." : isUploadingScreenshot ? "Processing image..." : "Confirm & Submit Deposit"}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center pb-2">
              <h3 className="text-lg font-bold text-foreground">Withdraw to {selectedPaymentMethod.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">Enter your account details below</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Your {selectedPaymentMethod.name} Number</label>
              <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full p-3.5 rounded-xl border-2 border-input outline-none focus:border-green-500 bg-muted/30 focus:bg-card font-mono font-bold transition-all text-foreground text-sm"
                placeholder={`Enter your ${selectedPaymentMethod.name} number`}/>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Account Title / Name</label>
              <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)}
                className="w-full p-3.5 rounded-xl border-2 border-input outline-none focus:border-green-500 bg-muted/30 focus:bg-card transition-all text-foreground text-sm" placeholder="Name on account"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-3.5 rounded-xl border-2 border-input outline-none focus:border-green-500 font-bold text-xl bg-muted/30 focus:bg-card transition-all text-foreground" placeholder="0.00"/>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">Available: {((user.balance || 0) * 10).toFixed(2)} ARN</p>
            </div>
            <button onClick={handleAction} disabled={!amount || !accountNumber || !accountName || isPending}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base active:scale-[0.98]">
              {isPending ? "Processing..." : "Confirm Withdrawal Request"}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ─── Transaction type display helper ──────────────────────────────
  const getTxDisplay = (tx: any, iconSize = "w-5 h-5") => {
    let typeDisplay = tx.type, icon = <ArrowPathIcon className={`${iconSize} text-gray-500`}/>, iconBg = "bg-gray-100 dark:bg-gray-900/30", amountColor = "text-foreground", prefix = "";
    if (tx.type === 'DEPOSIT') { icon = <ArrowDownTrayIcon className={`${iconSize} text-green-600 dark:text-green-400`}/>; iconBg = "bg-green-100 dark:bg-green-900/30"; amountColor = "text-green-600 dark:text-green-400"; prefix = "+"; typeDisplay = "Wallet Deposit"; }
    else if (tx.type === 'WITHDRAWAL') { icon = <ArrowUpTrayIcon className={`${iconSize} text-purple-600 dark:text-purple-400`}/>; iconBg = "bg-purple-100 dark:bg-purple-900/30"; amountColor = "text-purple-600 dark:text-purple-400"; prefix = "-"; typeDisplay = "Withdrawal"; }
    else if (tx.type === 'MUDARABAH_TRANSFER' || tx.type === 'INVESTMENT') { icon = <ChartPieIcon className={`${iconSize} text-emerald-600 dark:text-emerald-400`}/>; iconBg = "bg-emerald-100 dark:bg-emerald-900/30"; amountColor = "text-emerald-600 dark:text-emerald-400"; typeDisplay = "Pool Transfer"; }
    else if (tx.type === 'DAILY_EARNING_TRANSFER') { icon = <ChartPieIcon className={`${iconSize} text-blue-600 dark:text-blue-400`}/>; iconBg = "bg-blue-100 dark:bg-blue-900/30"; amountColor = "text-blue-600 dark:text-blue-400"; typeDisplay = "Daily Earning Pool"; }
    else if (tx.type === 'SPIN_REWARD') { icon = <BanknotesIcon className={`${iconSize} text-yellow-600 dark:text-yellow-400`}/>; iconBg = "bg-yellow-100 dark:bg-yellow-900/30"; amountColor = "text-yellow-600 dark:text-yellow-400"; prefix = "+"; typeDisplay = "Spin Wheel Reward"; }
    else if (tx.type === 'UNLOCK_FEE') { icon = <LockClosedIcon className={`${iconSize} text-red-500 dark:text-red-400`}/>; iconBg = "bg-red-100 dark:bg-red-900/30"; amountColor = "text-red-500 dark:text-red-400"; prefix = "-"; typeDisplay = "Account Unlock Fee"; }
    else if (tx.type === 'TASK_INCOME') { icon = <CheckCircleIcon className={`${iconSize} text-cyan-600 dark:text-cyan-400`}/>; iconBg = "bg-cyan-100 dark:bg-cyan-900/30"; amountColor = "text-cyan-600 dark:text-cyan-400"; prefix = "+"; typeDisplay = "Task Income"; }
    else if (tx.type.includes('COMMISSION')) { icon = <MapPinIcon className={`${iconSize} text-pink-600 dark:text-pink-400`}/>; iconBg = "bg-pink-100 dark:bg-pink-900/30"; amountColor = "text-pink-600 dark:text-pink-400"; prefix = "+"; typeDisplay = "Referral Commission"; }
    else if (tx.type === 'ADMIN_ADJUSTMENT') { icon = <CheckCircleIcon className={`${iconSize} text-gray-500`}/>; iconBg = "bg-gray-100 dark:bg-gray-900/30"; amountColor = "text-gray-600"; typeDisplay = "Admin Adjustment"; }
    return { typeDisplay, icon, iconBg, amountColor, prefix }
  }

  // ─── MAIN RETURN ──────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 md:gap-8 min-h-screen pb-12 w-full">
       <Toaster position="top-center" toastOptions={{ style: { borderRadius: '12px', padding: '14px 20px', fontWeight: 700, fontSize: '14px' } }} />
       <div className="flex-1 space-y-6 md:space-y-8 min-w-0">
          
           {/* 1. MAIN WALLET HEADER & BALANCES */}
           <div className="flex flex-col gap-4">
               {/* Primary Balance Card */}
               <div className="w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden flex flex-col items-center justify-center text-center">
                  <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-blue-400/20 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
                  
                  <div className="relative z-10 w-full flex flex-col items-center">
                     <div className="flex items-center gap-2 mb-3">
                         <div className="p-1.5 bg-white/10 rounded-lg"><BanknotesIcon className="w-4 h-4 text-blue-200"/></div>
                         <h2 className="text-blue-100 font-bold tracking-widest uppercase text-xs">Total Balance</h2>
                     </div>
                     <div className="text-4xl sm:text-5xl md:text-6xl font-black font-serif tracking-tight text-white mb-2 leading-none">
                         {((user.balance || 0) * 10).toFixed(2)} <span className="text-xl sm:text-2xl text-blue-200">ARN</span>
                     </div>
                     <div className="flex items-center gap-2.5 mt-2">
                         <span className="text-blue-100/90 font-medium text-sm">≈ {formatCurrency(user.balance || 0)}</span>
                         <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", user.isActiveMember ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-red-500/20 text-red-300 border-red-500/30")}>
                             {user.isActiveMember ? "Active" : "Locked"}
                         </span>
                     </div>
                  </div>
               </div>

               {/* Minor Balances Grid */}
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   <div className="bg-card border border-border rounded-2xl p-4 flex flex-col shadow-sm">
                       <div className="flex items-center gap-2 mb-2">
                           <div className="p-1.5 bg-emerald-500/10 rounded-md shrink-0"><ChartPieIcon className="w-4 h-4 text-emerald-500" /></div>
                           <span className="text-[10px] xl:text-xs font-bold uppercase tracking-widest text-muted-foreground truncate">Mudarabah Pool</span>
                       </div>
                       <span className="text-lg md:text-xl font-bold text-foreground leading-none">{formatCurrency(user.mudarabahBalance || 0)}</span>
                   </div>

                   <div className="bg-card border border-border rounded-2xl p-4 flex flex-col shadow-sm">
                       <div className="flex items-center gap-2 mb-2">
                           <div className="p-1.5 bg-blue-500/10 rounded-md shrink-0"><BanknotesIcon className="w-4 h-4 text-blue-500" /></div>
                           <span className="text-[10px] xl:text-xs font-bold uppercase tracking-widest text-muted-foreground truncate">Daily Earning Pool</span>
                       </div>
                       <span className="text-lg md:text-xl font-bold text-foreground leading-none">{formatCurrency(user.dailyEarningWallet || 0)}</span>
                   </div>

                   {user.lockedArnBalance > 0 && !user.isActiveMember && (
                       <div className="bg-card border border-orange-500/30 rounded-2xl p-4 flex flex-col shadow-sm col-span-2 md:col-span-1">
                           <div className="flex items-center gap-2 mb-2">
                               <div className="p-1.5 bg-orange-500/10 rounded-md shrink-0"><LockClosedIcon className="w-4 h-4 text-orange-500" /></div>
                               <span className="text-[10px] xl:text-xs font-bold uppercase tracking-widest text-muted-foreground truncate text-orange-600 dark:text-orange-400">Locked Bonus</span>
                           </div>
                           <span className="text-lg md:text-xl font-bold text-foreground leading-none">{user.lockedArnBalance.toFixed(2)} ARN</span>
                       </div>
                   )}
               </div>

               {/* Unlock Section */}
               {!user.isActiveMember && (
                 <div className="w-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/20 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all w-full animate-in fade-in-50 zoom-in-95">
                     <div className="flex-1">
                         <h3 className="text-amber-600 dark:text-amber-400 font-bold text-base md:text-lg mb-1.5 flex items-center gap-2">
                             <LockClosedIcon className="w-5 h-5" /> Account Locked
                         </h3>
                         <p className="text-muted-foreground text-xs md:text-sm font-medium leading-relaxed max-w-xl">
                             You are missing out! Use <strong className="text-foreground">{formatCurrency(1.00)}</strong> from your wallet to unlock all platform features instantly.
                         </p>
                     </div>
                     <div className="flex flex-col gap-2 shrink-0 sm:w-auto w-full">
                         <button onClick={handleUnlockAccount} disabled={isUnlocking} className="w-full sm:w-auto relative overflow-hidden bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-amber-950 font-black px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-sm">
                            <span className="flex items-center justify-center gap-2">{isUnlocking ? "Unlocking..." : `Use ${formatCurrency(1)} to Unlock`}{!isUnlocking && <ChevronRightIcon className="w-4 h-4" />}</span>
                         </button>
                     </div>
                 </div>
               )}
           </div>

           {/* ACTION GRID */}
           <div className="flex gap-2 sm:gap-3 animate-in fade-in slide-in-from-top-2">
               {[
                   { id: 'deposit', label: 'Deposit', icon: ArrowDownTrayIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                   { id: 'withdraw', label: 'Withdraw', icon: ArrowUpTrayIcon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                   { id: 'transfer', label: 'Transfer', icon: ArrowPathIcon, color: 'text-orange-500', bg: 'bg-orange-500/10' },
               ].map((item) => (
                   <button key={item.id} onClick={() => { setActiveTab(item.id); setMessage(null); }}
                       className={cn("flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 p-2 sm:px-4 sm:py-3 rounded-xl border transition-all flex-1 justify-center group",
                           activeTab === item.id ? `bg-card border-${item.color.split('-')[1]}-500 shadow-sm` : "bg-card border-border hover:bg-muted/50")}>
                       <div className={cn("p-1.5 sm:p-1.5 rounded-lg shrink-0 transition-colors", activeTab === item.id ? item.bg : "bg-muted group-hover:bg-muted-foreground/10")}>
                           <item.icon className={cn("w-5 h-5 sm:w-5 sm:h-5", activeTab === item.id ? item.color : "text-muted-foreground")} />
                       </div>
                       <div className="flex items-center gap-1">
                          <span className={cn("text-[9px] min-[360px]:text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest whitespace-nowrap", activeTab === item.id ? "text-foreground" : "text-muted-foreground")}>{item.label}</span>
                          {item.id === 'withdraw' && !user.isActiveMember && <LockClosedIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 shrink-0" />}
                       </div>
                   </button>
               ))}
           </div>

           {/* 2. ACTION FORM PANEL */}
           <div className="bg-card rounded-[1.5rem] border border-border shadow-md p-4 sm:p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-foreground capitalize flex items-center gap-2 sm:gap-3 flex-wrap">
                      {activeTab === 'deposit' && <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 shrink-0"><ArrowDownTrayIcon className="w-5 h-5 sm:w-6 sm:h-6"/></div>}
                      {activeTab === 'withdraw' && <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 shrink-0"><ArrowUpTrayIcon className="w-5 h-5 sm:w-6 sm:h-6"/></div>}
                      {activeTab === 'transfer' && <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400 shrink-0"><ArrowPathIcon className="w-5 h-5 sm:w-6 sm:h-6"/></div>}
                      <span className="whitespace-normal leading-tight">{activeTab === 'withdraw' ? 'Swap & Withdraw' : `${activeTab} ${activeTab === 'deposit' ? 'USD' : 'Funds'}`}</span>
                  </h3>
                  {(activeTab === 'deposit') && (
                     <div className="hidden sm:flex px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold rounded-full items-center gap-1.5 border border-green-100 dark:border-green-800">
                        <ShieldCheckIcon className="w-4 h-4"/><span>1 USD = 10 ARN</span>
                     </div>
                  )}
              </div>

              {message && (
                 <div className={cn("p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
                     message.type === 'success' ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800"
                 )}>
                    {message.type === 'success' ? <CheckIcon className="w-5 h-5"/> : <div className="w-5 h-5 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center text-red-600 dark:text-red-300 shrink-0">!</div>}
                    {message.text}
                 </div>
              )}

              <div className="space-y-6">
                 {/* === DEPOSIT === */}
                 {activeTab === "deposit" && (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="space-y-2.5">
                           <div className="flex items-center justify-between pl-1">
                               <label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest">Select Deposit Method</label>
                           </div>
                           <div className="flex flex-col md:grid md:grid-cols-3 gap-2.5">
                               {/* Compact TRC-20 Card */}
                               <button onClick={() => setDepositMethod("TRC20")} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all w-full text-left group", depositMethod === "TRC20" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10 ring-1 ring-blue-500/50 shadow-sm" : "border-border bg-card hover:bg-muted/30")}>
                                   <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors", depositMethod === "TRC20" ? "bg-blue-500 text-white shadow-sm" : "bg-muted text-muted-foreground group-hover:bg-blue-500/10 group-hover:text-blue-500")}><QrCodeIcon className="w-5 h-5"/></div>
                                   <div className="flex-1 min-w-0">
                                       <div className="flex items-center justify-between gap-2 mb-0.5">
                                           <span className={cn("font-bold text-sm whitespace-nowrap leading-none", depositMethod === "TRC20" ? "text-blue-600 dark:text-blue-400" : "text-foreground")}>TRC-20 Crypto</span>
                                           <span className="shrink-0 text-[8px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-widest border border-blue-200 dark:border-blue-800">Fast</span>
                                       </div>
                                       <span className="text-[10px] text-muted-foreground font-medium truncate block leading-none">Automated & global</span>
                                   </div>
                                    {depositMethod === "TRC20" && <CheckCircleIcon className="w-4 h-4 text-blue-500 shrink-0 ml-1" />}
                               </button>

                               {/* Compact Merchant Card */}
                               <button onClick={() => { setDepositMethod("MERCHANT"); setMerchantModalType('DEPOSIT'); setMerchantModalOpen(true) }} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all w-full text-left group", depositMethod === "MERCHANT" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 ring-1 ring-emerald-500/50 shadow-sm" : "border-border bg-card hover:bg-muted/30")}>
                                   <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors", depositMethod === "MERCHANT" ? "bg-emerald-500 text-white shadow-sm" : "bg-muted text-muted-foreground group-hover:bg-emerald-500/10 group-hover:text-emerald-500")}><BanknotesIcon className="w-5 h-5"/></div>
                                   <div className="flex-1 min-w-0">
                                       <div className="flex items-center justify-between gap-2 mb-0.5">
                                           <span className={cn("font-bold text-sm whitespace-nowrap leading-none", depositMethod === "MERCHANT" ? "text-emerald-600 dark:text-emerald-400" : "text-foreground")}>Local Agent</span>
                                           <span className="shrink-0 text-[8px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-widest border border-emerald-200 dark:border-emerald-800">Popular</span>
                                       </div>
                                       <span className="text-[10px] text-muted-foreground font-medium truncate block leading-none">Bank details & wallets</span>
                                   </div>
                                    {depositMethod === "MERCHANT" && <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0 ml-1" />}
                               </button>

                               {/* Compact Card (Disabled) */}
                               <button onClick={() => setDepositMethod("CARD")} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all w-full text-left group", depositMethod === "CARD" ? "border-gray-500 bg-gray-50 dark:bg-gray-900/10 ring-1 ring-gray-500/50 shadow-sm" : "border-border bg-card hover:bg-muted/30")}>
                                   <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors", depositMethod === "CARD" ? "bg-gray-500 text-white shadow-sm" : "bg-muted text-muted-foreground group-hover:bg-gray-500/10 group-hover:text-gray-500")}><CreditCardIcon className="w-5 h-5"/></div>
                                   <div className="flex-1 min-w-0">
                                       <div className="flex items-center justify-between gap-2 mb-0.5">
                                           <span className={cn("font-bold text-sm whitespace-nowrap leading-none", depositMethod === "CARD" ? "text-gray-600 dark:text-gray-400" : "text-foreground")}>Credit Card</span>
                                           <span className="shrink-0 text-[8px] font-bold bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded uppercase tracking-widest border border-border">Offline</span>
                                       </div>
                                       <span className="text-[10px] text-muted-foreground font-medium truncate block leading-none">Under maintenance</span>
                                   </div>
                                    {depositMethod === "CARD" && <CheckCircleIcon className="w-4 h-4 text-gray-500 shrink-0 ml-1" />}
                               </button>
                           </div>
                        </div>
                        {depositMethod === "TRC20" && (
                           <div className="bg-muted/30 rounded-2xl p-4 md:p-6 border border-border space-y-6">
                              <div className="flex flex-col md:flex-row gap-5 md:gap-6">
                                 <div className="mx-auto md:mx-0 shrink-0 w-full max-w-[200px] md:max-w-none md:w-auto"><QRCode network="TRC20" imagePath={currentWallet.qrCodePath || "/qr-trc20.png"} /></div>
                                 <div className="flex-1 space-y-4 min-w-0 w-full overflow-hidden">
                                    <div className="space-y-2 w-full">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Wallet Address</label>
                                       <div className="flex items-center gap-2 p-1 bg-card border border-border rounded-xl w-full">
                                          <div className="flex-1 px-3 py-2 font-mono text-xs md:text-sm text-foreground truncate">{currentWallet?.address}</div>
                                          <button onClick={copyAddress} className="p-2 bg-foreground text-background rounded-lg hover:opacity-80 transition-colors shrink-0"><DocumentDuplicateIcon className="w-4 h-4"/></button>
                                       </div>
                                    </div>
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-lg leading-relaxed border border-blue-100 dark:border-blue-800/30"><strong>Note:</strong> Deposits are automatically converted to ARN Tokens (1 USD = 10 ARN).</div>
                                 </div>
                              </div>
                               <div className="space-y-3">
                                  <div><label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 pl-1">Transaction ID (Hash)</label><input type="text" value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="Paste your hash..." className="w-full px-3 py-2.5 rounded-xl border border-input outline-none focus:border-blue-500 transition-all bg-card font-mono text-sm text-foreground"/></div>
                                  <div><label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 pl-1">Amount (USD)</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-input outline-none focus:border-blue-500 transition-all bg-card font-bold text-base text-foreground"/></div>{amount && !isNaN(parseFloat(amount)) && <div className="mt-1 px-1 text-xs font-bold text-blue-600 dark:text-blue-400">You receive: {(parseFloat(amount) * 10).toFixed(0)} ARN</div>}</div>
                                  <button onClick={handleAction} className="w-full py-3 mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]">Submit Deposit</button>
                               </div>
                           </div>
                        )}
                        {depositMethod === "CARD" && (
                            <div className="p-8 text-center bg-muted/30 rounded-2xl border border-dashed border-border">
                                <CreditCardIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3"/><h4 className="font-bold text-foreground">Coming Soon</h4><p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">Direct card payments are currently under maintenance. Please use TRC-20 or a Merchant.</p>
                            </div>
                        )}
                    </div>
                 )}

                 {/* === WITHDRAW === */}
                 {activeTab === "withdraw" && !user.isActiveMember && (
                    <div className="p-8 text-center bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/30 animate-in fade-in">
                        <LockClosedIcon className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                        <h4 className="font-bold text-amber-700 dark:text-amber-400 text-lg">Withdrawal Locked</h4>
                        <p className="text-sm text-amber-600 dark:text-amber-300 max-w-sm mx-auto mt-2">
                           You must unlock your account by meeting the $1 requirement to access withdrawals.
                        </p>
                    </div>
                 )}
                 {activeTab === "withdraw" && user.isActiveMember && (
                    <div className="space-y-8 animate-in fade-in">
                       <div className="flex flex-col md:grid md:grid-cols-2 gap-2.5">
                           <button onClick={() => setWithdrawalMethod("TRC20")} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all w-full text-left group", withdrawalMethod === "TRC20" ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10 ring-1 ring-purple-500/50 shadow-sm" : "border-border bg-card hover:bg-muted/30")}>
                               <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors", withdrawalMethod === "TRC20" ? "bg-purple-500 text-white shadow-sm" : "bg-muted text-muted-foreground group-hover:bg-purple-500/10 group-hover:text-purple-500")}><QrCodeIcon className="w-5 h-5"/></div>
                               <div className="flex-1 min-w-0">
                                   <div className="flex items-center justify-between gap-2 mb-0.5"><span className={cn("font-bold text-sm truncate leading-none", withdrawalMethod === "TRC20" ? "text-purple-600 dark:text-purple-400" : "text-foreground")}>TRC-20 Crypto</span><span className="shrink-0 text-[8px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded uppercase tracking-widest border border-purple-200 dark:border-purple-800">Global</span></div>
                                   <span className="text-[10px] text-muted-foreground font-medium truncate block leading-none">Fast automated swap</span>
                               </div>
                                {withdrawalMethod === "TRC20" && <CheckCircleIcon className="w-4 h-4 text-purple-500 shrink-0 ml-1" />}
                           </button>

                           <button onClick={() => { setWithdrawalMethod("MERCHANT"); setMerchantModalType('WITHDRAWAL'); setMerchantModalOpen(true) }} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all w-full text-left group", withdrawalMethod === "MERCHANT" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 ring-1 ring-emerald-500/50 shadow-sm" : "border-border bg-card hover:bg-muted/30")}>
                               <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors", withdrawalMethod === "MERCHANT" ? "bg-emerald-500 text-white shadow-sm" : "bg-muted text-muted-foreground group-hover:bg-emerald-500/10 group-hover:text-emerald-500")}><BanknotesIcon className="w-5 h-5"/></div>
                               <div className="flex-1 min-w-0">
                                   <div className="flex items-center justify-between gap-2 mb-0.5"><span className={cn("font-bold text-sm truncate leading-none", withdrawalMethod === "MERCHANT" ? "text-emerald-600 dark:text-emerald-400" : "text-foreground")}>Local Agent</span><span className="shrink-0 text-[8px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-widest border border-emerald-200 dark:border-emerald-800">Popular</span></div>
                                   <span className="text-[10px] text-muted-foreground font-medium truncate block leading-none">Withdraw to bank</span>
                               </div>
                                {withdrawalMethod === "MERCHANT" && <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0 ml-1" />}
                           </button>
                       </div>
                       {withdrawalMethod === "TRC20" && (
                            <div className="space-y-4">
                                <div><label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Destination Address</label><input type="text" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Enter USDT TRC-20 address..." className="w-full px-4 py-3.5 rounded-xl border border-input outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50/50 dark:focus:ring-purple-900/30 transition-all bg-card font-mono text-sm text-foreground"/></div>
                                <div><label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Amount to Swap (ARN)</label><div className="relative"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="w-full px-4 py-3.5 rounded-xl border border-input outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50/50 dark:focus:ring-purple-900/30 transition-all bg-card font-bold text-lg text-foreground"/><span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">ARN</span></div>
                                    <div className="flex flex-col gap-1 mt-2 px-1">
                                        <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground font-medium">Available: {((balance || 0) * 10).toFixed(2)} ARN</span><span className="text-xs font-bold text-purple-600 dark:text-purple-400">{amount && !isNaN(parseFloat(amount)) ? `You receive: $${(parseFloat(amount) / 10).toFixed(2)}` : 'You receive: $0.00'}</span></div>
                                        <div className="flex justify-between items-center text-[10px] font-bold"><span className="text-muted-foreground uppercase tracking-wider">24h Limit: {user.withdrawalLimit || 10}%</span><span className="text-purple-500/80">Max: ${((balance || 0) * (user.withdrawalLimit || 10) / 100).toFixed(2)} USD</span></div>
                                    </div>
                                </div>
                                <button onClick={handleAction} className="w-full py-4 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-lg shadow-gray-900/10 transition-all hover:scale-[1.01] active:scale-[0.98]">Swap & Withdraw (USD)</button>
                            </div>
                       )}
                    </div>
                 )}

        {/* === TRANSFER === */}
                {activeTab === "transfer" && (
                    <div className="space-y-4 animate-in fade-in">
                             <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                                <div><label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 pl-1">From (Source)</label><select value={transferSource} onChange={(e) => { const v = e.target.value as any; setTransferSource(v); if (v === transferDestination) setTransferDestination(v === "WALLET" ? "MUDARABAH" : "WALLET"); }} className="w-full px-3 py-2.5 rounded-xl border border-input outline-none focus:border-blue-500 transition-all bg-card font-bold text-sm text-foreground appearance-none cursor-pointer"><option value="WALLET">Main Wallet</option><option value="MUDARABAH">Mudarabah Pool</option><option value="DAILY_EARNING">Daily Earning Pool</option></select><div className="mt-1 px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Balance: <span className="text-foreground">{formatCurrency(transferSource === "WALLET" ? (user.balance || 0) : transferSource === "MUDARABAH" ? (user.mudarabahBalance || 0) : ((user as any).dailyEarningWallet || 0))}</span></div></div>
                                <div><label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 pl-1">To (Destination)</label><select value={transferDestination} onChange={(e) => { const v = e.target.value as any; setTransferDestination(v); if (v === transferSource) setTransferSource(v === "WALLET" ? "MUDARABAH" : "WALLET"); }} className="w-full px-3 py-2.5 rounded-xl border border-input outline-none focus:border-green-500 transition-all bg-card font-bold text-sm text-foreground appearance-none cursor-pointer"><option value="WALLET">Main Wallet</option><option value="MUDARABAH">Mudarabah Pool</option><option value="DAILY_EARNING">Daily Earning Pool</option></select><div className="mt-1 px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Balance: <span className="text-foreground">{formatCurrency(transferDestination === "WALLET" ? (user.balance || 0) : transferDestination === "MUDARABAH" ? (user.mudarabahBalance || 0) : ((user as any).dailyEarningWallet || 0))}</span></div></div>
                             </div>
                             <div><label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 pl-1">Amount</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-input outline-none focus:border-blue-500 focus:bg-card transition-all bg-muted/30 font-bold text-base text-foreground"/></div></div>
                             <button onClick={handleAction} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]">Transfer Funds</button>
                    </div>
                )}
             </div>
          </div>
       </div>

       {/* 3. TRANSACTION HISTORY */}
       <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className="bg-card rounded-2xl border border-border shadow-md p-4 sm:p-6">
              <div className="flex flex-col gap-4 mb-5">
                  <div><h3 className="text-lg sm:text-xl font-bold font-serif text-foreground flex items-center gap-2.5"><div className="p-1.5 sm:p-2 bg-muted rounded-xl text-muted-foreground shrink-0"><CalendarDaysIcon className="w-5 h-5"/></div>Transaction History</h3><p className="text-xs sm:text-sm text-muted-foreground mt-1 pl-0.5">Your deposits, withdrawals, and pool transfers.</p></div>
                  <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl border border-border">
                          {(['7d', '30d', 'custom'] as const).map(r => (
                            <button key={r} onClick={() => setFilterRange(r)} className={cn("flex-1 px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1", filterRange === r ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                               {r === 'custom' && <FunnelIcon className="w-3 h-3"/>}{r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'Custom'}
                            </button>
                          ))}
                      </div>
                      {filterRange === 'custom' && (<div className="flex items-center gap-2 animate-in fade-in"><input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="flex-1 px-2 sm:px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium text-foreground outline-none focus:border-blue-500"/><span className="text-muted-foreground text-xs font-bold shrink-0">to</span><input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="flex-1 px-2 sm:px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium text-foreground outline-none focus:border-blue-500"/></div>)}
                  </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-hidden rounded-xl border border-border">
               <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 border-b border-border"><tr><th className="px-4 py-3.5 font-bold text-muted-foreground tracking-wider uppercase text-[10px]">Transaction Details</th><th className="px-4 py-3.5 font-bold text-muted-foreground tracking-wider uppercase text-[10px]">Date & Time</th><th className="px-4 py-3.5 font-bold text-muted-foreground tracking-wider uppercase text-[10px] text-right">Amount</th><th className="px-4 py-3.5 font-bold text-muted-foreground tracking-wider uppercase text-[10px] text-right">Status</th></tr></thead>
                  <tbody className="divide-y divide-border">
                      {filteredTransactions.length === 0 ? (
                          <tr><td colSpan={4}><div className="text-center py-16"><div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground"><ArrowPathIcon className="w-8 h-8"/></div><p className="text-base text-foreground font-bold">No transactions found</p><p className="text-sm text-muted-foreground mt-1">Try adjusting your date filters.</p></div></td></tr>
                      ) : filteredTransactions.map((tx, i) => { const d = getTxDisplay(tx); return (
                          <tr key={tx.id || i} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-4"><div className="flex items-center gap-3"><div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm", d.iconBg)}>{d.icon}</div><div className="min-w-0"><div className="font-bold text-foreground text-sm">{d.typeDisplay}</div><div className="text-xs text-muted-foreground truncate max-w-[250px] lg:max-w-xs">{tx.description || tx.method || "System Transaction"}</div></div></div></td>
                              <td className="px-4 py-4 whitespace-nowrap"><div className="text-sm text-foreground font-medium" suppressHydrationWarning>{new Date(tx.createdAt).toLocaleDateString()}</div><div className="text-[10px] text-muted-foreground uppercase tracking-widest" suppressHydrationWarning>{new Date(tx.createdAt).toLocaleTimeString()}</div></td>
                              <td className="px-4 py-4 text-right whitespace-nowrap"><div className={cn("text-sm font-black", d.amountColor)}>{d.prefix}${(tx.amount || 0).toFixed(2)} USD</div>{tx.arnMinted > 0 && <div className="text-xs font-bold text-blue-500">+{tx.arnMinted.toFixed(2)} ARN</div>}</td>
                              <td className="px-4 py-4 text-right"><span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border", tx.status === 'COMPLETED' ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" : tx.status === 'FAILED' ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800")}>{tx.status}</span></td>
                          </tr>
                      ) })}
                  </tbody>
               </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-border border border-border rounded-xl overflow-hidden mt-3">
                  {filteredTransactions.length === 0 ? (
                      <div className="text-center py-12 px-4"><div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 text-muted-foreground"><ArrowPathIcon className="w-6 h-6"/></div><p className="text-sm text-foreground font-bold">No transactions found</p></div>
                  ) : filteredTransactions.map((tx, i) => { const d = getTxDisplay(tx, "w-4 h-4"); return (
                      <div key={tx.id || i} className="p-3.5 bg-card hover:bg-muted/20 transition-colors">
                          <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2.5 min-w-0"><div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", d.iconBg)}>{d.icon}</div><div className="min-w-0"><div className="font-bold text-foreground text-xs leading-tight truncate">{d.typeDisplay}</div><div className="text-[10px] text-muted-foreground leading-tight line-clamp-1">{tx.description || tx.method || "System Transaction"}</div></div></div>
                              <div className="text-right shrink-0"><div className={cn("text-sm font-black leading-tight", d.amountColor)}>{d.prefix}${(tx.amount || 0).toFixed(2)}</div>{tx.arnMinted > 0 && <div className="text-[9px] font-bold text-blue-500">+{tx.arnMinted.toFixed(2)} ARN</div>}</div>
                          </div>
                          <div className="flex items-center justify-between gap-2"><div className="text-[10px] text-muted-foreground" suppressHydrationWarning>{new Date(tx.createdAt).toLocaleDateString()} · {new Date(tx.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div><span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border", tx.status === 'COMPLETED' ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" : tx.status === 'FAILED' ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800")}>{tx.status}</span></div>
                      </div>
                  ) })}
              </div>
          </div>
       </div>

       {/* ════════ CENTERED MERCHANT MODAL ════════ */}
       {merchantModalOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeMerchantModal}/>
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-[480px] max-h-[90vh] bg-card rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden pointer-events-auto animate-in zoom-in-95 fade-in duration-300">
              <div className="flex items-center justify-between p-5 border-b border-border shrink-0 bg-card">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map(step => { const cs = !selectedCountry ? 1 : !selectedPaymentMethod ? 2 : 3; return (<div key={step} className={cn("rounded-full transition-all duration-300", step === cs ? "w-6 h-2 bg-green-500" : step < cs ? "w-2 h-2 bg-green-500/50" : "w-2 h-2 bg-muted-foreground/20")}/>) })}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{merchantModalType === 'DEPOSIT' ? 'Merchant Deposit' : 'Merchant Withdrawal'}</p>
                    <h2 className="text-sm font-bold text-foreground">Step {!selectedCountry ? 1 : !selectedPaymentMethod ? 2 : 3} of 3</h2>
                  </div>
                </div>
                <button onClick={closeMerchantModal} className="w-9 h-9 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"><XMarkIcon className="w-5 h-5"/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 overscroll-contain">
                {message && (
                  <div className={cn("p-3 rounded-xl mb-4 text-sm font-bold flex items-center gap-2 animate-in fade-in", message.type === 'success' ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800")}>
                    {message.type === 'success' ? <CheckIcon className="w-4 h-4 shrink-0"/> : <span className="shrink-0">⚠️</span>}{message.text}
                  </div>
                )}
                {renderMerchantContent(merchantModalType)}
              </div>
            </div>
          </div>
        </>
       )}
    </div>
  )
}