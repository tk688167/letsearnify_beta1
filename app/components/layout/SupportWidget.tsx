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
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  SparklesIcon,
  UserIcon,
  ClockIcon,
  CheckBadgeIcon
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

  const isPublicPage = pathname === "/"
  const isAdminPage = pathname.startsWith("/admin")
  const isAuthPage = pathname.startsWith("/login") || 
                   pathname.startsWith("/signup") || 
                   pathname.startsWith("/forgot-password") || 
                   pathname.startsWith("/verify-email")
  const isAgentContext = searchParams.get("agent") === "true"

  if (!mounted) return null

  if (!session || isPublicPage || isAdminPage || isAuthPage || isAgentContext) {
    return null
  }

  return (
    <>
      {/* ═══ FLOATING BUTTON ═══ */}
      <div className="fixed bottom-24 sm:bottom-28 right-5 sm:right-6 z-[9999] flex flex-col items-end pointer-events-none">
        <motion.button
          whileHover={{ scale: 1.08, y: -3 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(!isOpen)}
          className="pointer-events-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-600/40 flex items-center justify-center hover:shadow-blue-600/50 border-2 border-white/20 transition-all relative group overflow-hidden"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <XMarkIcon className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="support"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SupportIcon className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse Ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/30 animate-ping opacity-40" />

          {/* Unread Badge */}
          {unreadCount > 0 && !isOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] bg-gradient-to-r from-red-500 to-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg shadow-red-500/30 px-1 z-[10001]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* ═══ MODAL ═══ */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[440px] overflow-hidden rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl flex flex-col"
              style={{ height: 'min(750px, calc(100vh - 80px))' }}
            >
              {/* ═══ HEADER ═══ */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shrink-0">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl -ml-16 -mb-16" />
                {/* <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" /> */}

                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all active:scale-95 border border-white/10"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
                
                <div className="relative flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                    <SupportIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight">Support Center</h3>
                    <p className="text-blue-100/70 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                      We're here to help you 24/7
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                {/* <div className="relative mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[8px] font-bold text-white/80 uppercase tracking-widest">
                    Online • Ready to assist
                  </p>
                </div> */}
              </div>

              {/* ═══ CONTENT ═══ */}
              <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm">
                {view === 'MENU' && (
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5">
                    <div className="space-y-3">
                      <motion.button 
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleWhatsApp}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/5 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                          <WhatsAppIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">WhatsApp Support</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">Get instant help on WhatsApp</p>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                      </motion.button>

                      {/* Email Support */}
                      <motion.button 
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleEmail}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                          <EnvelopeIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">Email Support</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">Send us an email</p>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </motion.button>

                      {/* Live Chat */}
                      <motion.button 
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (session) setView('INBOX')
                          else window.location.href = '/login?callbackUrl=' + encodeURIComponent(window.location.pathname)
                        }}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                          <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">Live Support</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {session ? "View your conversations" : "Login to start chatting"}
                          </p>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                      </motion.button>

                      {/* Status */}
                      <div className="pt-4 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <p className="text-[8px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">
                            Available 24/7
                          </p>
                          {/* <span className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                          <p className="text-[8px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">
                            Avg. response: 2min
                          </p> */}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {view === 'INBOX' && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Inbox Header */}
                    <div className="px-4 sm:px-6 pt-4 sm:pt-6 shrink-0">
                      <div className="flex items-center justify-between mb-4">
                        <button 
                          onClick={() => setView('MENU')}
                          className="text-[9px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full transition-all"
                        >
                          <ChevronRightIcon className="w-3 h-3 rotate-180" /> Back
                        </button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openThread(null)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-full text-[9px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20"
                        >
                          <PlusIcon className="w-3.5 h-3.5" /> New Chat
                        </motion.button>
                      </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 pb-6">
                      <div className="space-y-2.5">
                        {inboxData?.conversations?.map((conv: any) => (
                          <motion.button 
                            key={conv.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openThread(conv.id)}
                            className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-indigo-400/50 transition-all text-left flex items-start gap-4 shadow-sm hover:shadow-md"
                          >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/30 dark:to-purple-950/30 flex items-center justify-center shrink-0 border border-indigo-200/30 dark:border-indigo-500/10">
                              <ChatBubbleLeftRightIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                  {conv.title || "Support Chat"}
                                </p>
                                <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 shrink-0 whitespace-nowrap bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                  {format(new Date(conv.updatedAt), 'MMM dd')}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                {conv.lastMessage?.message || "No messages yet"}
                              </p>
                              {conv.unreadCount > 0 && (
                                <span className="inline-block mt-1.5 px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 text-[8px] font-bold rounded-full">
                                  {conv.unreadCount} new
                                </span>
                              )}
                            </div>
                          </motion.button>
                        ))}

                        {(!inboxData?.conversations || inboxData.conversations.length === 0) && (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-300 dark:border-gray-700">
                              <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                            </div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">No conversations</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Start your first chat now</p>
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

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </>
  )
}