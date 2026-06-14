"use client"

import { useState } from "react"
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

interface CopyableTextProps {
  text: string
  displayText?: string
  className?: string
  label?: string
  iconPosition?: "left" | "right"
}

export function CopyableText({ 
  text, 
  displayText, 
  className,
  label,
  iconPosition = "right"
}: CopyableTextProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy!", err)
    }
  }

  return (
    <div className={cn("relative inline-flex items-center group", className)}>
      {label && <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mr-2">{label}</span>}
      
      <button 
        onClick={handleCopy}
        className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 -ml-2 transition-colors relative min-h-[44px] min-w-[44px] justify-center"
        title="Click to copy"
      >
        <span className="font-mono font-bold break-all text-left">
          {displayText || text}
        </span>
        
        {copied ? (
          <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
        ) : (
          <ClipboardDocumentIcon className="w-5 h-5 text-gray-400 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        )}

        {/* Floating Tooltip */}
        {copied && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded shadow-lg animate-in fade-in zoom-in duration-200 z-50 whitespace-nowrap pointer-events-none">
            Copied!
          </div>
        )}
      </button>
    </div>
  )
}
