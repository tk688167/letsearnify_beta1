export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-10 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-40 sm:h-48 bg-gradient-to-r from-muted to-muted/50 rounded-2xl" />

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
           <div key={i} className="p-5 bg-card rounded-2xl border border-border h-28">
              <div className="flex justify-between items-start mb-3">
                 <div className="w-10 h-10 rounded-xl bg-muted" />
              </div>
              <div className="h-6 w-20 bg-muted rounded mb-2" />
              <div className="h-3 w-28 bg-muted/60 rounded" />
           </div>
        ))}
      </div>

      {/* Action Hub Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
           <div key={i} className="p-4 md:p-5 bg-card rounded-2xl border border-border h-24 md:h-28">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted mb-3" />
              <div className="h-4 w-16 bg-muted rounded mb-1" />
              <div className="h-3 w-12 bg-muted/60 rounded" />
           </div>
        ))}
      </div>

      {/* Info Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-card rounded-2xl border border-border h-40" />
          <div className="p-6 bg-card rounded-2xl border border-border h-40" />
      </div>

      {/* Tier Progress Skeleton */}
      <div className="h-72 bg-muted/30 rounded-[2rem] border border-border" />
      
      {/* Pools Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
         {[1, 2, 3, 4].map((i) => (
             <div key={i} className="h-44 bg-card rounded-2xl border border-border" />
         ))}
      </div>
    </div>
  )
}