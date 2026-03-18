"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  CheckBadgeIcon,
  BriefcaseIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  MegaphoneIcon,
  PencilSquareIcon,
  CameraIcon,
  MusicalNoteIcon,
  CalculatorIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  CpuChipIcon,
  VideoCameraIcon,
  ShieldCheckIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  ChevronRightIcon,
  FireIcon,
} from "@heroicons/react/24/outline"
import { StarIcon as StarSolid } from "@heroicons/react/24/solid"
import Link from "next/link"
import ThemeToggle from "@/app/components/ui/ThemeToggle"
import Logo from "@/app/components/ui/Logo"

// ─── Data ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "all", label: "All Freelancers", icon: BriefcaseIcon, count: 2400 },
  { id: "development", label: "Development & IT", icon: CodeBracketIcon, count: 612 },
  { id: "design", label: "Design & Creative", icon: PaintBrushIcon, count: 438 },
  { id: "marketing", label: "Digital Marketing", icon: MegaphoneIcon, count: 317 },
  { id: "writing", label: "Writing & Content", icon: PencilSquareIcon, count: 285 },
  { id: "video", label: "Video & Animation", icon: VideoCameraIcon, count: 198 },
  { id: "music", label: "Music & Audio", icon: MusicalNoteIcon, count: 142 },
  { id: "photography", label: "Photography", icon: CameraIcon, count: 96 },
  { id: "finance", label: "Finance & Accounting", icon: CalculatorIcon, count: 178 },
  { id: "translation", label: "Translation", icon: GlobeAltIcon, count: 254 },
  { id: "education", label: "Online Tutoring", icon: AcademicCapIcon, count: 189 },
  { id: "ai", label: "AI & Machine Learning", icon: CpuChipIcon, count: 312 },
  { id: "cybersecurity", label: "Cybersecurity", icon: ShieldCheckIcon, count: 87 },
]

const SORT_OPTIONS = [
  { id: "top", label: "Top Rated" },
  { id: "newest", label: "Newest" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
]

export interface Freelancer {
  id: string
  name: string
  title: string
  tagline: string
  avatar: string
  category: string
  skills: string[]
  rating: number
  reviews: number
  hourlyRate: number
  currency: string
  verified: boolean
  topRated: boolean
  location: string
  completedJobs: number
  responseTime: string
  initials: string
  avatarColor: string
}

const SAMPLE_FREELANCERS: Freelancer[] = [
  {
    id: "1",
    name: "Sarah Chen",
    title: "Full-Stack Developer",
    tagline: "Building scalable web apps with React & Node.js",
    avatar: "",
    category: "development",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    rating: 4.9,
    reviews: 187,
    hourlyRate: 65,
    currency: "$",
    verified: true,
    topRated: true,
    location: "United States",
    completedJobs: 234,
    responseTime: "< 1 hour",
    initials: "SC",
    avatarColor: "from-violet-500 to-purple-700",
  },
  {
    id: "2",
    name: "Marcus Rivera",
    title: "UI/UX Designer",
    tagline: "Crafting premium interfaces that convert & delight",
    avatar: "",
    category: "design",
    skills: ["Figma", "Webflow", "Motion Design", "Branding"],
    rating: 4.8,
    reviews: 142,
    hourlyRate: 55,
    currency: "$",
    verified: true,
    topRated: true,
    location: "Spain",
    completedJobs: 179,
    responseTime: "< 2 hours",
    initials: "MR",
    avatarColor: "from-blue-500 to-cyan-600",
  },
  {
    id: "3",
    name: "Aisha Okafor",
    title: "Digital Marketing Strategist",
    tagline: "ROI-driven growth campaigns for ambitious brands",
    avatar: "",
    category: "marketing",
    skills: ["SEO", "Google Ads", "Meta Ads", "Analytics"],
    rating: 4.7,
    reviews: 98,
    hourlyRate: 48,
    currency: "$",
    verified: true,
    topRated: false,
    location: "Nigeria",
    completedJobs: 113,
    responseTime: "< 3 hours",
    initials: "AO",
    avatarColor: "from-amber-500 to-orange-600",
  },
  {
    id: "4",
    name: "Liam O'Brien",
    title: "Content Writer & Copywriter",
    tagline: "Words that sell — SEO articles, landing pages & ads",
    avatar: "",
    category: "writing",
    skills: ["Copywriting", "SEO Writing", "Blog Posts", "Email"],
    rating: 4.9,
    reviews: 231,
    hourlyRate: 35,
    currency: "$",
    verified: true,
    topRated: true,
    location: "Ireland",
    completedJobs: 312,
    responseTime: "< 1 hour",
    initials: "LO",
    avatarColor: "from-emerald-500 to-teal-600",
  },
  {
    id: "5",
    name: "Yuki Tanaka",
    title: "AI & ML Engineer",
    tagline: "Transform your business with custom AI solutions",
    avatar: "",
    category: "ai",
    skills: ["Python", "TensorFlow", "LLMs", "RAG Systems"],
    rating: 5.0,
    reviews: 63,
    hourlyRate: 95,
    currency: "$",
    verified: true,
    topRated: true,
    location: "Japan",
    completedJobs: 78,
    responseTime: "< 4 hours",
    initials: "YT",
    avatarColor: "from-sky-500 to-blue-700",
  },
  {
    id: "6",
    name: "Priya Sharma",
    title: "Video Editor & Animator",
    tagline: "Cinematic edits — YouTube, Reels, ads & explainers",
    avatar: "",
    category: "video",
    skills: ["Premiere Pro", "After Effects", "DaVinci", "Motion"],
    rating: 4.8,
    reviews: 115,
    hourlyRate: 42,
    currency: "$",
    verified: true,
    topRated: false,
    location: "India",
    completedJobs: 148,
    responseTime: "< 2 hours",
    initials: "PS",
    avatarColor: "from-pink-500 to-rose-600",
  },
  {
    id: "7",
    name: "Carlos Mendes",
    title: "Cybersecurity Consultant",
    tagline: "Penetration testing, audits & secure architecture",
    avatar: "",
    category: "cybersecurity",
    skills: ["Penetration Testing", "OWASP", "SOC2", "Firewall"],
    rating: 4.9,
    reviews: 47,
    hourlyRate: 110,
    currency: "$",
    verified: true,
    topRated: true,
    location: "Brazil",
    completedJobs: 58,
    responseTime: "< 6 hours",
    initials: "CM",
    avatarColor: "from-red-500 to-rose-700",
  },
  {
    id: "8",
    name: "Sophie Laurent",
    title: "Brand Designer",
    tagline: "Logos, identity systems & visual storytelling",
    avatar: "",
    category: "design",
    skills: ["Adobe Illustrator", "Brand Identity", "Logo Design", "Print"],
    rating: 4.7,
    reviews: 176,
    hourlyRate: 50,
    currency: "$",
    verified: true,
    topRated: false,
    location: "France",
    completedJobs: 189,
    responseTime: "< 2 hours",
    initials: "SL",
    avatarColor: "from-fuchsia-500 to-purple-600",
  },
  {
    id: "9",
    name: "Hamza Al-Rashid",
    title: "Financial Analyst",
    tagline: "Business valuations, models & financial consulting",
    avatar: "",
    category: "finance",
    skills: ["Financial Modeling", "Excel", "Valuation", "CFO"],
    rating: 4.8,
    reviews: 88,
    hourlyRate: 70,
    currency: "$",
    verified: true,
    topRated: false,
    location: "UAE",
    completedJobs: 102,
    responseTime: "< 4 hours",
    initials: "HA",
    avatarColor: "from-indigo-500 to-blue-700",
  },
  {
    id: "10",
    name: "Elena Popescu",
    title: "Online Tutor (STEM)",
    tagline: "Expert tutoring in Math, Physics & Computer Science",
    avatar: "",
    category: "education",
    skills: ["Mathematics", "Physics", "Python", "SAT Prep"],
    rating: 4.9,
    reviews: 204,
    hourlyRate: 30,
    currency: "$",
    verified: true,
    topRated: true,
    location: "Romania",
    completedJobs: 267,
    responseTime: "< 1 hour",
    initials: "EP",
    avatarColor: "from-lime-500 to-green-600",
  },
  {
    id: "11",
    name: "James Osei",
    title: "Music Producer & Composer",
    tagline: "Original beats, mixing & mastering for creators",
    avatar: "",
    category: "music",
    skills: ["Music Production", "Mixing", "Mastering", "FL Studio"],
    rating: 4.6,
    reviews: 79,
    hourlyRate: 38,
    currency: "$",
    verified: false,
    topRated: false,
    location: "Ghana",
    completedJobs: 91,
    responseTime: "< 8 hours",
    initials: "JO",
    avatarColor: "from-yellow-500 to-amber-600",
  },
  {
    id: "12",
    name: "Nina Kovalev",
    title: "Technical Translator (RU/EN)",
    tagline: "Precise legal, technical & medical translations",
    avatar: "",
    category: "translation",
    skills: ["Russian", "English", "Legal", "Medical"],
    rating: 5.0,
    reviews: 137,
    hourlyRate: 28,
    currency: "$",
    verified: true,
    topRated: true,
    location: "Russia",
    completedJobs: 182,
    responseTime: "< 2 hours",
    initials: "NK",
    avatarColor: "from-cyan-500 to-sky-600",
  },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarSolid
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= Math.floor(rating)
              ? "text-amber-400"
              : star - rating < 1 && star - rating > 0
              ? "text-amber-300"
              : "text-gray-300 dark:text-slate-600"
          }`}
        />
      ))}
    </div>
  )
}

function FreelancerCard({ freelancer }: { freelancer: Freelancer }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="group relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 rounded-2xl p-5 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-300 cursor-pointer flex flex-col gap-4"
    >
      {/* Top-rated badge */}
      {freelancer.topRated && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
          <FireIcon className="w-3 h-3" />
          Top Rated
        </div>
      )}

      {/* Header: Avatar + Name */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${freelancer.avatarColor} flex items-center justify-center flex-shrink-0 shadow-md`}
        >
          <span className="text-white font-bold text-sm">{freelancer.initials}</span>
          {freelancer.verified && (
            <CheckBadgeIcon className="absolute -bottom-1.5 -right-1.5 w-5 h-5 text-blue-500 bg-white dark:bg-slate-900 rounded-full" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {freelancer.name}
            </h3>
          </div>
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate">
            {freelancer.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            📍 {freelancer.location}
          </p>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed line-clamp-2">
        {freelancer.tagline}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {freelancer.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="text-[10px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-500/20"
          >
            {skill}
          </span>
        ))}
        {freelancer.skills.length > 3 && (
          <span className="text-[10px] font-medium bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-2 py-0.5 rounded-md">
            +{freelancer.skills.length - 3}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-slate-800/60">
        <div className="flex items-center gap-1.5">
          <StarRating rating={freelancer.rating} />
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            {freelancer.rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400 dark:text-slate-500">
            ({freelancer.reviews})
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {freelancer.currency}{freelancer.hourlyRate}
            <span className="text-xs font-normal text-gray-400 dark:text-slate-500">/hr</span>
          </p>
        </div>
      </div>

      {/* Meta footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-slate-500">
          <span>{freelancer.completedJobs} jobs</span>
          <span>·</span>
          <span>{freelancer.responseTime}</span>
        </div>
        <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-0.5 transition-colors">
          View Profile
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MarketplaceClient() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("top")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filtered = useMemo(() => {
    let result = SAMPLE_FREELANCERS

    if (selectedCategory !== "all") {
      result = result.filter((f) => f.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.title.toLowerCase().includes(q) ||
          f.tagline.toLowerCase().includes(q) ||
          f.skills.some((s) => s.toLowerCase().includes(q)) ||
          f.category.toLowerCase().includes(q)
      )
    }

    if (sortBy === "top") result = [...result].sort((a, b) => b.rating - a.rating)
    if (sortBy === "newest") result = [...result].sort((a, b) => Number(a.id) - Number(b.id))
    if (sortBy === "price_asc") result = [...result].sort((a, b) => a.hourlyRate - b.hourlyRate)
    if (sortBy === "price_desc") result = [...result].sort((a, b) => b.hourlyRate - a.hourlyRate)

    return result
  }, [selectedCategory, searchQuery, sortBy])

  const activeCat = CATEGORIES.find((c) => c.id === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
      {/* ── Top Navbar ── */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-slate-800/60 transition-colors duration-200">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
          {/* Logo + Back */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Logo size="sm" />
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
            <ChevronRightIcon className="w-3.5 h-3.5" />
            <span className="font-medium text-gray-600 dark:text-slate-300">Freelance Marketplace</span>
          </div>

          {/* Search — desktop */}
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills, categories, or freelancer names…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700/60 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 transition-all"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Mobile: filter toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg"
            >
              <FunnelIcon className="w-4 h-4" />
              Filter
            </button>
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors shadow-md shadow-blue-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Under Development Banner ── */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white py-3 px-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-center gap-3 text-sm flex-wrap text-center">
          <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full text-xs tracking-wider uppercase">
            🚧 Under Development
          </span>
          <span className="text-white/90">
            The LetsEarnify Freelance Marketplace is in active development. Explore what&apos;s coming — join early to secure your profile.
          </span>
          <Link
            href="/login"
            className="text-xs font-bold underline underline-offset-2 hover:text-yellow-300 transition-colors whitespace-nowrap"
          >
            Join the Waitlist →
          </Link>
        </div>
      </div>

      {/* ── Hero Section ── */}
      <section className="bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-950 border-b border-gray-200/60 dark:border-slate-800/60 py-10 md:py-14 px-4 transition-colors duration-200">
        <div className="max-w-screen-2xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <BriefcaseIcon className="w-3.5 h-3.5" />
              Professional Freelance Marketplace
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
              Hire Verified{" "}
              <span className="text-gradient">Professionals.</span>
              <br className="hidden sm:block" />
              Build Anything.
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-slate-400 max-w-2xl leading-relaxed mb-6">
              LetsEarnify's marketplace connects you with rigorously vetted freelancers across every discipline. Every profile is backed by real credentials, reviews, and verified identity.
            </p>

            {/* Stats strip */}
            <div className="flex items-center gap-6 flex-wrap">
              {[
                { label: "Freelancers", value: "2,400+" },
                { label: "Categories", value: "40+" },
                { label: "Countries", value: "75+" },
                { label: "Avg. Response", value: "< 2hrs" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Body: Sidebar + Grid ── */}
      <div className="max-w-screen-2xl mx-auto flex gap-0 md:gap-6 px-0 md:px-6 py-6">

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-50 shadow-2xl overflow-y-auto md:hidden"
              >
                <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-slate-800/60">
                  <h2 className="font-bold text-gray-900 dark:text-white">Categories</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <SidebarContent
                  categories={CATEGORIES}
                  selectedCategory={selectedCategory}
                  onSelect={(id) => { setSelectedCategory(id); setSidebarOpen(false) }}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-60 lg:w-64 shrink-0">
          <div className="sticky top-[105px] bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <Bars3BottomLeftIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Categories</h2>
              </div>
            </div>
            <SidebarContent
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
        </aside>

        {/* ── Right Content ── */}
        <div className="flex-1 min-w-0 px-4 md:px-0">

          {/* Mobile search */}
          <div className="md:hidden mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search freelancers…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/60 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
            </div>
          </div>

          {/* Filter & Sort bar */}
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                {activeCat?.label || "All Freelancers"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {filtered.length} freelancer{filtered.length !== 1 ? "s" : ""} found
                {searchQuery ? ` for "${searchQuery}"` : ""}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-medium bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/60 text-gray-700 dark:text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 dark:text-slate-700 mb-4" />
              <h3 className="text-base font-bold text-gray-600 dark:text-slate-400">No freelancers found</h3>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                Try a different search or category
              </p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("all") }}
                className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((f) => (
                  <FreelancerCard key={f.id} freelancer={f} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Coming soon CTA */}
          <div className="mt-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 text-center text-white shadow-xl shadow-blue-500/20">
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 px-3 py-1 rounded-full text-xs font-semibold mb-4">
              🚀 Launching Soon
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">
              Are You a Freelancer?
            </h3>
            <p className="text-sm text-blue-100 max-w-md mx-auto mb-6">
              Join our waitlist to be among the first verified professionals on the LetsEarnify Marketplace.
              Gain early access, premium profile placement, and zero commission for your first 3 months.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm shadow-lg"
              >
                <BriefcaseIcon className="w-4 h-4" />
                Apply as Freelancer
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors text-sm"
              >
                Post a Project
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer note ── */}
      <div className="border-t border-gray-200/60 dark:border-slate-800/60 py-6 mt-4 text-center">
        <p className="text-xs text-gray-400 dark:text-slate-500">
          © 2024 LetsEarnify. Freelance Marketplace is currently under development.{" "}
          <Link href="/" className="text-blue-500 hover:underline">
            Return to Homepage
          </Link>
        </p>
      </div>
    </div>
  )
}

// ─── Sidebar Content ─────────────────────────────────────────────────────────

function SidebarContent({
  categories,
  selectedCategory,
  onSelect,
}: {
  categories: typeof CATEGORIES
  selectedCategory: string
  onSelect: (id: string) => void
}) {
  return (
    <nav className="p-2 space-y-0.5">
      {categories.map((cat) => {
        const Icon = cat.icon
        const isActive = selectedCategory === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
              isActive
                ? "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-semibold"
                : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-slate-500"}`} />
            <span className="text-[13px] flex-1 truncate">{cat.label}</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
              isActive
                ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300"
                : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500"
            }`}>
              {cat.count.toLocaleString()}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
