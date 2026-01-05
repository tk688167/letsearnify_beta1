"use client"

import { useState } from "react"
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
  GlobeAltIcon
} from "@heroicons/react/24/outline"
import { signOut } from "next-auth/react" 

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'User Management', href: '/admin/users', icon: UsersIcon },
  { name: 'Deposit Approvals', href: '/admin/deposits', icon: CurrencyDollarIcon },
  { name: 'Withdrawal Requests', href: '/admin/withdrawals', icon: ArrowLeftOnRectangleIcon },
  { name: 'Wallet Settings', href: '/admin/wallets', icon: WalletIcon }, 
  { name: 'Merchant Settings', href: '/admin/settings/merchant', icon: BanknotesIcon },
  { name: 'Tier Audit', href: '/admin/tiers/audit', icon: CheckCircleIcon },
  { name: 'Pools & Revenue', href: '/admin/pools', icon: BanknotesIcon },
  { name: 'Visitor Logs', href: '/admin/visits', icon: GlobeAltIcon },
]

export default function MobileAdminNav({ counts = { deposits: 0, withdrawals: 0 } }: { counts?: { deposits: number, withdrawals: number } }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex justify-between items-center md:hidden">
         <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsOpen(true)}
              className="p-1 -ml-1 text-gray-600 hover:text-blue-600 focus:outline-none"
            >
               <Bars3Icon className="w-7 h-7" />
               {/* Mobile Header Badge Indicator (Optional: Show dot if any notifications) */}
               {(counts.deposits > 0 || counts.withdrawals > 0) && (
                 <span className="absolute top-3 left-3 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
               )}
            </button>
            <Link href="/dashboard" className="font-serif font-bold text-lg text-gray-900 cursor-pointer">
              Let'<span className="text-blue-600">$</span>Earnify <span className="text-xs text-gray-400 font-sans ml-1 uppercase">Admin</span>
            </Link>
         </div>
      </header>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={closeMenu}
        />
      )}

      {/* Drawer Panel */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
           <div className="p-6 pb-2 flex justify-between items-start">
             <div>
               <Link href="/dashboard">
                 <h1 className="text-2xl font-serif font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer">
                   Let'$Earnify
                 </h1>
               </Link>
               <p className="text-xs text-gray-400 mt-1 font-medium tracking-wider uppercase">Admin Portal</p>
             </div>
             <button onClick={closeMenu} className="p-1 text-gray-400 hover:text-gray-600">
               <XMarkIcon className="w-6 h-6" />
             </button>
           </div>

           <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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
                      onClick={closeMenu}
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
        </div>
      </div>
    </>
  )
}
