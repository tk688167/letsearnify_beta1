"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { 
  BuildingLibraryIcon, 
  ShieldCheckIcon, 
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon
} from "@heroicons/react/24/outline"

import Logo from "@/app/components/ui/Logo"

export default function Footer() {
  return (
    <footer className=" bg-slate-50 dark:bg-[#060e27]  transition-colors  py-12 border-t border-gray-300 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* 1. Brand & Mission */}
          <div className="space-y-4">
            <div className="mb-4">
              <Logo  size="md" asLink={false} />
            </div>
            <p className="text-sm leading-relaxed ">
              The trusted digital ecosystem for earning online rewards, freelancing, and ethical investments. We bridge the gap between effort and financial freedom.
            </p>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h3 className=" font-bold uppercase tracking-wider text-sm mb-6">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link href="/features" className="hover:text-blue-400 transition-colors">Features</Link></li>
              {/* <li><Link href="/team" className="hover:text-blue-400 transition-colors">Our Team</Link></li> */}
              {/* <li><Link href="/careers" className="hover:text-blue-400 transition-colors">Careers</Link></li> */}
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* 3. Legal & Compliance */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-sm mb-6">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-blue-400 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* 4. Trust & Security */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-sm mb-6">Verified & Secure</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl  border border-gray-300 dark:border-gray-700">
                <ShieldCheckIcon className="w-8 h-8 text-green-400"/>
                <div>
                  <div className="text-xs font-bold  uppercase">SSL Encrypted</div>
                  <div className="text-[10px] text-gray-500">256-bit Secure Connection</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl  border border-gray-300 dark:border-gray-700">
                <BuildingLibraryIcon className="w-8 h-8 text-blue-400"/>
                <div>
                  <div className="text-xs font-bold  uppercase">Verified Platform</div>
                  <div className="text-[10px] text-gray-500">Registered Entity</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-300 dark:border-gray-800 flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-gray-500">
         &copy; 2025 LetsEarnify. All rights reserved.
          </div>
        
      </div>
    </footer>
  )
}
