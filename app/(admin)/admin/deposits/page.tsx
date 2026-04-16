export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import ImagePreviewToggle from "./ImagePreviewToggle"
import { MerchantDepositsClient } from "../merchant/deposits/client"
import DepositActionButtons from "./DepositActionButtons"

export default async function AdminDepositsPage(props: any) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") redirect("/dashboard");

    const searchParams = await props.searchParams;
    const tab = (searchParams?.tab || "trc20").toLowerCase();

    // TAB: MERCHANT
    if (tab === "merchant") {
        const transactions = await prisma.merchantTransaction.findMany({
            include: { user: { select: { id: true, name: true, email: true, memberId: true } } },
            orderBy: { createdAt: 'desc' }
        });

        return (
            <div className="p-4 md:p-8 space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 dark:text-white">Deposit Hub</h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Unified management portal for all incoming user deposits.</p>
                </div>
                
                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                    <Link href="?tab=trc20" className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'trc20' ? 'bg-white dark:bg-slate-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}>TRC20</Link>
                    <Link href="?tab=binance" className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'binance' ? 'bg-white dark:bg-slate-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}>Binance</Link>
                    <Link href="?tab=merchant" className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'merchant' ? 'bg-white dark:bg-slate-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}>Merchant</Link>
                </div>

                {/* Render the legacy client exactly unchanged. Because it has its own padding, we map it identically without losing structure */}
                <div className="-mx-4 md:-mx-8">
                    <MerchantDepositsClient transactions={JSON.parse(JSON.stringify(transactions))} />
                </div>
            </div>
        )
    }

    // TABS: TRC20 or BINANCE
    const methodFilter = tab === "binance" ? "BINANCE" : "TRC20%";

    const rawDeposits: any[] = await prisma.$queryRaw`
        SELECT 
            t.id, t.amount, t."txId", t.status, t.method, t."description", t."createdAt", t."userId",
            t."convertedAmount", t."exchangeRate", t."currency",
            u.name as "userName", u.email as "userEmail"
        FROM "Transaction" t
        JOIN "User" u ON t."userId" = u.id
        WHERE t.type = 'DEPOSIT' AND (t.method LIKE ${methodFilter} OR t.method = ${methodFilter})
        ORDER BY t."createdAt" DESC
    `;

    const deposits = rawDeposits.map((d: any) => ({
        id: d.id,
        amount: d.amount,
        txId: d.txId,
        status: d.status,
        method: d.method,
        description: d.description,
        createdAt: new Date(d.createdAt),
        user: { name: d.userName, email: d.userEmail },
        
        // Unified Currency fields
        convertedAmount: d.convertedAmount,
        exchangeRate: d.exchangeRate,
        currency: d.currency
    }));

    const pending = deposits.filter((d: any) => d.status === "PENDING");
    const history = deposits.filter((d: any) => d.status !== "PENDING");

    const getBinanceId = (description?: string | null) => {
        const match = description?.match(/Binance ID:\s*(.+)$/i)
        return match?.[1]?.trim() || null
    }

    const statusClass = (s: string) =>
        s === "COMPLETED" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400";

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 dark:text-white">Deposit Hub</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Unified management portal for all incoming user deposits.</p>
            </div>

            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                <Link href="?tab=trc20" className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'trc20' ? 'bg-white dark:bg-slate-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}>TRC20</Link>
                <Link href="?tab=binance" className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'binance' ? 'bg-white dark:bg-slate-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}>Binance</Link>
                <Link href="?tab=merchant" className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'merchant' ? 'bg-white dark:bg-slate-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}>Merchant</Link>
            </div>

            {/* ── Pending ── */}
            <section className="space-y-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Pending Approval</h2>
                    <span className="bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                    {pending.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">No pending {tab} deposits.</div>
                    ) : pending.map((d: any) => (
                        <div key={d.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white text-sm">{d.user.name}</div>
                                    <div className="text-xs text-gray-400 dark:text-slate-500">{d.user.email}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-green-600 dark:text-green-400 font-bold text-sm">${d.amount.toFixed(2)}</div>
                                    {d.convertedAmount && (
                                        <div className="text-[10px] text-gray-500 dark:text-slate-500 font-medium">
                                            {d.convertedAmount.toLocaleString()} {d.currency}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">
                                        {d.method === 'BINANCE' ? 'Proof & Binance ID' : 'TXID (TRC20)'}
                                    </span>
                                    {d.method === 'BINANCE' && <ImagePreviewToggle imageUrl={d.txId} />}
                                </div>
                                <div className="font-mono text-xs break-all text-gray-600 dark:text-slate-300">
                                    {d.method === 'BINANCE' ? `Proof Uploaded${getBinanceId(d.description) ? ` | ${getBinanceId(d.description)}` : ""}` : d.txId}
                                    {d.description?.includes("[VERIFIED") && (
                                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400">VERIFIED</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500 px-1">
                                <span>{new Date(d.createdAt).toLocaleString()}</span>
                                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded font-bold">{d.method}</span>
                            </div>
                            <div className="flex gap-2">
                                <DepositActionButtons transactionId={d.id} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-amber-50/50 dark:bg-amber-500/5 border-b border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 uppercase text-xs font-bold">
                                <tr>
                                    {["User","Amount","Network","TXID / PROOF","Submitted","Actions"].map((h: any) => (
                                        <th key={h} className={`px-6 py-3 ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {pending.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-slate-500">No pending {tab} deposits.</td></tr>
                                ) : pending.map((d: any) => (
                                    <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {d.user.name}<br /><span className="text-xs text-gray-400 dark:text-slate-500 font-normal">{d.user.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-green-600 dark:text-green-400 font-bold">${d.amount.toFixed(2)}</span>
                                                {d.convertedAmount && (
                                                    <span className="text-[10px] text-gray-500 dark:text-slate-500 font-medium">
                                                        {d.convertedAmount.toLocaleString()} {d.currency}
                                                    </span>
                                                )}
                                                {d.exchangeRate && (
                                                    <span className="text-[9px] text-gray-400 dark:text-slate-600 leading-tight">
                                                        Rate: 1 USD = {d.exchangeRate}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-md text-xs font-bold">{d.method}</span></td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-slate-400 max-w-[200px]">
                                            {d.method === 'BINANCE' ? (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate max-w-[80px]">Binance Proof</span>
                                                        <ImagePreviewToggle imageUrl={d.txId} />
                                                    </div>
                                                    {getBinanceId(d.description) && (
                                                        <span className="block text-[10px] text-gray-500 dark:text-slate-400 truncate" title={getBinanceId(d.description) || ""}>
                                                            ID: {getBinanceId(d.description)}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="truncate block" title={d.txId || ""}>{d.txId}</span>
                                            )}
                                            {d.description?.includes("[VERIFIED") && (
                                                <span className="mt-1 inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400">VERIFIED</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400 text-xs">{new Date(d.createdAt).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <DepositActionButtons transactionId={d.id} compact />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ── History ── */}
            <section className="space-y-3 opacity-80">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">History Log</h2>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                    {history.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">No history found.</div>
                    ) : history.map((d: any) => (
                        <div key={d.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 flex justify-between items-start gap-3">
                            <div className="min-w-0">
                                <div className="font-bold text-gray-900 dark:text-white text-sm truncate">{d.user.name}</div>
                                <div className="text-xs text-gray-400 dark:text-slate-500 truncate">{d.user.email}</div>
                                <div className="text-xs text-gray-400 dark:text-slate-600 mt-1">{new Date(d.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="font-bold text-gray-700 dark:text-slate-300 text-sm">${d.amount.toFixed(2)}</div>
                                <span className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusClass(d.status)}`}>{d.status}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-500 uppercase text-xs font-bold">
                                <tr>
                                    {["User","Amount","Network","TXID / PROOF","Date","Status"].map((h,i) => (
                                        <th key={h} className={`px-6 py-3 ${i===5?"text-right":""}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {history.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-slate-500">No history found.</td></tr>
                                ) : history.map((d: any) => (
                                    <tr key={d.id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {d.user.name}<br /><span className="text-xs text-gray-400 dark:text-slate-500 font-normal">{d.user.email}</span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-600 dark:text-slate-300">${d.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded text-xs font-bold">{d.method}</span></td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-400 dark:text-slate-500 max-w-[150px] truncate" title={d.txId || ""}>
                                            {d.method === "BINANCE" ? "Attached Proof" : d.txId}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 dark:text-slate-500 text-xs">{new Date(d.createdAt).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${statusClass(d.status)}`}>{d.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    )
}
