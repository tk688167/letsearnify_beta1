import { Metadata } from "next"
import LandingPageContent from "./components/pages/LandingPageContent"

export const metadata: Metadata = {
  title: "LetsEarnify (L-E-T-S Earnify) - Earn Online Rewards & Freelancing",
  description: "Join LetsEarnify, the trusted platform for earning money online. Complete tasks, offer freelance services, and participate in ethical referral programs. Trusted payouts.",
  alternates: {
    canonical: 'https://www.letsearnify.com',
  },
  keywords: ["LetsEarnify", "L-E-T-S Earnify", "earn online rewards", "referral program", "freelance marketplace", "trusted payouts", "make money online"],
  openGraph: {
    title: "LetsEarnify - Your Gateway to Digital Earnings",
    description: "Start earning today with tasks, freelancing, and referrals. Join thousands of satisfied members.",
    url: 'https://www.letsearnify.com',
    type: 'website',
  }
}

import React, { Suspense } from "react"
// ... imports

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50"></div>}>
       <LandingPageContent />
    </Suspense>
  )
}
