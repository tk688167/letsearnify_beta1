"use client"

import { useState } from "react"
import Link from "next/link"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import Logo from "@/app/components/ui/Logo"
import ThemeToggle from "@/app/components/ui/ThemeToggle"

export default function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 glass-panel border-b-0 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex justify-between items-center">
          <div className="z-50 relative">
            <Logo size="md" />
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="/#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/pools" className="hover:text-primary transition-colors">Reward Pools</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms & Disclosures</Link>
            <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4 z-50 relative">
             <ThemeToggle />
             
             <Link href="/login" className="hidden md:block px-3 py-2 md:px-5 md:py-2.5 text-xs md:text-sm font-medium text-foreground hover:text-primary transition-colors">
               Log In
             </Link>
             <Link 
               href="/signup" 
               className="hidden md:block px-4 py-2 md:px-6 md:py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-xs md:text-sm font-medium shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5"
             >
               Get Started
             </Link>

             {/* Mobile Menu Button */}
             <button 
               onClick={() => setIsOpen(!isOpen)}
               className="md:hidden p-3 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
               aria-label="Toggle menu"
             >
               {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
             </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-background transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="flex flex-col h-full pt-24 px-6 pb-8">
            <nav className="flex flex-col space-y-6 text-lg font-medium text-foreground">
               <Link href="/#features" onClick={() => setIsOpen(false)} className="py-2 border-b border-border">Features</Link>
               <Link href="/#how-it-works" onClick={() => setIsOpen(false)} className="py-2 border-b border-border">How it Works</Link>
               <Link href="/about" onClick={() => setIsOpen(false)} className="py-2 border-b border-border">About</Link>
               <Link href="/pools" onClick={() => setIsOpen(false)} className="py-2 border-b border-border">Reward Pools</Link>
               <Link href="/terms" onClick={() => setIsOpen(false)} className="py-2 border-b border-border">Terms & Disclosures</Link>
               <Link href="/faq" onClick={() => setIsOpen(false)} className="py-2 border-b border-border">FAQ</Link>
            </nav>
            
            <div className="mt-auto space-y-4">
               <Link href="/login" className="block w-full py-3 text-center text-foreground bg-secondary rounded-xl font-bold">Log In</Link>
               <Link href="/signup" className="block w-full py-3 text-center text-primary-foreground bg-primary rounded-xl font-bold shadow-lg shadow-primary/30">Get Started</Link>
            </div>
         </div>
      </div>
    </>
  )
}
