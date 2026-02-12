"use client"

import { useState, useEffect } from "react"
import { ClockIcon } from "@heroicons/react/24/outline"

export default function CountdownTimer({ targetDate, onComplete }: { targetDate: Date, onComplete?: () => void }) {
    const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number } | null>(null)

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date()
            const diff = targetDate.getTime() - now.getTime()
            
            if (diff <= 0) {
                clearInterval(interval)
                setTimeLeft(null)
                if (onComplete) onComplete()
            } else {
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
                const minutes = Math.floor((diff / 1000 / 60) % 60)
                const seconds = Math.floor((diff / 1000) % 60)
                setTimeLeft({ hours, minutes, seconds })
            }
        }, 1000)
        
        return () => clearInterval(interval)
    }, [targetDate, onComplete])

    if (!timeLeft) return null

    return (
        <div className="flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-full font-mono text-sm font-bold border border-gray-200 shadow-inner">
            <ClockIcon className="w-4 h-4" />
            <span>
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
        </div>
    )
}
