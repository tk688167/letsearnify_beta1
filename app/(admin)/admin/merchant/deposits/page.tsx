import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { TransactionActions } from "./actions"
import Link from "next/link"
import { ArrowTopRightOnSquareIcon, PhotoIcon } from "@heroicons/react/24/outline"

export default async function MerchantDepositsPage() {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") redirect("/login")

    const transactions = await prisma.merchantTransaction.findMany({
        where: { type: 'DEPOSIT' }, // User specifically asked for deposits page, but I'll show deposits mainly
        include: {
            user: true
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Merchant Deposits</h1>
                    <p className="text-sm text-gray-500">Manage and review merchant deposit requests.</p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">User / ID</th>
                                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Amounts</th>
                                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Payment Proof</th>
                                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No deposit requests found.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                        {/* User & ID */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{tx.user.name || "Unknown"}</span>
                                                <span className="text-xs text-gray-500">{tx.user.email}</span>
                                                <span className="text-[10px] text-gray-400 font-mono mt-1 w-24 truncate" title={tx.userId}>ID: {tx.userId}</span>
                                            </div>
                                        </td>

                                        {/* Amounts */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-500 w-8">USD:</span>
                                                    <span className="font-bold text-gray-900">{formatCurrency(tx.amount)}</span>
                                                </div>
                                                {tx.convertedAmount && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-gray-500 w-8">{tx.currency}:</span>
                                                        <span className="font-mono text-gray-700 bg-gray-100 px-1.5 rounded text-xs">
                                                            {tx.convertedAmount.toLocaleString()} {tx.currency}
                                                        </span>
                                                    </div>
                                                )}
                                                {tx.exchangeRate && (
                                                    <div className="text-[10px] text-gray-400">Rate: {tx.exchangeRate}</div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Proof */}
                                        <td className="px-6 py-4">
                                            {tx.screenshot ? (
                                                <a 
                                                    href={tx.screenshot} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold"
                                                >
                                                    <PhotoIcon className="w-4 h-4"/>
                                                    View Proof
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">No screenshot</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                                                ${tx.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                                  tx.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                                                  'bg-yellow-100 text-yellow-800'}`}>
                                                {tx.status.toLowerCase()}
                                            </span>
                                            <div className="text-[10px] text-gray-400 mt-1">
                                                {new Date(tx.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end">
                                                <TransactionActions id={tx.id} status={tx.status} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
