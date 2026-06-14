export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center">
        {/* Animated Rings */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-100 opacity-30"></div>
        <div className="relative w-16 h-16 rounded-full border-4 border-transparent border-t-indigo-600 border-r-fuchsia-600 animate-spin"></div>
        
        {/* Brand Pulse */}
        <div className="mt-8 text-sm font-bold tracking-widest text-indigo-900 uppercase animate-pulse">
            Loading Let'$Earnify
        </div>
      </div>
    </div>
  )
}
