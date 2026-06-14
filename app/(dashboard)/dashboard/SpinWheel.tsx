"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/solid"
import { cn } from "@/lib/utils"

interface SpinWheelProps {
    onComplete?: () => void;
}

export function SpinWheel({ onComplete }: SpinWheelProps) {
    const [isSpinning, setIsSpinning] = useState(false)
    const [reward, setReward] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSpin = async () => {
        if (isSpinning) return
        setIsSpinning(true)
        setError(null)
        setReward(null)

        try {
            // Anti-Gravity: Call Secure API
            const res = await fetch("/api/spin", { method: "POST" })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Spin failed")
            }

            // Simulate Spin Delay for Effect (3 seconds)
            setTimeout(() => {
                setReward(data.points)
                setIsSpinning(false)
                if (onComplete) onComplete()
            }, 3000)

        } catch (err: any) {
            setError(err.message)
            setIsSpinning(false)
        }
    }

    return (
        <div className="w-full bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-700"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
                    <SparklesIcon className="w-8 h-8 text-amber-300 animate-pulse" />
                </div>
                
                <h3 className="text-2xl font-bold font-serif mb-2">Daily Power Spin</h3>
                <p className="text-indigo-100 mb-6 text-sm max-w-xs mx-auto">
                    Spin once every 24 hours to earn ARN Tokens.
                </p>

                <div className="relative">
                     {/* The Wheel (Visual Only) */}
                     <motion.div 
                        animate={{ rotate: isSpinning ? 360 * 5 : 0 }}
                        transition={{ duration: 3, ease: "easeOut" }}
                        className="w-48 h-48 rounded-full border-4 border-amber-300 bg-gradient-to-tr from-indigo-800 to-purple-800 flex items-center justify-center shadow-2xl relative"
                     >
                        <div className="absolute inset-2 border-2 border-white/20 rounded-full border-dashed"></div>
                        <span className="text-4xl font-bold text-white/20">ARN</span>
                     </motion.div>
                     
                     {/* Result Overlay */}
                     <AnimatePresence>
                        {reward !== null && (
                            <motion.div 
                               initial={{ scale: 0, opacity: 0 }}
                               animate={{ scale: 1, opacity: 1 }}
                               exit={{ scale: 0 }}
                               className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-full"
                            >
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-amber-400">+{reward}</div>
                                    <div className="text-xs font-bold text-white uppercase">ARN Tokens</div>
                                </div>
                            </motion.div>
                        )}
                     </AnimatePresence>
                </div>

                <div className="mt-8 w-full max-w-xs">
                    {error ? (
                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm mb-4">
                            {error}
                        </div>
                    ) : null}

                    <button 
                        onClick={handleSpin}
                        disabled={isSpinning || reward !== null}
                        className={cn(
                            "w-full py-3 rounded-xl font-bold shadow-lg transition-all transform active:scale-95",
                            isSpinning ? "bg-gray-500 cursor-not-allowed" : 
                            reward !== null ? "bg-green-500 hover:bg-green-600" :
                            "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-indigo-900"
                        )}
                    >
                        {isSpinning ? "Spinning..." : reward !== null ? "Claimed!" : "Spin Now"}
                    </button>
                </div>
            </div>
        </div>
    )
}
