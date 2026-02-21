"use client"

import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"
import React from "react"

export default function UnderDevelopment({ 
    title, 
    description, 
    icon,
    children
}: { 
    title: string, 
    description: string, 
    icon: React.ReactNode,
    children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-160px)] md:min-h-[calc(100vh-100px)]">
       {/* Card container */}
       <div className="w-full max-w-[340px] sm:max-w-md relative bg-card/60 backdrop-blur-2xl border border-border/60 rounded-[2rem] p-6 sm:p-8 text-center shadow-2xl shadow-indigo-500/5 overflow-hidden group">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-60"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-[50px] rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 blur-[50px] rounded-full"></div>
          
          <motion.div 
             initial={{ scale: 0.95, opacity: 0, y: 10 }} 
             animate={{ scale: 1, opacity: 1, y: 0 }} 
             transition={{ duration: 0.4, ease: "easeOut" }}
             className="relative z-10 flex flex-col items-center"
          >
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mb-5 ring-1 ring-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3 group-hover:shadow-indigo-500/20">
                  {icon}
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 rounded-full bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest border border-amber-200/50 dark:border-amber-800/50 backdrop-blur-sm">
                  <WrenchScrewdriverIcon className="w-3.5 h-3.5" />
                  Under Development
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground mb-3">{title}</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed [text-wrap:balance]">{description}</p>
              
              {children && (
                  <div className="mt-6 w-full text-left bg-muted/30 rounded-xl p-4 border border-border/50 shadow-inner backdrop-blur-sm">
                      {children}
                  </div>
              )}
          </motion.div>
       </div>
    </div>
  )
}
