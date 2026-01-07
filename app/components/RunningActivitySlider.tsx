"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

type SliderMessage = {
    text: string
    active: boolean
    icon?: string
}

export default function RunningActivitySlider() {
  const [messages, setMessages] = useState<SliderMessage[]>([])
  
  useEffect(() => {
    fetch("/api/activity-slider")
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) setMessages(data)
        })
        .catch(err => console.error(err))
  }, [])

  if (messages.length === 0) return null

  // Duplicate messages to ensure smooth infinite loop if list is short
  const displayMessages = messages.length < 5 ? [...messages, ...messages, ...messages] : messages

  return (
    <div className="w-full bg-white border-b border-gray-100 py-3 overflow-hidden relative group">
        
        {/* Gradients for fade effect */}
        <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-white to-transparent z-10"></div>
        <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-white to-transparent z-10"></div>

        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee group-hover:paused">
            {/* Render Twice for infinite loop effect */}
            <div className="flex items-center gap-12">
                {displayMessages.map((msg, idx) => (
                    <div key={`a-${idx}`} className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <span className="text-lg">{msg.icon || "🔔"}</span>
                        <span>{msg.text}</span>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-12">
                {displayMessages.map((msg, idx) => (
                    <div key={`b-${idx}`} className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <span className="text-lg">{msg.icon || "🔔"}</span>
                        <span>{msg.text}</span>
                    </div>
                ))}
            </div>
             <div className="flex items-center gap-12">
                {displayMessages.map((msg, idx) => (
                    <div key={`c-${idx}`} className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <span className="text-lg">{msg.icon || "🔔"}</span>
                        <span>{msg.text}</span>
                    </div>
                ))}
            </div>
        </div>

        <style jsx>{`
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-33.33%); }
            }
            .animate-marquee {
                animation: marquee 40s linear infinite;
                width: max-content;
            }
            .group-hover\\:paused:hover {
                animation-play-state: paused;
            }
        `}</style>
    </div>
  )
}
