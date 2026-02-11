"use client"

import { cn } from "@/lib/utils"

interface SectionWatermarkProps {
    section: string
}

export function SectionWatermark({ section }: SectionWatermarkProps) {
    return (
        <span className="text-white font-bold tracking-widest uppercase text-sm opacity-80 animate-watermarkFadeIn">
            {section}
            <style jsx>{`
                @keyframes watermarkFadeIn {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 0.8; transform: translateY(0); }
                }
                .animate-watermarkFadeIn {
                    animation: watermarkFadeIn 1s ease-out forwards;
                }
            `}</style>
        </span>
    )
}
