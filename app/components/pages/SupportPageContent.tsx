"use client"

import React from "react"
import LandingHeader from "../LandingHeader"
import Footer from "../layout/Footer"
import InlineBackButton from "../ui/InlineBackButton"
import { QuestionMarkCircleIcon, LifebuoyIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline"

export default function SupportPageContent() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <LandingHeader />

      <main className="flex-1 pt-24 pb-24">
        {/* Back Navigation */}
        <div className="max-w-7xl mx-auto px-6">
           <InlineBackButton />
        </div>

        {/* Page Header */}
        <section className="py-16 px-6 text-center">
           <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Help & Support</h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
                 Need assistance? We're here to help you succeed.
              </p>
           </div>
        </section>

        {/* Support Options */}
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-8">
           
           <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                <QuestionMarkCircleIcon className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ Center</h2>
              <p className="text-gray-600 mb-8">
                 Find answers to common questions about earnings, withdrawals, and account verification in our comprehensive knowledge base.
              </p>
              <a href="/faq" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                 Browse FAQs
              </a>
           </div>

           <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-900 mb-6 shadow-sm">
                <ChatBubbleLeftRightIcon className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Support</h2>
              <p className="text-gray-600 mb-8">
                 Can't find what you're looking for? Our support team is available 24/7 to assist you with any issues.
              </p>
              <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                 Contact Us
              </a>
           </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
