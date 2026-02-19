"use client"

import { useEffect, useState } from "react"
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid"
import { useTheme } from "next-themes"

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }
  
  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark")

  // Prevent hydration mismatch by rendering a placeholder until mounted
  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800/50 animate-pulse border border-gray-200 dark:border-gray-700" />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative overflow-hidden group flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300
        border border-gray-200 dark:border-gray-700/50
        bg-white dark:bg-gray-800/50
        hover:border-gray-300 dark:hover:border-gray-600
        hover:shadow-sm dark:hover:shadow-md dark:hover:shadow-indigo-500/10
        active:scale-95
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
          className={`w-5 h-5 text-indigo-400 transition-all duration-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`} 
        />
      </div>
      
      {/* Background Glow Effect */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${
        isDark ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 bg-amber-500/5'
      }`} />
      <div className={`absolute inset-0 transition-opacity duration-300 ${
        isDark ? 'opacity-0 group-hover:opacity-100 bg-indigo-500/10' : 'opacity-0'
      }`} />
    </button>
  )
}
