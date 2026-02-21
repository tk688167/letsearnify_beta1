"use client"

import React from "react"
import LandingHeader from "../LandingHeader"
import Footer from "../layout/Footer"
import InlineBackButton from "../ui/InlineBackButton"

export default function TermsPageContent() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <LandingHeader />

      <main className="flex-1 pt-24 pb-24">
        {/* Back Navigation */}
        <div className="max-w-7xl mx-auto px-6">
           <InlineBackButton />
        </div>

        {/* Page Header */}
        <section className="py-16 px-6 text-center">
           <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Terms of Service</h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
                 Please read these terms carefully before using our platform.
              </p>
              <div className="mt-8 text-sm text-gray-400">
                  Last Updated: <span suppressHydrationWarning>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
           </div>
        </section>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto px-6 space-y-8">
           
           <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-100 prose prose-gray max-w-none">
              <h3>1. Acceptance of Terms</h3>
              <p>
                By accessing and using LetsEarnify, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
              </p>

              <h3>2. User Conduct</h3>
              <p>
                You agree not to use the platform for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the platform in any way that could damage the platform, the services, or the general business of LetsEarnify.
              </p>

              <h3>3. Earning & Withdrawals</h3>
              <p>
                Earnings are credited to your wallet upon successful completion of tasks. We reserve the right to audit and verify all tasks before processing withdrawals. Any attempt to manipulate the system or use automated bots will result in immediate account termination.
              </p>
              
              <h3>4. Limitation of Liability</h3>
              <p>
                LetsEarnify shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or the inability to use the service or for cost of procurement of substitute goods and services.
              </p>
           </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
