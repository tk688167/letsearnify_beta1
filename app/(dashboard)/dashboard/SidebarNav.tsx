"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  ArrowLeftStartOnRectangleIcon, 
  BriefcaseIcon, 
  ShoppingBagIcon, 
  UserIcon, 
  Cog6ToothIcon, 
  GlobeAltIcon, 
  CreditCardIcon,
  SparklesIcon,
  ChartBarIcon,
  ChartPieIcon,
  LockClosedIcon,
  BoltIcon
} from "@heroicons/react/24/outline"

interface SidebarNavProps {
  isActiveMember: boolean
  session: any
}

const NAV_ITEMS = [
  { href: "/dashboard/welcome", icon: "globe", label: "Explorer", color: "blue", locked: false, exact: false },
  { href: "/dashboard", icon: "chart", label: "Dashboard", color: "purple", locked: false, exact: true },
  { href: "/dashboard/wallet", icon: "wallet", label: "My Wallet", color: "indigo", locked: false, exact: false },
  { href: "/dashboard/spin", icon: "sparkles", label: "Spin", color: "pink", locked: false, exact: false },
  { href: "/dashboard/referrals", icon: "partners", label: "Partner Program", color: "purple", locked: false, exact: false },
  { href: "/dashboard/tiers", icon: "tier", label: "Tier Progress", color: "yellow", locked: false, exact: false },
  { href: "/dashboard/tasks", icon: "briefcase", label: "Task Center", color: "emerald", locked: false, exact: false },
  { href: "/dashboard/pools/daily-earning", icon: "bolt", label: "Daily Earning", color: "teal", locked: false, exact: false },
  { href: "/dashboard/pools", icon: "pools", label: "Reward Pools", color: "blue", locked: true, exact: false },
  { href: "/dashboard/marketplace", icon: "shopping", label: "Marketplace", color: "orange", locked: true, exact: false },
  { href: "/dashboard/mudarabah", icon: "pie", label: "Mudarabah Pools", color: "emerald", locked: true, exact: false },
]

const ACCOUNT_ITEMS = [
  { href: "/dashboard/profile", icon: "user", label: "My Profile", color: "gray", exact: false },
  { href: "/dashboard/settings", icon: "settings", label: "Settings", color: "gray", exact: false },
]

const ICONS: Record<string, React.ReactNode> = {
  globe: <GlobeAltIcon className="w-5 h-5" />,
  wallet: <CreditCardIcon className="w-5 h-5" />,
  chart: <ChartBarIcon className="w-5 h-5" />,
  sparkles: <SparklesIcon className="w-5 h-5" />,
  partners: <GlobeAltIcon className="w-5 h-5" />,
  tier: <div className="w-5 h-5 flex items-center justify-center font-serif font-bold">T</div>,
  briefcase: <BriefcaseIcon className="w-5 h-5" />,
  bolt: <BoltIcon className="w-5 h-5" />,
  pools: <ChartBarIcon className="w-5 h-5" />,
  shopping: <ShoppingBagIcon className="w-5 h-5" />,
  pie: <ChartPieIcon className="w-5 h-5" />,
  user: <UserIcon className="w-5 h-5" />,
  settings: <Cog6ToothIcon className="w-5 h-5" />,
}

const COLOR_STYLES: Record<string, { hover: string, active: string }> = {
  blue: {
    hover: "hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    active: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md shadow-blue-500/10 dark:shadow-blue-900/20 border-l-[3px] border-blue-500"
  },
  purple: {
    hover: "hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20",
    active: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 shadow-md shadow-purple-500/10 dark:shadow-purple-900/20 border-l-[3px] border-purple-500"
  },
  emerald: {
    hover: "hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
    active: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-md shadow-emerald-500/10 dark:shadow-emerald-900/20 border-l-[3px] border-emerald-500"
  },
  orange: {
    hover: "hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20",
    active: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 shadow-md shadow-orange-500/10 dark:shadow-orange-900/20 border-l-[3px] border-orange-500"
  },
  indigo: {
    hover: "hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
    active: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-md shadow-indigo-500/10 dark:shadow-indigo-900/20 border-l-[3px] border-indigo-500"
  },
  yellow: {
    hover: "hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
    active: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 shadow-md shadow-yellow-500/10 dark:shadow-yellow-900/20 border-l-[3px] border-yellow-500"
  },
  pink: {
    hover: "hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20",
    active: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 shadow-md shadow-pink-500/10 dark:shadow-pink-900/20 border-l-[3px] border-pink-500"
  },
  teal: {
    hover: "hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20",
    active: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 shadow-md shadow-teal-500/10 dark:shadow-teal-900/20 border-l-[3px] border-teal-500"
  },
  gray: {
    hover: "hover:text-foreground hover:bg-muted",
    active: "text-foreground bg-muted shadow-md shadow-muted/50 border-l-[3px] border-foreground/30"
  },
}

export function SidebarNav({ isActiveMember, session }: SidebarNavProps) {
  const pathname = usePathname()

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href
    if (href === "/dashboard/welcome" && pathname === "/dashboard/welcome") return true
    if (href === "/dashboard" && pathname === "/dashboard") return true
    if (href !== "/dashboard") return pathname.startsWith(href)
    return false
  }

  return (
    <nav className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-1.5">
      <div className="px-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Platform</div>
      
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href, item.exact)
        const showLock = item.locked && !isActiveMember
        const styles = COLOR_STYLES[item.color] || COLOR_STYLES.blue

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-[15px] font-medium group ${
              active
                ? `${styles.active} font-semibold`
                : `text-muted-foreground hover:shadow-md hover:shadow-muted/50 dark:hover:shadow-none ${styles.hover}`
            }`}
          >
            <span className={`transition-colors ${active ? "text-current" : "text-muted-foreground/70 group-hover:text-current"}`}>
              {ICONS[item.icon]}
            </span>
            <span className="flex-1">{item.label}</span>
            {showLock && (
              <LockClosedIcon className="w-3.5 h-3.5 text-amber-500/60 shrink-0" />
            )}
          </Link>
        )
      })}

      <div className="pt-8 px-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Account</div>
      
      {ACCOUNT_ITEMS.map((item) => {
        const active = isActive(item.href, item.exact)
        const styles = COLOR_STYLES[item.color] || COLOR_STYLES.gray

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-[15px] font-medium group ${
              active
                ? `${styles.active} font-semibold`
                : `text-muted-foreground hover:shadow-md hover:shadow-muted/50 dark:hover:shadow-none ${styles.hover}`
            }`}
          >
            <span className={`transition-colors ${active ? "text-current" : "text-muted-foreground/70 group-hover:text-current"}`}>
              {ICONS[item.icon]}
            </span>
            {item.label}
          </Link>
        )
      })}

      <div className="mx-4 mt-2 mb-2 border-t border-border" />
      
      <form action="/api/auth/signout" method="POST">
        <button type="submit" className="flex items-center gap-3.5 px-4 py-3 w-full text-left text-destructive hover:bg-destructive/10 hover:shadow-md hover:shadow-destructive/20 rounded-xl transition-all duration-200 text-[15px] font-semibold group">
          <span className="text-destructive transition-colors">
            <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
          </span>
          Sign Out
        </button>
      </form>
    </nav>
  )
}