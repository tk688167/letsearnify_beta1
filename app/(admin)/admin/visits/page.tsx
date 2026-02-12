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
    <div className="p-6 md:p-10 min-h-screen bg-gray-50/50">
       <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-3xl font-serif font-bold text-gray-900">Visitor Logs</h1>
             <p className="text-gray-500 mt-1">Raw telemetry data from the last 50 visits.</p>
          </div>
       </div>

       <div className="space-y-4">
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
              {visits.map(visit => (
                  <div key={visit.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                      <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                                  {visit.device === 'Mobile' ? <DevicePhoneMobileIcon className="w-5 h-5"/> : <ComputerDesktopIcon className="w-5 h-5"/>}
                              </div>
                              <div>
                                  <div className="font-bold text-gray-900 text-sm">{visit.ip}</div>
                                  <div className="text-xs text-gray-400 break-all">{visit.user?.email || "Anonymous"}</div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="font-mono text-xs font-bold text-gray-600">{format(visit.createdAt, 'HH:mm')}</div>
                              <div className="text-[10px] text-gray-400">{format(visit.createdAt, 'MMM dd')}</div>
                          </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-600">
                              <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                              <span className="max-w-[150px] truncate">{visit.city && visit.country ? `${visit.city}, ${visit.country}` : 'Unknown'}</span>
                          </div>
                          <span className="px-2 py-1 bg-gray-100 rounded font-mono text-gray-500">
                              {visit.path}
                          </span>
                      </div>
                      
                      <div className="text-[10px] text-gray-400 font-mono text-center pt-1">
                          {visit.os} • {visit.browser}
                      </div>
                  </div>
              ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                         <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Device & IP</th>
                         <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Location</th>
                         <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Path</th>
                         <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                         <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Time</th>
                      </tr>
                   </thead>
               <tbody className="divide-y divide-gray-50">
                  {visits.map(visit => (
                     <VisitRow key={visit.id} visit={visit} />
                  ))}
               </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  )
}
