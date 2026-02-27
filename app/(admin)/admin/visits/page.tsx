export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { GlobeAltIcon, DevicePhoneMobileIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline"
import VisitRow from "./VisitRow"

export default async function AdminVisitsPage() {
  const visits = await prisma.visit.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } }
  })

  return (
    <div className="p-4 md:p-8 space-y-6">
        <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Visitor Logs</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Raw telemetry from the last 50 visits.</p>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
            {visits.map(visit => (
                <div key={visit.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-gray-500 dark:text-slate-400">
                                {visit.device === 'Mobile'
                                    ? <DevicePhoneMobileIcon className="w-4 h-4" />
                                    : <ComputerDesktopIcon className="w-4 h-4" />}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white text-sm">{visit.ip}</div>
                                <div className="text-xs text-gray-400 dark:text-slate-500 break-all">{visit.user?.email || "Anonymous"}</div>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <div className="font-mono text-xs font-bold text-gray-600 dark:text-slate-300">{format(visit.createdAt, 'HH:mm')}</div>
                            <div className="text-[10px] text-gray-400 dark:text-slate-500">{format(visit.createdAt, 'MMM dd')}</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400">
                            <GlobeAltIcon className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                            <span className="max-w-[130px] truncate">
                                {visit.city && visit.country ? `${visit.city}, ${visit.country}` : 'Unknown'}
                            </span>
                        </div>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded font-mono text-gray-500 dark:text-slate-400 text-[10px] max-w-[90px] truncate">
                            {visit.path}
                        </span>
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-slate-600 font-mono text-center">{visit.os} • {visit.browser}</div>
                </div>
            ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                            {["Device & IP","Location","Path","User","Time"].map((h,i) => (
                                <th key={h} className={`p-6 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider ${i===4?"text-right":""}`}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                        {visits.map(visit => (
                            <VisitRow key={visit.id} visit={visit} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  )
}
