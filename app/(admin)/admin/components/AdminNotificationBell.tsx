"use client"

import { useState, useEffect, useRef } from "react"
import { BellIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { BellAlertIcon } from "@heroicons/react/24/solid"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: 'deposit' | 'withdrawal' | 'signup' | 'merchant_deposit' | 'task_submission' | 'unlock'
  title: string
  description: string
  href: string
  time: string
  read: boolean
}

const TYPE_STYLES: Record<string, { bg: string, icon: string }> = {
  deposit: { bg: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400", icon: "💰" },
  withdrawal: { bg: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400", icon: "💸" },
  signup: { bg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400", icon: "👤" },
  merchant_deposit: { bg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400", icon: "🏦" },
  task_submission: { bg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400", icon: "✅" },
  unlock: { bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400", icon: "🔓" },
}

export function AdminNotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
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
    const interval = setInterval(fetchNotifications, 15000) // every 15s
    return () => clearInterval(interval)
  }, [])

  const markAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", { method: "POST", body: JSON.stringify({ action: "mark_all_read" }) })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all",
          isOpen ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-gray-50 dark:bg-slate-800/40 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/60 hover:text-gray-700 dark:hover:text-slate-200"
        )}
      >
        {unreadCount > 0 ? (
          <BellAlertIcon className="w-5 h-5" />
        ) : (
          <BellIcon className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-[360px] max-h-[480px] bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-wider">
                  Mark all read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[400px] divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="text-center py-12 px-4">
                <BellIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const style = TYPE_STYLES[n.type] || TYPE_STYLES.deposit
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors",
                      !n.read && "bg-blue-50/50 dark:bg-blue-950/20"
                    )}
                  >
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm", style.bg)}>
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-xs font-bold truncate", n.read ? "text-muted-foreground" : "text-foreground")}>{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{n.description}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium">{n.time}</p>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}