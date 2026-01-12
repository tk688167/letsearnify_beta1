'use client' // Error components must be Client Components
 
import { useEffect } from 'react'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-6 max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
        </div>
        
        <div>
            <h2 className="text-2xl font-bold text-gray-900 font-serif">Something went wrong!</h2>
            <p className="text-gray-500 mt-2 text-sm text-balance">
                We apologize for the inconvenience. A notification has been sent to our technical team.
            </p>
        </div>
        
        <div className="pt-2">
            <button
                onClick={
                // Attempt to recover by trying to re-render the segment
                () => reset()
                }
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-gray-900 hover:bg-black transition-all"
            >
                Try again
            </button>
        </div>
      </div>
    </div>
  )
}
