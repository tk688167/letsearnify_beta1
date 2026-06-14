"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeftIcon, 
  PaperAirplaneIcon,
  UserCircleIcon,
  SparklesIcon
} from "@heroicons/react/24/outline"
import useSWR from "swr"
import { format } from "date-fns"
import Logo from "../ui/Logo"

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface LiveChatWindowProps {
  onBack: () => void
  conversationId: string | null
}

export default function LiveChatWindow({ onBack, conversationId }: LiveChatWindowProps) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    (conversationId === "undefined" || !conversationId) ? null : conversationId
  )
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data, mutate, isValidating } = useSWR(
    activeConversationId ? `/api/support/chat/history?conversationId=${activeConversationId}` : null, 
    fetcher, 
    {
      refreshInterval: 5000, 
      revalidateOnFocus: true
    }
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [data?.messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isSending) return

    const trimmedMessage = message.trim()
    
    // Optimistic message
    const tempMsg = {
        id: 'temp-' + Date.now(),
        message: trimmedMessage,
        sender: "USER",
        createdAt: new Date().toISOString()
    }
    
    // Universal Optimistic UI: Even if data is unknown (new chat), show the message list
    const currentMessages = data?.messages || []
    mutate({ ...data, messages: [...currentMessages, tempMsg] }, false)

    setIsSending(true)
    setMessage("") // Clear input for zero-latency feel
    
    try {
      const res = await fetch("/api/support/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            message: trimmedMessage,
            conversationId: activeConversationId
        })
      })

      // API always returns 200 (or 401/400) — check the body for success
      const result = await res.json()

      if (res.ok && result.success) {
        // If this was a brand-new conversation, update our local key so SWR fetches the right URL
        if (!activeConversationId && result.conversationId) {
            setActiveConversationId(result.conversationId)
        }
        // Force-refresh to replace the temp message with real server data
        await mutate()
      } else {
        // Restore message to input so the user doesn't lose their text
        setMessage(trimmedMessage)
        console.error("[Chat] Send reported failure:", result?.error || res.status)
      }
    } catch (error) {
      // Network-level failure (offline, timeout, etc.)
      setMessage(trimmedMessage)
      console.error("[Chat] Network/send error:", error)
    } finally {
      setIsSending(false)
    }
  }

  const messages = data?.messages || []

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Fixed Top Section */}
      <div className="shrink-0 px-6 pt-4 bg-background/50">
        {/* Branding Header */}
        <div className="text-center mb-6">
          <Logo size="sm" className="justify-center mb-2" />
          <p className="text-[10px] sm:text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
              We’re here to help you grow with LetsEarnify 🚀
          </p>
        </div>

        <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors bg-muted/30 px-3 py-1.5 rounded-full"
          >
            <ArrowLeftIcon className="w-3 h-3" /> Inbox
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Active Thread</span>
          </div>
        </div>
      </div>

      {/* Messages Window - ONLY SCROLLABLE AREA */}
      <div className="flex-1 overflow-y-auto px-6 space-y-4 custom-scrollbar scroll-smooth">
        <div className="h-4 shrink-0" /> {/* Padding Top */}
        {messages.length === 0 && !isValidating && !isSending && (
          <div className="text-center py-12 opacity-50 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4 border border-border/50">
                <UserCircleIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-xs font-black text-foreground uppercase tracking-wider">How can we help you?</p>
            <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-widest">Send your first message to start.</p>
          </div>
        )}

        {messages.map((msg: any, idx: number) => {
          const isUser = msg.sender === "USER"
          const isBot = !isUser && idx === 1 && messages[0].sender === "USER" && (msg.message.includes("We will reply") || msg.message.includes("Support Bot"))
          
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}
            >
              <div className={`max-w-[85%] group`}>
                <div className={`
                  px-4 py-3 rounded-2xl text-sm font-semibold shadow-sm leading-relaxed
                  ${isUser 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-card text-foreground rounded-tl-none border border-border/60 shadow-md'}
                `}>
                  {msg.message.split('\n').map((line: string, i: number) => (
                    <span key={i}>{line}{i !== msg.message.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
                <div className={`flex items-center gap-2 mt-1.5 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">
                    {msg.id.toString().startsWith('temp-') ? 'Sending...' : format(new Date(msg.createdAt), 'hh:mm a')}
                  </p>
                  {isBot && (
                    <span className="text-[8px] font-black uppercase tracking-[0.1em] text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <SparklesIcon className="w-2.5 h-2.5" /> Support Bot
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
        <div ref={messagesEndRef} className="h-6" /> {/* Padding Bottom */}
      </div>

      {/* Fixed Input Area */}
      <div className="shrink-0 px-6 py-4 bg-background/50 border-t border-border/30">
        <form onSubmit={handleSend} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-300" />
            <input 
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="relative w-full bg-background border border-border/80 focus:border-blue-500 rounded-2xl py-3.5 pl-6 pr-16 text-sm font-bold placeholder:text-muted-foreground/40 outline-none transition-all shadow-sm"
                disabled={isSending}
            />
            <button 
                type="submit"
                disabled={isSending || !message.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl disabled:opacity-50 hover:bg-blue-700 transition-all shadow-lg active:scale-90"
            >
            <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
            </button>
        </form>
        <p className="text-center text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] mt-3">
            Multi-Conversation Support Active
        </p>
      </div>
    </div>
  )
}
