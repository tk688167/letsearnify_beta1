import { prisma } from "@/lib/prisma"
import { DailyPoolsAdminClient } from "./DailyPoolsAdminClient"

export const metadata = {
  title: "Daily Earnings Pools | Admin Portal",
}

export default async function DailyPoolsAdminPage() {
    const pools = await prisma.dailyEarningInvestment.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    memberId: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Daily Earnings Pool Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Monitor all user pools, earnings, and expiry dates.</p>
                </div>
            </div>

            <DailyPoolsAdminClient pools={pools} />
        </div>
    )
}
