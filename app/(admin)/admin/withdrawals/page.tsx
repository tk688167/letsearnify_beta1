export const dynamic = "force-dynamic";

import { getWithdrawalRequests } from "@/app/actions/admin/withdrawal"
import { getUsersWithActiveCooldown } from "@/app/actions/admin/timer"
import WithdrawalTable from "./withdrawal-table"
import CooldownManager from "./cooldown-manager"
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline"

export const metadata = {
    title: "Withdrawal Requests | Admin Portal",
}

export default async function WithdrawalPage() {
    const requests = await getWithdrawalRequests()
    const cooldownUsers = await getUsersWithActiveCooldown()

    const totalPending = requests.reduce((acc: number, r: any) => acc + r.amount, 0)

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red-100 dark:bg-red-500/10 rounded-xl">
                        <ArrowLeftOnRectangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Withdrawal Requests</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Review and approve user withdrawal requests.</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-6">
                {[
                    { label: "Pending", value: requests.length, color: "text-gray-900 dark:text-white" },
                    { label: "Total Pending", value: `$${totalPending.toFixed(2)}`, color: "text-gray-900 dark:text-white" },
                    { label: "Cooldowns", value: cooldownUsers.length, color: "text-orange-600 dark:text-orange-400" },
                ].map((s: any) => (
                    <div key={s.label} className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <div className="text-[10px] md:text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</div>
                        <div className={`text-xl md:text-3xl font-serif font-bold mt-1.5 ${s.color}`}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Cooldown Manager */}
            {cooldownUsers.length > 0 && <CooldownManager users={cooldownUsers} />}

            {/* Table */}
            <WithdrawalTable requests={requests} />
        </div>
    )
}
