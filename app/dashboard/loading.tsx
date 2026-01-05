export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-10 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2"></div>
           <div className="h-4 w-64 bg-gray-100 rounded-lg"></div>
        </div>
        <div className="flex gap-3">
           <div className="h-10 w-28 bg-gray-200 rounded-xl"></div>
           <div className="h-10 w-28 bg-blue-100 rounded-xl"></div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
           <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 h-32">
              <div className="flex justify-between items-start mb-4">
                 <div className="w-10 h-10 rounded-xl bg-gray-100"></div>
                 <div className="w-12 h-5 rounded-full bg-green-50"></div>
              </div>
              <div className="h-8 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-32 bg-gray-100 rounded"></div>
           </div>
        ))}
      </div>

      {/* Info Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-gray-100 h-40"></div>
          <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-50 h-40"></div>
      </div>

      {/* Tier Progress Skeleton */}
      <div className="h-80 bg-gray-100 rounded-[2.5rem]"></div>
      
      {/* Pools Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-10">
         {[1, 2, 3, 4].map((i) => (
             <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100"></div>
         ))}
      </div>
    </div>
  )
}
