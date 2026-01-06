"use client"

import Link from "next/link"
import SignupForm from "../../components/auth/SignupForm"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function SignupPageContent() {
  const searchParams = useSearchParams()
  const refCode = searchParams.get("ref") || ""

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block">
            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-gray-900">
                Let'<span className="text-blue-600">$</span>Earnify
            </h1>
        </Link>
        <h2 className="mt-6 text-center text-xl font-bold text-gray-900 tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join thousands of earners today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
         <SignupForm referralCode={refCode} />
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <SignupPageContent />
    </Suspense>
  )
}
