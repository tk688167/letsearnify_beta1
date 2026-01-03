"use client"

import { useRouter, usePathname } from "next/navigation"
import { ArrowLeftIcon } from "@heroicons/react/24/solid"

export default function BackButton() {
  const router = useRouter()
  const pathname = usePathname()

  // Hide on Landing Page and Dashboard Overview
  if (pathname === "/" || pathname === "/dashboard") {
    return null
  }

  // Check if we are inside dashboard (but not the overview) to adjust position for sidebar
  const isDashboardPage = pathname?.startsWith("/dashboard")

  // Tailwind classes for positioning
  // Mobile: Always top-left (z-50 to sit above typical headers if needed, generally below modal overlays)
  // Desktop: If dashboard, push right to clear sidebar (w-72 = 18rem). If not, standard top-left.
  const positionClasses = isDashboardPage 
    ? "md:left-[19rem] md:top-6" // Desktop (Dashboard)
    : "md:left-8 md:top-8"       // Desktop (Public/Auth)

  return (
    <button
      onClick={() => router.back()}
      className={`fixed top-4 left-4 ${positionClasses} z-40 p-2 bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-full shadow-sm text-gray-600 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all duration-300 group`}
      aria-label="Go Back"
    >
      <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
    </button>
  )
}
