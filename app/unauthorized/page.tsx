import Link from "next/link"
import { ShieldExclamationIcon } from "@heroicons/react/24/solid"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full text-center">
         <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-pulse">
            <ShieldExclamationIcon className="w-12 h-12" />
         </div>
         <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Access Denied</h1>
         <p className="text-gray-500 mb-8">
            You do not have the required permissions to view this page. This area is restricted to administrators only.
         </p>
         
         <div className="flex flex-col gap-3">
            <Link 
              href="/dashboard" 
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors"
            >
               Return to Dashboard
            </Link>
            <Link 
              href="/login" 
              className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
               Switch Account
            </Link>
         </div>
      </div>
    </div>
  )
}
