"use client"

import React from "react"
import LandingHeader from "../LandingHeader"
import Footer from "../layout/Footer"
import InlineBackButton from "../ui/InlineBackButton"
import { ShieldCheckIcon, LockClosedIcon, ServerIcon, KeyIcon } from "@heroicons/react/24/outline"

export default function SecurityPageContent() {
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
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Security Center</h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
                 Your funds and data are protected by bank-grade security protocols.
              </p>
           </div>
        </section>

        {/* Content Area */}
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8">
           
           <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                    <ShieldCheckIcon className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900">Account Protection</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                 We use multi-factor authentication (2FA) and real-time login monitoring to prevent unauthorized access. All sensitive actions require email verification.
              </p>
           </div>

           <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-fuchsia-50 rounded-xl text-fuchsia-600">
                    <LockClosedIcon className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900">Data Encryption</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                 Your personal data is encrypted at rest and in transit using military-grade AES-256 encryption. We never store plain-text passwords.
              </p>
           </div>

           <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                    <ServerIcon className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900">Secure Infrastructure</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                 Our servers are hosted in secure data centers with 24/7 monitoring, DDoS protection, and automated backups to ensure 99.9% uptime.
              </p>
           </div>

           <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                    <KeyIcon className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900">Wallet Security</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                 Funds are kept in cold storage wallets. Internal transfers employ strict approval workflows to prevent fraud and theft.
              </p>
           </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
