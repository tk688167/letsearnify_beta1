
import { prisma } from "@/lib/prisma"
import { InformationCircleIcon } from "@heroicons/react/24/outline"

// Server Component for fetching and displaying pools
export async function CompanyPools() {
    const pools = await prisma.pool.findMany()
    
    const getPool = (name: string) => {
        const p = pools.find(p => p.name === name)
        return { 
            value: p ? `$${p.balance.toLocaleString()}` : "$0.00",
            percentage: (p as any)?.percentage || 0 
        }
    }

    const poolData = [
        { 
            name: "CBSP Pool", 
            key: "CBSP",
            ...getPool("CBSP"), 
            color: "bg-blue-500", 
            textColor: "text-blue-700",
            bgColor: "bg-blue-50",
            description: "Community Benevolent/Bonus System Pool. Accumulates a portion of referral commissions to reward top performers and fund special community events."
        },
        { 
            name: "Royalty Pool", 
            key: "Royalty",
            ...getPool("Royalty"), 
            color: "bg-purple-500",
            textColor: "text-purple-700",
            bgColor: "bg-purple-50", 
            description: "Dedicated rewarad pool for Gold, Platinum, Diamond, and Emerald tier members based on monthly performance qualifications."
        },
        { 
            name: "Reward Pool", 
            key: "Reward",
            ...getPool("Reward"), 
            color: "bg-orange-500", 
            textColor: "text-orange-700",
            bgColor: "bg-orange-50",
            description: "Funds tier-based achievement rewards. Users receive these rewards automatically upon reaching specific new tier milestones."
        },
        { 
            name: "Emergency Fund", 
            key: "Emergency",
            ...getPool("Emergency"), 
            color: "bg-red-500", 
            textColor: "text-red-700",
            bgColor: "bg-red-50",
            description: "Strategic reserve fund for emergency contingencies and company-specific payouts. Managed strictly by the administration."
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-5 duration-700 ease-out">
            {poolData.map((pool) => (
                <div key={pool.name} className="relative group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    {/* Background Gradient Splash */}
                    <div className={`absolute top-0 right-0 w-24 h-24 ${pool.bgColor} rounded-full blur-[40px] opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                               <div className={`w-10 h-10 rounded-xl ${pool.bgColor} ${pool.textColor} flex items-center justify-center shadow-inner`}>
                                   {/* Icon or Initial */}
                                   <span className="font-black text-lg">{pool.key.charAt(0)}</span>
                               </div>
                               <div>
                                   <h3 className="font-bold text-gray-900 text-sm font-serif leading-tight">{pool.name}</h3>
                                   <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">System Pool</span>
                               </div>
                            </div>
                            
                            {/* Tooltip Icon */}
                            <div className="relative">
                                    <InformationCircleIcon className="w-5 h-5 text-gray-300 cursor-help hover:text-gray-500 transition-colors" />
                                    {/* Tooltip Content */}
                                    <div className="absolute right-0 bottom-full mb-2 w-56 p-3 bg-gray-900/95 backdrop-blur-md text-white text-[11px] leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl border border-white/10 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                                        {pool.description}
                                        <div className="absolute top-full right-1 -mt-1 border-4 border-transparent border-t-gray-900/95"></div>
                                    </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 mb-4">
                             <div className="text-3xl font-serif font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                                {pool.value}
                             </div>
                             {pool.key === "CBSP" && (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 rounded-md border border-green-100 w-fit">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wide">Weekly 4% Distrib.</span>
                                </div>
                             )}
                             {pool.percentage > 0 && pool.key !== "CBSP" && (
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${pool.color} w-[${Math.min(pool.percentage, 100)}%] rounded-full`}></div>
                                    </div>
                                    <span className={`text-xs font-bold ${pool.textColor}`}>
                                        {pool.percentage}% Alloc
                                    </span>
                                </div>
                             )}
                        </div>
                        
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                            {pool.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
