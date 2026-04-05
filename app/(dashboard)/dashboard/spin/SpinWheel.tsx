"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useAnimation, AnimatePresence } from "framer-motion"
import { SpinReward } from "@/lib/spin-config"
import { LockClosedIcon, SparklesIcon } from "@heroicons/react/24/solid"
import confetti from "canvas-confetti"
import CountdownTimer from "./CountdownTimer"

interface SpinWheelProps {
    rewards: SpinReward[]
    onSpin: () => Promise<{ success: boolean, reward?: SpinReward, message?: string, nextSpinTime?: number }>
    isLocked?: boolean
    cooldownDate?: Date | null
    type: "FREE" | "PREMIUM"
    userId: string
}

export default function SpinWheel({ rewards, onSpin, isLocked, cooldownDate, type, userId }: SpinWheelProps) {
    const [isSpinning, setIsSpinning] = useState(false)
    const [result, setResult] = useState<SpinReward | null>(null)
    const [showCelebration, setShowCelebration] = useState(false)
    const [localNextSpin, setLocalNextSpin] = useState<Date | null>(cooldownDate || null)
    const [error, setError] = useState<string | null>(null)
    const ObjectWindow = typeof window !== 'undefined' ? window : null

    const controls = useAnimation()
    const wheelRef = useRef<HTMLDivElement>(null)
    const rotationRef = useRef(0)

    const segmentAngle = 360 / rewards.length

    // SYNC Backend state with LocalStorage for flawless persistency across navigation
    useEffect(() => {
        if (!ObjectWindow || !userId) return;
        const storageKey = `spin_lock_${userId}_${type}`;
        const storedTime = localStorage.getItem(storageKey);
        
        let targetTime: number | null = null;
        if (storedTime) targetTime = parseInt(storedTime, 10);
        if (cooldownDate && cooldownDate.getTime() > (targetTime || 0)) {
            targetTime = cooldownDate.getTime();
        }

        if (targetTime && targetTime > Date.now()) {
            setLocalNextSpin(new Date(targetTime));
            localStorage.setItem(storageKey, targetTime.toString());
        } else if (targetTime && targetTime <= Date.now()) {
            setLocalNextSpin(null);
            localStorage.removeItem(storageKey);
        } else {
            setLocalNextSpin(null);
        }
    }, [cooldownDate, type, userId, ObjectWindow]);

    const isCoolingDown = !!localNextSpin && localNextSpin.getTime() > Date.now()

    // Dynamic Font Size Calculation — Optimized for 10-segment readability
    const getFontSize = (label: string) => {
        const count = rewards.length
        let baseSize = 4.2
        if (count <= 6) baseSize = 5.2
        else if (count <= 10) baseSize = 4.2
        else if (count <= 14) baseSize = 3.6
        else baseSize = 3.2

        if (label.length > 15) return (baseSize * 0.75).toString()
        if (label.length > 10) return (baseSize * 0.85).toString()
        return baseSize.toString()
    }

    const triggerCelebration = (reward: SpinReward) => {
        const isRealWin = reward.type !== "TRY_AGAIN" && reward.type !== "EMPTY"
        if (isRealWin) {
            const end = Date.now() + 2000
            const colors = type === "PREMIUM"
                ? ['#FBBF24', '#F59E0B', '#D97706', '#B45309', '#FFFBEB']
                : ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#EEF2FF']

            const frame = () => {
                confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.65 }, colors })
                confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.65 }, colors })
                if (Date.now() < end) requestAnimationFrame(frame)
            }
            frame()
            confetti({
                particleCount: 180,
                spread: 120,
                origin: { y: 0.5 },
                colors,
                startVelocity: 45,
                gravity: 1.1,
                scalar: 1.2
            })
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

        // Constant slow spin while waiting for server response
        controls.start({
            rotate: rotationRef.current + 3600,
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
            const winIndex = rewards.findIndex((r: any) => r.label === wonReward.label)
            
            // Stop infinite loop and set current state
            controls.stop()

            // Calculate precise target rotation
            // We want to bring winIndex to the top (270deg offset in SVG space, but SVG is -90deg rotated, so top is already 0 relative to component)
            // Extra rotation: 360 - (index-based angle) - half-segment
            const segmentCenter = (winIndex * segmentAngle) + (segmentAngle / 2)
            const extraRotation = 360 - segmentCenter
            
            // Add 10 full turns (3600deg) + the target segment adjustment
            const finalRotation = rotationRef.current + 3600 + extraRotation
            rotationRef.current = finalRotation

            await controls.start({
                rotate: finalRotation,
                transition: { duration: 6, ease: [0.15, 0, 0.15, 1] }
            })

            setResult(wonReward)
            if (response.nextSpinTime) {
                setLocalNextSpin(new Date(response.nextSpinTime));
                if (typeof window !== 'undefined' && userId) {
                    localStorage.setItem(`spin_lock_${userId}_${type}`, response.nextSpinTime.toString());
                }
            }
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
        <div className="flex flex-col items-center justify-center gap-6 sm:gap-10 relative select-none w-full">
            {/* Embedded Responsive Persistent Header/Timer */}
            <div className="text-center relative z-0 w-full mb-2">
                {isCoolingDown && localNextSpin ? (
                    <div className="flex flex-col items-center gap-3">
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${type === "PREMIUM" ? "text-amber-500" : "text-slate-400 dark:text-slate-500"}`}>
                            {type === "PREMIUM" ? "Premium Cooldown Active" : "Next Cycle Available In"}
                        </span>
                        <CountdownTimer targetDate={localNextSpin} onComplete={() => {
                            setLocalNextSpin(null);
                            if (typeof window !== 'undefined' && userId) {
                                localStorage.removeItem(`spin_lock_${userId}_${type}`);
                            }
                        }} />
                    </div>
                ) : (
                    <div className={`mx-auto max-w-max px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm flex items-center justify-center gap-3 border ${type === "PREMIUM"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20 animate-pulse"
                        }`}>
                        {type === "PREMIUM" && <SparklesIcon className="w-4 h-4 animate-spin-slow" />}
                        {type === "PREMIUM" ? "Elite Cycle Ready" : "Cycle Ready to Execute"}
                    </div>
                )}
            </div>

            {/* ═══ THE WHEEL ═══ */}
            <div className={`relative group transition-all duration-700 ${isLocked ? 'grayscale opacity-50' : 'grayscale-0 opacity-100'}`}>
                {/* Pointer - Precisely Centered Top (Needle Tipped) */}
                <div className="absolute -top-6 md:-top-9 left-1/2 -translate-x-1/2 z-30 drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)]">
                    <div className="w-5 h-9 md:w-7 md:h-12 relative flex flex-col items-center">
                        <div className={`w-full h-full ${type === "PREMIUM" ? "bg-amber-500" : "bg-indigo-600"} shadow-xl shadow-black/20`}
                            style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
                        <div className="absolute -top-0.5 w-full h-1.5 bg-black/10 blur-[1px] rounded-full" />
                    </div>
                </div>

                {/* Outer Glow / Ring */}
                <div className={`absolute -inset-4 md:-inset-6 rounded-full blur-2xl opacity-20 transition-all duration-1000 ${isSpinning ? 'scale-110 opacity-40 animate-pulse' : 'scale-100'
                    } ${type === "PREMIUM" ? 'bg-amber-400' : 'bg-indigo-400'}`} />

                {/* Main Wheel Container - Balanced & Symmetrical */}
                <motion.div
                    ref={wheelRef}
                    animate={controls}
                    className={`
                        w-[85vw] max-w-[280px] sm:max-w-[340px] md:max-w-[420px] aspect-square
                        rounded-full border-[6px] sm:border-8 md:border-[12px] shadow-[0_0_80px_rgba(0,0,0,0.35)] overflow-hidden relative 
                        transition-transform duration-1000 origin-center mx-auto
                        ${type === "PREMIUM"
                            ? "border-[#D97706] bg-[#0c0c0c] ring-4 ring-amber-500/20"
                            : "border-indigo-600 bg-white dark:bg-slate-900 ring-4 ring-indigo-500/10"
                        }
                    `}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        <defs>
                            <filter id="inner-glow">
                                <feFlood floodColor="black" floodOpacity="0.2" result="black" />
                                <feComposite operator="out" in="SourceGraphic" in2="black" result="inner" />
                                <feGaussianBlur in="inner" stdDeviation="1" result="blur" />
                                <feComposite operator="atop" in="blur" in2="SourceGraphic" />
                            </filter>
                            <linearGradient id="grad_premium" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#F59E0B" />
                                <stop offset="50%" stopColor="#B45309" />
                                <stop offset="100%" stopColor="#F59E0B" />
                            </linearGradient>
                            <linearGradient id="grad_free" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#4F46E5" />
                                <stop offset="100%" stopColor="#818CF8" />
                            </linearGradient>
                        </defs>

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
                                <g key={i} className="cursor-default">
                                    <path
                                        d={pathData}
                                        fill={reward.color.includes("gradient") ? (type === "PREMIUM" ? "url(#grad_premium)" : "url(#grad_free)") : reward.color}
                                        stroke={type === "PREMIUM" ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.1)"}
                                        strokeWidth="0.3"
                                        filter="url(#inner-glow)"
                                    />
                                    <g transform={`rotate(${(i * segmentAngle) + (segmentAngle / 2)}, 50, 50)`}>
                                        <text
                                            x="90"
                                            y="50"
                                            fill={reward.textColor || "#fff"}
                                            fontSize={getFontSize(reward.label)}
                                            fontWeight="900"
                                            textAnchor="end"
                                            dominantBaseline="central"
                                            alignmentBaseline="central"
                                            style={{
                                                pointerEvents: 'none',
                                                userSelect: 'none',
                                                letterSpacing: '0.01em',
                                                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))'
                                            }}
                                        >
                                            {reward.label.toUpperCase()}
                                        </text>
                                    </g>
                                </g>
                            )
                        })}
                    </svg>
                </motion.div>

                {/* Center Cap - Optimized UI Alignment */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22%] aspect-square rounded-full shadow-[0_15px_45px_rgba(0,0,0,0.6)] flex items-center justify-center z-20 border-[3px] sm:border-4 ${type === "PREMIUM"
                    ? "bg-[#080808] border-amber-500 shadow-amber-500/10"
                    : "bg-white dark:bg-slate-900 border-indigo-600 shadow-indigo-600/10"
                }`}>
                    <div className={`w-full h-full rounded-full flex flex-col items-center justify-center text-center ${type === "PREMIUM" ? "text-amber-500" : "text-indigo-600 dark:text-indigo-400"
                    }`}>
                        <span className="text-[clamp(14px,4vw,24px)] font-black tracking-tighter leading-none shadow-black/20">WIN</span>
                    </div>
                    {/* Decorative Inner Ring */}
                    <div className="absolute inset-1.5 sm:inset-2 rounded-full border border-current opacity-10" />
                </div>

                {/* LOCKED overlay */}
                <AnimatePresence>
                    {isLocked && !isSpinning && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 rounded-full backdrop-blur-md flex flex-col items-center justify-center text-white z-40 p-4 sm:p-6 text-center"
                        >
                            <div className="p-3 sm:p-4 bg-amber-500/20 rounded-full mb-2 sm:mb-4 border border-amber-500/30">
                                <LockClosedIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-amber-400" />
                            </div>
                            <span className="font-black text-[clamp(14px,4vw,24px)] tracking-[0.1em] text-amber-500 mb-1 sm:mb-2 leading-tight">PREMIUM LOCKED</span>
                            <p className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-slate-400 max-w-[140px] sm:max-w-[180px] leading-relaxed">Upgrade to unlock exclusive rewards</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══ SPIN BUTTON ═══ */}
            <div className="relative group">
                {/* Button Glow shadow */}
                <div className={`absolute -inset-1 rounded-full blur-xl opacity-40 transition-all group-hover:opacity-70 ${type === "PREMIUM" ? 'bg-amber-500' : 'bg-indigo-500'
                    }`} />

                <button
                    onClick={handleSpin}
                    disabled={isSpinning || !!isLocked || isCoolingDown}
                    className={`
                        relative px-16 py-5 rounded-[2rem] font-black text-xl tracking-[0.15em] uppercase transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl overflow-hidden
                        ${type === "PREMIUM"
                            ? "bg-[#0c0c0c] text-amber-400 border-2 border-amber-500/50"
                            : "bg-indigo-600 text-white border-2 border-indigo-400/50"
                        }
                    `}
                >
                    {/* Animated Shine Effect */}
                    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
                        <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-white/20 skew-x-[45deg] animate-[shine_3s_infinite]"
                            style={{ animation: 'shine 3s ease-in-out infinite' }} />
                    </div>

                    <span className="relative z-10 flex items-center justify-center gap-3">
                        {isSpinning ? "Spinning..." : isCoolingDown ? "Cooldown" : "Spin Now"}
                    </span>
                </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 dark:text-red-400 font-bold text-xs uppercase tracking-widest bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* ═══ BIG WIN CELEBRATION OVERLAY ═══ */}
            <AnimatePresence>
                {showCelebration && result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 md:p-6"
                        onClick={dismissCelebration}
                    >
                        {/* Background particle glow */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-30 blur-[100px] pointer-events-none rounded-full ${isRealWin ? (type === 'PREMIUM' ? 'bg-amber-600' : 'bg-indigo-600') : 'bg-slate-600'
                            }`} />

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 100 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="relative max-w-lg w-full"
                            onClick={(e: any) => e.stopPropagation()}
                        >
                            <div className={`relative rounded-[3rem] overflow-hidden border-4 shadow-[0_0_80px_rgba(0,0,0,0.8)] ${isRealWin
                                    ? (type === 'PREMIUM' ? 'border-amber-500 bg-[#0a0a0a]' : 'border-indigo-500 bg-white dark:bg-slate-900')
                                    : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900'
                                }`}>
                                <div className="p-8 sm:p-10 md:p-14 text-center">
                                    {/* Win Badge */}
                                    <motion.div
                                        initial={{ y: -50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="mb-8"
                                    >
                                        <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] ${isRealWin
                                                ? (type === 'PREMIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400')
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                            }`}>
                                            {isRealWin ? "Winning Announcement" : "System Notification"}
                                        </span>
                                    </motion.div>

                                    {/* Reward Detail */}
                                    <div className="mb-10">
                                        <motion.h2
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", damping: 12, delay: 0.4 }}
                                            className={`text-[clamp(2rem,6vw,4.5rem)] font-black tracking-tighter mb-3 leading-[1.1] break-words ${isRealWin
                                                    ? (type === 'PREMIUM' ? 'text-white' : 'text-slate-900 dark:text-white')
                                                    : 'text-slate-400'
                                                }`}
                                        >
                                            {result.label}
                                        </motion.h2>
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="text-base text-slate-500 dark:text-slate-400 font-medium"
                                        >
                                            {isRealWin
                                                ? `Successfully credited to your ${type === 'PREMIUM' ? 'exclusive' : 'daily'} wallet.`
                                                : "The wheel didn't land on a reward this time."}
                                        </motion.p>
                                    </div>

                                    {/* Visual Elements */}
                                    {isRealWin && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", damping: 10, delay: 0.6 }}
                                            className="mb-12 flex justify-center"
                                        >
                                            <div className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-4xl sm:text-5xl shadow-2xl ${type === 'PREMIUM' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-indigo-600 shadow-indigo-600/20'
                                                }`}>
                                                {type === 'PREMIUM' ? "🏆" : "💰"}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Action Button */}
                                    <motion.button
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                        onClick={dismissCelebration}
                                        className={`w-full py-4 sm:py-5 rounded-[1.25rem] sm:rounded-[1.5rem] font-bold text-base sm:text-lg tracking-tight transition-all active:scale-95 shadow-xl ${isRealWin
                                                ? (type === 'PREMIUM' ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20')
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {isRealWin ? (type === 'PREMIUM' ? "Accept Premium Reward" : "Claim Success") : "Close & Keep Moving"}
                                    </motion.button>

                                    <p className="mt-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                        {type === 'PREMIUM' ? "Next Spin Available in 24 Hours" : `Next Spin Available in ${rewards.length > 5 ? 48 : 24} Hours`}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes shine {
                    0% { left: -100%; transition-property: left; }
                    20% { left: 100%; transition-property: left; }
                    100% { left: 100%; transition-property: left; }
                }
                .clip-pointer {
                    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));
                }
            `}</style>
        </div>
    )
}
