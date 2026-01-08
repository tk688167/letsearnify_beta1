"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon, UsersIcon, GlobeAltIcon, ArrowLeftOnRectangleIcon, CheckCircleIcon, BanknotesIcon, CurrencyDollarIcon, WalletIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Navigation Structure
const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'User Management', href: '/admin/users', icon: UsersIcon },
  { name: 'Deposit Approvals', href: '/admin/deposits', icon: CurrencyDollarIcon },
  { name: 'Manual Deposit', href: '/admin/manual-deposit', icon: BanknotesIcon },
  { name: 'Withdrawal Requests', href: '/admin/withdrawals', icon: ArrowLeftOnRectangleIcon },
  { name: 'Wallet Settings', href: '/admin/wallets', icon: WalletIcon }, 
  { name: 'Merchant Settings', href: '/admin/settings/merchant', icon: BanknotesIcon },
  { 
      name: 'Tier System', 
      href: '#', 
      icon: CheckCircleIcon,
      children: [
          { name: 'Tier Audit', href: '/admin/tiers/audit', icon: '📋' },
          { name: 'Tier Management', href: '/admin/tiers/manage', icon: '⚙️' }
      ]
  },
  { 
      name: 'Site Management',
      href: '#',
      icon: GlobeAltIcon,
      children: [
          { name: 'Platform Stats', href: '/admin/stats', icon: '📊' },
          { name: 'Welcome Page Slider', href: '/admin/welcome-slider', icon: '📢' }
      ]
  },
  { 
      name: 'Pools & Revenue', 
      href: '/admin/pools', // Fallback or main link
      icon: BanknotesIcon,
      children: [
          { name: 'Pools Overview', href: '/admin/pools' },
          { name: 'CBSPool', href: '/admin/pools/cbspool', icon: '💰' },
          { name: 'Royalty Pool', href: '/admin/royalty', icon: '👑' }
      ]
  },
  { name: 'Visitor Logs', href: '/admin/visits', icon: GlobeAltIcon },
]

export function AdminSidebar({ counts: initialCounts = { deposits: 0, withdrawals: 0 } }: { counts?: { deposits: number, withdrawals: number } }) {
  const pathname = usePathname()
  const [counts, setCounts] = useState(initialCounts)
  const [openMenus, setOpenMenus] = useState<string[]>([])

  // Init open menus based on current path
  useEffect(() => {
    navigation.forEach(item => {
        if (item.children && item.children.some(child => pathname === child.href)) {
            setOpenMenus(prev => [...prev, item.name])
        }
    })
  }, []) // Run once on mount

  const toggleMenu = (name: string) => {
      setOpenMenus(prev => 
        prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
      )
  }

  // Real-time polling
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/admin/pending-counts')
        if (res.ok) {
          const data = await res.json()
          if (typeof data.deposits === 'number') {
            setCounts({ 
                deposits: data.deposits, 
                withdrawals: data.withdrawals 
            })
          }
        }
      } catch (error) {
        console.error("Polling error:", error)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setCounts(initialCounts)
  }, [initialCounts])

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col hidden md:flex z-50 h-screen sticky top-0 overflow-y-auto">
      <div className="p-8 pb-4">
        <Link href="/dashboard">
          <h1 className="text-2xl font-serif font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer">
            Let'$Earnify
          </h1>
        </Link>
        <p className="text-xs text-gray-400 mt-1 font-medium tracking-wider uppercase">Admin Portal</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 pb-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const hasChildren = item.children && item.children.length > 0
          const isOpen = openMenus.includes(item.name)
          const isChildActive = hasChildren && item.children?.some(child => pathname === child.href)
          
          let badgeCount = 0
          if (item.name === 'Deposit Approvals') badgeCount = counts.deposits
          if (item.name === 'Withdrawal Requests') badgeCount = counts.withdrawals

          return (
            <div key={item.name}>
                {hasChildren ? (
                    <button
                        onClick={() => toggleMenu(item.name)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left ${
                            isActive || isChildActive
                            ? 'bg-blue-50 text-blue-700 shadow-sm' 
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1">{item.name}</span>
                        {isOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                    </button>
                ) : (
                    <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive 
                            ? 'bg-blue-50 text-blue-700 shadow-sm' 
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1">{item.name}</span>
                        
                        {badgeCount > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-sm animate-pulse">
                            {badgeCount}
                            </span>
                        )}
                    </Link>
                )}

                {/* Sub-menu */}
                <AnimatePresence>
                    {hasChildren && isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pl-12 pr-4 py-1 space-y-1">
                                {item.children!.map((child) => (
                                    <Link
                                        key={child.name}
                                        href={child.href}
                                        className={`block py-2 text-sm transition-colors ${
                                            pathname === child.href
                                            ? 'text-blue-600 font-medium'
                                            : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            {/* @ts-ignore */}
                                            {child.icon ? <span>{child.icon}</span> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>}
                                            {child.name}
                                        </span>
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

      <div className="p-4 border-t border-gray-100 m-4 space-y-2">
         <Link 
           href="/dashboard"
           className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
         >
           <UsersIcon className="w-5 h-5" />
           Switch to Dashboard
         </Link>
         <button 
           onClick={() => signOut({ callbackUrl: '/' })}
           className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
         >
           <ArrowLeftOnRectangleIcon className="w-5 h-5" />
           Sign Out
         </button>
      </div>
    </aside>
  )
}
