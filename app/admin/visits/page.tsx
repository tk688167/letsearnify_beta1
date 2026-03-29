import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { GlobeAltIcon, DevicePhoneMobileIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline"

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

       <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
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
                      <tr key={visit.id} className="hover:bg-gray-50/50 transition-colors">
                         <td className="p-6">
                            <div className="flex items-center gap-3">
                               <div className="text-gray-400">
                                  {visit.device === 'Mobile' ? <DevicePhoneMobileIcon className="w-5 h-5"/> : <ComputerDesktopIcon className="w-5 h-5"/>}
                               </div>
                               <div>
                                  <div className="font-bold text-gray-900 text-sm">{visit.ip}</div>
                                  <div className="text-xs text-gray-500">{visit.os} • {visit.browser}</div>
                               </div>
                            </div>
                         </td>
                         <td className="p-6">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                               <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                               {visit.city && visit.country ? `${visit.city}, ${visit.country}` : 'Unknown Location'}
                            </div>
                         </td>
                         <td className="p-6">
                             <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-600">
                                {visit.path}
                             </span>
                         </td>
                         <td className="p-6 text-sm">
                            {visit.user ? (
                               <span className="text-blue-600 font-medium">{visit.user.email}</span>
                            ) : (
                               <span className="text-gray-400 italic">Anonymous</span>
                            )}
                         </td>
                         <td className="p-6 text-right text-sm text-gray-500 font-mono">
                            {format(visit.createdAt, 'HH:mm:ss')} <br/>
                            <span className="text-xs text-gray-400">{format(visit.createdAt, 'MMM dd')}</span>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  )
}
