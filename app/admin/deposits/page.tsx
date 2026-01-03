
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { approveDeposit, rejectDeposit } from "@/app/actions/admin/deposits"
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"


export default async function AdminDepositsPage() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") redirect("/dashboard");

    // Workaround for Stale Client: Fetch deposits using Raw Query to ensure 'txId' is included.
    const rawDeposits: any[] = await prisma.$queryRaw`
        SELECT 
            t.id, t.amount, t."txId", t.status, t.method, t."description", t."createdAt", t."userId",
            u.name as "userName", u.email as "userEmail"
        FROM "Transaction" t
        JOIN "User" u ON t."userId" = u.id
        WHERE t.type = 'DEPOSIT' AND (t.method LIKE 'TRC20%' OR t.method LIKE 'BEP20%')
        ORDER BY t."createdAt" DESC
    `;

    // Map raw results to the shape expected by the UI
    const deposits = rawDeposits.map(d => ({
        id: d.id,
        amount: d.amount,
        txId: d.txId,
        status: d.status,
        method: d.method,
        description: d.description,
        createdAt: new Date(d.createdAt),
        user: {
            name: d.userName,
            email: d.userEmail
        }
    }));

    const pending = deposits.filter(d => d.status === "PENDING");
    const history = deposits.filter(d => d.status !== "PENDING");

    return (
        <div className="p-6 md:p-10 space-y-10">
            <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Deposit Requests</h1>
                <p className="text-gray-500">Manage and approve manual crypto deposits.</p>
            </div>

            {/* Pending Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    Pending Approval
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">{pending.length}</span>
                </h2>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-yellow-50/50 text-gray-500 uppercase text-xs font-bold font-mono">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Network</th>
                                    <th className="px-6 py-4">TXID</th>
                                    <th className="px-6 py-4">Submitted</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pending.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No pending deposits.</td>
                                    </tr>
                                ) : (
                                    pending.map((deposit: any) => (
                                        <tr key={deposit.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {deposit.user.name} <br/>
                                                <span className="text-xs text-gray-400 font-normal">{deposit.user.email}</span>
                                            </td>
                                            <td className="px-6 py-4 text-green-600 font-bold">${deposit.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold ring-1 ring-blue-100">{deposit.method}</span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500 max-w-[150px] truncate" title={deposit.txId || ''}>
                                                {deposit.txId}
                                                {deposit.description?.includes("[VERIFIED") && (
                                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
                                                        VERIFIED
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                {new Date(deposit.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <form action={async () => {
                                                        "use server"
                                                        await approveDeposit(deposit.txId!)
                                                    }}>
                                                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg text-xs font-bold transition shadow-sm hover:shadow-md">
                                                            <CheckCircleIcon className="w-4 h-4" /> Approve
                                                        </button>
                                                    </form>

                                                    <form action={async () => {
                                                        "use server"
                                                        await rejectDeposit(deposit.txId!, "Admin Rejected") 
                                                    }}>
                                                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-600 border border-gray-200 hover:bg-red-50 rounded-lg text-xs font-bold transition">
                                                            <XCircleIcon className="w-4 h-4" /> Reject
                                                        </button>
                                                    </form>
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

            {/* History Section */}
            <div className="space-y-4 opacity-75">
                <h2 className="text-xl font-bold text-gray-900">History Log</h2>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-400 uppercase text-xs font-bold font-mono">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Network</th>
                                    <th className="px-6 py-4">TXID</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No history found.</td>
                                    </tr>
                                ) : (
                                    history.map((deposit: any) => (
                                        <tr key={deposit.id} className="hover:bg-gray-50/30 transition-colors">
                                           <td className="px-6 py-4 font-medium text-gray-900">
                                                {deposit.user.name} <br/>
                                                <span className="text-xs text-gray-400 font-normal">{deposit.user.email}</span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-600">${deposit.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-bold">{deposit.method}</span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-400 max-w-[150px] truncate" title={deposit.txId || ''}>
                                                {deposit.txId}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-xs">
                                                {new Date(deposit.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                    deposit.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {deposit.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
