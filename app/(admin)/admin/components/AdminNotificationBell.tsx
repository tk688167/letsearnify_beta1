"use client"

import { useState, useEffect, useRef } from "react"
import { 
  BellIcon, 
  XMarkIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  CalendarDaysIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  UserPlusIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  LockOpenIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  SparklesIcon,
  CheckIcon
} from "@heroicons/react/24/outline"
import { BellAlertIcon } from "@heroicons/react/24/solid"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"

interface Notification {
  id: string
  type: 'deposit' | 'withdrawal' | 'signup' | 'merchant_deposit' | 'task_submission' | 'unlock' | 'support_message' | 'daily_earning' | 'spin_wheel'
  title: string
  description: string
  href: string
  time: string
  read: boolean
  sortDate?: string
}

// Higher-end design configuration utilizing actual icons and fluid micro-actions
const TYPE_CONFIG: Record<string, { bg: string, icon: any, label: string, color: string }> = {
  deposit: { bg: "bg-emerald-500/10 border-emerald-500/20", color: "text-emerald-500", icon: ArrowDownLeftIcon, label: "Deposit" },
  withdrawal: { bg: "bg-purple-500/10 border-purple-500/20", color: "text-purple-500", icon: ArrowUpRightIcon, label: "Withdrawal" },
  signup: { bg: "bg-blue-500/10 border-blue-500/20", color: "text-blue-500", icon: UserPlusIcon, label: "New User" },
  merchant_deposit: { bg: "bg-amber-500/10 border-amber-500/20", color: "text-amber-500", icon: BuildingOfficeIcon, label: "Merchant" },
  task_submission: { bg: "bg-cyan-500/10 border-cyan-500/20", color: "text-cyan-500", icon: CheckCircleIcon, label: "Task" },
  unlock: { bg: "bg-teal-500/10 border-teal-500/20", color: "text-teal-500", icon: LockOpenIcon, label: "Unlock" },
  support_message: { bg: "bg-rose-500/10 border-rose-500/20", color: "text-rose-500", icon: ChatBubbleLeftRightIcon, label: "Live Chat" },
  daily_earning: { bg: "bg-indigo-500/10 border-indigo-500/20", color: "text-indigo-500", icon: ChartBarIcon, label: "Daily Pool" },
  spin_wheel: { bg: "bg-pink-500/10 border-pink-500/20", color: "text-pink-500", icon: SparklesIcon, label: "Spin Wheel" },
}

const CATEGORY_MAP: Record<string, { title: string, order: number }> = {
  'signup': { title: 'User Registrations', order: 1 },
  'task_submission': { title: 'Task Approvals', order: 2 },
  'deposit': { title: 'Financial Logs', order: 3 },
  'withdrawal': { title: 'Financial Logs', order: 3 },
  'merchant_deposit': { title: 'Financial Logs', order: 3 },
  'daily_earning': { title: 'Pool Activities', order: 4 },
  'spin_wheel': { title: 'Game Modules', order: 5 },
  'unlock': { title: 'Security & Access', order: 6 },
  'support_message': { title: 'Customer Support', order: 7 }
}

export function AdminNotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<string>('All')
  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d' | 'custom'>('7d')
  const [customDate, setCustomDate] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

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
      setNotifications(prev => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  const filteredNotifications = notifications.filter((n) => {
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

  const groupedNotifications = filteredNotifications.reduce((acc: any, n) => {
    const category = CATEGORY_MAP[n.type]?.title || 'System Core'
    const order = CATEGORY_MAP[n.type]?.order || 99
    if (!acc[category]) {
      acc[category] = { title: category, order, items: [] }
    }
    acc[category].items.push(n)
    return acc
  }, {})

  const sortedCategories = Object.values(groupedNotifications).sort((a: any, b: any) => a.order - b.order)

  const renderItem = (n: Notification) => {
    const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.deposit
    const IconComponent = cfg.icon

    return (
      <Link
        key={n.id}
        href={n.href}
        onClick={() => setIsOpen(false)}
        className={cn(
          "group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 outline-none",
          n.read 
            ? "bg-slate-50/50 hover:bg-white dark:bg-slate-900/40 dark:hover:bg-slate-900 border-slate-100 dark:border-slate-800/60 hover:shadow-md hover:shadow-slate-200/40 dark:hover:shadow-none" 
            : "bg-blue-50/40 hover:bg-blue-50/60 dark:bg-blue-500/[0.03] dark:hover:bg-blue-500/[0.05] border-blue-100/80 dark:border-blue-500/20 shadow-sm"
        )}
      >
        <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105", cfg.bg)}>
          <IconComponent className={cn("w-5 h-5", cfg.color)} />
        </div>
        
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn("text-[10px] font-semibold tracking-wider uppercase", cfg.color)}>
              {cfg.label}
            </span>
            <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{n.time}</span>
          </div>
          <h4 className={cn("text-sm font-semibold tracking-tight transition-colors", n.read ? "text-slate-700 dark:text-slate-200" : "text-slate-900 dark:text-slate-50")}>
            {n.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-1 group-hover:line-clamp-none">
            {n.description}
          </p>
        </div>

        {!n.read && (
          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full ring-4 ring-blue-500/10" />
        )}
      </Link>
    )
  }

  const FullScreenOverlay = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop with standard modern glassmorphism blur */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200" onClick={() => setIsOpen(false)} />
      
      {/* Container window */}
      <div className="relative w-full max-w-4xl h-full sm:h-[85vh] bg-white dark:bg-slate-950 sm:rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800/80 overflow-hidden flex flex-col transition-all animate-in zoom-in-95 duration-200">
        
        {/* HEADER SECTION */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-900 bg-slate-50/60 dark:bg-slate-900/20">
          <div className="flex items-center justify-between gap-4 mb-5">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-600/10">
                 <BellIcon className="w-5 h-5" />
               </div>
               <div>
                 <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">Notification Center</h1>
                 <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{notifications.length || 0} administrative activities tracked</p>
               </div>
             </div>
             
             <div className="flex items-center gap-2">
               {unreadCount > 0 && (
                 <button onClick={markAllRead} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold transition-colors">
                   <CheckIcon className="w-3.5 h-3.5" /> Mark all read
                 </button>
               )}
               <button onClick={() => setIsOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors border border-slate-200/40 dark:border-transparent">
                 <XMarkIcon className="w-4 h-4" />
               </button>
             </div>
          </div>

          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
               <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Filter activities..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all dark:text-white"
               />
            </div>
            
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-x-auto">
               {(['today', '7d', '30d'] as const).map((f) => (
                 <button
                   key={f}
                   onClick={() => setDateFilter(f)}
                   className={cn(
                     "px-3 h-8 text-[11px] font-semibold rounded-md transition-all whitespace-nowrap",
                     dateFilter === f 
                       ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm" 
                       : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                   )}
                 >
                   {f === 'today' ? 'Today' : f === '7d' ? '7 Days' : '30 Days'}
                 </button>
               ))}
               
               <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />
               
               <div className="relative flex items-center h-8 px-3 gap-1.5 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer">
                 <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" />
                 <input 
                   type="date" 
                   value={customDate}
                   onChange={(e) => { setCustomDate(e.target.value); setDateFilter('custom'); }}
                   className="absolute inset-0 opacity-0 cursor-pointer"
                 />
                 <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                   {dateFilter === 'custom' && customDate ? customDate : 'Custom'}
                 </span>
               </div>
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS CONTAINER LOG */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {unreadCount > 0 && (
             <div className="px-4 py-3 bg-blue-600 rounded-xl flex items-center justify-between shadow-md shadow-blue-600/10">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-xs font-semibold text-white tracking-wide">{unreadCount} actionable logs pending</span>
                </div>
                <button onClick={markAllRead} className="text-xs font-bold text-blue-100 hover:text-white underline transition-colors">Clear queue</button>
             </div>
          )}

          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-900">
                <FunnelIcon className="w-6 h-6 text-slate-300 dark:text-slate-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No entries matched filters</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mt-1">Try adjusting your terms or check out broader date filters.</p>
              <button 
                onClick={() => { setSearchTerm(""); setDateFilter("30d"); setActiveTab("All"); }}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Reset System Filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* RESPONSIVE SEGMENT TABS (Horizontal Scrollable Container for Mobile UI) */}
              <div className="flex items-center gap-1.5 pb-2 overflow-x-auto whitespace-nowrap no-scrollbar border-b border-slate-100 dark:border-slate-900">
                <button
                  onClick={() => setActiveTab('All')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all border",
                    activeTab === 'All' 
                      ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 font-semibold" 
                      : "bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200/60 dark:border-transparent hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  All Logs
                </button>
                {sortedCategories.map((group: any) => {
                  const unreadItemsCount = group.items.filter((n: any) => !n.read).length;
                  return (
                    <button
                      key={group.title}
                      onClick={() => setActiveTab(group.title)}
                      className={cn(
                        "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all border",
                        activeTab === group.title 
                          ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 font-semibold" 
                          : "bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200/60 dark:border-transparent hover:text-slate-900 dark:hover:text-slate-100"
                      )}
                    >
                      {group.title}
                      {unreadItemsCount > 0 && (
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-bold",
                          activeTab === group.title ? "bg-white/20 text-white dark:bg-slate-900 dark:text-white" : "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                        )}>
                          {unreadItemsCount}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* LIST SEGMENTS */}
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {(() => {
                  const currentItems = activeTab === 'All' ? filteredNotifications : (sortedCategories as any[]).find((g: any) => g.title === activeTab)?.items || [];
                  const unreadItems = currentItems.filter((n: any) => !n.read);
                  const readItems = currentItems.filter((n: any) => n.read);
                  
                  return (
                    <div className="space-y-6">
                      {unreadItems.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider pl-1">Action Required</h4>
                          <div className="grid gap-2.5">
                            {unreadItems.map(renderItem)}
                          </div>
                        </div>
                      )}
                      
                      {readItems.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">History Log</h4>
                          <div className="grid gap-2.5">
                            {readItems.map(renderItem)}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}
        </div>

        {/* SYSTEM FOOTER */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-900 text-left flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Secure Audit Stream</span>
            <span className="text-[10px] font-mono text-slate-300 dark:text-slate-700">v2.4.1</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Premium Compact Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex items-center justify-center w-9 h-9 rounded-lg transition-all border outline-none",
          isOpen 
            ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-sm" 
            : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800"
        )}
      >
        {unreadCount > 0 ? <BellAlertIcon className="w-[18px] h-[18px]" /> : <BellIcon className="w-[18px] h-[18px]" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold text-white bg-red-500 rounded-full border border-white dark:border-slate-900 shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* PORTAL FOR MODAL ISOLATION */}
      {isOpen && isMounted && createPortal(FullScreenOverlay, document.body)}
    </div>
  )
}