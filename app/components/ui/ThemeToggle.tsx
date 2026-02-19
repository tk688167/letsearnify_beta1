"use client"

import { useEffect, useState } from "react"
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid"
import { useTheme } from "next-themes"

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-secondary animate-pulse border border-border" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`
        relative overflow-hidden group flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300
        border border-border
        bg-secondary
        hover:border-primary/50
        hover:shadow-sm dark:hover:shadow-md dark:hover:shadow-primary/10
        active:scale-95
        cursor-pointer
      `}
      aria-label="Toggle theme"
    >
      <div className="relative z-10">
        <SunIcon 
          className={`w-5 h-5 text-amber-500 transition-all duration-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
            isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`} 
        />
        <MoonIcon 
          className={`w-5 h-5 text-primary transition-all duration-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`} 
        />
      </div>
      
      {/* Background Glow Effect */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${
        isDark ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 bg-amber-500/10'
      }`} />
      <div className={`absolute inset-0 transition-opacity duration-300 ${
        isDark ? 'opacity-0 group-hover:opacity-100 bg-primary/10' : 'opacity-0'
      }`} />
    </button>
  )
}
