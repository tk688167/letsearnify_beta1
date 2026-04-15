"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  UserCircleIcon, 
  PaperAirplaneIcon, 
  ChatBubbleLeftRightIcon,
  CircleStackIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ClockIcon,
  CalendarIcon
} from "@heroicons/react/24/outline"
import useSWR from "swr"
import { format } from "date-fns"

const fetcher = (url: string) => fetch(url).then(r => r.json())
const MotionDiv = motion.div

export default function AdminChatPage() {
  const { data: convData, mutate: mutateConvs } = useSWR("/api/admin/chat/conversations", fetcher, {
    refreshInterval: 10000 // Refresh list every 10s
  })

  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  const selectedConv = convData?.conversations?.find((c: any) => c.id === selectedConvId)

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden bg-background border border-border sm:rounded-3xl shadow-xl">
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Sidebar: Conversations List */}
        <div className={`
          ${selectedConvId ? 'hidden sm:flex' : 'flex'} 
          w-full sm:w-80 md:w-96 border-r border-border flex-col bg-muted/10 shrink-0
        `}>
          <div className="p-6 border-b border-border bg-card">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-black text-foreground flex items-center gap-2 tracking-tight">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" /> Support Desk
                </h1>
                <div className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                    SaaS Engine
                </div>
            </div>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Search by user or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {convData?.conversations?.filter((c: any) => 
               !searchQuery || 
               c.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
               c.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               c.title?.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                  selectedConvId === conv.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'hover:bg-muted/50 text-foreground border border-transparent hover:border-border'
                }`}
              >
                <div className="relative shrink-0">
                  {conv.user.image ? (
                    <img src={conv.user.image} className="w-12 h-12 rounded-full border border-border object-cover" />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedConvId === conv.id ? 'bg-white/20' : 'bg-muted'}`}>
                      <UserCircleIcon className="w-8 h-8" />
                    </div>
                  )}
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background animate-bounce">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className={`text-[10px] font-black uppercase tracking-widest truncate ${selectedConvId === conv.id ? 'text-blue-100' : 'text-blue-600'}`}>
                        {conv.title}
                    </p>
                    <span className={`text-[9px] font-bold ${selectedConvId === conv.id ? 'text-blue-100' : 'text-muted-foreground'}`}>
                        {format(new Date(conv.updatedAt), 'hh:mm a')}
                    </span>
                  </div>
                  <p className={`text-sm font-black truncate ${selectedConvId === conv.id ? 'text-white' : 'text-foreground'}`}>
                        {conv.user.name || "Anonymous"}
                  </p>
                  <p className={`text-[10px] truncate ${selectedConvId === conv.id ? 'text-blue-50' : 'text-muted-foreground'}`}>
                    {conv.lastMessage?.sender === "ADMIN" ? "You: " : ""}{conv.lastMessage?.message}
                  </p>
                </div>
              </button>
            ))}

            {(!convData?.conversations || convData.conversations.length === 0) && (
                <div className="p-16 text-center opacity-40 flex flex-col items-center">
                   <CircleStackIcon className="w-12 h-12 mb-4" />
                   <p className="text-xs font-black uppercase tracking-[0.2em]">No Conversations</p>
                </div>
            )}
          </div>
        </div>

        {/* Right Content: Chat Window */}
        <div className={`
          ${selectedConvId ? 'flex' : 'hidden sm:flex'} 
          flex-1 flex-col bg-card/50
        `}>
          <AnimatePresence mode="wait">
            {selectedConvId ? (
              <ChatThread 
                key={selectedConvId} 
                conversationId={selectedConvId} 
                user={selectedConv?.user} 
                title={selectedConv?.title}
                onBack={() => setSelectedConvId(null)}
                onMessageSent={() => mutateConvs()} 
              />
            ) : (
              <MotionDiv 
                key="empty-state"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-muted/5"
              >
                <div className="w-24 h-24 bg-card rounded-[3rem] flex items-center justify-center mb-8 border border-border shadow-inner">
                   <ChatBubbleLeftRightIcon className="w-12 h-12 text-blue-600/30" />
                </div>
                <h3 className="text-3xl font-black text-foreground tracking-tight mb-4">Support Inbox</h3>
                <p className="text-muted-foreground text-sm font-medium max-w-sm leading-relaxed mx-auto italic">
                    "Great customer support doesn't mean the customer is always right, it means the customer is always heard."
                </p>
                <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <div className="px-6 py-4 bg-muted/30 rounded-2xl border border-border flex items-center gap-2 justify-center">
                        <ClockIcon className="w-4 h-4" /> 24h Response Target
                    </div>
                    <div className="px-6 py-4 bg-muted/30 rounded-2xl border border-border flex items-center gap-2 justify-center">
                        <ShieldCheckIcon className="w-4 h-4" /> Verified User
                    </div>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}

function ChatThread({ conversationId, user, title, onMessageSent, onBack }: any) {
  const { data: msgData, mutate } = useSWR(`/api/admin/chat/messages/${conversationId}`, fetcher, {
    refreshInterval: 3000 // Faster sync for active chat
  })
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [msgData?.messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return

    setIsSending(true)
    try {
      const res = await fetch(`/api/admin/chat/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() })
      })
      if (res.ok) {
        setInput("")
        mutate()
        onMessageSent()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  const messages = msgData?.messages || []

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-4 sm:p-8 border-b border-border bg-card flex items-center justify-between shadow-sm relative z-10">
         <div className="flex items-center gap-4 sm:gap-6 overflow-hidden">
            <button 
              onClick={onBack}
              className="sm:hidden p-3 -ml-3 text-muted-foreground hover:text-foreground transition-all active:scale-90"
            >
               <CircleStackIcon className="w-7 h-7 rotate-90" />
            </button>
            <div className="relative shrink-0">
               {user.image ? <img src={user.image} className="w-12 h-12 rounded-2xl object-cover border border-border" /> : <UserCircleIcon className="w-12 h-12 text-muted-foreground" />}
               <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full" />
            </div>
            <div className="min-w-0">
               <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-black text-foreground leading-tight truncate text-sm sm:text-lg">{user.name || "Verified User"}</h4>
                  <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[8px] font-black uppercase tracking-widest border border-blue-500/10">USER</span>
               </div>
               <p className="text-[10px] sm:text-xs font-black text-blue-600 uppercase tracking-widest opacity-80">{title}</p>
            </div>
         </div>
         <div className="hidden md:flex items-center gap-3">
            <div className="text-right mr-4 border-r border-border pr-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">User Email</p>
                <p className="text-xs font-bold text-foreground">{user.email}</p>
            </div>
            <div className="px-4 py-2 bg-muted/50 rounded-2xl border border-border text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
               <ShieldCheckIcon className="w-4 h-4 text-blue-600" /> Secure Thread
            </div>
         </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-8 custom-scrollbar bg-muted/5">
        {messages.map((msg: any) => {
          const isAdmin = msg.sender === "ADMIN"
          return (
            <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} w-full`}>
              <div className={`max-w-[85%] sm:max-w-[75%] ${isAdmin ? 'text-right' : 'text-left'}`}>
                <div className={`
                    px-5 py-3.5 sm:px-6 sm:py-4 rounded-3xl font-semibold text-sm sm:text-base shadow-md leading-relaxed
                    ${isAdmin 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-card border border-border text-foreground rounded-tl-none'}
                `}>
                  {msg.message.split('\n').map((line: string, i: number) => (
                    <span key={i}>{line}{i !== msg.message.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
                <p className="text-[10px] font-black text-muted-foreground/40 mt-3 flex items-center gap-2 justify-end uppercase tracking-[0.1em] px-2 italic">
                    <ClockIcon className="w-3 h-3" /> {format(new Date(msg.createdAt), 'MMM dd, hh:mm a')}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Reply Area */}
      <div className="p-6 sm:p-8 bg-card border-t border-border shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleSend} className="relative max-w-5xl mx-auto group">
           <textarea 
             value={input}
             onChange={(e) => setInput(e.target.value)}
             placeholder="Compose your reply..."
             rows={1}
             onKeyDown={(e) => {
               if (e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault()
                 handleSend(e as any)
               }
             }}
             className="w-full bg-muted/30 border border-border focus:border-blue-500 rounded-[2rem] py-4 sm:py-5 pl-6 sm:pl-8 pr-16 sm:pr-20 text-sm sm:text-base font-bold resize-none outline-none transition-all shadow-inner placeholder:text-muted-foreground/30 focus:bg-background"
           />
           <button 
             type="submit" 
             disabled={isSending || !input.trim()}
             className="absolute right-3 bottom-3 p-3 sm:p-4 bg-blue-600 text-white rounded-[1.5rem] hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl active:scale-95 group-focus-within:rotate-12"
           >
             <PaperAirplaneIcon className="w-6 h-6 sm:w-7 sm:h-7 -rotate-45" />
           </button>
        </form>
        <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
            <span>Shift + Enter for new line</span>
            <span className="text-blue-500/40">•</span>
            <span>Automated Thread Tracking</span>
            <span className="text-blue-500/40">•</span>
            <span>Real-time Sync Active</span>
        </div>
      </div>
    </div>
  )
}
