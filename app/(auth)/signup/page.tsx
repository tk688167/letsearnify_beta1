"use client"

import Link from "next/link"
import SignupForm from "../../components/auth/SignupForm"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Logo from "@/app/components/ui/Logo"

function SignupPageContent() {
  const searchParams = useSearchParams()
  const refCode = searchParams.get("ref") || ""

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo size="xl" />
        <h2 className="mt-6 text-center text-xl font-bold text-foreground tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
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
