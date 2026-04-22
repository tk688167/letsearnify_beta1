"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  XMarkIcon, 
  EnvelopeIcon, 
  ChatBubbleOvalLeftEllipsisIcon,
  ChevronRightIcon,
  PlusIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline"
import { useSession } from "next-auth/react"
import LiveChatWindow from "./LiveChatWindow"
import useSWR from "swr"
import { format } from "date-fns"

const fetcher = (url: string) => fetch(url).then(r => r.json())

const SupportIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5C21 15.7508 17.1406 19.3333 12.5 19.3333C11.5815 19.3333 10.6974 19.2063 9.87322 18.9688L6 21V17.1852C4.19246 15.7533 3 13.7548 3 11.5C3 7.24925 6.85938 3.66667 11.5 3.66667C16.1406 3.66667 21 7.24925 21 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 10L11 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 13L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export default function SupportWidget() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<'MENU' | 'INBOX' | 'CHAT'>('MENU')
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const WHATSAPP_NUMBER = "923192939169"
  const SUPPORT_EMAIL = "letsearnify@gmail.com"

  const handleWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20I%20need%20support%20with%20LetsEarnify`
    window.open(url, '_blank')
  }

  const handleEmail = () => {
    window.open(`mailto:${SUPPORT_EMAIL}?subject=Support Request&body=Hi Support Team,`, '_self')
  }

  const { data: inboxData, mutate: mutateInbox } = useSWR(isOpen && session ? "/api/support/chat/conversations" : null, fetcher)
  
  // Unread Count Polling
  const { data: unreadData, mutate: mutateUnread } = useSWR(
    !isOpen && session ? "/api/support/chat/unread" : null, 
    fetcher, 
    { refreshInterval: 15000 }
  )

  const unreadCount = unreadData?.unreadCount || 0

  const openThread = (id: string | null) => {
    setSelectedConvId(id)
    setView('CHAT')
  }

  // Visibility Logic: Hide on Landing Page, Admin Portal, Auth Pages, and for Guests
  const isPublicPage = pathname === "/"
  const isAdminPage = pathname.startsWith("/admin")
  const isAuthPage = pathname.startsWith("/login") || 
                   pathname.startsWith("/signup") || 
                   pathname.startsWith("/forgot-password") || 
                   pathname.startsWith("/verify-email")
  const isAgentContext = searchParams.get("agent") === "true"

  // Suppress rendering entirely until client has mounted to prevent hydration mismatch.
  // useSession() returns null on the server but a real value on the client, which
  // causes React's SSR HTML to differ from the first client render.
  if (!mounted) return null

  if (!session || isPublicPage || isAdminPage || isAuthPage || isAgentContext) {
    return null
  }

  return (
    <>
      <div className="fixed bottom-24 sm:bottom-28 right-6 z-[9999] flex flex-col items-end pointer-events-none">
        {/* Floating Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="pointer-events-auto w-13 h-13 rounded-2xl bg-blue-600 text-white shadow-[0_15px_30px_rgba(37,99,235,0.4)] flex items-center justify-center hover:bg-blue-700 border-2 border-white/10 transition-all relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <XMarkIcon className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="support"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <SupportIcon className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unread Badge */}
          {unreadCount > 0 && !isOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg z-[10001] animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop Dimmer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-background/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className={`relative w-full max-w-[420px] overflow-hidden rounded-[2.5rem] bg-card border border-border/60 shadow-[0_40px_80px_rgba(0,0,0,0.4)] flex flex-col`}
              style={{ 
                height: 'min(750px, calc(100vh - 80px))'
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all active:scale-95"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
                
                <h3 className="text-2xl font-black tracking-tight text-white">Support Center</h3>
                <p className="text-blue-100/80 text-xs font-bold mt-1 uppercase tracking-widest">How can we help you today?</p>
              </div>

              {/* Content Area - FIXED CONTAINER (No global scroll) */}
              <div className="flex-1 flex flex-col overflow-hidden bg-background/50 backdrop-blur-xl">
                {view === 'MENU' && (
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="space-y-4 font-sans">
                      {/* WhatsApp Support */}
                      <button 
                        onClick={handleWhatsApp}
                        className="w-full flex items-center gap-5 p-5 rounded-3xl bg-card border border-border/50 hover:border-green-500/50 hover:bg-green-500/[0.02] transition-all group active:scale-[0.98]"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-500 shadow-sm group-hover:text-white transition-all duration-300">
                          <WhatsAppIcon className="w-7 h-7" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-black text-foreground uppercase tracking-wider leading-none mb-1.5">WhatsApp Support</p>
                          <p className="text-[10px] text-muted-foreground font-bold opacity-70 group-hover:opacity-100 transition-opacity">Instant help on WhatsApp</p>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                      </button>

                      {/* Email Support */}
                      <button 
                        onClick={handleEmail}
                        className="w-full flex items-center gap-5 p-5 rounded-3xl bg-card border border-border/50 hover:border-blue-500/50 hover:bg-blue-500/[0.02] transition-all group active:scale-[0.98]"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 shadow-sm group-hover:text-white transition-all duration-300">
                          <EnvelopeIcon className="w-7 h-7" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-black text-foreground uppercase tracking-wider leading-none mb-1.5">Email Support</p>
                          <p className="text-[10px] text-muted-foreground font-bold opacity-70 group-hover:opacity-100 transition-opacity">Contact via email</p>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </button>

                      {/* Live Chat Entrance */}
                      <button 
                        onClick={() => {
                            if (session) setView('INBOX')
                            else window.location.href = '/login?callbackUrl=' + encodeURIComponent(window.location.pathname)
                        }}
                        className="w-full flex items-center gap-5 p-5 rounded-3xl bg-card border border-border/50 hover:border-indigo-500/50 hover:bg-indigo-500/[0.02] transition-all group active:scale-[0.98]"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500 shadow-sm group-hover:text-white transition-all duration-300">
                          <ChatBubbleOvalLeftEllipsisIcon className="w-7 h-7" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-black text-foreground uppercase tracking-wider leading-none mb-1.5">Live Support</p>
                          <p className="text-[10px] text-muted-foreground font-bold opacity-70 group-hover:opacity-100 transition-opacity">
                            {session ? "View your conversations" : "Login to start chatting"}
                          </p>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                      </button>

                      <div className="pt-6 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Operational (24/7)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {view === 'INBOX' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="px-6 pt-6 shrink-0">
                      <div className="flex items-center justify-between mb-6">
                        <button 
                          onClick={() => setView('MENU')}
                          className="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest flex items-center gap-1 bg-muted/30 px-3 py-1.5 rounded-full"
                        >
                          <ChevronRightIcon className="w-3 h-3 rotate-180" /> Back
                        </button>
                        <button 
                          onClick={() => openThread(null)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                        >
                          <PlusIcon className="w-3.5 h-3.5" /> Start New Chat
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
                      <div className="space-y-3">
                        {inboxData?.conversations?.map((conv: any) => (
                          <button 
                            key={conv.id}
                            onClick={() => openThread(conv.id)}
                            className="w-full p-4 rounded-3xl bg-card border border-border/50 hover:border-blue-500/30 transition-all text-left flex items-start gap-4 active:scale-[0.99] group shadow-sm"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0 border border-border/50 group-hover:bg-blue-500/10 transition-colors">
                                <ChatBubbleLeftRightIcon className="w-6 h-6 text-muted-foreground group-hover:text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-sm font-black text-foreground truncate uppercase tracking-tight">{conv.title}</p>
                                <span className="text-[9px] font-bold text-muted-foreground shrink-0 flex items-center gap-1 whitespace-nowrap">
                                    <CalendarIcon className="w-3 h-3" /> {format(new Date(conv.updatedAt), 'MMM dd')}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate opacity-70">
                                {conv.lastMessage?.message || "No messages yet"}
                              </p>
                            </div>
                          </button>
                        ))}

                        {(!inboxData?.conversations || inboxData.conversations.length === 0) && (
                            <div className="text-center py-16 opacity-40">
                                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                                    <PlusIcon className="w-8 h-8" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest">No chats found</p>
                                <p className="text-[10px] font-bold mt-2">Start your first conversation above!</p>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {view === 'CHAT' && (
                  <div className="flex-1 overflow-hidden">
                      <LiveChatWindow 
                        conversationId={selectedConvId} 
                        onBack={() => {
                          setView('INBOX')
                          mutateInbox()
                        }} 
                      />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
