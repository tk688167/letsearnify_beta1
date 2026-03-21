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
    const [showCelebration, setShowCelebration] = useState(false)
    const [localCooldown, setLocalCooldown] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const controls = useAnimation()
    const wheelRef = useRef<HTMLDivElement>(null)

    const segmentAngle = 360 / rewards.length
    const isCoolingDown = (!!cooldown && cooldown > 0) || localCooldown

    const triggerCelebration = (reward: SpinReward) => {
        const isRealWin = reward.type !== "TRY_AGAIN" && reward.type !== "EMPTY"
        if (isRealWin) {
            const end = Date.now() + 2000
            const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F97316']
            const frame = () => {
                confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors })
                confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors })
                if (Date.now() < end) requestAnimationFrame(frame)
            }
            frame()
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors, startVelocity: 35, gravity: 0.8 })
        }
        setShowCelebration(true)
    }

    const dismissCelebration = () => {
        setShowCelebration(false)
    }

    const handleSpin = async () => {
        if (isSpinning || isLocked || isCoolingDown) return
        
        setError(null)
        setResult(null)
        setShowCelebration(false)
        setIsSpinning(true)
        
        controls.start({
            rotate: 360 * 10,
            transition: { duration: 20, ease: "linear", repeat: Infinity }
        })

        try {
            const response = await onSpin()
            
            if (!response.success || !response.reward) {
                setIsSpinning(false)
                controls.stop()
                setError(response.message || "Something went wrong")
                return
            }

            const wonReward = response.reward
            const index = rewards.findIndex(r => r.label === wonReward.label)
            
            const targetRotation = 360 * 5 + (360 - (index * segmentAngle) - (segmentAngle / 2))
            
            await controls.start({
                rotate: targetRotation,
                transition: { duration: 4, ease: "easeOut" }
            })

            setResult(wonReward)
            setLocalCooldown(true)
            triggerCelebration(wonReward)
            
        } catch (e: any) {
            controls.stop()
            setError(e.message || "Network error. Please try again.")
        } finally {
            setIsSpinning(false)
        }
    }

    const isRealWin = result && result.type !== "TRY_AGAIN" && result.type !== "EMPTY"

    return (
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 relative">
            {/* ═══ THE WHEEL ═══ */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
                {/* Pointer */}
                <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-secondary border-4 border-foreground/30 rotate-45 transform shadow-lg" />
                </div>

                {/* Wheel — ALWAYS VISIBLE, never blurred */}
                <motion.div
                    ref={wheelRef}
                    animate={controls}
                    className={`w-full h-full rounded-full border-4 md:border-8 shadow-2xl overflow-hidden relative ${
                        type === "PREMIUM"
                            ? "border-yellow-500 shadow-yellow-500/20 bg-[#1a1a1a]" 
                            : "border-indigo-500 shadow-indigo-500/20 bg-card"
                    }`}
                >
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

                {/* Center Cap */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-card rounded-full shadow-lg flex items-center justify-center z-10 border-4 border-border">
                    <span className="font-bold text-card-foreground text-xs text-center leading-tight">
                        {type}<br/>WIN
                    </span>
                </div>

                {/* LOCKED overlay — only for premium lock, NOT for cooldown */}
                <AnimatePresence>
                    {isLocked && !isSpinning && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 rounded-full backdrop-blur-sm flex flex-col items-center justify-center text-white z-30"
                        >
                            <LockClosedIcon className="w-12 h-12 mb-2 text-gray-300" />
                            <span className="font-bold text-lg">LOCKED</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══ SPIN BUTTON ═══ */}
            <button
                onClick={handleSpin}
                disabled={isSpinning || !!isLocked || isCoolingDown}
                className={`
                    relative px-12 py-4 rounded-full font-black text-lg tracking-widest uppercase transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl
                    ${type === "PREMIUM" 
                        ? "bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-white ring-4 ring-yellow-500/30" 
                        : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white ring-4 ring-indigo-500/30"
                    }
                `}
            >
                {isSpinning ? "SPINNING..." : isCoolingDown ? "COOLDOWN" : "SPIN NOW"}
            </button>

            {/* Error */}
            {error && <p className="text-red-400 font-medium text-sm animate-pulse">{error}</p>}

            {/* ═══ BIG WIN CELEBRATION OVERLAY ═══ */}
            <AnimatePresence>
                {showCelebration && result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                        onClick={dismissCelebration}
                    >
                        <motion.div
                            initial={{ scale: 0.3, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 30 }}
                            transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                            className="relative max-w-sm w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Glow background */}
                            <div className={`absolute inset-0 rounded-[2rem] blur-3xl opacity-30 ${isRealWin ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500' : 'bg-gradient-to-br from-gray-400 to-gray-600'}`} />
                            
                            <div className={`relative rounded-[2rem] overflow-hidden border-2 shadow-2xl ${isRealWin ? 'border-yellow-500/50 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950' : 'border-border bg-card'}`}>
                                {/* Top sparkle bar */}
                                {isRealWin && (
                                    <div className="h-1.5 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 animate-pulse" />
                                )}

                                <div className="p-8 sm:p-10 text-center">
                                    {/* Emoji */}
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", damping: 10, delay: 0.3 }}
                                        className="text-6xl sm:text-7xl mb-4"
                                    >
                                        {isRealWin ? "🎉" : "😅"}
                                    </motion.div>

                                    {/* Title */}
                                    <motion.h2
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className={`text-xl sm:text-2xl font-black mb-2 ${isRealWin ? 'text-yellow-400' : 'text-foreground'}`}
                                    >
                                        {isRealWin ? "CONGRATULATIONS!" : "Better Luck Next Time!"}
                                    </motion.h2>

                                    {/* Subtitle */}
                                    <motion.p
                                        initial={{ y: 15, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-sm text-muted-foreground mb-6"
                                    >
                                        {isRealWin ? "You just won from the spin wheel!" : "Don't give up — try again next time!"}
                                    </motion.p>

                                    {/* Big Reward Display */}
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", damping: 12, delay: 0.6 }}
                                        className={`inline-flex flex-col items-center justify-center rounded-2xl px-10 py-6 mb-6 ${
                                            isRealWin 
                                                ? 'bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/20 border-2 border-yellow-500/30' 
                                                : 'bg-muted/50 border border-border'
                                        }`}
                                    >
                                        <span className={`text-4xl sm:text-5xl font-black tracking-tight ${isRealWin ? 'text-white' : 'text-foreground'}`}>
                                            {result.label}
                                        </span>
                                        <span className={`text-xs font-bold uppercase tracking-widest mt-2 ${isRealWin ? 'text-yellow-400/70' : 'text-muted-foreground'}`}>
                                            {isRealWin ? `Added to your ${type === 'PREMIUM' ? 'Premium' : ''} Wallet` : "No reward this time"}
                                        </span>
                                    </motion.div>

                                    {/* Spin type badge */}
                                    <motion.div
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                        className="mb-6"
                                    >
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            type === 'PREMIUM' 
                                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                        }`}>
                                            {type === 'PREMIUM' ? '⭐' : '🎡'} {type} Spin
                                        </span>
                                    </motion.div>

                                    {/* Close Button */}
                                    <motion.button
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                        onClick={dismissCelebration}
                                        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
                                            isRealWin 
                                                ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-500/20' 
                                                : 'bg-foreground text-background hover:opacity-90'
                                        }`}
                                    >
                                        {isRealWin ? "Claim & Continue" : "Try Again Later"}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}