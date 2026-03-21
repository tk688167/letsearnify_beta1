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
  { name: "Deposit Approvals", href: "/admin/deposits", icon: CurrencyDollarIcon },
  { name: "Merchant Deposits", href: "/admin/merchant/deposits", icon: BanknotesIcon },
  { name: "Manual Deposit", href: "/admin/manual-deposit", icon: BanknotesIcon },
  { name: "Withdrawal Requests", href: "/admin/withdrawals", icon: ArrowLeftOnRectangleIcon },
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
      { name: "Pools Overview", href: "/admin/pools" },
      { name: "CBSPool", href: "/admin/pools/cbspool", icon: "💰" },
      { name: "Royalty Pool", href: "/admin/royalty", icon: "👑" },
    ],
  },
  { name: "Mudarabah Pool", href: "/admin/mudarabah", icon: ChartBarIcon },
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
    <aside className="w-64 bg-white dark:bg-slate-950 border-r border-gray-100 dark:border-slate-800/60 flex flex-col hidden md:flex z-50 h-screen sticky top-0 overflow-y-auto transition-colors duration-200">
      <div className="px-5 pt-6 pb-4">
        <Logo size="md" />
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[10px] font-bold text-white bg-blue-600 dark:bg-blue-500 px-2 py-0.5 rounded-md tracking-widest uppercase">Admin</span>
          <span className="text-[10px] text-gray-400 dark:text-slate-600 font-medium">Portal</span>
        </div>
      </div>

      <div className="mx-4 h-px bg-gray-100 dark:bg-slate-800/60 mb-3" />

      <nav className="flex-1 px-3 space-y-0.5 pb-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const hasChildren = item.children && item.children.length > 0
          const isOpen = openMenus.includes(item.name)
          const isChildActive = hasChildren && item.children?.some((child) => pathname === child.href)

          let badgeCount = 0
          if (item.name === "Deposit Approvals") badgeCount = counts.deposits
          if (item.name === "Withdrawal Requests") badgeCount = counts.withdrawals
          if (item.name === "Merchant Deposits") badgeCount = counts.merchantDeposits

          const activeClass = "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
          const inactiveClass = "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-slate-100"

          return (
            <div key={item.name}>
              {hasChildren ? (
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left ${isActive || isChildActive ? activeClass : inactiveClass}`}
                >
                  <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                  <span className="flex-1 text-[13px]">{item.name}</span>
                  {isOpen ? <ChevronUpIcon className="w-3.5 h-3.5 opacity-60" /> : <ChevronDownIcon className="w-3.5 h-3.5 opacity-60" />}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${isActive ? activeClass : inactiveClass}`}
                >
                  <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {badgeCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
                      {badgeCount}
                    </span>
                  )}
                </Link>
              )}

              <AnimatePresence>
                {hasChildren && isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                    <div className="pl-10 pr-3 py-1 space-y-0.5">
                      {item.children!.map((child) => (
                        <Link key={child.name} href={child.href}
                          className={`flex items-center gap-2 py-2 px-3 rounded-lg text-[12.5px] transition-colors ${pathname === child.href ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-500/10" : "text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-200"}`}>
                          {/* @ts-ignore */}
                          {child.icon ? <span className="text-sm">{child.icon}</span> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-600" />}
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-100 dark:border-slate-800/60 space-y-1">
  {/* Notification Bell */}
  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800/40 mb-1">
    <span className="text-[12px] font-medium text-gray-500 dark:text-slate-400">Notifications</span>
    <AdminNotificationBell />
  </div>
        <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-[13px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
          <ArrowTopRightOnSquareIcon className="w-4 h-4" />Switch to Dashboard
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-[13px] font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
          <ArrowLeftOnRectangleIcon className="w-4 h-4" />Sign Out
        </button>
      </div>
    </aside>
  )
}