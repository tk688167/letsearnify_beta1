"use client"

import { useState } from "react"
import { createNowPaymentsInvoice } from "@/app/actions/wallet"
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"

export function DepositNowPaymentsForm({ 
    method 
}: { 
    method: "BTC" | "CARD" 
}) {
    const [amount, setAmount] = useState<string>("10.00");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handlePay() {
        setIsSubmitting(true);
        setError("");

        try {
            const val = parseFloat(amount);
            if (isNaN(val) || val < 1) {
                setError("Minimum deposit is $1");
                setIsSubmitting(false);
                return;
            }

            const res = await createNowPaymentsInvoice(val, method);
            
            if (res.error) {
                setError(res.error);
            } else if (res.url) {
                // Redirect
                window.location.href = res.url;
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        }
        setIsSubmitting(false);
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4 capitalize">
                Deposit via {method === "BTC" ? "Bitcoin" : "Credit Card"}
            </h3>
            
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">{error}</div>}

            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                        step="0.01"
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-xl text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum deposit $1.00</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700 leading-relaxed">
                    You will be redirected to our secure payment processor (NOWPayments) to complete your {method === "BTC" ? "Bitcoin" : "Card"} transaction.
                </div>
                
                <button 
                    onClick={handlePay}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg shadow-gray-200 hover:bg-black hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? "Processing..." : (
                        <>
                            Pay Now <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
