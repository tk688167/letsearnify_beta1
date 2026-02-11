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

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    <div className="p-3 bg-red-100 rounded-xl">
                        <ArrowLeftOnRectangleIcon className="w-8 h-8 text-red-600" />
                    </div>
                    Withdrawal Requests
                </h1>
                <p className="text-gray-500 mt-2 max-w-2xl">
                    Review and approve user withdrawal requests. Approved amounts are deducted from user balance.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pending Requests</div>
                    <div className="text-4xl font-serif font-bold text-gray-900 mt-2">{requests.length}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Amount Pending</div>
                    <div className="text-4xl font-serif font-bold text-gray-900 mt-2">
                        ${requests.reduce((acc, r) => acc + r.amount, 0).toFixed(2)}
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Cooldowns</div>
                    <div className="text-4xl font-serif font-bold text-orange-600 mt-2">
                        {cooldownUsers.length}
                    </div>
                </div>
            </div>
            
            {/* Cooldown Manager */}
            {cooldownUsers.length > 0 && <CooldownManager users={cooldownUsers} />}

            {/* Table */}
            <WithdrawalTable requests={requests} />
        </div>
    )
}
