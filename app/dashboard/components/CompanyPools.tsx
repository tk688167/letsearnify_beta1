
import { 
    BanknotesIcon, 
    SparklesIcon, 
    ShieldCheckIcon, 
    ChartBarIcon, 
    InformationCircleIcon,
    ArrowTrendingUpIcon,
    UsersIcon,
    GiftIcon
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils";

export function CompanyPools({ pools }: { pools: any[] }) {
    
    // Helper to format currency
    const formatMoney = (amount: number) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const getPoolData = (key: string) => {
        const pool = pools.find(p => p.name === key);
        return {
            balance: pool ? pool.balance : 0,
            formatted: pool ? formatMoney(pool.balance) : "$0.00"
        }
    }

    const poolConfig = [
        { 
            key: "CBSP", 
            name: "CBSP Pool",
            subtitle: "Global Profit Share",
            icon: UsersIcon,
            theme: "blue",
            accent: "from-blue-500 to-indigo-600",
            bg: "bg-blue-50",
            text: "text-blue-900",
            allocation: "5% of All Deposits",
            distribution: "Weekly (3%)",
            qualification: "Active Member",
            features: ["Auto-Distribution", "Community Funded"],
            data: getPoolData("CBSP")
        },
        { 
            key: "Royalty", 
            name: "Royalty Pool",
            subtitle: "Elite Performance Reward",
            icon: SparklesIcon,
            theme: "purple",
            accent: "from-purple-500 to-fuchsia-600",
            bg: "bg-purple-50",
            text: "text-purple-900",
            allocation: "Dynamic Allocation",
            distribution: "Monthly",
            qualification: "Gold Tier & Above",
            features: ["High-Yield", "Tier Multipliers"],
            data: getPoolData("Royalty")
        },
        { 
            key: "Reward", 
            name: "Achievement Pool",
            subtitle: "Milestone Bounties",
            icon: GiftIcon,
            theme: "amber",
            accent: "from-amber-400 to-orange-500",
            bg: "bg-amber-50",
            text: "text-amber-900",
            allocation: "System Generated",
            distribution: "Instant",
            qualification: "Rank Upgrades",
            features: ["Instant Payout", "One-time Bonus"],
            data: getPoolData("Reward")
        },
        { 
            key: "Emergency", 
            name: "Reserve Fund",
            subtitle: "Strategic Safety Net",
            icon: ShieldCheckIcon,
            theme: "emerald",
            accent: "from-emerald-500 to-teal-600",
            bg: "bg-emerald-50",
            text: "text-emerald-900",
            allocation: "Admin Discretion",
            distribution: "Contingency",
            qualification: "Strictly Controlled",
            features: ["Risk Management", "Liquidity Cover"],
            data: getPoolData("Emergency")
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {poolConfig.map((pool) => (
                <div 
                    key={pool.key} 
                    className="group relative bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                    {/* Top Decorative Line */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${pool.accent}`}></div>

                    {/* Background Pattern */}
                    <div className={`absolute top-0 right-0 w-32 h-32 ${pool.bg} rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -mr-10 -mt-10`}></div>
                    
                    <div className="relative z-10 p-6 flex flex-col h-full">
                        
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${pool.accent} text-white shadow-lg shadow-${pool.theme}-500/20 group-hover:scale-110 transition-transform duration-300`}>
                                 <pool.icon className="w-6 h-6" />
                             </div>
                             <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${pool.bg.replace('bg-', 'border-').replace('50', '100')} ${pool.text} bg-opacity-50`}>
                                 {pool.qualification}
                             </div>
                        </div>

                        {/* Title & Amount */}
                        <div className="mb-6">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{pool.subtitle}</h3>
                            <h2 className="text-xl font-bold text-gray-900 font-serif leading-none mb-2">{pool.name}</h2>
                            <div className={`text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${pool.accent}`}>
                                {pool.data.formatted}
                            </div>
                        </div>

                        {/* Details Divider */}
                        <div className="border-t border-gray-100 my-auto mb-4"></div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                            <div>
                                <div className="text-gray-400 font-medium mb-0.5">Allocation</div>
                                <div className="font-bold text-gray-700">{pool.allocation}</div>
                            </div>
                            <div>
                                <div className="text-gray-400 font-medium mb-0.5">Frequency</div>
                                <div className="font-bold text-gray-700">{pool.distribution}</div>
                            </div>
                        </div>
                        
                        {/* Hover Overlay Features */}
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gray-50/90 backdrop-blur-sm border-t border-gray-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between gap-2">
                            {pool.features.map((feature, i) => (
                                <div key={i} className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold text-gray-600 bg-white py-2 rounded-lg border border-gray-200 shadow-sm">
                                    <SparklesIcon className="w-3 h-3 text-amber-500" />
                                    {feature}
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            ))}
        </div>
    )
}
