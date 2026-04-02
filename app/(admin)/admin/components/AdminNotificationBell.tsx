"use client"

import { useState, useEffect, useRef } from "react"
import { BellIcon, XMarkIcon, MagnifyingGlassIcon, FunnelIcon, CalendarDaysIcon } from "@heroicons/react/24/outline"
import { BellAlertIcon, CheckCircleIcon } from "@heroicons/react/24/solid"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"

interface Notification {
  id: string
  type: 'deposit' | 'withdrawal' | 'signup' | 'merchant_deposit' | 'task_submission' | 'unlock'
  title: string
  description: string
  href: string
  time: string
  read: boolean
  sortDate?: string
}

const TYPE_STYLES: Record<string, { bg: string, icon: string, label: string }> = {
  deposit: { bg: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400", icon: "💰", label: "Deposit" },
  withdrawal: { bg: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400", icon: "💸", label: "Withdrawal" },
  signup: { bg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400", icon: "👤", label: "New User" },
  merchant_deposit: { bg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400", icon: "🏦", label: "Merchant" },
  task_submission: { bg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400", icon: "✅", label: "Task" },
  unlock: { bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400", icon: "🔓", label: "Unlock" },
}

export function AdminNotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d' | 'custom'>('7d')
  const [customDate, setCustomDate] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  // Poll for notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/admin/notifications")
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }
      } catch {}
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [])

  const markAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", { method: "POST", body: JSON.stringify({ action: "mark_all_read" }) })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         n.description.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false

    const now = new Date()
    const nDate = n.sortDate ? new Date(n.sortDate) : new Date()
    
    if (dateFilter === 'today') return nDate.toDateString() === now.toDateString()
    if (dateFilter === '7d') {
      const d = new Date(); d.setDate(now.getDate() - 7); return nDate >= d
    }
    if (dateFilter === '30d') {
      const d = new Date(); d.setDate(now.getDate() - 30); return nDate >= d
    }
    if (dateFilter === 'custom' && customDate) {
      return nDate.toDateString() === new Date(customDate).toDateString()
    }
    return true
  })

  // THE FULL SCREEN CENTER CONTENT
  const FullScreenOverlay = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-lg" onClick={() => setIsOpen(false)} />
      
      {/* Main Container */}
      <div className="relative w-full max-w-5xl h-full sm:h-[90vh] bg-white dark:bg-slate-900 sm:rounded-[40px] shadow-2xl border border-white/10 overflow-hidden flex flex-col scale-in-center animate-in zoom-in-95 duration-200">
        
        {/* TOP BAR / HEADER */}
        <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-600 rounded-[18px] flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                 <BellIcon className="w-6 h-6" />
               </div>
               <div>
                 <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Notification Center</h1>
                 <p className="text-xs text-gray-500 font-bold dark:text-slate-500 uppercase tracking-widest">{notifications.length || 0} ADMINISTRATIVE EVENTS LOGGED</p>
               </div>
             </div>
             
             <div className="flex items-center gap-3">
               {unreadCount > 0 && (
                 <button onClick={markAllRead} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl text-xs font-black uppercase transition-all hover:bg-blue-100">
                   <CheckCircleIcon className="w-4 h-4" /> Mark All Read
                 </button>
               )}
               <button onClick={() => setIsOpen(false)} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
                 <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
               </button>
             </div>
          </div>

          {/* Search & Filter Section */}
          <div className="flex flex-col md:flex-row items-stretch gap-4">
            <div className="relative flex-1 group">
               <MagnifyingGlassIcon className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search by user, email, or event type..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-12 pr-4 h-14 bg-white dark:bg-slate-950 border-2 border-gray-100 dark:border-slate-800 rounded-[22px] text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-gray-400 placeholder:font-medium dark:text-white"
               />
            </div>
            
            <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-slate-800 rounded-[24px] border-2 border-transparent">
               {(['today', '7d', '30d'] as const).map((f) => (
                 <button
                   key={f}
                   onClick={() => setDateFilter(f)}
                   className={cn(
                     "px-5 h-10 text-[11px] font-black uppercase tracking-widest rounded-[18px] transition-all",
                     dateFilter === f 
                       ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-md" 
                       : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                   )}
                 >
                   {f === 'today' ? 'Today' : f === '7D' ? '7 Days' : '30 Days'}
                   {f === '7d' ? '7 Days' : ''}
                   {f === '30d' ? '30 Days' : ''}
                 </button>
               ))}
               
               <div className="h-6 w-[1px] bg-gray-200 dark:bg-slate-700 mx-1" />
               
               <div className="relative flex items-center h-10 px-4 gap-2 bg-transparent rounded-[18px] hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer">
                 <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                 <input 
                   type="date" 
                   value={customDate}
                   onChange={(e) => { setCustomDate(e.target.value); setDateFilter('custom'); }}
                   className="absolute inset-0 opacity-0 cursor-pointer"
                 />
                 <span className="text-[11px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                   {dateFilter === 'custom' ? customDate : 'Custom'}
                 </span>
               </div>
            </div>
          </div>
        </div>

        {/* LIST CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 custom-scrollbar">
          {unreadCount > 0 && (
             <div className="px-6 py-4 bg-blue-600 rounded-[24px] flex items-center justify-between shadow-lg shadow-blue-600/20 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span className="text-sm font-black text-white uppercase tracking-widest">{unreadCount} Actionable Notifications</span>
                </div>
                <button onClick={markAllRead} className="text-xs font-black text-white/90 hover:text-white underline uppercase">Clear Queue</button>
             </div>
          )}

          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800/50 rounded-[40px] flex items-center justify-center mb-6">
                <FunnelIcon className="w-10 h-10 text-gray-200 dark:text-slate-700" />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Events Found</h3>
              <p className="text-sm text-gray-500 dark:text-slate-500 max-w-xs mt-2 font-medium">We couldn't find any notifications matching your current filters or search query.</p>
              <button 
                onClick={() => { setSearchTerm(""); setDateFilter("30d"); }}
                className="mt-6 px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-[20px] text-xs font-black uppercase hover:bg-gray-200 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredNotifications.map(n => {
                const style = TYPE_STYLES[n.type] || TYPE_STYLES.deposit
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-5 p-5 bg-white dark:bg-slate-800/40 border border-transparent rounded-[30px] transition-all hover:bg-gray-50 dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none hover:border-blue-500/20",
                      !n.read && "bg-blue-50/30 dark:bg-blue-950/10 border-blue-100 dark:border-blue-500/20 ring-1 ring-inset ring-blue-500/10"
                    )}
                  >
                    <div className={cn("w-14 h-14 rounded-[22px] flex items-center justify-center shrink-0 text-2xl shadow-sm", style.bg)}>
                      {style.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 uppercase tracking-widest">{style.label}</span>
                        <span className="text-[10px] font-bold text-gray-300 dark:text-slate-600">•</span>
                        <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase">{n.time}</span>
                      </div>
                      <h4 className={cn("text-base font-black tracking-tight", n.read ? "text-gray-700 dark:text-slate-200" : "text-gray-900 dark:text-white")}>
                        {n.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-slate-500 mt-0.5 font-medium line-clamp-1 group-hover:line-clamp-none transition-all">
                        {n.description}
                      </p>
                    </div>

                    {!n.read && <div className="absolute top-6 right-6 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-blue-500/20" />}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-gray-50 dark:bg-slate-800/40 border-t border-gray-100 dark:border-slate-800 text-center">
            <p className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-[0.2em]">End of Administratie Event Feed</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all shadow-sm",
          isOpen ? "bg-blue-600 text-white shadow-blue-600/20" : "bg-white dark:bg-slate-800/40 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-white border border-gray-100 dark:border-slate-800/50"
        )}
      >
        {unreadCount > 0 ? <BellAlertIcon className="w-5 h-5" /> : <BellIcon className="w-5 h-5" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-slate-950 shadow-lg shadow-red-500/40">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* PORTAL FULL SCREEN OVERLAY */}
      {isOpen && isMounted && createPortal(FullScreenOverlay, document.body)}
    </div>
  )
}