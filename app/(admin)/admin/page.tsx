import { getAnalytics } from "@/lib/analytics"
import { MainTrafficChart, DistributionChart, BarListChart } from "./components/charts"
import { StatsCard } from "./components/StatsCard"
import { LiveFeed } from "./components/LiveFeed"
import { AdminStatsGrid } from "./components/AdminStatsGrid"
import { DashboardFilterBar } from "./components/DashboardFilterBar"
import { UsersIcon, GlobeAltIcon, CursorArrowRaysIcon, AdjustmentsHorizontalIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import { Suspense } from "react"

export default async function AdminDashboard(props: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>
}) {
  const searchParams = await props.searchParams
  const rawRange = searchParams.range || "7d"
  const from = searchParams.from
  const to = searchParams.to

  // Only pass known preset ranges to getAnalytics; custom uses from/to
  const presetRange = (["7d", "30d", "90d"].includes(rawRange) ? rawRange : "7d") as "7d" | "30d" | "90d"
  const custom = rawRange === "custom" && from && to ? { from, to } : undefined

  const { overview, trafficData, deployment, recentActivity } = await getAnalytics(presetRange, custom)

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 p-3 md:p-8 space-y-4 md:space-y-6 transition-colors duration-200">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-gray-900 dark:text-white tracking-tight">
            Executive Dashboard
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-0.5 text-xs md:text-sm">
            Real-time platform intelligence &amp; telemetry.
          </p>
        </div>

        {/* Filter bar — wrapped in Suspense because it uses useSearchParams internally */}
        <Suspense fallback={null}>
          <DashboardFilterBar
            initialRange={rawRange}
            initialFrom={from}
            initialTo={to}
          />
        </Suspense>
      </div>

      {/* ── Platform Financials (auto-polls) ── */}
      <AdminStatsGrid />

      {/* ── Traffic KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatsCard
          title="Sessions"
          value={overview.totalVisits.toLocaleString()}
          icon={<CursorArrowRaysIcon className="w-5 h-5" />}
          color="blue"
          trend="+12.5%"
          compact
        />
        <StatsCard
          title="Visitors"
          value={overview.uniqueVisitors.toLocaleString()}
          icon={<GlobeAltIcon className="w-5 h-5" />}
          color="purple"
          trend="+8.2%"
          compact
        />
        <StatsCard
          title="Signups"
          value={overview.totalSignups.toLocaleString()}
          icon={<UsersIcon className="w-5 h-5" />}
          color="emerald"
          trend="+24%"
          compact
        />
        <StatsCard
          title="Active Now"
          value={overview.activeSessions}
          icon={<AdjustmentsHorizontalIcon className="w-5 h-5" />}
          color="amber"
          trend="Live"
          compact
        />
      </div>

      {/* ── Charts & Feed ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">

        {/* Left: Charts */}
        <div className="xl:col-span-2 space-y-4">
          {/* Traffic Chart */}
          <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/60">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Traffic Overview</h2>
              <button className="p-1.5 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-400 dark:text-slate-600">
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </div>
            <MainTrafficChart data={trafficData} />
          </div>

          {/* Device & Browser breakdown — horizontal scroll on xs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/60">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Device Breakdown</h2>
              <DistributionChart data={deployment.devices} title="Devices" />
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/60">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Browser Usage</h2>
              <BarListChart data={deployment.browsers} />
            </div>
          </div>
        </div>

        {/* Right: Geo + Feed */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/60">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Top Locations</h2>
            <BarListChart data={deployment.countries} />
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/60 min-h-[280px]">
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Live Activity</h2>
            </div>
            <LiveFeed activities={recentActivity} />
          </div>
        </div>
      </div>
    </div>
  )
}
