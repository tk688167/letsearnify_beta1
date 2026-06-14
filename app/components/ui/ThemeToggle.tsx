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
      <div className="w-[56px] h-8 rounded-full bg-secondary animate-pulse border border-border" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`
        relative inline-flex items-center h-8 w-[56px] rounded-full p-1 transition-colors duration-300 ease-in-out
        border outline-none focus-visible:ring-2 focus-visible:ring-primary/50
        ${isDark 
          ? 'bg-slate-900 border-slate-700/80 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]' 
          : 'bg-slate-100 border-slate-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]'}
      `}
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      
      {/* Background Track Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 w-full h-full pointer-events-none">
         <SunIcon className={`w-3.5 h-3.5 text-amber-500 transition-all duration-300 ${isDark ? 'opacity-40 scale-100' : 'opacity-0 scale-75'}`} />
         <MoonIcon className={`w-3.5 h-3.5 text-indigo-400 transition-all duration-300 ${!isDark ? 'opacity-40 scale-100' : 'opacity-0 scale-75'}`} />
      </div>

      {/* The thumb */}
      <div
        className={`
          flex items-center justify-center w-6 h-6 rounded-full transform transition-transform duration-500 z-10
          ${isDark 
            ? 'translate-x-[24px] bg-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.4)] ring-1 ring-white/10' 
            : 'translate-x-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] ring-1 ring-slate-900/5'}
        `}
        style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {isDark ? (
           <MoonIcon className="w-3.5 h-3.5 text-indigo-300" />
        ) : (
           <SunIcon className="w-3.5 h-3.5 text-amber-500" />
        )}
      </div>
    </button>
  )
}
