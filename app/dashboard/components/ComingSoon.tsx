"use client"

import { ClockIcon, RocketLaunchIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

interface ComingSoonProps {
    title?: string;
    launchDate?: Date;
}

export function ComingSoon({ title = "Coming Soon", launchDate }: ComingSoonProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gray-900 text-white shadow-2xl shadow-blue-900/20">
      
      {/* Background Animations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-10 p-10 md:p-16 text-center">
         <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-8 animate-in slide-in-from-top-4 duration-700">
             <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
             <span className="text-xs font-bold uppercase tracking-wider">In Development</span>
         </div>

         <div className="flex justify-center mb-6">
             <RocketLaunchIcon className="w-16 h-16 text-blue-300 animate-bounce" />
         </div>

         <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white leading-tight">
            {title}
         </h1>

         <p className="text-lg text-blue-100/80 max-w-xl mx-auto mb-10 leading-relaxed">
            We are working hard to bring you this feature as soon as possible. 
            Stay tuned for an experience that will redefine your earning potential! 🚀
         </p>

         {/* Social Links */}
         <div className="flex flex-col md:flex-row items-center justify-center gap-6">
             <div className="flex gap-4">
                <SocialLink href="#" label="Facebook" color="bg-[#1877F2]" />
                <SocialLink href="#" label="Twitter" color="bg-[#1DA1F2]" />
                <SocialLink href="#" label="Instagram" color="bg-[#E4405F]" />
             </div>
         </div>
      </div>
      
      {/* Divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </div>
  )
}

function SocialLink({ href, label, color }: { href: string, label: string, color: string }) {
    return (
        <a 
            href={href} 
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${color} hover:scale-110 transition-transform shadow-lg shadow-black/20`}
            title={label}
        >
            <span className="sr-only">{label}</span>
            {/* Simple Letter Icon */}
            <span className="font-bold text-sm">{label.charAt(0)}</span>
        </a>
    )
}
