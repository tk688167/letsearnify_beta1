"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { trackVisit } from "@/lib/actions"

export function Tracker() {
  const pathname = usePathname()
  const initialized = useRef(false)

  useEffect(() => {
    // Prevent double firing in React Strict Mode dev
    if (initialized.current) return
    initialized.current = true

    const data = {
      path: pathname,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      referrer: document.referrer,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }

    // Fire and forget
    trackVisit(data)
  }, [pathname])

  return null
}
