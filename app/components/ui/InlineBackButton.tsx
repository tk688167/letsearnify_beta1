"use client"

import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "@heroicons/react/24/solid"

export default function InlineBackButton({ className = "" }: { className?: string }) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white/50 hover:bg-white hover:text-gray-900 rounded-full border border-gray-200/50 shadow-sm transition-all hover:shadow-md mb-6 backdrop-blur-sm ${className}`}
    >
      <ArrowLeftIcon className="w-4 h-4" />
      <span>Back</span>
    </button>
  )
}
