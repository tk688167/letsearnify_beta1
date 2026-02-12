import { prisma } from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"

export default async function SpinHistory({ userId }: { userId: string }) {
    const logs = await prisma.mLMLog.findMany({
        where: { 
            userId: userId,
            type: { in: ["SPIN_REWARD", "BONUS_SPIN"] }
        },
        orderBy: { createdAt: "desc" },
        take: 10
    })

    if (logs.length === 0) return <div className="text-gray-400 text-sm text-center italic py-4">No spin history yet.</div>

    return (
        <div className="space-y-3">
            {logs.map(log => (
                <div key={log.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-sm">
                    <div className="font-medium text-gray-900 truncate pr-2 flex-1">{log.description}</div>
                    <div className="text-gray-400 text-xs shrink-0 whitespace-nowrap">{formatDistanceToNow(log.createdAt, { addSuffix: true })}</div>
                </div>
            ))}
        </div>
    )
}
