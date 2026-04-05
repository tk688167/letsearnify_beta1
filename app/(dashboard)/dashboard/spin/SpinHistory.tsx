import { prisma } from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"
import { TrophyIcon, GiftIcon, ReceiptRefundIcon, StarIcon } from "@heroicons/react/24/solid"

export default async function SpinHistory({ userId }: { userId: string }) {
    const logs = await prisma.mLMLog.findMany({
        where: { 
            userId: userId,
            type: { in: ["SPIN_REWARD", "BONUS_SPIN"] }
        },
        orderBy: { createdAt: "desc" },
        take: 10
    })

    if (logs.length === 0) return (
        <div className="flex flex-col items-center justify-center py-10 opacity-40">
            <GiftIcon className="w-12 h-12 mb-3" />
            <p className="text-xs font-black uppercase tracking-widest italic">Inventory Empty</p>
        </div>
    )

    const getIcon = (description: string) => {
        const desc = description.toUpperCase();
        if (desc.includes("ARN")) return <StarIcon className="w-5 h-5 text-amber-500" />
        if (desc.includes("SPIN")) return <ReceiptRefundIcon className="w-5 h-5 text-indigo-500" />
        if (desc.includes("BONUS")) return <GiftIcon className="w-5 h-5 text-purple-500" />
        return <TrophyIcon className="w-5 h-5 text-emerald-500" />
    }

    return (
        <div className="space-y-4">
            {logs.map((log: any, index: number) => (
                <div 
                    key={log.id} 
                    className="group flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none animate-in fade-in slide-in-from-right-5 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        {getIcon(log.description)}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                        <div className="font-black text-slate-900 dark:text-white text-sm tracking-tight truncate uppercase italic">
                            {log.description}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                        </div>
                    </div>
                    
                    <div className="shrink-0">
                        <div className="w-2 h-2 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
