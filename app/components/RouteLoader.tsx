"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export default function RouteLoader() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // Show loader on route change
        setLoading(true)
        setProgress(30)

        const t1 = setTimeout(() => setProgress(60), 150)
        const t2 = setTimeout(() => setProgress(80), 300)
        const t3 = setTimeout(() => {
            setProgress(100)
            setTimeout(() => {
                setLoading(false)
                setProgress(0)
            }, 200)
        }, 500)

        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
            clearTimeout(t3)
        }
    }, [pathname, searchParams])

    if (!loading) return null

    return (
        <>
            {/* Top progress bar */}
            <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-transparent">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Subtle full-screen overlay for heavy page loads */}
            {progress < 80 && (
                <div className="fixed inset-0 z-[9998] pointer-events-none flex items-center justify-center bg-background/30 backdrop-blur-[1px] transition-opacity duration-300">
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative w-8 h-8">
                            <div className="absolute inset-0 rounded-full border-2 border-border" />
                            <div className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}