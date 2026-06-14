"use client"

import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "@heroicons/react/24/solid"

export default function InlineBackButton({ className = "", label = "Back to Platform" }: { className?: string; label?: string }) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className={`group relative inline-flex items-center gap-2.5 pl-2 pr-5 py-2 text-sm font-bold text-muted-foreground hover:text-foreground bg-card/40 backdrop-blur-xl border border-border/50 hover:border-primary/30 rounded-[14px] transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:-translate-y-0.5 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[14px] pointer-events-none" />
      <div className="p-1.5 bg-background/80 rounded-xl group-hover:bg-primary/20 transition-colors duration-300 relative border border-border/50 group-hover:border-primary/20">
        <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:text-primary transition-colors duration-300" />
      </div>
      <span className="relative tracking-wide">{label}</span>
    </button>
  )
}
