"use client"

import { useState, useTransition, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { formatCurrency, cn } from "@/lib/utils"
import { deposit, withdraw, transferToPool } from "@/lib/actions"
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

export default function WalletClient({ user, transactions, platformWallets }: { user: any, transactions: any[], platformWallets: any[] }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalletContent user={user} transactions={transactions} platformWallets={platformWallets} />
    </Suspense>
  )
}

function WalletContent({ user, transactions, platformWallets }: { user: any, transactions: any[], platformWallets: any[] }) {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab")
  
  const [balance, setBalance] = useState(user.balance)
  const [activeTab, setActiveTab] = useState(initialTab && ["deposit", "withdraw", "transfer"].includes(initialTab) ? initialTab : "deposit")
  const [amount, setAmount] = useState("")
  // For Deposits:
  const [depositMethod, setDepositMethod] = useState<"CRYPTO" | "STRIPE">("CRYPTO")
  const [cryptoNetwork, setCryptoNetwork] = useState<"TRC20" | "BEP20">("TRC20")
  const [txHash, setTxHash] = useState("")
  
  // Helper to find wallet data
  const currentWallet = platformWallets.find(w => w.network === cryptoNetwork) || { address: "Loading...", qrCodePath: "" }

  
  // For Withdraws/Transfers:
  const [method, setMethod] = useState("TRC20") // Default withdraw method
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
        let res
        if (activeTab === "deposit") {
           if (depositMethod === "STRIPE") {
             throw new Error("Stripe payments are currently disabled.")
           }
           if (!txHash) {
             throw new Error("Please enter the Transaction Hash.")
           }
           res = await deposit(val, "CRYPTO", { network: cryptoNetwork, txHash })
        } else if (activeTab === "withdraw") {
           if (!details) {
             throw new Error("Please provide withdrawal destination details.")
           }
           res = await withdraw(val, method, details) // Re-using 'method' state for withdraw network
           if (res?.success) setDetails("")
        } else if (activeTab === "transfer") {
           res = await transferToPool(val, method) // method acts as poolName here
        }

        if (res?.success) {
           setMessage({ type: 'success', text: res.message || "Transaction successful!" })
           setAmount("")
           setTxHash("")
           // Optimistic update
           if (activeTab === "deposit") setBalance((curr: number) => curr + val)
           else setBalance((curr: number) => curr - val)
        } else {
           setMessage({ type: 'error', text: res?.message || "Transaction failed." })
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
                      <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
                         <button 
                           onClick={() => setDepositMethod("CRYPTO")}
                           className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition-all", depositMethod === "CRYPTO" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900")}
                         >
                            Crypto (Fast)
                         </button>
                         <button 
                           onClick={() => setDepositMethod("STRIPE")}
                           className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition-all", depositMethod === "STRIPE" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900")}
                         >
                            Credit Card
                         </button>
                      </div>

                      {depositMethod === "CRYPTO" ? (
                         <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                               <SelectionCard 
                                  selected={cryptoNetwork === "TRC20"}
                                  onClick={() => setCryptoNetwork("TRC20")}
                                  title="USDT (TRC20)"
                                  icon={<QrCodeIcon className="w-6 h-6"/>}
                               />
                               <SelectionCard 
                                  selected={cryptoNetwork === "BEP20"}
                                  onClick={() => setCryptoNetwork("BEP20")}
                                  title="BNB (BEP20)"
                                  icon={<QrCodeIcon className="w-6 h-6"/>}
                               />
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 items-center">
                               <div className="w-full md:w-auto flex-shrink-0">
                                  <QRCode 
                                    network={cryptoNetwork} 
                                    imagePath={currentWallet.qrCodePath || (cryptoNetwork === "TRC20" ? "/qr-trc20.png" : "/qr-bep20.png")} 
                                  />
                               </div>
                               <div className="w-full space-y-4">
                                  <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Wallet Address</div>
                                  <div className="flex items-center gap-2">
                                     <div className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs md:text-sm text-gray-600 break-all">
                                        {currentWallet.address}
                                     </div>
                                     <button onClick={copyAddress} className="p-4 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors">
                                        <DocumentDuplicateIcon className="w-5 h-5"/>
                                     </button>
                                  </div>
                                  <div className="text-xs text-blue-600 font-medium">
                                     * Only send {cryptoNetwork} to this address.
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
                         </div>
                      ) : (
                         <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <CreditCardIcon className="w-12 h-12 text-gray-300 mx-auto mb-2"/>
                            <h4 className="font-bold text-gray-900">Coming Soon</h4>
                            <p className="text-sm text-gray-500">Stripe card payments are currently disabled.</p>
                         </div>
                      )}
                   </>
                )}

                {/* WITHDRAW FORM */}
                {activeTab === "withdraw" && (
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                            <SelectionCard 
                               selected={method === "TRC20"}
                               onClick={() => setMethod("TRC20")}
                               title="USDT (TRC20)"
                               icon={<QrCodeIcon className="w-6 h-6"/>}
                            />
                            <SelectionCard 
                               selected={method === "BEP20"}
                               onClick={() => setMethod("BEP20")}
                               title="BNB (BEP20)"
                               icon={<QrCodeIcon className="w-6 h-6"/>}
                            />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                           Destination Address
                         </label>
                         <input 
                            type="text" 
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder={`Enter your ${method} wallet address...`}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                         />
                      </div>
                   </div>
                )}

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

                {/* Amount Input (Common) */}
                {depositMethod !== "STRIPE" && (
                   <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount</label>
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
                )}

                {/* Messages */}
                {message && (
                   <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {message.text}
                   </div>
                )}

                {/* Submit Button */}
                {depositMethod !== "STRIPE" && (
                   <button 
                     onClick={handleAction}
                     disabled={isPending}
                     className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-xl shadow-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                      {isPending ? "Processing..." : `Confirm ${activeTab}`}
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
                transactions.map((tx) => (
                   <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' : 
                            tx.type === 'WITHDRAWAL' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                         }`}>
                            {tx.type === 'DEPOSIT' && <ArrowDownTrayIcon className="w-5 h-5" />}
                            {tx.type === 'WITHDRAWAL' && <ArrowUpTrayIcon className="w-5 h-5" />}
                            {tx.type === 'INVESTMENT' && <ArrowPathIcon className="w-5 h-5" />}
                         </div>
                         <div>
                            <div className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{tx.type}</div>
                            <div className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</div>
                            {tx.method && <div className="text-[10px] text-gray-400 truncate w-32" title={tx.method}>{tx.method}</div>}
                         </div>
                      </div>
                      <div className={`font-bold ${
                         tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-gray-900'
                      }`}>
                         {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
                   </div>
                ))
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
