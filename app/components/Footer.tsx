"use client"

import React from "react"
import Link from "next/link"
import { ShieldCheckIcon, LockClosedIcon, CheckBadgeIcon } from "@heroicons/react/24/solid"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                Let'$Earnify
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              The trusted digital ecosystem for earning online rewards, freelancing, and ethical investments. Join thousands of users achieving financial freedom today.
            </p>
            <div className="flex gap-4 pt-2">
               {/* Social placeholders - can be replaced with real icons later */}
               <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
                  <span className="text-xs font-bold">X</span>
               </div>
               <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-800 hover:text-white transition-colors cursor-pointer">
                  <span className="text-xs font-bold">in</span>
               </div>
               <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-colors cursor-pointer">
                  <span className="text-xs font-bold">Ig</span>
               </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Company</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link href="/stories" className="hover:text-blue-400 transition-colors">Success Stories</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact Support</Link></li>
              <li><Link href="/features" className="hover:text-blue-400 transition-colors">Platform Features</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Legal & Compliance</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/security" className="hover:text-blue-400 transition-colors">Security Center</Link></li>
              <li><Link href="/terms#disclaimer" className="hover:text-blue-400 transition-colors">Risk Disclosure</Link></li>
            </ul>
          </div>

          {/* Trust Badges */}
          <div>
             <h3 className="font-bold text-lg mb-6 text-white">Verified Security</h3>
             <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                   <LockClosedIcon className="w-5 h-5 text-emerald-400" />
                   <div>
                      <div className="text-xs font-bold text-gray-300">SSL Secured</div>
                      <div className="text-[10px] text-gray-500">256-bit Encryption</div>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                   <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
                   <div>
                      <div className="text-xs font-bold text-gray-300">Fraud Protection</div>
                      <div className="text-[10px] text-gray-500">Active Monitoring</div>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                   <CheckBadgeIcon className="w-5 h-5 text-purple-400" />
                   <div>
                      <div className="text-xs font-bold text-gray-300">Verified Platform</div>
                      <div className="text-[10px] text-gray-500">Trusted Operations</div>
                   </div>
                </div>
             </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {currentYear} LetsEarnify. All rights reserved.</p>
          <div className="flex gap-6">
             <span>Server Time: {new Date().toUTCString()}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
