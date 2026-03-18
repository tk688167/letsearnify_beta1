
import { PoolManagerCard } from "@/app/(admin)/admin/components/PoolManagerCard"
import { getPools } from "@/app/actions/admin/pools"
import Link from "next/link"
import { ChartBarIcon, ArrowRightIcon } from "@heroicons/react/24/outline"

export const dynamic = 'force-dynamic'

export default async function AdminPoolsPage() {
    const pools = await getPools()
    
    // Ensure all 4 pools exist in the list (fallback if DB empty for some reason, though seed should handle it)
    // Order: CBSP, Royalty, Reward, Emergency
    const orderedNames = ["CBSP", "Royalty", "Reward", "Emergency"]
    const displayPools = orderedNames.map(name => 
        pools.find(p => p.name === name) || { name, balance: 0, percentage: 0 }
    )

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Pool Management</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage system pool balances and percentage allocations.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {displayPools.map((pool) => (
                    <PoolManagerCard key={pool.name} pool={pool} />
                ))}
            </div>

            <div className="mt-8">
                <Link href="/admin/pools/daily-earning" className="group block">
                    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-900 rounded-[2rem] p-6 lg:p-8 border border-indigo-500/20 shadow-lg hover:shadow-indigo-500/10 transition-all relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <ChartBarIcon className="w-32 h-32 text-indigo-400" />
                        </div>
                        
                        <div className="flex items-center gap-4 relative z-10 max-w-2xl">
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-indigo-400/30">
                                <ChartBarIcon className="w-8 h-8 text-indigo-300" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Daily Earning Pool Dashboard</h2>
                                <p className="text-indigo-100/70 text-sm leading-relaxed">
                                    Monitor all active 30-day locks globally. Track total system liabilities, historical 1% compound payouts, and manage user withdrawals.
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 shrink-0">
                            <div className="flex items-center gap-2 px-6 py-3 bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-bold rounded-xl group-hover:bg-indigo-500/30 transition-colors">
                                Open Dashboard
                                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-400">
                <strong>Note:</strong> Updates made here are immediately reflected on the user dashboard. All actions are logged.
            </div>
        </div>
    )
}
