"use client"
import { useState } from "react"
import { EyeIcon, XMarkIcon } from "@heroicons/react/24/outline"

export default function ImagePreviewToggle({ imageUrl }: { imageUrl: string }) {
    const [isOpen, setIsOpen] = useState(false)

    if (!imageUrl) return <span className="text-xs text-muted-foreground italic">No snippet provided</span>

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors text-[10px] font-bold border border-blue-100 dark:border-blue-800/30"
            >
                <EyeIcon className="w-3.5 h-3.5"/> View Proof
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                    <div className="relative max-w-3xl w-full max-h-[90vh] bg-card rounded-2xl overflow-hidden shadow-2xl border border-border animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                            <h3 className="text-sm font-bold text-foreground">Payment Proof Screenshot</h3>
                            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                                <XMarkIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="p-4 overflow-auto max-h-[calc(90vh-60px)] flex items-center justify-center bg-muted/20">
                            <img src={imageUrl} alt="Payment proof" className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg"/>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
