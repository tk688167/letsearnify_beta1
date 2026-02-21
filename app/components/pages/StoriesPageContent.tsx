"use client"

import React from "react"
import LandingHeader from "../LandingHeader"
import Footer from "../layout/Footer"
import InlineBackButton from "../ui/InlineBackButton"
import { StarIcon } from "@heroicons/react/24/solid"

const stories = [
  {
    name: "Sarah Jenkins",
    role: "Freelancer",
    content: "LetsEarnify has completely changed how I manage my side income. The tasks are easy to complete, and the payouts are incredibly fast.",
    rating: 5,
    location: "United Kingdom"
  },
  {
    name: "Michael Chen",
    role: "Student",
    content: "I started using this platform to pay for my textbooks. Now it covers my rent too! The referral program is generous and transparent.",
    rating: 5,
    location: "Canada"
  },
  {
    name: "Amara Okeke",
    role: "Digital Nomad",
    content: "Best earning platform I've found. No hidden fees, no impossible thresholds. Just honest work for honest pay.",
    rating: 5,
    location: "Nigeria"
  }
]

export default function StoriesPageContent() {
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
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Success Stories</h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
                 Read what our community has to say about their earning journey.
              </p>
           </div>
        </section>

        {/* Stories Grid */}
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
           {stories.map((story, index) => (
             <div key={index} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col h-full">
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(story.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 flex-1 italic">"{story.content}"</p>
                <div className="mt-auto">
                   <h3 className="font-bold text-gray-900">{story.name}</h3>
                   <div className="text-sm text-gray-400">{story.role} • {story.location}</div>
                </div>
             </div>
           ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
