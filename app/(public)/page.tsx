import { Metadata } from "next"
import LandingPageContent from "@/app/components/pages/LandingPageContent"

export const metadata: Metadata = {
  title: "LetsEarnify - The Premier Digital Earning Ecosystem",
  description: "Join the regulated hybrid economy. Earn from micro-tasks, professional freelancing, and institutional-grade profit pools. Start your journey with just $1.",
  alternates: {
    canonical: 'https://www.letsearnify.com',
  },
  keywords: ["LetsEarnify", "digital wealth", "referral income", "freelance marketplace", "fintech earning", "make money online"],
  openGraph: {
    title: "LetsEarnify - Professional Digital Earning",
    description: "One Account. Diversified Income Streams. Join the future of digital wealth generation.",
    url: 'https://www.letsearnify.com',
    type: 'website',
  }
}

import React, { Suspense } from "react"
// ... imports

import { getSocialProofStats, getPayoutProofs } from "@/app/actions/admin/social-proof"

export default async function LandingPage() {
  const stats = await getSocialProofStats()
  const proofs = await getPayoutProofs()

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50"></div>}>
       <LandingPageContent initialStats={stats} initialProofs={proofs} />
    </Suspense>
  )
}
