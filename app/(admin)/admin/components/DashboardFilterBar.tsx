"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { CalendarDaysIcon } from "@heroicons/react/24/outline"

const PRESETS = [
  { label: "7D",  value: "7d"  },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
] as const

export function DashboardFilterBar({ initialRange, initialFrom, initialTo }: {
  initialRange: string
  initialFrom?: string
  initialTo?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [activeRange, setActiveRange] = useState(initialRange)
  const [showCustom, setShowCustom] = useState(initialRange === "custom")
  const [from, setFrom] = useState(initialFrom || "")
  const [to, setTo] = useState(initialTo || "")

  // Sync with URL on mount
  useEffect(() => {
    setActiveRange(initialRange)
    setShowCustom(initialRange === "custom")
  }, [initialRange])

  const navigateTo = (params: Record<string, string>) => {
    const p = new URLSearchParams(params)
    router.push(`${pathname}?${p.toString()}`, { scroll: false })
  }

  const handlePreset = (value: string) => {
    setActiveRange(value)
    setShowCustom(false)
    navigateTo({ range: value })
  }

  const handleCustomApply = () => {
    if (!from || !to) return
    setActiveRange("custom")
    navigateTo({ range: "custom", from, to })
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="flex flex-col gap-2">
      {/* Filter pill row */}
      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800/60 w-fit">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePreset(p.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRange === p.value
                ? "bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow"
                : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom((v) => !v)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
            activeRange === "custom"
              ? "bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow"
              : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <CalendarDaysIcon className="w-3.5 h-3.5" />
          Custom
        </button>
      </div>

      {/* Custom date picker — shown inline below the pills */}
      {showCustom && (
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-3 py-2 shadow-sm">
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">From</label>
            <input
              type="date"
              max={to || today}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">To</label>
            <input
              type="date"
              min={from}
              max={today}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <button
            onClick={handleCustomApply}
            disabled={!from || !to || from > to}
            className="px-3 py-1 bg-indigo-600 dark:bg-indigo-500 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  )
}
