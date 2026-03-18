"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckBadgeIcon, FireIcon, XMarkIcon, PaperAirplaneIcon, PlusIcon,
  ChatBubbleLeftRightIcon, ClockIcon, MapPinIcon, StarIcon, UserCircleIcon,
  GlobeAltIcon, ShieldCheckIcon, LanguageIcon, ArrowLeftIcon,
  ChatBubbleOvalLeftEllipsisIcon, ChevronDownIcon, ChevronUpIcon,
  LockClosedIcon, BriefcaseIcon, LinkIcon, DocumentTextIcon,
} from "@heroicons/react/24/outline"
import { StarIcon as StarSolid, CheckBadgeIcon as CheckBadgeSolid } from "@heroicons/react/24/solid"
import { FREELANCERS, CATEGORIES, type Freelancer, type JobPost, type ChatThread } from "./marketplace-data"

// ─── Constants ──────────────────────────────────────────────────────────────
export const AVAIL = { available: "bg-emerald-500", busy: "bg-amber-500", away: "bg-slate-400" }
const LEVEL_COLORS: Record<string, string> = {
  Expert: "text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20",
  Pro: "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
  Rising: "text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20",
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ initials, color, size = "md", avail }: { initials: string; color: string; size?: "sm"|"md"|"lg"; avail?: string }) {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-base" : "w-10 h-10 text-sm"
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sz} rounded-xl bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white shadow-sm`}>{initials}</div>
      {avail && <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${AVAIL[avail as keyof typeof AVAIL]}`} />}
    </div>
  )
}

// ─── StarRow ─────────────────────────────────────────────────────────────────
export function StarRow({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <span className="flex items-center gap-1 text-xs">
      {[1,2,3,4,5].map(i => <StarSolid key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? "text-amber-400" : "text-gray-200 dark:text-slate-700"}`} />)}
      <span className="font-bold text-gray-800 dark:text-white ml-0.5">{rating}</span>
      <span className="text-gray-400 dark:text-slate-500">({reviews})</span>
    </span>
  )
}

// ─── FreelancerCard ───────────────────────────────────────────────────────────
export function FreelancerCard({ f, onViewProfile }: { f: Freelancer; onViewProfile: (f: Freelancer) => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 rounded-2xl p-4 sm:p-5 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-200 dark:hover:border-blue-500/20 transition-all duration-300 flex flex-col gap-3 cursor-pointer group"
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <Avatar initials={f.initials} color={f.avatarColor} avail={f.availability} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{f.name}</p>
            {f.verified && <CheckBadgeIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />}
            {f.topRated && <span className="flex items-center gap-0.5 text-[9px] font-bold bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full flex-shrink-0"><FireIcon className="w-2.5 h-2.5" />Top</span>}
          </div>
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate">{f.title}</p>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 flex items-center gap-0.5 mt-0.5"><MapPinIcon className="w-3 h-3 flex-shrink-0" />{f.location}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${LEVEL_COLORS[f.level] || LEVEL_COLORS.Pro}`}>{f.level}</span>
      </div>

      {/* Bio */}
      <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2">{f.bio}</p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1">
        {f.skills.slice(0, 4).map(s => (
          <span key={s} className="text-[10px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-500/20">{s}</span>
        ))}
        {f.skills.length > 4 && <span className="text-[10px] text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">+{f.skills.length - 4}</span>}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-gray-50 dark:border-slate-800/60 flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <StarRow rating={f.rating} reviews={f.reviews} />
          <p className="text-[10px] text-gray-400 dark:text-slate-500">{f.completedJobs} jobs · {f.responseTime}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900 dark:text-white">${f.hourlyRate}<span className="text-xs font-normal text-gray-400">/hr</span></p>
          <button onClick={() => onViewProfile(f)} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-0.5 block group-hover:text-blue-700">View Profile →</button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── FreelancerProfileModal ───────────────────────────────────────────────────
export function FreelancerProfileModal({ freelancer, onClose, onMessage, onApplyVerification }: {
  freelancer: Freelancer; onClose: () => void; onMessage: (f: Freelancer) => void; onApplyVerification?: () => void
}) {
  const [verifyForm, setVerifyForm] = useState({ portfolioUrl: "", yearsExp: "", category: "", pitch: "" })
  const [verifyStatus, setVerifyStatus] = useState<"idle"|"pending">("idle")
  const [activeTab, setActiveTab] = useState<"profile"|"verify">("profile")

  const submitVerify = () => {
    if (!verifyForm.portfolioUrl || !verifyForm.category || !verifyForm.pitch) return
    setVerifyStatus("pending")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Banner */}
        <div className={`bg-gradient-to-r ${freelancer.avatarColor} p-4 sm:p-5 flex items-end gap-4`}>
          <div className="relative">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">{freelancer.initials}</div>
            {freelancer.verified && <CheckBadgeSolid className="absolute -bottom-1 -right-1 w-5 h-5 text-white drop-shadow" />}
            <span className={`absolute -top-1 left-0 w-3 h-3 rounded-full border-2 border-white ${AVAIL[freelancer.availability]}`} />
          </div>
          <div className="pb-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-white">{freelancer.name}</h2>
              {freelancer.topRated && <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-400/20 border border-amber-300/40 text-amber-100 px-2 py-0.5 rounded-full"><FireIcon className="w-3 h-3" />Top Rated</span>}
            </div>
            <p className="text-white/80 text-sm">{freelancer.title}</p>
          </div>
          <button onClick={onClose} className="self-start p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"><XMarkIcon className="w-5 h-5 text-white" /></button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-100 dark:border-slate-800/60 bg-white dark:bg-slate-900 flex-shrink-0">
          {[{ id:"profile", label:"Profile" }, { id:"verify", label:"✦ Become Verified" }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 py-3 text-xs font-bold transition-colors ${activeTab === t.id ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"}`}
            >{t.label}</button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5">
          {activeTab === "profile" && (
            <div className="space-y-5">
              {/* Meta pills */}
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${LEVEL_COLORS[freelancer.level] || LEVEL_COLORS.Pro}`}>{freelancer.level}</span>
                <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full"><MapPinIcon className="w-3.5 h-3.5" />{freelancer.location}</span>
                <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full"><ClockIcon className="w-3.5 h-3.5" />Responds {freelancer.responseTime}</span>
                <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full"><GlobeAltIcon className="w-3.5 h-3.5" />Since {freelancer.joinedDate}</span>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Rating", value: `${freelancer.rating}★`, sub: `${freelancer.reviews} reviews` },
                  { label: "Hourly Rate", value: `$${freelancer.hourlyRate}`, sub: "per hour" },
                  { label: "Jobs Done", value: freelancer.completedJobs.toString(), sub: "completed" },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 dark:bg-slate-800/60 rounded-xl p-3 text-center">
                    <p className="text-base font-bold text-gray-900 dark:text-white">{s.value}</p>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
              {/* Bio */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">About</h3>
                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{freelancer.bio}</p>
              </div>
              {/* Skills */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {freelancer.skills.map(s => (
                    <span key={s} className="text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20 px-2.5 py-1 rounded-lg">{s}</span>
                  ))}
                </div>
              </div>
              {/* Portfolio */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">Portfolio Highlights</h3>
                <div className="space-y-2">
                  {freelancer.portfolio.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />{p}
                    </div>
                  ))}
                </div>
              </div>
              {/* Languages */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">Languages</h3>
                <div className="flex flex-wrap gap-1.5">
                  {freelancer.languages.map(l => (
                    <span key={l} className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full"><LanguageIcon className="w-3.5 h-3.5" />{l}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "verify" && (
            <div className="space-y-5">
              {freelancer.verificationStatus === "verified" ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                    <CheckBadgeSolid className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">Verified Freelancer</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs">You are a verified member of the LetsEarnify freelancer network. You can respond to job posts and receive direct inquiries.</p>
                </div>
              ) : verifyStatus === "pending" ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                    <ClockIcon className="w-8 h-8 text-amber-500" />
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">Application Submitted</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs">Your verification application is under review. You'll be notified within 2-3 business days once approved.</p>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1.5 rounded-full">🕐 Pending Review</span>
                </div>
              ) : (
                <>
                  {/* Explanation */}
                  <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4 flex gap-3">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">Why become a Verified Freelancer?</p>
                      <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 leading-relaxed">
                        <li>• Respond to job posts and reach clients directly</li>
                        <li>• Get a verified badge on your profile</li>
                        <li>• Priority ranking in freelancer search results</li>
                        <li>• Receive direct inquiries from clients</li>
                      </ul>
                    </div>
                  </div>
                  {/* Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Portfolio / Work Samples URL *</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input value={verifyForm.portfolioUrl} onChange={e => setVerifyForm(p => ({ ...p, portfolioUrl: e.target.value }))}
                          placeholder="https://your-portfolio.com"
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Years of Experience *</label>
                        <select value={verifyForm.yearsExp} onChange={e => setVerifyForm(p => ({ ...p, yearsExp: e.target.value }))}
                          className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                          <option value="">Select…</option>
                          {["0–1 years","1–2 years","2–4 years","4–7 years","7+ years"].map(v => <option key={v}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Primary Category *</label>
                        <select value={verifyForm.category} onChange={e => setVerifyForm(p => ({ ...p, category: e.target.value }))}
                          className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                          <option value="">Select…</option>
                          {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Professional Pitch *</label>
                      <textarea rows={4} value={verifyForm.pitch} onChange={e => setVerifyForm(p => ({ ...p, pitch: e.target.value }))}
                        placeholder="Briefly describe your expertise, notable projects, and what makes you stand out as a professional…"
                        className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none" />
                    </div>
                    <button onClick={submitVerify}
                      disabled={!verifyForm.portfolioUrl || !verifyForm.category || !verifyForm.pitch}
                      className="w-full py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-2">
                      <DocumentTextIcon className="w-4 h-4" />
                      Submit Verification Application
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer CTA (only on profile tab) */}
        {activeTab === "profile" && (
          <div className="px-4 sm:px-5 py-4 border-t border-gray-100 dark:border-slate-800/60 flex gap-3 bg-white dark:bg-slate-900 flex-shrink-0">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Close</button>
            <button onClick={() => { onMessage(freelancer); onClose() }}
              className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-2">
              <ChatBubbleLeftRightIcon className="w-4 h-4" />Send Message
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ─── InboxPanel ───────────────────────────────────────────────────────────────
export function InboxPanel({ threads, freelancers, activeId, onSelect, onSend, onClose }: {
  threads: ChatThread[]; freelancers: Freelancer[]
  activeId: string | null; onSelect: (id: string) => void
  onSend: (id: string, text: string) => void; onClose: () => void
}) {
  const [input, setInput] = useState("")
  const active = threads.find(t => t.id === activeId)
  const activeFl = activeId ? freelancers.find(f => f.id === activeId) : null
  const send = () => {
    if (!input.trim() || !activeId) return
    onSend(activeId, input.trim())
    setInput("")
    setTimeout(() => onSend(activeId + "__them", ["Thank you for reaching out! I'd be happy to discuss your project.","That sounds great. Could you share more details?","I'm available and interested. When would you like to start?"][Math.floor(Math.random()*3)]), 1200)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center sm:justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm sm:backdrop-blur-none sm:bg-transparent" onClick={onClose} />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative z-10 flex w-full sm:w-[400px] h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-gray-100 dark:border-slate-800/60 flex-col">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-slate-800/60 flex-shrink-0">
          {activeFl && <button onClick={() => onSelect("")} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"><ArrowLeftIcon className="w-4 h-4" /></button>}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">{activeFl ? activeFl.name : "Messages"}</h2>
            {activeFl && <p className="text-xs text-gray-400 dark:text-slate-500">{activeFl.title}</p>}
            {!activeFl && <p className="text-xs text-gray-400 dark:text-slate-500">{threads.length} conversation{threads.length !== 1 ? "s" : ""}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"><XMarkIcon className="w-5 h-5" /></button>
        </div>

        {!activeFl && (
          <div className="flex-1 overflow-y-auto">
            {threads.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-3">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-200 dark:text-slate-700" />
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">No messages yet</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 max-w-[200px] leading-relaxed">Visit a freelancer's profile and tap "Send Message" to start a conversation.</p>
              </div>
            )}
            {threads.map(t => {
              const fl = freelancers.find(f => f.id === t.id); if (!fl) return null
              const last = t.messages[t.messages.length - 1]
              return (
                <button key={t.id} onClick={() => onSelect(t.id)} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 dark:border-slate-800/40 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors text-left">
                  <Avatar initials={fl.initials} color={fl.avatarColor} avail={fl.availability} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{fl.name}</p>
                      {last && <span className="text-[10px] text-gray-400 dark:text-slate-500 flex-shrink-0">{last.time}</span>}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{fl.title}</p>
                    {last && <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">{last.from === "me" ? "You: " : ""}{last.text}</p>}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {activeFl && active && (
          <>
            <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-slate-950/50 px-4 py-4 space-y-3">
              {active.messages.length === 0 && <div className="text-center py-8"><p className="text-xs text-gray-400 dark:text-slate-500">Start your conversation with {activeFl.name.split(" ")[0]}</p></div>}
              {active.messages.map(m => (
                <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${m.from === "me" ? "bg-blue-600 text-white rounded-br-sm" : "bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-100 dark:border-slate-700 rounded-bl-sm"}`}>
                    <p>{m.text}</p>
                    <p className={`text-[10px] mt-1 ${m.from === "me" ? "text-blue-200" : "text-gray-400 dark:text-slate-500"}`}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-3 py-3 border-t border-gray-100 dark:border-slate-800/60 bg-white dark:bg-slate-900 flex gap-2 flex-shrink-0">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder={`Message ${activeFl.name.split(" ")[0]}…`}
                className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
              <button onClick={send} className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex-shrink-0"><PaperAirplaneIcon className="w-4 h-4" /></button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

// ─── JobPostCard ──────────────────────────────────────────────────────────────
export function JobPostCard({ post, onViewFreelancerProfile, userIsVerified, onApplyVerification }: {
  post: JobPost; onViewFreelancerProfile: (f: Freelancer) => void; userIsVerified: boolean; onApplyVerification: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [comments, setComments] = useState(post.comments)
  const [commentText, setCommentText] = useState("")

  const submitComment = () => {
    if (!commentText.trim()) return
    setComments(prev => [...prev, { id: Date.now().toString(), freelancerId: "me", freelancerName: "You", freelancerInitials: "ME", freelancerColor: "from-blue-500 to-indigo-600", freelancerTitle: "Platform User", text: commentText.trim(), postedAt: "Just now", verified: false }])
    setCommentText(""); setShowCommentForm(false)
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Post header */}
      <div className="px-4 sm:px-6 pt-5 pb-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${post.clientColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>{post.clientInitials}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{post.clientName}</p>
              <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1 flex-shrink-0"><ClockIcon className="w-3.5 h-3.5" />{post.postedAt}</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500">Client · Verified Account</p>
          </div>
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 leading-snug">{post.title}</h3>
        <div className="flex gap-2 flex-wrap mb-3">
          <span className="text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-500/20">{post.category}</span>
          <span className="text-xs text-gray-600 dark:text-slate-400 flex items-center gap-1">💰 {post.budget}</span>
          <span className="text-xs text-gray-600 dark:text-slate-400 flex items-center gap-1">📅 {post.deadline}</span>
        </div>
        <p className={`text-sm text-gray-600 dark:text-slate-400 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>{post.description}</p>
        <button onClick={() => setExpanded(v => !v)} className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-0.5 hover:underline">
          {expanded ? <><ChevronUpIcon className="w-3.5 h-3.5" />Show less</> : <><ChevronDownIcon className="w-3.5 h-3.5" />Read more</>}
        </button>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.skills.map(s => <span key={s} className="text-[10px] font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-2 py-0.5 rounded-md">{s}</span>)}
        </div>
      </div>

      {/* Comments section */}
      <div className="border-t border-gray-100 dark:border-slate-800/60 bg-gray-50/50 dark:bg-slate-950/30">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
            <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" />
            {comments.length} freelancer {comments.length === 1 ? "response" : "responses"}
          </p>
          {userIsVerified ? (
            <button onClick={() => setShowCommentForm(v => !v)} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <PlusIcon className="w-3.5 h-3.5" />Apply / Respond
            </button>
          ) : (
            <button onClick={onApplyVerification} className="flex items-center gap-1 text-xs font-semibold text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <LockClosedIcon className="w-3.5 h-3.5" />Verified Only
            </button>
          )}
        </div>

        {/* Unverified notice */}
        {!userIsVerified && (
          <div className="mx-4 sm:mx-6 mb-3 px-3 py-2.5 bg-gray-100 dark:bg-slate-800/60 rounded-xl flex items-start gap-2.5">
            <LockClosedIcon className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              Only verified freelancers can respond to job posts.{" "}
              <button onClick={onApplyVerification} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Apply for Verification →</button>
            </p>
          </div>
        )}

        <AnimatePresence>
          {showCommentForm && userIsVerified && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-4 sm:px-6 pb-3">
              <textarea rows={3} value={commentText} onChange={e => setCommentText(e.target.value)}
                placeholder="Introduce yourself and explain how you can help with this project. Be professional and specific…"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none" />
              <div className="flex gap-2 mt-2">
                <button onClick={() => setShowCommentForm(false)} className="text-xs font-medium text-gray-500 dark:text-slate-400 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button onClick={submitComment} className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors shadow-sm shadow-blue-500/20">Submit Response</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {comments.length > 0 && (
          <div className="divide-y divide-gray-100 dark:divide-slate-800/40">
            {comments.map(c => {
              const fl = FREELANCERS.find(f => f.id === c.freelancerId)
              return (
                <div key={c.id} className="px-4 sm:px-6 py-3.5 flex gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.freelancerColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{c.freelancerInitials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{c.freelancerName}</p>
                      {c.verified && <span className="flex items-center gap-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-500/20"><CheckBadgeIcon className="w-3 h-3" />Verified</span>}
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-auto flex-shrink-0">{c.postedAt}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">{c.freelancerTitle}</p>
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{c.text}</p>
                    {fl && <button onClick={() => onViewFreelancerProfile(fl)} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-1.5 flex items-center gap-0.5"><UserCircleIcon className="w-3.5 h-3.5" />View Profile & Message</button>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PostJobModal ─────────────────────────────────────────────────────────────
export function PostJobModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ title: "", category: "", budget: "", deadline: "", description: "", skills: "" })
  const [submitted, setSubmitted] = useState(false)
  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }))
  if (submitted) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-4"><BriefcaseIcon className="w-8 h-8 text-emerald-500" /></div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">Job Posted!</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">Your job post is now live. Verified freelancers will start responding shortly.</p>
        <button onClick={onClose} className="w-full py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">Done</button>
      </motion.div>
    </div>
  )
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-gray-100 dark:border-slate-800/60 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Post a Job</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Verified freelancers will respond publicly. You review profiles and message directly.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {[
            { label: "Job Title", field: "title" as const, placeholder: "e.g. Need a React developer for a dashboard project" },
            { label: "Budget", field: "budget" as const, placeholder: "e.g. $500 – $1,000 or $30/hr" },
            { label: "Deadline", field: "deadline" as const, placeholder: "e.g. 2 weeks, 1 month" },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>
              <input value={form[field]} onChange={e => set(field, e.target.value)} placeholder={placeholder}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Category</label>
            <select value={form.category} onChange={e => set("category", e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
              <option value="">Select a category…</option>
              {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Project Description</label>
            <textarea rows={4} value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="Describe your project clearly — scope, deliverables, requirements, and any relevant context…"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Required Skills</label>
            <input value={form.skills} onChange={e => set("skills", e.target.value)} placeholder="e.g. React, TypeScript, Node.js"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 flex gap-2.5">
            <ShieldCheckIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">Only verified freelancers can respond. You review their comments, visit their profile, and initiate a private message when ready.</p>
          </div>
        </div>
        <div className="px-5 sm:px-6 py-4 border-t border-gray-100 dark:border-slate-800/60 flex gap-3 flex-shrink-0 bg-white dark:bg-slate-900">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={() => setSubmitted(true)} className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-colors">Publish Job Post</button>
        </div>
      </motion.div>
    </div>
  )
}
