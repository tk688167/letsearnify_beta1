"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem("cookie_consent")
    if (!consent) {
      // Delay slightly for smoother entrance
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true")
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-gray-900/95 backdrop-blur-md text-white p-5 rounded-2xl shadow-2xl border border-gray-700 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div className="space-y-2 max-w-2xl">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">Cookie Preference</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. By continuing to use our site, you agree to our <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</Link>.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
               <button 
                onClick={handleAccept}
                className="px-6 py-2.5 bg-white text-gray-900 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors shadow-lg"
               >
                 I Accept
               </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
