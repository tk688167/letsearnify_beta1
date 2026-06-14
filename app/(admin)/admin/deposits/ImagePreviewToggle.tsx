'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { EyeIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"

export default function ImagePreviewToggle({ imageUrl, title = "Proof Screenshot" }: { imageUrl: string, title?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  // Scroll lock handle
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
  }, [isOpen])

  if (!imageUrl) return <span className="text-xs text-gray-500 italic">No proof</span>

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md hover:bg-blue-500/20 transition-all text-[10px] font-bold border border-blue-500/20"
      >
        <EyeIcon className="w-3 h-3" /> View Proof
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-gray-900 rounded-xl border border-gray-700 overflow-hidden"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-700">
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="relative w-full h-[50vh] p-2">
                <Image
                  src={imageUrl}
                  alt="Proof"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}