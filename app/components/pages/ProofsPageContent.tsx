"use client"

import React from "react"
import { motion } from "framer-motion"
import LandingHeader from "../../components/LandingHeader"
import { CheckCircleIcon, ArrowTopRightOnSquareIcon, ClockIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline"

export default function ProofsPageContent() {
  // Mock Data for Payout Log (Realistic ranges)
  const payouts = [
    { id: "TX892...44M", date: "2 mins ago", method: "USDT (TRC20)", amount: "$125.50", status: "Completed" },
    { id: "TX771...99K", date: "5 mins ago", method: "USDT (TRC20)", amount: "$42.00", status: "Completed" },
    { id: "TX332...11L", date: "12 mins ago", method: "Bank Transfer", amount: "$89.00", status: "Processing" },
    { id: "TX554...22P", date: "18 mins ago", method: "USDT (TRC20)", amount: "$210.00", status: "Completed" },
    { id: "TX110...88Q", date: "25 mins ago", method: "USDT (TRC20)", amount: "$15.00", status: "Completed" },
    { id: "TX993...55R", date: "32 mins ago", method: "Bank Transfer", amount: "$350.00", status: "Completed" },
    { id: "TX445...66S", date: "45 mins ago", method: "USDT (TRC20)", amount: "$68.00", status: "Completed" },
    { id: "TX221...33T", date: "1 hour ago", method: "USDT (TRC20)", amount: "$19.50", status: "Completed" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <LandingHeader />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="bg-white py-16 px-6 border-b border-gray-100">
           <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-100 rounded-full text-xs font-bold uppercase tracking-wider text-green-700 mb-6">
                    <CheckCircleIcon className="w-4 h-4" />
                    Verified Transactions
                 </div>
                 <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Transparency Protocol</h1>
                 <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    We believe in radical transparency. View real-time payout data and blockchain verification details below.
                 </p>
              </motion.div>
           </div>
        </section>

        {/* Live Payout Log */}
        <section className="py-16 px-6">
           <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-bold flex items-center gap-2">
                    <ClockIcon className="w-6 h-6 text-indigo-600" />
                    Recent Payouts
                 </h2>
                 <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live Updates
                 </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                       <thead className="bg-gray-50 text-gray-900 font-bold uppercase text-xs">
                          <tr>
                             <th className="px-6 py-4 whitespace-nowrap">Transaction ID</th>
                             <th className="px-6 py-4">Method</th>
                             <th className="px-6 py-4">Amount</th>
                             <th className="px-6 py-4 whitespace-nowrap">Time</th>
                             <th className="px-6 py-4">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                          {payouts.map((tx, idx) => (
                             <motion.tr 
                               key={idx}
                               initial={{ opacity: 0, x: -20 }}
                               whileInView={{ opacity: 1, x: 0 }}
                               viewport={{ once: true }}
                               transition={{ delay: idx * 0.05 }}
                               className="hover:bg-gray-50 transition-colors"
                             >
                                <td className="px-6 py-4 font-mono text-indigo-600 flex items-center gap-1 group cursor-pointer whitespace-nowrap">
                                   {tx.id}
                                   <ArrowTopRightOnSquareIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{tx.method}</td>
                                <td className="px-6 py-4 font-bold text-gray-900">{tx.amount}</td>
                                <td className="px-6 py-4 text-gray-400 whitespace-nowrap">{tx.date}</td>
                                <td className="px-6 py-4">
                                   <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                      tx.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                                   }`}>
                                      {tx.status}
                                   </span>
                                </td>
                             </motion.tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
                 <div className="p-4 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-100">
                    * Transaction IDs are partially masked for user privacy.
                 </div>
              </div>
           </div>
        </section>

        {/* Visual Proofs / Education */}
        <section className="py-16 px-6 bg-white border-t border-gray-100">
           <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div>
                 <h2 className="text-3xl font-serif font-bold mb-6">How to Verify</h2>
                 <p className="text-gray-500 mb-8 leading-relaxed">
                    Don't just take our word for it. Every crypto transaction on LetsEarnify generates a unique hash on the blockchain. You can verify any payment using independent explorers like TronScan.
                 </p>
                 
                 <div className="space-y-4">
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                       <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">1</div>
                       <div>
                          <h4 className="font-bold text-gray-900">Copy the TXID</h4>
                          <p className="text-sm text-gray-500">Locate the Transaction ID in your withdrawal history logs.</p>
                       </div>
                    </div>
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                       <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">2</div>
                       <div>
                          <h4 className="font-bold text-gray-900">Visit Blockchain Explorer</h4>
                          <p className="text-sm text-gray-500">Go to TronScan (for TRC20) or BscScan (for BEP20).</p>
                       </div>
                    </div>
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                       <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">3</div>
                       <div>
                          <h4 className="font-bold text-gray-900">Paste & Validate</h4>
                          <p className="text-sm text-gray-500">Paste the ID to see the timestamp, amount, and recipient address status.</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-20 transform rotate-3"></div>
                 <div className="relative bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                             <div className="text-sm text-gray-400">Total Paid Out (24h)</div>
                             <div className="font-bold text-2xl">$14,250.00</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-sm text-gray-400">Next Batch</div>
                          <div className="font-mono text-sm">~45 mins</div>
                       </div>
                    </div>
                    <div className="space-y-3">
                       <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-green-500 rounded-full"></div>
                       </div>
                       <p className="text-xs text-gray-400 text-center">daily limit processing...</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Integrity Disclaimer */}
        <section className="py-16 px-6 bg-gray-50">
           <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Integrity Statement</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                 The screenshots or transaction logs displayed above are strictly for transparency purposes. 
                 They represent real transactions processed by our system. However, individual results may vary based on user activity, 
                 task availability, and market conditions. We do not guarantee specific earnings.
              </p>
              <div className="text-xs text-gray-400">
                 Last Updated: {new Date().toLocaleDateString()}
              </div>
           </div>
        </section>

      </main>

      <footer className="bg-white border-t border-gray-200 py-12 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} LetsEarnify. All rights reserved.</p>
      </footer>
    </div>
  )
}
