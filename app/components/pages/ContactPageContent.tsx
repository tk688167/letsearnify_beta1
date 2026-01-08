"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import LandingHeader from "../../components/LandingHeader"
import Footer from "../../components/Footer"
import { EnvelopeIcon, ChatBubbleLeftRightIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline"

export default function ContactPageContent() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <LandingHeader />

      <main className="flex-1 pt-24">
        {/* Header Section */}
        <section className="relative py-20 px-6 bg-gray-50 overflow-hidden text-center">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             className="max-w-3xl mx-auto relative z-10"
           >
             <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
               Get in Touch
             </h1>
             <p className="text-lg md:text-xl text-gray-500 leading-relaxed">
               We value open communication. Reach out to us for partnerships, support, or general inquiries.
             </p>
           </motion.div>
        </section>

        <section className="py-20 px-6 md:px-12 bg-white">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-12">
             
             {/* Contact Info */}
             {/* Contact Info */}
             <div className="lg:col-span-1 space-y-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 h-full">
                   <h3 className="font-bold text-lg mb-6 text-gray-900 border-b border-gray-100 pb-4">Customer Support</h3>
                   
                   <div className="space-y-8">
                      <div className="flex items-start gap-4">
                         <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                            <EnvelopeIcon className="w-6 h-6" />
                         </div>
                         <div>
                            <div className="font-bold text-gray-900 text-sm">Email Support</div>
                            <p className="text-xs text-gray-500 mb-1">For general inquiries and account help.</p>
                            <a href="mailto:support@letsearnify.com" className="text-indigo-600 hover:underline text-sm font-medium">support@letsearnify.com</a>
                         </div>
                      </div>

                      <div className="flex items-start gap-4">
                         <div className="p-3 bg-green-50 text-green-600 rounded-xl shrink-0">
                            <ChatBubbleLeftRightIcon className="w-6 h-6" />
                         </div>
                         <div>
                            <div className="font-bold text-gray-900 text-sm">Live Chat</div>
                            <p className="text-xs text-gray-500 mb-1">Available for active members.</p>
                            <span className="text-xs text-green-600 font-bold block mt-1">24/7 Support via Dashboard</span>
                         </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-xl mt-8">
                        <h4 className="font-bold text-sm text-gray-900 mb-2">Response Time</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            We aim to respond to all inquiries within 24 hours. For faster assistance, please use the Live Chat widget inside your dashboard.
                        </p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Form */}
             <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-xl p-8 md:p-10">
                <div className="mb-8">
                   <h2 className="text-2xl font-bold text-gray-900 mb-2">General Inquiries</h2>
                </div>

                {submitted ? (
                  <div className="py-16 text-center">
                     <div className="text-4xl mb-4">✅</div>
                     <h3 className="text-2xl font-bold mb-2">Message Sent</h3>
                     <p className="text-gray-500">We'll respond to {formState.email} shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-sm font-bold text-gray-700 ml-1">Name</label>
                           <input 
                              type="text" 
                              name="name"
                              required
                              value={formState.name}
                              onChange={handleChange}
                              className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none bg-gray-50 focus:bg-white"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                           <input 
                              type="email" 
                              name="email"
                              required
                              value={formState.email}
                              onChange={handleChange}
                              className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none bg-gray-50 focus:bg-white"
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                        <textarea 
                           name="message"
                           required
                           rows={5}
                           value={formState.message}
                           onChange={handleChange}
                           className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none bg-gray-50 focus:bg-white"
                        ></textarea>
                     </div>
                     <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                     >
                        {isSubmitting ? "Sending..." : "Send Message"}
                     </button>
                  </form>
                )}
             </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
