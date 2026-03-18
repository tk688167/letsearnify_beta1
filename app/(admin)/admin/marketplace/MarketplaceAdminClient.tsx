"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BriefcaseIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckBadgeIcon,
  StarIcon,
  UserGroupIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  FireIcon,
  GlobeAltIcon,
  AdjustmentsHorizontalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TagIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline"
import { StarIcon as StarSolid } from "@heroicons/react/24/solid"

// ─── Types ────────────────────────────────────────────────────────────────────

interface FreelancerProfile {
  id: string
  name: string
  email: string
  title: string
  category: string
  skills: string[]
  rating: number
  reviews: number
  hourlyRate: number
  verified: boolean
  topRated: boolean
  visible: boolean
  status: "active" | "pending" | "suspended"
  location: string
  completedJobs: number
  joinedDate: string
  initials: string
  avatarColor: string
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  freelancerCount: number
  visible: boolean
  featured: boolean
  order: number
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SAMPLE_FREELANCERS: FreelancerProfile[] = [
  { id: "1", name: "Sarah Chen", email: "sarah@example.com", title: "Full-Stack Developer", category: "Development & IT", skills: ["React", "Node.js", "TypeScript"], rating: 4.9, reviews: 187, hourlyRate: 65, verified: true, topRated: true, visible: true, status: "active", location: "United States", completedJobs: 234, joinedDate: "Jan 2024", initials: "SC", avatarColor: "from-violet-500 to-purple-700" },
  { id: "2", name: "Marcus Rivera", email: "marcus@example.com", title: "UI/UX Designer", category: "Design & Creative", skills: ["Figma", "Webflow", "Motion Design"], rating: 4.8, reviews: 142, hourlyRate: 55, verified: true, topRated: true, visible: true, status: "active", location: "Spain", completedJobs: 179, joinedDate: "Feb 2024", initials: "MR", avatarColor: "from-blue-500 to-cyan-600" },
  { id: "3", name: "Aisha Okafor", email: "aisha@example.com", title: "Digital Marketing Strategist", category: "Digital Marketing", skills: ["SEO", "Google Ads", "Analytics"], rating: 4.7, reviews: 98, hourlyRate: 48, verified: true, topRated: false, visible: true, status: "active", location: "Nigeria", completedJobs: 113, joinedDate: "Mar 2024", initials: "AO", avatarColor: "from-amber-500 to-orange-600" },
  { id: "4", name: "Liam O'Brien", email: "liam@example.com", title: "Content Writer", category: "Writing & Content", skills: ["Copywriting", "SEO Writing", "Blog Posts"], rating: 4.9, reviews: 231, hourlyRate: 35, verified: true, topRated: true, visible: true, status: "active", location: "Ireland", completedJobs: 312, joinedDate: "Jan 2024", initials: "LO", avatarColor: "from-emerald-500 to-teal-600" },
  { id: "5", name: "Yuki Tanaka", email: "yuki@example.com", title: "AI & ML Engineer", category: "AI & Machine Learning", skills: ["Python", "TensorFlow", "LLMs"], rating: 5.0, reviews: 63, hourlyRate: 95, verified: true, topRated: true, visible: true, status: "active", location: "Japan", completedJobs: 78, joinedDate: "Apr 2024", initials: "YT", avatarColor: "from-sky-500 to-blue-700" },
  { id: "6", name: "Priya Sharma", email: "priya@example.com", title: "Video Editor", category: "Video & Animation", skills: ["Premiere Pro", "After Effects", "DaVinci"], rating: 4.8, reviews: 115, hourlyRate: 42, verified: true, topRated: false, visible: false, status: "pending", location: "India", completedJobs: 148, joinedDate: "May 2024", initials: "PS", avatarColor: "from-pink-500 to-rose-600" },
  { id: "7", name: "Carlos Mendes", email: "carlos@example.com", title: "Cybersecurity Consultant", category: "Cybersecurity", skills: ["Penetration Testing", "OWASP", "SOC2"], rating: 4.9, reviews: 47, hourlyRate: 110, verified: true, topRated: true, visible: true, status: "active", location: "Brazil", completedJobs: 58, joinedDate: "Feb 2024", initials: "CM", avatarColor: "from-red-500 to-rose-700" },
  { id: "8", name: "James Osei", email: "james@example.com", title: "Music Producer", category: "Music & Audio", skills: ["Music Production", "Mixing", "Mastering"], rating: 4.6, reviews: 79, hourlyRate: 38, verified: false, topRated: false, visible: true, status: "suspended", location: "Ghana", completedJobs: 91, joinedDate: "Jun 2024", initials: "JO", avatarColor: "from-yellow-500 to-amber-600" },
]

const SAMPLE_CATEGORIES: Category[] = [
  { id: "1", name: "Development & IT", slug: "development", icon: "💻", freelancerCount: 612, visible: true, featured: true, order: 1 },
  { id: "2", name: "Design & Creative", slug: "design", icon: "🎨", freelancerCount: 438, visible: true, featured: true, order: 2 },
  { id: "3", name: "Digital Marketing", slug: "marketing", icon: "📢", freelancerCount: 317, visible: true, featured: true, order: 3 },
  { id: "4", name: "Writing & Content", slug: "writing", icon: "✍️", freelancerCount: 285, visible: true, featured: false, order: 4 },
  { id: "5", name: "Video & Animation", slug: "video", icon: "🎬", freelancerCount: 198, visible: true, featured: false, order: 5 },
  { id: "6", name: "Music & Audio", slug: "music", icon: "🎵", freelancerCount: 142, visible: true, featured: false, order: 6 },
  { id: "7", name: "Finance & Accounting", slug: "finance", icon: "💰", freelancerCount: 178, visible: true, featured: false, order: 7 },
  { id: "8", name: "AI & Machine Learning", slug: "ai", icon: "🤖", freelancerCount: 312, visible: true, featured: true, order: 8 },
  { id: "9", name: "Cybersecurity", slug: "cybersecurity", icon: "🔐", freelancerCount: 87, visible: true, featured: false, order: 9 },
  { id: "10", name: "Translation", slug: "translation", icon: "🌐", freelancerCount: 254, visible: false, featured: false, order: 10 },
]

const TABS = [
  { id: "freelancers", label: "Freelancers", icon: UserGroupIcon },
  { id: "categories", label: "Categories", icon: Squares2X2Icon },
  { id: "settings", label: "Settings", icon: Cog6ToothIcon },
]

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  suspended: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20",
}

const STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-500",
  pending: "bg-amber-500",
  suspended: "bg-red-500",
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: string
}) {
  const Icon = icon
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 rounded-2xl p-3 md:p-5">
      <div className="flex items-start justify-between gap-1 mb-2">
        <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide leading-tight">{label}</p>
        <div className={`w-7 h-7 md:w-8 md:h-8 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
        </div>
      </div>
      <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-[10px] md:text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">{sub}</p>}
    </div>
  )
}

// ─── Freelancers Tab ──────────────────────────────────────────────────────────

function FreelancersTab() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [freelancers, setFreelancers] = useState(SAMPLE_FREELANCERS)

  const filtered = freelancers.filter((f) => {
    const matchSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || f.status === statusFilter
    return matchSearch && matchStatus
  })

  const toggleVisible = (id: string) =>
    setFreelancers((prev) => prev.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)))

  const toggleVerified = (id: string) =>
    setFreelancers((prev) => prev.map((f) => (f.id === id ? { ...f, verified: !f.verified } : f)))

  const toggleTopRated = (id: string) =>
    setFreelancers((prev) => prev.map((f) => (f.id === id ? { ...f, topRated: !f.topRated } : f)))

  const setStatus = (id: string, status: FreelancerProfile["status"]) =>
    setFreelancers((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)))

  return (
    <div className="space-y-4">
      {/* ── Filter bar ── */}
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="relative w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, title, or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/60 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        {/* Status pills — horizontally scrollable on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <FunnelIcon className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
          {["all", "active", "pending", "suspended"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg capitalize whitespace-nowrap flex-shrink-0 transition-colors ${
                statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mobile: card list ── */}
      <div className="md:hidden space-y-3">
        {filtered.map((f) => (
          <div
            key={f.id}
            className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 rounded-2xl p-4"
          >
            {/* Top row: avatar + name + status */}
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.avatarColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <span className="text-white text-xs font-bold">{f.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{f.name}</p>
                  {f.verified && <CheckBadgeIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                  {f.topRated && <FireIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{f.title}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{f.email}</p>
              </div>
              {/* Status badge */}
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg border flex-shrink-0 ${STATUS_COLORS[f.status]}`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[f.status]}`} />
                <span className="capitalize">{f.status}</span>
              </div>
            </div>

            {/* Details row */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400 mb-3 flex-wrap">
              <span className="flex items-center gap-1">
                <StarSolid className="w-3 h-3 text-amber-400" />
                <span className="font-semibold text-gray-800 dark:text-white">{f.rating}</span>
                <span>({f.reviews})</span>
              </span>
              <span className="font-semibold text-gray-800 dark:text-white">${f.hourlyRate}/hr</span>
              <span>{f.completedJobs} jobs</span>
              <span>📍 {f.location}</span>
            </div>

            {/* Bottom: status change + action buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-gray-100 dark:border-slate-800/50">
              {/* Status select */}
              <div className="relative flex-shrink-0">
                <select
                  value={f.status}
                  onChange={(e) => setStatus(f.id, e.target.value as FreelancerProfile["status"])}
                  className={`text-xs font-semibold pl-2 pr-6 py-1 rounded-lg border cursor-pointer focus:outline-none appearance-none ${STATUS_COLORS[f.status]}`}
                  style={{ background: "transparent" }}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
                <ChevronDownIcon className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                {/* Visibility */}
                <button
                  onClick={() => toggleVisible(f.id)}
                  title={f.visible ? "Hide" : "Show"}
                  className={`p-2 rounded-lg transition-colors ${
                    f.visible
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                      : "text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800"
                  }`}
                >
                  {f.visible ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                </button>
                {/* Verify */}
                <button
                  onClick={() => toggleVerified(f.id)}
                  title={f.verified ? "Remove verification" : "Verify"}
                  className={`p-2 rounded-lg transition-colors ${
                    f.verified
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                      : "text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800"
                  }`}
                >
                  <CheckBadgeIcon className="w-4 h-4" />
                </button>
                {/* Top Rated */}
                <button
                  onClick={() => toggleTopRated(f.id)}
                  title={f.topRated ? "Remove Top Rated" : "Mark Top Rated"}
                  className={`p-2 rounded-lg transition-colors ${
                    f.topRated
                      ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10"
                      : "text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800"
                  }`}
                >
                  <FireIcon className="w-4 h-4" />
                </button>
                {/* Edit */}
                <button
                  title="Edit"
                  className="p-2 rounded-lg text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
                {/* Delete */}
                <button
                  title="Delete"
                  className="p-2 rounded-lg text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-slate-500 text-sm">
            No freelancers match your filters.
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-400 dark:text-slate-500 px-1">
          <span>Showing {filtered.length} of {freelancers.length}</span>
          <button className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Export CSV</button>
        </div>
      </div>

      {/* ── Desktop: table ── */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800/60 bg-gray-50/50 dark:bg-slate-800/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Freelancer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Rate</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/40">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${f.avatarColor} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-bold">{f.initials}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">{f.name}</p>
                          {f.verified && <CheckBadgeIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                          {f.topRated && <FireIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[150px]">{f.title}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 truncate max-w-[150px]">{f.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-600 dark:text-slate-400">{f.category}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">📍 {f.location}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <StarSolid className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{f.rating}</span>
                      <span className="text-xs text-gray-400 dark:text-slate-500">({f.reviews})</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{f.completedJobs} jobs</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">${f.hourlyRate}/hr</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <select
                        value={f.status}
                        onChange={(e) => setStatus(f.id, e.target.value as FreelancerProfile["status"])}
                        className={`text-xs font-semibold pl-2 pr-6 py-1 rounded-lg border cursor-pointer focus:outline-none appearance-none ${STATUS_COLORS[f.status]}`}
                        style={{ background: "transparent" }}
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      <ChevronDownIcon className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleVisible(f.id)} title={f.visible ? "Hide" : "Show"}
                        className={`p-1.5 rounded-lg transition-colors ${f.visible ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800"}`}>
                        {f.visible ? <EyeIcon className="w-3.5 h-3.5" /> : <EyeSlashIcon className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => toggleVerified(f.id)} title={f.verified ? "Remove verification" : "Verify"}
                        className={`p-1.5 rounded-lg transition-colors ${f.verified ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10" : "text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800"}`}>
                        <CheckBadgeIcon className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleTopRated(f.id)} title={f.topRated ? "Remove Top Rated" : "Mark Top Rated"}
                        className={`p-1.5 rounded-lg transition-colors ${f.topRated ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10" : "text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800"}`}>
                        <FireIcon className="w-3.5 h-3.5" />
                      </button>
                      <button title="Edit" className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                        <PencilSquareIcon className="w-3.5 h-3.5" />
                      </button>
                      <button title="Delete" className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-slate-500">
            Showing {filtered.length} of {freelancers.length} freelancers
          </p>
          <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Export CSV
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Categories Tab ───────────────────────────────────────────────────────────

function CategoriesTab() {
  const [categories, setCategories] = useState(SAMPLE_CATEGORIES)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatIcon, setNewCatIcon] = useState("🎯")

  const toggleVisibility = (id: string) =>
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)))

  const toggleFeatured = (id: string) =>
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, featured: !c.featured } : c)))

  const moveOrder = (id: string, dir: -1 | 1) => {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === id)
      if (idx < 0) return prev
      const next = [...prev]
      const swapIdx = idx + dir
      if (swapIdx < 0 || swapIdx >= next.length) return prev
      ;[next[idx].order, next[swapIdx].order] = [next[swapIdx].order, next[idx].order]
      return [...next].sort((a, b) => a.order - b.order)
    })
  }

  const addCategory = () => {
    if (!newCatName.trim()) return
    const id = (categories.length + 1).toString()
    setCategories((prev) => [
      ...prev,
      { id, name: newCatName, slug: newCatName.toLowerCase().replace(/\s+/g, "-"), icon: newCatIcon, freelancerCount: 0, visible: true, featured: false, order: categories.length + 1 },
    ])
    setNewCatName("")
    setNewCatIcon("🎯")
    setShowAddForm(false)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Control category order, visibility &amp; featured status.
        </p>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="self-start sm:self-auto flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors shadow-md shadow-blue-500/20"
        >
          <PlusIcon className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Add form — mobile-friendly stacked layout */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 space-y-3 overflow-hidden"
          >
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">New Category</h4>
            <div className="flex gap-2">
              <input
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                className="w-12 text-center py-2 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-lg focus:outline-none flex-shrink-0"
                maxLength={2}
              />
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category name…"
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addCategory}
                className="flex-1 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Add Category
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories list */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-slate-800/40">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className={`px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/30 ${!cat.visible ? "opacity-50" : ""}`}
            >
              {/* Top row: icon + name */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg leading-none flex-shrink-0">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</p>
                    {cat.featured && (
                      <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 px-1.5 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                    {!cat.visible && (
                      <span className="text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-slate-500">/{cat.slug} · {cat.freelancerCount} freelancers</p>
                </div>
              </div>

              {/* Bottom row: all controls */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Reorder */}
                <button
                  onClick={() => moveOrder(cat.id, -1)}
                  disabled={idx === 0}
                  title="Move up"
                  className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowUpIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => moveOrder(cat.id, 1)}
                  disabled={idx === categories.length - 1}
                  title="Move down"
                  className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowDownIcon className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-px bg-gray-200 dark:bg-slate-700 mx-0.5" />

                {/* Featured */}
                <button
                  onClick={() => toggleFeatured(cat.id)}
                  title={cat.featured ? "Remove from featured" : "Mark as featured"}
                  className={`p-1.5 rounded-lg transition-colors ${cat.featured ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10" : "text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700"}`}
                >
                  <FireIcon className="w-3.5 h-3.5" />
                </button>

                {/* Visibility */}
                <button
                  onClick={() => toggleVisibility(cat.id)}
                  title={cat.visible ? "Hide category" : "Show category"}
                  className={`p-1.5 rounded-lg transition-colors ${cat.visible ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800"}`}
                >
                  {cat.visible ? <EyeIcon className="w-3.5 h-3.5" /> : <EyeSlashIcon className="w-3.5 h-3.5" />}
                </button>

                <div className="h-4 w-px bg-gray-200 dark:bg-slate-700 mx-0.5" />

                {/* Edit */}
                <button className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                  <PencilSquareIcon className="w-3.5 h-3.5" />
                </button>

                {/* Delete */}
                <button className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const [settings, setSettings] = useState({
    marketplaceStatus: "development",
    commissionRate: "10",
    allowNewRegistrations: true,
    requireIdVerification: true,
    requirePortfolioItems: false,
    featuredBannerVisible: true,
    ctaBannerText: "Join the waitlist for early access to the LetsEarnify Freelance Marketplace.",
    minHourlyRate: "5",
    maxHourlyRate: "500",
    allowedCountries: "All",
  })

  const toggle = (key: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key as keyof typeof settings] }))

  const ToggleSwitch = ({
    field,
    label,
    desc,
  }: {
    field: keyof typeof settings
    label: string
    desc?: string
  }) => (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">{label}</p>
        {desc && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 leading-snug">{desc}</p>}
      </div>
      <button
        onClick={() => toggle(field)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
          settings[field] ? "bg-blue-600" : "bg-gray-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`inline-block w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${
            settings[field] ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  )

  const InputField = ({
    label,
    field,
    type = "text",
    prefix,
    suffix,
  }: {
    label: string
    field: keyof typeof settings
    type?: string
    prefix?: string
    suffix?: string
  }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className="flex items-center">
        {prefix && (
          <span className="px-3 py-2 text-sm bg-gray-100 dark:bg-slate-800 border border-r-0 border-gray-200 dark:border-slate-700 rounded-l-lg text-gray-500 dark:text-slate-400 flex-shrink-0">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={settings[field] as string}
          onChange={(e) => setSettings((prev) => ({ ...prev, [field]: e.target.value }))}
          className={`flex-1 min-w-0 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
            prefix ? "" : "rounded-l-lg"
          } ${suffix ? "" : "rounded-r-lg"}`}
        />
        {suffix && (
          <span className="px-3 py-2 text-sm bg-gray-100 dark:bg-slate-800 border border-l-0 border-gray-200 dark:border-slate-700 rounded-r-lg text-gray-500 dark:text-slate-400 flex-shrink-0">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Marketplace Status */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 rounded-2xl p-4 md:p-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <GlobeAltIcon className="w-4 h-4 text-blue-500" />
          Marketplace Status
        </h3>
        {/* Buttons wrap on mobile */}
        <div className="flex gap-2 flex-wrap">
          {(["live", "development", "maintenance"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSettings((p) => ({ ...p, marketplaceStatus: status }))}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold capitalize border transition-all flex-shrink-0 ${
                settings.marketplaceStatus === status
                  ? status === "live"
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : status === "development"
                    ? "bg-amber-500 border-amber-500 text-white"
                    : "bg-red-600 border-red-600 text-white"
                  : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400"
              }`}
            >
              {status === "live" && <CheckCircleIcon className="w-4 h-4" />}
              {status === "development" && <AdjustmentsHorizontalIcon className="w-4 h-4" />}
              {status === "maintenance" && <XCircleIcon className="w-4 h-4" />}
              {status}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">
          Currently:{" "}
          <strong className="text-gray-600 dark:text-slate-300 capitalize">
            {settings.marketplaceStatus}
          </strong>{" "}
          — controls what visitors see on the marketplace page.
        </p>
      </div>

      {/* Access & Verification */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 rounded-2xl p-4 md:p-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
          Access &amp; Verification
        </h3>
        <div className="divide-y divide-gray-100 dark:divide-slate-800/40">
          <ToggleSwitch field="allowNewRegistrations" label="Allow New Freelancer Registrations" desc="Enable or pause new sign-ups" />
          <ToggleSwitch field="requireIdVerification" label="Require ID Verification" desc="Freelancers must submit ID before going live" />
          <ToggleSwitch field="requirePortfolioItems" label="Require Portfolio Samples" desc="At least 2 portfolio items required" />
          <ToggleSwitch field="featuredBannerVisible" label="Show Development Banner" desc="Display the banner to public visitors" />
        </div>
      </div>

      {/* Pricing & Commission */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 rounded-2xl p-4 md:p-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-blue-500" />
          Pricing &amp; Commission
        </h3>
        {/* Single column on mobile, 3 cols on lg */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField label="Min Hourly Rate" field="minHourlyRate" type="number" prefix="$" suffix="/hr" />
          <InputField label="Max Hourly Rate" field="maxHourlyRate" type="number" prefix="$" suffix="/hr" />
          <InputField label="Platform Commission" field="commissionRate" type="number" suffix="%" />
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 rounded-2xl p-4 md:p-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="w-4 h-4 text-blue-500" />
          CTA Banner Text
        </h3>
        <textarea
          rows={3}
          value={settings.ctaBannerText}
          onChange={(e) => setSettings((p) => ({ ...p, ctaBannerText: e.target.value }))}
          className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
        />
      </div>

      {/* Save */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
        <button className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
          Discard
        </button>
        <button className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-500/20">
          Save Settings
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MarketplaceAdminClient() {
  const [activeTab, setActiveTab] = useState("freelancers")
  const [mode, setMode] = useState<"development" | "live">("development")
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Load current mode from API on mount
  useEffect(() => {
    fetch("/api/admin/marketplace-mode")
      .then((r) => r.json())
      .then((data) => setMode(data.mode ?? "development"))
      .catch(() => {})
  }, [])

  const switchMode = async (newMode: "development" | "live") => {
    if (saving || newMode === mode) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/marketplace-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      })
      if (res.ok) {
        setMode(newMode)
        setToast(
          newMode === "live"
            ? "✅ Marketplace is now LIVE for all users."
            : "🚧 Marketplace switched to Development Mode."
        )
        setTimeout(() => setToast(null), 4000)
      }
    } catch {
      setToast("❌ Failed to switch mode. Try again.")
      setTimeout(() => setToast(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  const stats = [
    { label: "Total Freelancers", value: "2,400", sub: "+48 this month", icon: UserGroupIcon, color: "bg-blue-600" },
    { label: "Active Listings", value: "1,874", sub: "78% active rate", icon: BriefcaseIcon, color: "bg-emerald-600" },
    { label: "Pending Review", value: "127", sub: "Needs approval", icon: AdjustmentsHorizontalIcon, color: "bg-amber-500" },
    { label: "Categories", value: "40", sub: "10 featured", icon: Squares2X2Icon, color: "bg-violet-600" },
    { label: "Avg. Rating", value: "4.8", sub: "Platform avg.", icon: StarIcon, color: "bg-rose-500" },
    { label: "Countries", value: "75+", sub: "Global reach", icon: GlobeAltIcon, color: "bg-indigo-600" },
  ]

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 p-3 md:p-8 space-y-4 md:space-y-6 transition-colors duration-200">

      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl border border-white/10"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <BriefcaseIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              Freelance Marketplace
            </h1>
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400">
            Manage freelancer profiles, categories, visibility, and marketplace settings.
          </p>
        </div>

        <button
          className="self-start sm:self-auto flex-shrink-0 flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-500/20"
        >
          <PlusIcon className="w-4 h-4" />
          Add Freelancer
        </button>
      </div>

      {/* ── Marketplace Mode Control ── (the main feature) */}
      <div className={`rounded-2xl border-2 p-4 md:p-6 transition-all duration-300 ${
        mode === "live"
          ? "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/25"
          : "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/25"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Left: status indicator */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              mode === "live" ? "bg-emerald-500" : "bg-amber-500"
            }`}>
              {mode === "live"
                ? <CheckCircleIcon className="w-5 h-5 text-white" />
                : <AdjustmentsHorizontalIcon className="w-5 h-5 text-white" />
              }
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`text-sm font-bold ${
                  mode === "live"
                    ? "text-emerald-800 dark:text-emerald-300"
                    : "text-amber-800 dark:text-amber-300"
                }`}>
                  Marketplace Status
                </p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  mode === "live"
                    ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30"
                    : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30"
                }`}>
                  {mode === "live" ? "🟢 LIVE" : "🚧 Development Mode"}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${
                mode === "live"
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-amber-700 dark:text-amber-400"
              }`}>
                {mode === "live"
                  ? "The full marketplace is visible to all users at /marketplace."
                  : "Users see an \u201cUnder Development\u201d page at /marketplace. No marketplace content is shown."
                }
              </p>
            </div>
          </div>

          {/* Right: the single toggle */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {mode === "development" ? (
              <button
                onClick={() => switchMode("live")}
                disabled={saving}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-emerald-500/20"
              >
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <CheckCircleIcon className="w-4 h-4" />
                }
                Go Live
              </button>
            ) : (
              <button
                onClick={() => switchMode("development")}
                disabled={saving}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-amber-500/20"
              >
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <AdjustmentsHorizontalIcon className="w-4 h-4" />
                }
                Set to Dev Mode
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="w-full">
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 p-1 rounded-2xl w-full sm:w-fit overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 flex-1 sm:flex-initial px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "freelancers" && <FreelancersTab />}
          {activeTab === "categories" && <CategoriesTab />}
          {activeTab === "settings" && <SettingsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}


