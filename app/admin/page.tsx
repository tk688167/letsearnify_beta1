import { getAnalytics } from "@/lib/analytics"
import { MainTrafficChart, DistributionChart, BarListChart } from "./components/charts"
import { StatsCard } from "./components/StatsCard"
import { LiveFeed } from "./components/LiveFeed"
import { UsersIcon, GlobeAltIcon, CursorArrowRaysIcon, AdjustmentsHorizontalIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

export default async function AdminDashboard(props: { searchParams: Promise<{ range?: '7d' | '30d' | '90d' }> }) {
  const searchParams = await props.searchParams
  const range = searchParams.range || '7d'
  const { overview, trafficData, deployment, recentActivity } = await getAnalytics(range)

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
            <p className="text-gray-500 mt-1 font-medium">Real-time platform intelligence & telemetry.</p>
         </div>
         
         <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            <FilterButton label="7 Days" active={range === '7d'} value="7d" />
            <FilterButton label="30 Days" active={range === '30d'} value="30d" />
            <FilterButton label="90 Days" active={range === '90d'} value="90d" />
         </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatsCard 
            title="Total Sessions" 
            value={overview.totalVisits.toLocaleString()} 
            icon={<CursorArrowRaysIcon className="w-6 h-6"/>} 
            color="blue" 
            trend="+12.5%"
         />
         <StatsCard 
            title="Unique Visitors" 
            value={overview.uniqueVisitors.toLocaleString()} 
            icon={<GlobeAltIcon className="w-6 h-6"/>} 
            color="purple" 
            trend="+8.2%"
         />
         <StatsCard 
            title="Active Signups" 
            value={overview.totalSignups.toLocaleString()} 
            icon={<UsersIcon className="w-6 h-6"/>} 
            color="emerald" 
            trend="+24%"
         />
         <StatsCard 
            title="Active Now" 
            value={overview.activeSessions} 
            icon={<AdjustmentsHorizontalIcon className="w-6 h-6"/>} 
            color="amber" 
            trend="Live"
         />
      </div>

      {/* Main Charts & Feed Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Left Column: Charts */}
         <div className="xl:col-span-2 space-y-8">
            {/* Traffic Chart */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-gray-900">Traffic Overview</h2>
                  <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400">
                     <ArrowPathIcon className="w-5 h-5" />
                  </button>
               </div>
               <MainTrafficChart data={trafficData} />
            </div>

            {/* Split Metrics */}
            <div className="grid md:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Device Breakdown</h2>
                  <DistributionChart data={deployment.devices} title="Devices" />
               </div>
               <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Browser Usage</h2>
                  <BarListChart data={deployment.browsers} />
               </div>
            </div>
         </div>

         {/* Right Column: Feed & Geo */}
         <div className="space-y-8">
            {/* Geo Map Placeholder (Using Bar List) */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
               <h2 className="text-lg font-bold text-gray-900 mb-6">Top Locations</h2>
               <BarListChart data={deployment.countries} />
            </div>

            {/* Live Feed */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex-1 min-h-[400px]">
               <div className="flex items-center gap-3 mb-8">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <h2 className="text-lg font-bold text-gray-900">Live Activity</h2>
               </div>
               <LiveFeed activities={recentActivity} />
            </div>
         </div>
      </div>
    </div>
  )
}

function FilterButton({ label, active, value }: { label: string, active: boolean, value: string }) {
   return (
      <Link 
        href={`?range=${value}`}
        scroll={false}
        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${active ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
      >
         {label}
      </Link>
   )
}
