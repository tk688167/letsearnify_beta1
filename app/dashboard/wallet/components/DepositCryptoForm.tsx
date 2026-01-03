"use client"

import { useState } from "react"
import { submitDeposit } from "@/app/actions/wallet"
import { QrCodeIcon, DocumentDuplicateIcon, CheckIcon } from "@heroicons/react/24/outline"

export function DepositCryptoForm({ 
    wallets, 
    recentDeposits 
}: { 
    wallets: { network: string, address: string, qrCodePath: string }[],
    recentDeposits: any[]
}) {
    const [network, setNetwork] = useState(wallets[0]?.network || "TRC20");
    const [amount, setAmount] = useState<string>("1.00");
    const [txId, setTxId] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [copied, setCopied] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const activeWallet = wallets.find(w => w.network === network) || wallets[0];

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setSuccess("");

        const formData = new FormData();
        formData.append("network", network);
        formData.append("amount", amount);
        formData.append("txId", txId);

        const res = await submitDeposit(formData);

        if (res.error) {
            setError(res.error);
        } else {
            setSuccess(`Deposit of $${amount} submitted successfully! Pending Admin Approval.`);
            setTxId("");
            setAmount("1.00");
        }
        setIsSubmitting(false);
    }

    const copyAddress = () => {
        navigator.clipboard.writeText(activeWallet.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Deposit Form */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Manual Deposit</h3>
                    
                    {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">{error}</div>}
                    {success && <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm mb-4">{success}</div>}

                    <div className="space-y-4">
                        {/* Amount Input */}
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="1"
                                step="0.01"
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900"
                            />
                            <p className="text-xs text-blue-600 mt-1">Minimum deposit is $1. You may deposit any amount above this.</p>
                        </div>

                        {/* Network Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Network</label>
                            <select 
                                value={network} 
                                onChange={(e) => setNetwork(e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="TRC20">TRC-20 (USDT - Tron)</option>
                                <option value="BEP20">BEP-20 (BNB Smart Chain)</option>
                            </select>
                        </div>

                        {/* Wallet Info Card */}
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col items-center gap-4">
                             {/* QR Code Display */}
                             <div className="w-40 h-40 bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
                                 {activeWallet.qrCodePath && activeWallet.qrCodePath !== '/qr-placeholder.png' ? (
                                     <img 
                                        src={activeWallet.qrCodePath} 
                                        alt={`${activeWallet.network} QR Code`}
                                        className="w-full h-full object-contain"
                                     />
                                 ) : (
                                     <QrCodeIcon className="w-32 h-32 text-gray-800" />
                                 )}
                             </div>
                             
                             {/* Address */}
                             <div className="w-full">
                                 <p className="text-xs text-center text-gray-500 mb-1">Wallet Address</p>
                                 <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-gray-200">
                                     <code className="flex-1 text-xs md:text-sm font-mono text-gray-600 break-all">{activeWallet.address}</code>
                                     <button onClick={copyAddress} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500">
                                         {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
                                     </button>
                                 </div>
                             </div>
                        </div>

                        {/* Instructions */}
                        <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg leading-relaxed">
                            Please send the exact amount <strong>(${amount})</strong> to the address above. Deposits usually take 10-30 minutes to be verified.
                        </div>

                        {/* TXID Input */}
                        <form onSubmit={handleSubmit} className="pt-2">
                             <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID (TXID) / Hash</label>
                                <input 
                                    type="text" 
                                    value={txId}
                                    onChange={(e) => setTxId(e.target.value)}
                                    placeholder="Paste transaction hash here..."
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                    required
                                    minLength={5}
                                />
                             </div>
                             
                             <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                {isSubmitting ? "Verifying..." : "Submit for Approval"}
                             </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right: History */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Deposit History</h3>
                <div className="space-y-3">
                    {recentDeposits.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No recent deposits found.</p>
                    ) : (
                        recentDeposits.map((tx: any) => (
                            <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-bold text-gray-900">${tx.amount.toFixed(2)}</span>
                                    <span className="text-[10px] text-gray-500 uppercase font-mono">{tx.method}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                                        tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                        tx.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {tx.status}
                                    </span>
                                    <p className="text-[10px] text-gray-400 mt-1" suppressHydrationWarning>
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
