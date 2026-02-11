"use client"

import React from "react"
import LandingHeader from "../../components/LandingHeader"
import Footer from "../../components/Footer"
import InlineBackButton from "../ui/InlineBackButton"
import { LockClosedIcon, EyeIcon, CircleStackIcon, ServerIcon } from "@heroicons/react/24/outline"

export default function PrivacyPageContent() {
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
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Privacy Policy</h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
                 Your privacy is not an option; it's a fundamental right. Here is how we protect it.
              </p>
              <div className="mt-8 text-sm text-gray-400">
                 Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
           </div>
        </section>

        {/* content Area */}
        <div className="max-w-4xl mx-auto px-6 space-y-12">
           
           <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                    <LockClosedIcon className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900">1. Data Collection & Usage</h2>
              </div>
              <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                 <p>
                    We collect only the minimum amount of data necessary to provide our services and comply with financial regulations (KYC/AML). This includes:
                 </p>
                 <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Identity Data:</strong> Name, email address, and country of residence.</li>
                    <li><strong>Financial Data:</strong> Wallet addresses and transaction history. We do <strong>not</strong> store credit card details directly; these are handled by our secure payment partners (Stripe/Binance Pay).</li>
                    <li><strong>Technical Data:</strong> IP address, browser type, and device information for security and fraud prevention.</li>
                 </ul>
              </div>
           </div>

           <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-fuchsia-50 rounded-xl text-fuchsia-600">
                    <EyeIcon className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Data</h2>
              </div>
              <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                 <p>
                    Your data is used strictly for:
                 </p>
                 <ul className="list-disc pl-5 space-y-2">
                    <li>Processing transactions and withdrawals.</li>
                    <li>Verifying identity to prevent fraud and multi-accounting.</li>
                    <li>Communicating critical account updates and security alerts.</li>
                    <li>Improving platform performance and user experience.</li>
                 </ul>
                 <p className="font-medium text-gray-900 pt-4">
                    We clearly promise: We will NEVER sell your personal data to advertisers or third parties.
                 </p>
              </div>
           </div>

           <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                    <CircleStackIcon className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900">3. Data Security</h2>
              </div>
              <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                 <p>
                    Accidents happen, but we don't leave security to chance. We employ:
                 </p>
                 <ul className="list-disc pl-5 space-y-2">
                    <li><strong>End-to-End Encryption:</strong> All sensitive data is encrypted in transit and at rest using industry-standard protocols.</li>
                    <li><strong>Access Controls:</strong> Strict internal access controls ensure only authorized personnel can handle sensitive data.</li>
                    <li><strong>Regular Audits:</strong> We conduct periodic security assessments to identify and patch vulnerabilities.</li>
                 </ul>
              </div>
           </div>

           <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                    <ServerIcon className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900">4. Your Rights</h2>
              </div>
              <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                 <p>
                    You have full control over your data. You have the right to:
                 </p>
                 <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Access:</strong> Request a copy of all personal data we hold about you.</li>
                    <li><strong>Correction:</strong> Update or correct any inaccurate information.</li>
                    <li><strong>Deletion:</strong> Request the permanent deletion of your account and associated data (subject to retention required by law).</li>
                 </ul>
                 <p className="pt-4">
                    To exercise these rights, please contact our Data Protection Officer at <a href="mailto:privacy@letsearnify.com" className="text-indigo-600 font-bold hover:underline">privacy@letsearnify.com</a>.
                 </p>
              </div>
           </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
