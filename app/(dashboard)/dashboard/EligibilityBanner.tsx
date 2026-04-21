"use client"

import { useState, useEffect } from "react"
import { ShieldExclamationIcon, ClockIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

export default function EligibilityBanner({ user }: { user: any }) {
    if (!user || user.isActiveMember) return null;

    const [timeLeft, setTimeLeft] = useState<string>("")
    const [isExpired, setIsExpired] = useState(false)

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date().getTime()
            const registrationDate = new Date(user.createdAt).getTime()
            const graceEnd = registrationDate + (24 * 60 * 60 * 1000)
            const remaining = graceEnd - now

            if (remaining <= 0) {
                setIsExpired(true)
                setTimeLeft("Expired")
            } else {
                const hours = Math.floor(remaining / (1000 * 60 * 60))
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
                setTimeLeft(`${hours}h ${minutes}m`)
            }
        }

        const timer = setInterval(calculateTime, 60000)
        calculateTime()

        return () => clearInterval(timer)
    }, [user.createdAt])

    return (
        <div className={`mx-4 mt-6 p-5 rounded-[2rem] border flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-top-4 ${
            isExpired 
                ? 'bg-red-500/5 border-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400' 
                : 'bg-amber-500/5 border-amber-500/20 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
        }`}>
            <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                    isExpired ? 'bg-red-500/20 text-red-600' : 'bg-amber-500/20 text-amber-600'
                }`}>
                    {isExpired ? (
                        <ShieldExclamationIcon className="w-8 h-8" />
                    ) : (
                        <ClockIcon className="w-8 h-8 animate-pulse" />
                    )}
                </div>
                <div className="text-center md:text-left">
                    <h4 className="font-black text-lg md:text-xl tracking-tight mb-1">
                        {isExpired ? "Daily Earnings Forfeited" : "Critical: Action Required"}
                    </h4>
                    <p className="text-xs md:text-sm font-medium opacity-80 max-w-lg leading-relaxed">
                        {isExpired 
                            ? "You missed today's yield because your account was not activated within 24h. Please activate now to avoid losing tomorrow's profit."
                            : `Activation is required within 24 hours of sign-up to receive daily rewards. You have ${timeLeft} left to secure your earnings.`
                        }
                    </p>
                </div>
            </div>
            
            <Link 
                href="/dashboard/settings" 
                className={`w-full md:w-auto px-10 py-4 rounded-2xl text-sm font-black tracking-widest uppercase transition-all active:scale-95 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    isExpired 
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/30' 
                        : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/30'
                }`}
            >
                Activate Portfolio
            </Link>
        </div>
    )
}
