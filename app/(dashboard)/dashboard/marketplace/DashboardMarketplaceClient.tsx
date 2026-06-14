"use client"

import { useState, useMemo } from "react"
import { AnimatePresence } from "framer-motion"
import {
  MagnifyingGlassIcon, PlusIcon, ChatBubbleLeftRightIcon,
  BriefcaseIcon, StarIcon, ShieldCheckIcon, ClockIcon, GlobeAltIcon,
  FunnelIcon, ArrowsUpDownIcon,
} from "@heroicons/react/24/outline"
import {
  CATEGORIES, CATEGORY_ICONS, FREELANCERS, JOB_POSTS,
  type Freelancer, type ChatThread,
} from "./marketplace-data"
import {
  FreelancerCard, FreelancerProfileModal, InboxPanel, JobPostCard, PostJobModal,
} from "./marketplace-components"

const SORT_OPTIONS = [
  { id: "top", label: "Top Rated" },
  { id: "price_asc", label: "Lowest Rate" },
  { id: "price_desc", label: "Highest Rate" },
  { id: "jobs", label: "Most Jobs" },
]

// Simulated: current user is not yet verified (they can apply)
const CURRENT_USER_VERIFIED = false

export default function DashboardMarketplaceClient() {
  const [tab, setTab] = useState<"freelancers" | "posts">("freelancers")
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [sortBy, setSortBy] = useState("top")
  const [selectedProfile, setSelectedProfile] = useState<Freelancer | null>(null)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [showInbox, setShowInbox] = useState(false)
  const [inboxActive, setInboxActive] = useState<string | null>(null)
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [showPostJob, setShowPostJob] = useState(false)

  const openMessage = (fl: Freelancer) => {
    setThreads(prev => prev.find((t: any) => t.id === fl.id) ? prev : [...prev, { id: fl.id, freelancerId: fl.id, messages: [] }])
    setInboxActive(fl.id)
    setShowInbox(true)
  }

  const sendMsg = (id: string, text: string) => {
    const isReply = id.endsWith("__them")
    const realId = id.replace("__them", "")
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    setThreads(prev => prev.map((t: any) =>
      t.id === realId ? { ...t, messages: [...t.messages, { id: Date.now().toString(), from: isReply ? "them" : "me", text, time: now }] } : t
    ))
  }

  const handleApplyVerification = () => {
    // Open the logged-in user's own profile at the verify tab
    // For simulation, open the first freelancer profile at verify tab
    const mockSelf = { ...FREELANCERS[0], name: "You", initials: "ME", verificationStatus: "none" as const }
    setSelectedProfile(mockSelf as Freelancer)
  }

  const filtered = useMemo(() => {
    let r = FREELANCERS.filter((f: any) => f.verified)
    if (activeCategory !== "All") r = r.filter((f: any) => f.category === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter((f: any) =>
        f.name.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.skills.some((s: any) => s.toLowerCase().includes(q))
      )
    }
    if (sortBy === "top") r = [...r].sort((a: any, b: any) => b.rating - a.rating)
    if (sortBy === "price_asc") r = [...r].sort((a: any, b: any) => a.hourlyRate - b.hourlyRate)
    if (sortBy === "price_desc") r = [...r].sort((a: any, b: any) => b.hourlyRate - a.hourlyRate)
    if (sortBy === "jobs") r = [...r].sort((a: any, b: any) => b.completedJobs - a.completedJobs)
    return r
  }, [search, activeCategory, sortBy])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">

      {/* ── HEADER ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800/60">

        {/* Hero banner */}
        <div className="relative overflow-hidden px-4 sm:px-6 md:px-8 pt-6 pb-5"
          style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1a4e 50%, #0d1b3e 100%)" }}>
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
                  <BriefcaseIcon className="w-4 h-4 text-blue-300" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-300/80">Freelance Marketplace</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-1">
                Hire{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">Verified</span>{" "}
                Professionals
              </h1>
              <p className="text-sm text-white/50 max-w-md">Connect with vetted freelancers or post your project and let them come to you</p>
            </div>
            {/* CTAs */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button onClick={() => { setShowInbox(true); setInboxActive(null) }}
                className="relative flex items-center gap-1.5 text-xs font-semibold text-white/80 bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-2 rounded-xl transition-all hover:scale-105 active:scale-95">
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                Inbox
                {threads.length > 0 && <span className="w-2 h-2 rounded-full bg-blue-400 absolute -top-0.5 -right-0.5 border border-slate-900 animate-pulse" />}
              </button>
              <button onClick={() => setShowPostJob(true)}
                className="group flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 border border-blue-500/50 hover:scale-105 active:scale-95">
                <PlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                Post a Job
              </button>
            </div>
          </div>

          {/* Trust strip */}
          <div className="relative z-10 flex gap-4 sm:gap-6 mt-4 overflow-x-auto pb-0.5 scrollbar-hide">
            {[
              { icon: <ShieldCheckIcon className="w-3.5 h-3.5" />, text: "Company-Verified Only" },
              { icon: <StarIcon className="w-3.5 h-3.5" />, text: "4.8★ Avg. Rating" },
              { icon: <ClockIcon className="w-3.5 h-3.5" />, text: "< 2hrs Response" },
              { icon: <GlobeAltIcon className="w-3.5 h-3.5" />, text: "75+ Countries" },
            ].map((s: any) => (
              <span key={s.text} className="flex items-center gap-1.5 text-[11px] text-white/40 whitespace-nowrap flex-shrink-0">
                <span className="text-blue-400">{s.icon}</span>{s.text}
              </span>
            ))}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="px-4 sm:px-6 md:px-8 py-3 flex gap-1 bg-white dark:bg-slate-900">
          <div className="flex gap-1 bg-gray-100 dark:bg-slate-800/60 p-1 rounded-xl w-full sm:w-auto">
            {([
              { id: "freelancers", label: "🔍 Find Freelancers" },
              { id: "posts", label: "📋 Job Posts" },
            ] as const).map((t: any) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 sm:flex-initial px-5 py-2 text-xs font-bold rounded-lg capitalize transition-all ${tab === t.id ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FIND FREELANCERS TAB ── */}
      {tab === "freelancers" && (
        <div className="px-4 sm:px-6 md:px-8 py-5 space-y-4">

          {/* Search + Sort Row */}
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by skill, title, or freelancer name… (e.g. React, UI Designer, SEO)"
                className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/60 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-sm transition-all"
              />
            </div>
            <div className="relative flex-shrink-0">
              <ArrowsUpDownIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="pl-9 pr-4 py-3 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/60 rounded-2xl text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-sm appearance-none cursor-pointer w-full sm:w-auto">
                {SORT_OPTIONS.map((o: any) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <FunnelIcon className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
            {CATEGORIES.map((cat: any) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-xl border whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5 ${
                  activeCategory === cat
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-400"
                }`}>
                <span>{CATEGORY_ICONS[cat] || "📁"}</span>
                {cat}
              </button>
            ))}
          </div>

          {/* Result count */}
          <p className="text-xs text-gray-400 dark:text-slate-500">
            Showing{" "}
            <span className="font-semibold text-gray-700 dark:text-slate-300">{filtered.length}</span>{" "}
            verified freelancer{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "All" && <> in <span className="font-semibold text-gray-700 dark:text-slate-300">{activeCategory}</span></>}
            {search && <> matching <span className="font-semibold text-gray-700 dark:text-slate-300">"{search}"</span></>}
          </p>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-200 dark:text-slate-700" />
              <p className="text-sm font-bold text-gray-500 dark:text-slate-400">No freelancers found</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">Try a different search term or category</p>
              <button onClick={() => { setSearch(""); setActiveCategory("All") }} className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((f: any) => <FreelancerCard key={f.id} f={f} onViewProfile={setSelectedProfile} />)}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* ── JOB POSTS TAB ── */}
      {tab === "posts" && (
        <div className="px-4 sm:px-6 md:px-8 py-5 space-y-4 max-w-4xl">
          {/* Section header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Job Posts</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 max-w-lg">
                Post your project requirements. Verified freelancers respond publicly. You review their profiles and initiate a private message when ready.
              </p>
            </div>
            <button onClick={() => setShowPostJob(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-colors flex-shrink-0">
              <PlusIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Post a Job</span>
              <span className="sm:hidden">Post</span>
            </button>
          </div>

          {/* Unverified call-to-action */}
          {!CURRENT_USER_VERIFIED && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border border-indigo-100 dark:border-indigo-800/40 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Are you a freelancer?</p>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">Apply for verification to respond to job posts and receive direct client inquiries.</p>
              </div>
              <button onClick={handleApplyVerification}
                className="flex-shrink-0 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors">
                Apply Now
              </button>
            </div>
          )}

          {/* Job post list */}
          <div className="space-y-4">
            {JOB_POSTS.map((post: any) => (
              <JobPostCard
                key={post.id}
                post={post}
                onViewFreelancerProfile={setSelectedProfile}
                userIsVerified={CURRENT_USER_VERIFIED}
                onApplyVerification={handleApplyVerification}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      <AnimatePresence>
        {selectedProfile && (
          <FreelancerProfileModal
            freelancer={selectedProfile}
            onClose={() => setSelectedProfile(null)}
            onMessage={fl => { setSelectedProfile(null); openMessage(fl) }}
          />
        )}
        {showInbox && (
          <InboxPanel
            threads={threads} freelancers={FREELANCERS}
            activeId={inboxActive}
            onSelect={id => setInboxActive(id || null)}
            onSend={sendMsg}
            onClose={() => { setShowInbox(false); setInboxActive(null) }}
          />
        )}
        {showPostJob && <PostJobModal onClose={() => setShowPostJob(false)} />}
      </AnimatePresence>
    </div>
  )
}
