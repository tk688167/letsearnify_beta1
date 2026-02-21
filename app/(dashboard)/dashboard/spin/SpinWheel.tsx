"use client"

import { useState, useRef } from "react"
import { motion, useAnimation, AnimatePresence } from "framer-motion"
import { SpinReward } from "@/lib/spin-config"
import { LockClosedIcon } from "@heroicons/react/24/solid"
import confetti from "canvas-confetti"

interface SpinWheelProps {
    rewards: SpinReward[]
    onSpin: () => Promise<{ success: boolean, reward?: SpinReward, message?: string }>
    isLocked?: boolean
    cooldown?: number
    type: "FREE" | "PREMIUM"
}

export default function SpinWheel({ rewards, onSpin, isLocked, cooldown, type }: SpinWheelProps) {
    const [isSpinning, setIsSpinning] = useState(false)
    const [result, setResult] = useState<SpinReward | null>(null)
    const [error, setError] = useState<string | null>(null)
    const controls = useAnimation()
    const wheelRef = useRef<HTMLDivElement>(null)

    const segmentAngle = 360 / rewards.length

    const handleSpin = async () => {
        if (isSpinning || isLocked || cooldown) return
        
        setError(null)
        setResult(null)
        setIsSpinning(true)
        
        // Start "loading" spin (fast rotation)
        controls.start({
            rotate: 360 * 10,
            transition: { duration: 20, ease: "linear", repeat: Infinity }
        })

        try {
            // Call Server Action
            const response = await onSpin()
            
            if (!response.success || !response.reward) {
                setIsSpinning(false)
                controls.stop()
                setError(response.message || "Something went wrong")
                return
            }

            const wonReward = response.reward
            const index = rewards.findIndex(r => r.label === wonReward.label)
            
            const randomOffset = Math.random() * (segmentAngle - 4) + 2
            const fullRotations = 5 * 360 
            
            const targetRotation = 360 * 5 + (360 - (index * segmentAngle) - (segmentAngle / 2))
            
            await controls.start({
                rotate: targetRotation,
                transition: { duration: 4, ease: "easeOut" }
            })

            // Animation Complete
            setResult(wonReward)
            if (wonReward.type !== "TRY_AGAIN" && wonReward.type !== "EMPTY") {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                })
            }
            
        } catch (e: any) {
            controls.stop()
            setError(e.message || "Network error. Please try again.")
        } finally {
            setIsSpinning(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
                {/* Visual Pointer - dark mode aware */}
                <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-secondary border-4 border-foreground/30 rotate-45 transform shadow-lg" />
                </div>

                {/* The Wheel */}
                <motion.div
                    ref={wheelRef}
                    animate={controls}
                    className={`w-full h-full rounded-full border-4 md:border-8 shadow-2xl overflow-hidden relative ${
                        type === "PREMIUM"
                            ? "border-yellow-500 shadow-yellow-500/20 bg-[#1a1a1a]" 
                            : "border-indigo-500 shadow-indigo-500/20 bg-card"
                    }`}
                >
                    {/* SVG Implementation for Perfect Segments */}
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {rewards.map((reward, i) => {
                             const startAngle = (i * segmentAngle) * (Math.PI / 180)
                             const endAngle = ((i + 1) * segmentAngle) * (Math.PI / 180)
                             
                             const x1 = (50 + 50 * Math.cos(startAngle)).toFixed(4)
                             const y1 = (50 + 50 * Math.sin(startAngle)).toFixed(4)
                             const x2 = (50 + 50 * Math.cos(endAngle)).toFixed(4)
                             const y2 = (50 + 50 * Math.sin(endAngle)).toFixed(4)
                             
                             const pathData = rewards.length === 1 
                                ? `M 50 50 L ${x1} ${y1} A 50 50 0 1 1 ${x1} ${y1} Z` 
                                : `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`
                             
                             return (
                                 <g key={i}>
                                     <path 
                                        d={pathData} 
                                        fill={reward.color.includes("gradient") ? "url(#grad_premium)" : reward.color} 
                                        stroke="rgba(0,0,0,0.15)"
                                        strokeWidth="0.5"
                                     />
                                     {/* Text Label - Radially Aligned */}
                                     <text
                                        x="50"
                                        y="50"
                                        fill={reward.textColor || "#fff"}
                                        fontSize="4.8" 
                                        fontWeight="900" 
                                        textAnchor="middle" 
                                        transform={`rotate(${(i * segmentAngle) + (segmentAngle/2)}, 50, 50) translate(35, 0)`}
                                        style={{ pointerEvents: 'none', userSelect: 'none', letterSpacing: '-0.1px' }} 
                                     >
                                         {reward.label.split(' ').map((word, idx, arr) => (
                                             <tspan 
                                                 key={idx} 
                                                 x="50" 
                                                 dy={idx === 0 ? (arr.length > 1 ? "-1.8" : "1.5") : "4.8"}
                                                 dominantBaseline="middle"
                                             >
                                                 {word}
                                             </tspan>
                                         ))}
                                     </text>
                                 </g>
                             )
                        })}
                        {/* Define Gradients if needed */}
                         {type === "PREMIUM" && (
                            <defs>
                                <linearGradient id="grad_premium" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FDB931" />
                                    <stop offset="100%" stopColor="#FFD700" />
                                </linearGradient>
                            </defs>
                        )}
                    </svg>

                </motion.div>

                {/* Center Cap - dark mode aware */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-card rounded-full shadow-lg flex items-center justify-center z-10 border-4 border-border">
                    <span className="font-bold text-card-foreground text-xs text-center leading-tight">
                        {type}<br/>WIN
                    </span>
                </div>

                {/* Locked / Cooldown Overlay */}
                <AnimatePresence>
                    {(isLocked || (cooldown && cooldown > 0)) && !isSpinning && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 rounded-full backdrop-blur-sm flex flex-col items-center justify-center text-white z-30"
                        >
                            {isLocked ? (
                                <>
                                    <LockClosedIcon className="w-12 h-12 mb-2 text-gray-300" />
                                    <span className="font-bold text-lg">LOCKED</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-3xl font-black mb-1">WAIT</span>
                                    <span className="text-xs opacity-80">Cooldown Active</span>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Spin Button */}
            <button
                onClick={handleSpin}
                disabled={isSpinning || !!isLocked || (!!cooldown && cooldown > 0)}
                className={`
                    relative px-12 py-4 rounded-full font-black text-lg tracking-widest uppercase transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl
                    ${type === "PREMIUM" 
                        ? "bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-white ring-4 ring-yellow-500/30" 
                        : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white ring-4 ring-indigo-500/30"
                    }
                `}
            >
                {isSpinning ? "SPINNING..." : "SPIN NOW"}
            </button>

            {/* Messages */}
            {error && <p className="text-red-400 font-medium text-sm animate-pulse">{error}</p>}
            {result && (
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 bg-card rounded-xl shadow-lg border border-border text-center"
                >
                    <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">You Won</p>
                    <p className="text-2xl font-black text-green-600 dark:text-green-400">
                        {result.label}
                    </p>
                </motion.div>
            )}
        </div>
    )
}
