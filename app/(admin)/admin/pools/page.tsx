
import { PoolManagerCard } from "@/app/(admin)/admin/components/PoolManagerCard"
import { getPools } from "@/app/actions/admin/pools"

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
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-serif font-bold text-gray-900">Pool Management</h1>
                <p className="text-gray-500">Manage system pool balances and percentage allocations.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayPools.map((pool) => (
                    <PoolManagerCard key={pool.name} pool={pool} />
                ))}
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                <strong>Note:</strong> Updates made here are immediately reflected on the user dashboard. All actions are logged.
            </div>
        </div>
    )
}
