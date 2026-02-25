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
    <div className="min-h-screen bg-background relative flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-amber-500/5 rounded-full blur-[80px]"></div>
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Logo size="xl" />
        <h2 className="mt-8 text-center text-3xl font-serif font-bold text-foreground tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-center text-base text-muted-foreground">
          Join thousands of earners today
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
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
