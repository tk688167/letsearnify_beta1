import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-6 max-w-lg">
        <h1 className="text-9xl font-black text-gray-200">404</h1>
        <div className="-mt-16 relative z-10">
             <h2 className="text-3xl font-bold text-gray-900 font-serif">Page Not Found</h2>
             <p className="text-gray-500 mt-2">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
             </p>
        </div>
        
        <div className="pt-4">
            <Link href="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/20">
              Return Home
            </Link>
        </div>
      </div>
    </div>
  )
}
