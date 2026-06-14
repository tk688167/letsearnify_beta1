"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "dark" | "light"
  asLink?: boolean
}

export default function Logo({ 
  className, 
  size = "md", 
  variant = "dark",
  asLink = true 
}: LogoProps) {
  const pathname = usePathname()
  
  let targetHref = "/"
  if (pathname?.startsWith("/dashboard")) {
    targetHref = "/dashboard"
  } else if (pathname?.startsWith("/admin")) {
    targetHref = "/admin"
  }
  const sizeClasses = {
    sm: {
      text: "text-lg",
      symbol: "text-2xl",
      spacing: "mx-[1px]",
      offset: "-translate-y-0.5",
      container: ""
    },
    md: {
      text: "text-[1.35rem] md:text-2xl",
      symbol: "text-[1.75rem] md:text-4xl",
      spacing: "mx-[2px]",
      offset: "-translate-y-0.5 md:-translate-y-1",
      container: ""
    },
    lg: {
      text: "text-xl md:text-3xl",
      symbol: "text-2xl md:text-5xl",
      spacing: "mx-[2px]",
      offset: "-translate-y-1 md:-translate-y-1.5",
      container: ""
    },
    xl: {
      text: "text-2xl md:text-4xl",
      symbol: "text-3xl md:text-5xl",
      spacing: "mx-[3px]",
      offset: "-translate-y-1 md:-translate-y-1.5",
      container: ""
    }
  }

  const currentSize = sizeClasses[size]
  const textColor = variant === "dark" ? "text-foreground" : "text-white"
  
  const content = (
    <div className={cn("flex items-center font-sans font-bold tracking-tighter hover:scale-[1.02] transition-transform duration-200 select-none", currentSize.text, textColor, className)}>
      <span>Let</span>
      <span 
        className={cn(
          "bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent relative font-extrabold",
          currentSize.symbol,
          currentSize.spacing,
          currentSize.offset,
          variant === "light" 
            ? "drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)] filter" 
            : "drop-shadow-[0_4px_3px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_4px_3px_rgba(255,255,255,0.1)] filter"
        )}
      >
        $
      </span>
      <span>Earnify</span>
    </div>
  )

  if (asLink) {
    return (
      <Link href={targetHref} className="inline-flex items-center justify-center">
        {content}
      </Link>
    )
  }

  return content
}
