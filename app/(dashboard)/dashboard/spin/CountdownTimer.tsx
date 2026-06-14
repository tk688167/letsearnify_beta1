"use client"

import { useState, useEffect } from "react"
import { ClockIcon } from "@heroicons/react/24/outline"

export default function CountdownTimer({ targetDate, onComplete }: { targetDate: Date, onComplete?: () => void }) {
    const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number } | null>(null)

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date()
            const diff = targetDate.getTime() - now.getTime()
            
            if (diff <= 0) {
                setTimeLeft(null)
                if (onComplete) onComplete()
                return false
            } else {
                const hours = Math.floor((diff / (1000 * 60 * 60)))
                const minutes = Math.floor((diff / 1000 / 60) % 60)
                const seconds = Math.floor((diff / 1000) % 60)
                setTimeLeft({ hours, minutes, seconds })
                return true
            }
        }

        calculateTime()
        const interval = setInterval(() => {
            if (!calculateTime()) clearInterval(interval)
        }, 1000)
        
        return () => clearInterval(interval)
    }, [targetDate, onComplete])

    if (!timeLeft) return null

    return (
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl font-mono text-xl md:text-3xl font-black border-2 border-slate-200 dark:border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all hover:scale-105 group overflow-hidden relative">
            {/* Animated Glow Line */}
            <div className="absolute bottom-0 left-0 h-1 bg-indigo-500/30 w-full" />
            
            <ClockIcon className="w-5 h-5 md:w-7 md:h-7 text-indigo-500 animate-pulse shrink-0" />
            
            <div className="flex items-baseline gap-1">
                <span className="text-slate-900 dark:text-white tabular-nums tracking-tighter">
                    {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-widest pb-1">h</span>
                
                <span className="text-slate-300 dark:text-slate-700 mx-1">:</span>
                
                <span className="text-slate-900 dark:text-white tabular-nums tracking-tighter">
                    {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-widest pb-1">m</span>

                <span className="text-slate-300 dark:text-slate-700 mx-1">:</span>
                
                <span className="text-slate-600 dark:text-slate-400 tabular-nums tracking-tighter opacity-80">
                    {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] md:text-xs text-slate-400/60 font-bold uppercase tracking-widest pb-1">s</span>
            </div>
        </div>
    )
}
