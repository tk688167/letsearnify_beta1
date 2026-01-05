"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon, UsersIcon, GlobeAltIcon, ArrowLeftOnRectangleIcon, CheckCircleIcon, BanknotesIcon, CurrencyDollarIcon, WalletIcon } from "@heroicons/react/24/outline"
import { signOut } from "next-auth/react"

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'User Management', href: '/admin/users', icon: UsersIcon },
  { name: 'Deposit Approvals', href: '/admin/deposits', icon: CurrencyDollarIcon }, // Added
  { name: 'Withdrawal Requests', href: '/admin/withdrawals', icon: ArrowLeftOnRectangleIcon }, // Added
  { name: 'Wallet Settings', href: '/admin/wallets', icon: WalletIcon }, 
  { name: 'Merchant Settings', href: '/admin/settings/merchant', icon: BanknotesIcon }, // Added
  { name: 'Tier Audit', href: '/admin/tiers/audit', icon: CheckCircleIcon },
  { name: 'Pools & Revenue', href: '/admin/pools', icon: BanknotesIcon },
  { name: 'Visitor Logs', href: '/admin/visits', icon: GlobeAltIcon },
]

import { useEffect, useState } from "react" // Added imports

export function AdminSidebar({ counts: initialCounts = { deposits: 0, withdrawals: 0 } }: { counts?: { deposits: number, withdrawals: number } }) {
  const pathname = usePathname()
  const [counts, setCounts] = useState(initialCounts)

  // Real-time polling
  useEffect(() => {
    // Poll every 10 seconds
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

  // Update state if initialCounts changes (e.g. server re-render)
  useEffect(() => {
    setCounts(initialCounts)
  }, [initialCounts])

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col hidden md:flex z-50 h-screen sticky top-0">
      <div className="p-8 pb-4">
        <Link href="/dashboard">
          <h1 className="text-2xl font-serif font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer">
            Let'$Earnify
          </h1>
        </Link>
        <p className="text-xs text-gray-400 mt-1 font-medium tracking-wider uppercase">Admin Portal</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          
          // Determine badge count
          let badgeCount = 0
          if (item.name === 'Deposit Approvals') badgeCount = counts.deposits
          if (item.name === 'Withdrawal Requests') badgeCount = counts.withdrawals

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
              
              {/* Notification Badge */}
              {badgeCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-sm animate-pulse">
                  {badgeCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 m-4">
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
