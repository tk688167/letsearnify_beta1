"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import LandingHeader from "../../components/LandingHeader";
import Footer from "../layout/Footer";
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

export default function ContactPageContent() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#060e25] text-gray-900 font-sans  dark:text-gray-100 dark:selection:bg-indigo-800 dark:selection:text-white transition-colors duration-300">
      <LandingHeader />

      <main className="flex-1 pt-16">
        {/* Header Section – Modern gradient + dark mode support */}
        <section className="relative py-15 px-6 bg-slate-50 dark:bg-[#060e25] 
         overflow-hidden text-center dark:from-gray-900 dark:via-gray-950 dark:to-indigo-950/30">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto relative z-10"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-6">
              Get in Touch
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              We value open communication. Reach out to us for partnerships,
              support, or general inquiries.
            </p>
          </motion.div>
          {/* Decorative blur circle */}
          <div className="absolute top-[-20%] right-[-10%] w-72 h-72 bg-indigo-300/30 dark:bg-indigo-500/20 rounded-full blur-3xl -z-0" />
          <div className="absolute bottom-[-20%] left-[-10%] w-72 h-72 bg-purple-300/30 dark:bg-purple-500/20 rounded-full blur-3xl -z-0" />
        </section>

        {/* Main Content – Responsive grid */}
        <section className="py-16 md:py-20 px-6 md:px-12 bg-slate-50 dark:bg-[#060e25] transition-colors duration-300">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8 md:gap-12">
            {/* Contact Info Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-50 dark:bg-[#060e28] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-gray-900/30 backdrop-blur-sm h-full transition-all duration-300">
                <h3 className="font-bold text-lg mb-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">
                  Customer Support
                </h3>

                <div className="space-y-8">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                      <EnvelopeIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white text-sm">
                        Email Support
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        For general inquiries and account help.
                      </p>
                      <a
                        href="mailto:support@letsearnify.com"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
                      >
                        support@letsearnify.com
                      </a>
                    </div>
                  </div>

                  {/* Live Chat */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 rounded-xl shrink-0">
                      <ChatBubbleLeftRightIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white text-sm">
                        Live Chat
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Available for active members.
                      </p>
                      <span className="text-xs text-green-600 dark:text-green-400 font-bold block mt-1">
                        24/7 Support via Dashboard
                      </span>
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl mt-6 border border-gray-100 dark:border-gray-700">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                      Response Time
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      We aim to respond to all inquiries within 24 hours. For
                      faster assistance, use the Live Chat widget inside your
                      dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="lg:col-span-2 bg-slate-50 dark:bg-[#060e25] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-gray-900/30 p-6 md:p-10 transition-all duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  General Inquiries
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Fill out the form and we'll get back to you shortly.
                </p>
              </div>

              {submitted ? (
                <div className="py-16 text-center">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Message Sent
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    We'll respond to {formState.email} shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formState.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none focus:bg-white dark:focus:bg-gray-800 transition-colors duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formState.email}
                        onChange={handleChange}
                        placeholder="Your email address"
                        className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none focus:bg-white dark:focus:bg-gray-800 transition-colors duration-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                      Message
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={formState.message}
                      placeholder="Write your message here..."
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none focus:bg-white dark:focus:bg-gray-800 transition-colors duration-200 resize-y"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gray-900 dark:bg-indigo-600 text-white rounded-xl font-bold hover:bg-black dark:hover:bg-indigo-700 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-gray-900/20 dark:shadow-indigo-600/20"
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
  );
}