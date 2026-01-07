export default function WelcomeLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-pulse">
        {/* Header Skeleton */}
        <div className="max-w-7xl mx-auto px-6 py-32 md:py-48 space-y-16">
            <div className="flex flex-col items-center space-y-8">
                <div className="w-32 h-8 bg-gray-200 rounded-full"></div>
                <div className="w-3/4 h-20 bg-gray-200 rounded-3xl"></div>
                <div className="w-1/2 h-8 bg-gray-200 rounded-xl"></div>
                <div className="w-48 h-16 bg-gray-900/10 rounded-[1.5rem] mt-8"></div>
            </div>

            {/* Slider Skeleton */}
            <div className="w-full h-24 bg-gray-900/50 rounded-none border-y border-gray-900/10"></div>

            {/* Features Skeleton */}
            <div className="space-y-8">
                <div className="w-1/2 h-12 bg-gray-200 rounded-2xl mx-auto"></div>
                <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-gray-100 rounded-[2rem]"></div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  )
}
