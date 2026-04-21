"use client"

import { useState, useEffect, useRef } from "react"
import { BellIcon, XMarkIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline"
import { formatDistanceToNow } from "date-fns"

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const unreadCount = notifications.filter(n => !n.isRead).length
    const lastNotifIdRef = useRef<string | null>(null)

    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission()
        }

        fetchNotifications()
        // Auto refresh every 30 secs for near real-time push
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen])

    async function fetchNotifications() {
        try {
            const res = await fetch("/api/user/notifications")
            const data = await res.json()
            if (data.notifications) {
                setNotifications(data.notifications)

                // Handle Push Notifications
                if (data.notifications.length > 0) {
                    const latestId = data.notifications[0].id
                    if (lastNotifIdRef.current && lastNotifIdRef.current !== latestId) {
                        const newUnread = data.notifications.filter((n: any) => !n.isRead)
                        if (newUnread.length > 0 && newUnread[0].id === latestId) {
                            if ("Notification" in window && Notification.permission === "granted") {
                                new Notification("Let's Earnify", {
                                    body: newUnread[0].title,
                                })
                            }
                        }
                    }
                    lastNotifIdRef.current = latestId
                }
            }
        } catch (error) {
            console.error("Failed to fetch notifications")
        } finally {
            setLoading(false)
        }
    }

    async function markAsRead(id: string) {
        try {
            await fetch("/api/user/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            })
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
        } catch (error) {}
    }

    async function deleteNotification(id: string) {
        try {
            await fetch(`/api/user/notifications?id=${id}`, { method: "DELETE" })
            setNotifications(prev => prev.filter(n => n.id !== id))
        } catch (error) {}
    }

    async function clearAllRead() {
        try {
            const readIds = notifications.filter(n => n.isRead).map(n => n.id);
            if (readIds.length === 0) return;

            await fetch("/api/user/notifications", { method: "DELETE" })
            setNotifications(prev => prev.filter(n => !n.isRead))
        } catch (error) {}
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg bg-card border border-border shadow-sm text-foreground hover:bg-muted transition-all active:scale-95"
                title="Notifications"
            >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse shadow-md shadow-red-500/20">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                {/* Mobile Backdrop */}
                <div 
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[90] md:hidden" 
                    onClick={() => setIsOpen(false)} 
                />
                
                {/* Modal / Dropdown */}
                <div className="fixed inset-x-4 top-[70px] md:absolute md:inset-auto md:right-0 md:mt-3 md:w-[380px] bg-card border border-border rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 md:origin-top-right">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-foreground">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full font-bold">
                                    {unreadCount} NEW
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={clearAllRead} 
                            className="text-[10px] uppercase tracking-wider font-bold text-primary hover:text-primary/80 transition-colors"
                        >
                            Clear Read
                        </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-muted-foreground text-xs">Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-10 text-center text-muted-foreground">
                                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                                    <BellIcon className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="text-sm font-medium">All caught up!</p>
                                <p className="text-xs mt-1 opacity-70">New alerts will appear here.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {notifications.map(n => (
                                    <div 
                                        key={n.id} 
                                        className={`p-4 hover:bg-muted/40 transition-colors relative group cursor-pointer ${!n.isRead ? 'bg-primary/[0.03]' : ''}`}
                                        onClick={() => !n.isRead && markAsRead(n.id)}
                                    >
                                        {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                                        <div className="flex gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                                                n.type === 'FORFEITURE' 
                                                    ? 'bg-red-500/10 text-red-600 border-red-500/10' 
                                                    : n.type === 'TRANSACTION'
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10'
                                                    : n.type === 'REWARD'
                                                    ? 'bg-purple-500/10 text-purple-600 border-purple-500/10'
                                                    : n.type === 'TASK'
                                                    ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/10'
                                                    : 'bg-primary/10 text-primary border-primary/10'
                                            }`}>
                                                {n.type === 'FORFEITURE' ? <XMarkIcon className="w-5 h-5" /> : <BellIcon className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <p className={`text-sm font-bold truncate ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-muted px-1.5 py-0.5 rounded">
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{n.message}</p>
                                                
                                                <div className="flex items-center gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!n.isRead && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                                            className="text-[10px] font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                                        >
                                                            <CheckIcon className="w-3 h-3" /> Mark read
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                                        className="text-[10px] font-bold text-destructive hover:bg-destructive/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                                    >
                                                        <TrashIcon className="w-3 h-3" /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                </>
            )}
        </div>
    )

}
