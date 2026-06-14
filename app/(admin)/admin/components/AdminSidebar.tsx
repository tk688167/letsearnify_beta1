"use client"

import { AdminNotificationBell } from "./AdminNotificationBell"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  UsersIcon,
  GlobeAltIcon,
  ArrowLeftOnRectangleIcon,
  CheckCircleIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  WalletIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentListIcon,
  GiftIcon,
  ArrowTopRightOnSquareIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ThemeToggle from "@/app/components/ui/ThemeToggle"
import Logo from "@/app/components/ui/Logo"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "User Management", href: "/admin/users", icon: UsersIcon },
  { name: "Freelance Marketplace", href: "/admin/marketplace", icon: BriefcaseIcon },
  { name: "Tasks & Companies", href: "/admin/tasks", icon: ClipboardDocumentListIcon },
  { name: "Spin Management", href: "/admin/spin", icon: GiftIcon },
  { name: "Deposit Management", href: "/admin/deposits", icon: CurrencyDollarIcon },
  { name: "Withdraw Requests", href: "/admin/withdrawals", icon: ArrowLeftOnRectangleIcon },
  { name: "Manual Unlocks", href: "/admin/unlocks", icon: CheckCircleIcon },
  { name: "Wallet Settings", href: "/admin/wallets", icon: WalletIcon },
  { name: "Merchant Settings", href: "/admin/merchant", icon: BanknotesIcon },
  {
    name: "Tier System",
    href: "#",
    icon: CheckCircleIcon,
    children: [
      { name: "Tier Audit", href: "/admin/tiers/audit", icon: "📋" },
      { name: "Tier Management", href: "/admin/tiers/manage", icon: "⚙️" },
    ],
  },
  {
    name: "Site Management",
    href: "#",
    icon: GlobeAltIcon,
    children: [
      { name: "Platform Stats", href: "/admin/stats", icon: "📊" },
      { name: "Social Proof", href: "/admin/social-proof", icon: "🌟" },
      { name: "Welcome Page Slider", href: "/admin/welcome-slider", icon: "📢" },
    ],
  },
  {
    name: "Pools & Revenue",
    href: "#",
    icon: BanknotesIcon,
    children: [
      { name: "Daily Earning Pool", href: "/admin/daily-pools", icon: "💎" },
      { name: "CBSPool", href: "/admin/pools/cbspool", icon: "💰" },
      { name: "Royalty Pool", href: "/admin/royalty", icon: "👑" },
      { name: "Achievement Pool", href: "/admin/pools/achievement", icon: "🏆" },
    ],
  },
  { name: "Mudarabah Pool", href: "/admin/mudarabah", icon: ChartBarIcon },
  {
    name: "Support & Help",
    href: "#",
    icon: ChatBubbleLeftRightIcon,
    children: [
      { name: "Live Chat", href: "/admin/live-chat", icon: "💬" },
    ],
  },
  { name: "Visitor Logs", href: "/admin/visits", icon: GlobeAltIcon },
]

export function AdminSidebar({
  counts: initialCounts = { deposits: 0, withdrawals: 0, merchantDeposits: 0 },
}: {
  counts?: { deposits: number; withdrawals: number; merchantDeposits: number }
}) {
  const pathname = usePathname()
  const [counts, setCounts] = useState(initialCounts)
  const [openMenus, setOpenMenus] = useState<string[]>([])

  useEffect(() => {
    navigation.forEach((item) => {
      if (item.children && item.children.some((child) => pathname === child.href)) {
        setOpenMenus((prev) => [...prev, item.name])
      }
    })
  }, [])

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    )
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/pending-counts")
        if (res.ok) {
          const data = await res.json()
          if (typeof data.deposits === "number") {
            setCounts({ 
              deposits: data.deposits, 
              withdrawals: data.withdrawals,
              merchantDeposits: data.merchantDeposits || 0
            })
          }
        }
      } catch {}
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setCounts(initialCounts)
  }, [initialCounts])

  return (
    <aside className="w-68 bg-white dark:bg-slate-950 border-r border-gray-100 dark:border-slate-900 flex flex-col hidden md:flex z-50 h-screen sticky top-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors duration-300">
      <div className="px-6 pt-6 pb-4 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="transition-transform duration-200 hover:scale-[1.02]">
            <Logo size="md" />
          </div>
          <div className="p-1 hover:bg-gray-50 dark:hover:bg-slate-900 rounded-lg transition-colors">
            <AdminNotificationBell />
          </div>
        </div>
       
      </div>

      <div className="mx-6 h-px bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 mb-4 shrink-0" />

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 pb-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const hasChildren = item.children && item.children.length > 0
          const isOpen = openMenus.includes(item.name)
          const isChildActive = hasChildren && item.children?.some((child) => pathname === child.href)

          let badgeCount = 0
          if (item.name === "Deposit Management") badgeCount = counts.deposits + (counts.merchantDeposits || 0)
          if (item.name === "Withdraw Requests") badgeCount = counts.withdrawals

          const activeClass = "bg-blue-50/70 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium border-l-2 border-blue-600 dark:border-blue-500 pl-2.5"
          const inactiveClass = "text-gray-600 dark:text-slate-400 hover:bg-gray-50/80 dark:hover:bg-slate-900/60 hover:text-gray-900 dark:hover:text-slate-200 border-l-2 border-transparent pl-3"

          return (
            <div key={item.name} className="transition-all duration-150">
              {hasChildren ? (
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`flex items-center gap-3 py-2.5 pr-3 rounded-xl text-sm transition-all duration-200 w-full text-left outline-none ${isActive || isChildActive ? activeClass : inactiveClass}`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0 opacity-80" />
                  <span className="flex-1 text-[13.5px] tracking-tight">{item.name}</span>
                  {isOpen ? (
                    <ChevronUpIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
                  ) : (
                    <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 py-2.5 pr-3 rounded-xl text-[13.5px] transition-all duration-200 outline-none ${isActive ? activeClass : inactiveClass}`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0 opacity-80" />
                  <span className="flex-1 tracking-tight">{item.name}</span>
                  {badgeCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[10px] font-bold text-white bg-rose-500 rounded-full shadow-sm shadow-rose-500/20">
                      {badgeCount}
                    </span>
                  )}
                </Link>
              )}

              <AnimatePresence initial={false}>
                {hasChildren && isOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }} 
                    transition={{ duration: 0.2, ease: "easeInOut" }} 
                    className="overflow-hidden"
                  >
                    <div className="pl-9 pr-2 py-1 my-0.5 space-y-0.5 border-l border-gray-100 dark:border-slate-900 ml-5">
                      {item.children!.map((child) => {
                        const isSubActive = pathname === child.href
                        return (
                          <Link key={child.name} href={child.href}
                            className={`flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12.5px] transition-all duration-150 outline-none ${isSubActive ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-500/5" : "text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-50/40 dark:hover:bg-slate-900/30"}`}>
                            {/* @ts-ignore */}
                            {child.icon ? <span className="text-sm shrink-0 filter dark:grayscale-[20%]">{child.icon}</span> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-700 shrink-0" />}
                            <span className="truncate">{child.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      {/* Footer Utility Section */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-900 space-y-1 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md shrink-0">
        <div className="flex items-center justify-between px-3 py-2 mb-1.5 rounded-xl bg-gray-50/80 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-900">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">Appearance</span>
          <ThemeToggle />
        </div>
        
        <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200">
          <ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>Switch to Dashboard</span>
        </Link>
        
        <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-[13px] font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200">
          <ArrowLeftOnRectangleIcon className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}