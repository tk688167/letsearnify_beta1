"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  ArrowLeftOnRectangleIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  WalletIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GiftIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentListIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline"
import { signOut } from "next-auth/react"
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
  { name: "Wallet Settings", href: "/admin/wallets", icon: WalletIcon },
  { name: "Merchant Settings", href: "/admin/settings/merchant", icon: BanknotesIcon },
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
      { name: "Mudarabah Pools", href: "/admin/mudarabah", icon: "📈" },
    ],
  },
  { name: "Visitor Logs", href: "/admin/visits", icon: GlobeAltIcon },
]

export default function MobileAdminNav({
  counts = { deposits: 0, withdrawals: 0 },
}: {
  counts?: { deposits: number; withdrawals: number }
}) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
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

  const closeMenu = () => setIsOpen(false)

  const activeClass = "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
  const inactiveClass =
    "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-slate-100"

  return (
    <>
      {/* ── Mobile Top Header ── */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800/60 px-4 py-3 flex justify-between items-center md:hidden transition-colors duration-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-1.5 -ml-1 text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
            aria-label="Open menu"
          >
            <Bars3Icon className="w-6 h-6" />
            {(counts.deposits > 0 || counts.withdrawals > 0) && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-[10px] font-bold text-white bg-blue-600 dark:bg-blue-500 px-1.5 py-0.5 rounded tracking-widest uppercase">
              Admin
            </span>
          </div>
        </div>

        {/* Theme toggle in mobile header */}
        <ThemeToggle />
      </header>

      {/* ── Drawer Overlay ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-sm md:hidden"
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {/* ── Drawer Panel ── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-950 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer header */}
          <div className="px-5 pt-5 pb-4 flex justify-between items-start">
            <div>
              <Logo size="md" />
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[10px] font-bold text-white bg-blue-600 dark:bg-blue-500 px-2 py-0.5 rounded-md tracking-widest uppercase">
                  Admin
                </span>
                <span className="text-[10px] text-gray-400 dark:text-slate-600 font-medium">Portal</span>
              </div>
            </div>
            <button
              onClick={closeMenu}
              className="p-1.5 text-gray-400 dark:text-slate-600 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="mx-4 h-px bg-gray-100 dark:bg-slate-800/60 mb-2" />

          {/* Nav */}
          <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const hasChildren = item.children && item.children.length > 0
              const isOpenSub = openMenus.includes(item.name)
              const isChildActive =
                hasChildren && item.children?.some((child) => pathname === child.href)

              let badgeCount = 0
              if (item.name === "Deposit Approvals") badgeCount = counts.deposits
              if (item.name === "Withdrawal Requests") badgeCount = counts.withdrawals

              return (
                <div key={item.name}>
                  {hasChildren ? (
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 w-full text-left ${
                        isActive || isChildActive ? activeClass : inactiveClass
                      }`}
                    >
                      <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                      <span className="flex-1">{item.name}</span>
                      {isOpenSub ? (
                        <ChevronUpIcon className="w-3.5 h-3.5 opacity-60" />
                      ) : (
                        <ChevronDownIcon className="w-3.5 h-3.5 opacity-60" />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                        isActive ? activeClass : inactiveClass
                      }`}
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
                    {hasChildren && isOpenSub && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-10 pr-3 py-1 space-y-0.5">
                          {item.children!.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              onClick={closeMenu}
                              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-[12.5px] transition-colors ${
                                pathname === child.href
                                  ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-500/10"
                                  : "text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-200"
                              }`}
                            >
                              {/* @ts-ignore */}
                              {child.icon ? (
                                <span className="text-sm">{child.icon}</span>
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-600" />
                              )}
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

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 dark:border-slate-800/60 space-y-1">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800/40">
              <span className="text-[12px] font-medium text-gray-500 dark:text-slate-400">Appearance</span>
              <ThemeToggle />
            </div>
            <Link
              href="/dashboard"
              onClick={closeMenu}
              className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-[13px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              Switch to Dashboard
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-[13px] font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
