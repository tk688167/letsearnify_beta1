import { prisma } from "@/lib/prisma"
export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { TransactionActions } from "./actions"
import { PhotoIcon } from "@heroicons/react/24/outline"

export default async function MerchantDepositsPage() {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") redirect("/login")

    const transactions = await prisma.merchantTransaction.findMany({
        where: { type: 'DEPOSIT' },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    })

    const statusClass = (s: string) =>
        s === 'APPROVED' ? 'bg-green-500/10 text-green-400' :
        s === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
        'bg-amber-500/10 text-amber-400'

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Merchant Deposits</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Review and manage merchant deposit requests.</p>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {transactions.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-500 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">No deposit requests found.</div>
                ) : transactions.map((tx) => (
                    <div key={tx.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <div className="font-bold text-gray-900 dark:text-white text-sm truncate">{tx.user.name || "Unknown"}</div>
                                <div className="text-xs text-gray-400 dark:text-slate-500 truncate">{tx.user.email}</div>
                            </div>
                            <span className={`shrink-0 ml-2 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusClass(tx.status)}`}>
                                {tx.status.toLowerCase()}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-gray-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                <div className="text-gray-400 dark:text-slate-500 mb-0.5">USD</div>
                                <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(tx.amount)}</div>
                            </div>
                            {tx.convertedAmount && (
                                <div className="bg-gray-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                    <div className="text-gray-400 dark:text-slate-500 mb-0.5">{tx.currency}</div>
                                    <div className="font-mono font-bold text-gray-900 dark:text-white">{tx.convertedAmount.toLocaleString()}</div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            {tx.screenshot ? (
                                <a href={tx.screenshot} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold">
                                    <PhotoIcon className="w-3.5 h-3.5" /> View Proof
                                </a>
                            ) : (
                                <span className="text-xs text-gray-400 dark:text-slate-600 italic">No screenshot</span>
                            )}
                            <span className="text-xs text-gray-400 dark:text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                            <TransactionActions id={tx.id} status={tx.status} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 uppercase text-xs font-bold">
                            <tr>
                                {["User / ID","Amounts","Payment Proof","Status","Actions"].map((h, i) => (
                                    <th key={h} className={`px-6 py-3 ${i===4?"text-right":""}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {transactions.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-slate-500">No deposit requests found.</td></tr>
                            ) : transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 dark:text-white">{tx.user.name || "Unknown"}</div>
                                        <div className="text-xs text-gray-500 dark:text-slate-400">{tx.user.email}</div>
                                        <div className="text-[10px] text-gray-400 dark:text-slate-600 font-mono mt-1 w-24 truncate" title={tx.userId}>ID: {tx.userId}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-500 dark:text-slate-400 w-8">USD:</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(tx.amount)}</span>
                                            </div>
                                            {tx.convertedAmount && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-500 dark:text-slate-400 w-8">{tx.currency}:</span>
                                                    <span className="font-mono text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 px-1.5 rounded text-xs">
                                                        {tx.convertedAmount.toLocaleString()} {tx.currency}
                                                    </span>
                                                </div>
                                            )}
                                            {tx.exchangeRate && <div className="text-[10px] text-gray-400 dark:text-slate-600">Rate: {tx.exchangeRate}</div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {tx.screenshot ? (
                                            <a href={tx.screenshot} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors text-xs font-bold">
                                                <PhotoIcon className="w-4 h-4" /> View Proof
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 dark:text-slate-600 text-xs italic">No screenshot</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${statusClass(tx.status)}`}>
                                            {tx.status.toLowerCase()}
                                        </span>
                                        <div className="text-[10px] text-gray-400 dark:text-slate-600 mt-1">{new Date(tx.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end">
                                            <TransactionActions id={tx.id} status={tx.status} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
