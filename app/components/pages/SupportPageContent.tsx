"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import LandingHeader from "../../components/LandingHeader"
import { EnvelopeIcon, ChatBubbleLeftRightIcon, ClockIcon, ShieldCheckIcon } from "@heroicons/react/24/outline"

export default function SupportPageContent() {
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
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white to-gray-50 -z-10"></div>
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
           
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             className="max-w-3xl mx-auto"
           >
             <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
               We're Here to Help
             </h1>
             <p className="text-lg md:text-xl text-gray-500 leading-relaxed">
               Have a question about your account, earnings, or our platform? Our dedicated support team is ready to assist you.
             </p>
           </motion.div>
        </section>

        <section className="py-20 px-6 md:px-12 bg-white relative z-10 -mt-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-12">
             
             {/* Contact Information & Trust Side */}
             <div className="lg:col-span-1 space-y-8">
                {/* Official Channels */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50"
                >
                   <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                     <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                     Official Channels
                   </h3>
                   
                   <div className="space-y-6">
                      <div className="flex items-start gap-4">
                         <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <EnvelopeIcon className="w-6 h-6" />
                         </div>
                         <div>
                            <div className="font-bold text-gray-900 text-sm">Email Support</div>
                            <a href="mailto:support@letsearnify.com" className="text-indigo-600 hover:underline text-sm font-medium">support@letsearnify.com</a>
                            <div className="text-xs text-gray-400 mt-1">For general inquiries & verification</div>
                         </div>
                      </div>

                      <div className="flex items-start gap-4">
                         <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <ChatBubbleLeftRightIcon className="w-6 h-6" />
                         </div>
                         <div>
                            <div className="font-bold text-gray-900 text-sm">Live Chat / WhatsApp</div>
                            <div className="text-gray-500 text-sm">Available for active members</div>
                            <div className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online Now
                            </div>
                         </div>
                      </div>
                   </div>
                </motion.div>

                {/* Availability & Trust */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden"
                >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-2xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                   
                   <h3 className="font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
                     <ClockIcon className="w-5 h-5 text-indigo-400" />
                     Response Time
                   </h3>
                   
                   <ul className="space-y-4 relative z-10 text-sm text-gray-300">
                      <li className="flex justify-between border-b border-gray-800 pb-2">
                        <span>General Support</span>
                        <span className="text-white font-medium">Within 24 Hours</span>
                      </li>
                      <li className="flex justify-between border-b border-gray-800 pb-2">
                        <span>Payment Issues</span>
                        <span className="text-white font-medium">Priority (1-4 Hours)</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Account Security</span>
                        <span className="text-white font-medium">Immediate</span>
                      </li>
                   </ul>

                   <div className="mt-8 pt-6 border-t border-gray-800 text-xs text-gray-400 flex items-start gap-3">
                      <ShieldCheckIcon className="w-8 h-8 text-green-400 shrink-0" />
                      <p>
                        We respond to all genuine inquiries. Our support team is human and values your trust. Please avoid submitting duplicate tickets.
                      </p>
                   </div>
                </motion.div>
             </div>

             {/* Contact Form */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-xl p-8 md:p-10"
             >
                <div className="mb-8">
                   <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
                   <p className="text-gray-500">Fill out the form below and we'll get back to you as soon as possible.</p>
                </div>

                {submitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                     <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-4xl mb-6">
                       ✓
                     </div>
                     <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                     <p className="text-gray-500 max-w-md">
                       Thank you for reaching out. We have received your message and will get back to you shortly at <span className="font-semibold text-gray-900">{formState.email}</span>.
                     </p>
                     <button 
                       onClick={() => { setSubmitted(false); setFormState({name:"", email:"", subject:"", message:""}) }}
                       className="mt-8 text-indigo-600 font-bold hover:underline"
                     >
                        Send another message
                     </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-sm font-bold text-gray-700 ml-1">Your Name</label>
                           <input 
                              type="text" 
                              name="name"
                              required
                              value={formState.name}
                              onChange={handleChange}
                              placeholder="John Doe"
                              className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-gray-50 focus:bg-white"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                           <input 
                              type="email" 
                              name="email"
                              required
                              value={formState.email}
                              onChange={handleChange}
                              placeholder="john@example.com"
                              className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-gray-50 focus:bg-white"
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                        <select 
                           name="subject"
                           required
                           value={formState.subject}
                           onChange={(e) => setFormState(prev => ({ ...prev, subject: e.target.value }))}
                           className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-gray-50 focus:bg-white text-gray-600"
                        >
                           <option value="" disabled>Select a topic...</option>
                           <option value="general">General Inquiry</option>
                           <option value="technical">Technical Support</option>
                           <option value="billing">Deposits & Withdrawals</option>
                           <option value="partnership">Partnership / Advertising</option>
                           <option value="account">Account Verification</option>
                        </select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                        <textarea 
                           name="message"
                           required
                           value={formState.message}
                           onChange={handleChange}
                           placeholder="How can we help you today?"
                           rows={6}
                           className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                        ></textarea>
                     </div>

                     <div className="pt-2">
                        <button 
                           type="submit"
                           disabled={isSubmitting}
                           className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                           {isSubmitting ? (
                              <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Sending...
                              </>
                           ) : (
                              "Send Message"
                           )}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4">
                           By submitting this form, you agree to our privacy policy and terms of service.
                        </p>
                     </div>
                  </form>
                )}
             </motion.div>

          </div>
        </section>

        {/* FAQ Teaser */}
        <section className="py-20 px-6 text-center">
           <h2 className="text-2xl font-bold text-gray-900 mb-4">Looking for quick answers?</h2>
           <p className="text-gray-500 mb-8">Check out our frequently asked questions before contacting support.</p>
           <a href="/faq" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 hover:underline">
              Visit FAQ Center <span aria-hidden="true">&rarr;</span>
           </a>
        </section>

      </main>

      {/* Footer Reuse */}
      <footer className="bg-gray-50 py-12 text-center text-gray-400 text-sm border-t border-gray-200">
        <p>© {new Date().getFullYear()} LetsEarnify. All rights reserved.</p>
      </footer>
    </div>
  )
}
