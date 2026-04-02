import { prisma } from "@/lib/prisma"
import { DailyPoolsAdminClient } from "./DailyPoolsAdminClient"
import { SparklesIcon } from "@heroicons/react/24/outline"

export const metadata = {
  title: "Daily Earning Pools | Admin Portal",
}

export default async function DailyPoolsAdminPage() {
    const pools = await prisma.dailyEarningInvestment.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    memberId: true,
                    image: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        Daily Earning Pools
                        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 text-xs font-bold px-2 py-1 rounded-md">
                            Live System
                        </span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-2xl text-sm">
                        Monitor active investments, track 1% daily yield distributions, and manage user lock periods across the entire platform ecosystem.
                    </p>
                </div>
            </div>

            <DailyPoolsAdminClient pools={pools} />
        </div>
    )
}
