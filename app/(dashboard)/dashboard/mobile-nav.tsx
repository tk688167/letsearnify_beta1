"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  EllipsisVerticalIcon, 
  XMarkIcon,
  HomeIcon, 
  BriefcaseIcon, 
  BanknotesIcon, 
  ShoppingBagIcon, 
  UserIcon, 
  Cog6ToothIcon, 
  GlobeAltIcon,
  ArrowLeftStartOnRectangleIcon,
  CreditCardIcon,
  SparklesIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"
import { Session } from "next-auth"
import { signOut } from "next-auth/react" 

export default function MobileNav({ session }: { session: Session | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const closeMenu = () => setIsOpen(false)
  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Mobile Header - Always Visible, Z-Index High */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 py-3.5 flex justify-between items-center md:hidden h-[64px]">
         <div className="flex items-center gap-3">
            <button 
              onClick={toggleMenu}
              className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-white border border-indigo-100 shadow-sm shadow-indigo-100/50 hover:shadow-md hover:shadow-indigo-200/50 hover:border-indigo-200 hover:scale-105 active:scale-95 transition-all duration-300"
            >
               <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
               <EllipsisVerticalIcon className="w-6 h-6 text-gray-500 group-hover:text-indigo-600 transition-colors duration-300 relative z-10" />
            </button>
            <Link href="/dashboard" className="font-serif font-bold text-lg text-gray-900 cursor-pointer">Let'$Earnify</Link>
         </div>
         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-500/20 ring-2 ring-white">
            {session?.user?.name?.[0] || "U"}
         </div>
      </header>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 top-[64px] z-30 bg-gray-900/20 backdrop-blur-[2px] md:hidden animate-in fade-in duration-200"
          onClick={closeMenu}
        />
      )}

      {/* Drawer Panel - Slides in BELOW header */}
      <div className={`fixed inset-y-0 left-0 top-[64px] z-40 w-72 bg-white/95 backdrop-blur-xl border-r border-gray-100 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
           {/* Header inside drawer removed to avoid duplication/clutter, simpler list */}
           
           <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              <div className="px-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">Platform</div>
              <MobileNavItem href="/dashboard/welcome" icon={<GlobeAltIcon className="w-5 h-5"/>} label="Welcome" pathname={pathname} close={closeMenu} color="blue" />
              <MobileNavItem href="/dashboard" icon={<HomeIcon className="w-5 h-5"/>} label="Overview" pathname={pathname} close={closeMenu} color="gray" />
              <MobileNavItem href="/dashboard/spin" icon={<SparklesIcon className="w-5 h-5"/>} label="Spin & Win" pathname={pathname} close={closeMenu} color="pink" />
              <MobileNavItem href="/dashboard/referrals" icon={<GlobeAltIcon className="w-5 h-5"/>} label="Partners" pathname={pathname} close={closeMenu} color="purple" />
              <MobileNavItem href="/dashboard/tiers" icon={<div className="w-5 h-5 flex items-center justify-center font-serif font-bold">T</div>} label="Tier Progress" pathname={pathname} close={closeMenu} color="yellow" />
              <MobileNavItem href="/dashboard/tasks" icon={<BriefcaseIcon className="w-5 h-5"/>} label="Task Center" pathname={pathname} close={closeMenu} color="emerald" />
              <MobileNavItem href="/dashboard/pools" icon={<ChartBarIcon className="w-5 h-5"/>} label="Reward Pools" pathname={pathname} close={closeMenu} color="blue" />
              <MobileNavItem href="/dashboard/investments" icon={<BanknotesIcon className="w-5 h-5"/>} label="Mudaraba Pool" pathname={pathname} close={closeMenu} color="teal" />
              <MobileNavItem href="/dashboard/marketplace" icon={<ShoppingBagIcon className="w-5 h-5"/>} label="Marketplace" pathname={pathname} close={closeMenu} color="orange" />
              <MobileNavItem href="/dashboard/wallet" icon={<CreditCardIcon className="w-5 h-5"/>} label="Wallet" pathname={pathname} close={closeMenu} color="indigo" />
              
              <div className="pt-8 px-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">Account</div>
              <MobileNavItem href="/dashboard/profile" icon={<UserIcon className="w-5 h-5"/>} label="My Profile" pathname={pathname} close={closeMenu} color="gray" />
              <MobileNavItem href="/dashboard/settings" icon={<Cog6ToothIcon className="w-5 h-5"/>} label="Settings" pathname={pathname} close={closeMenu} color="gray" />

              {session?.user?.email === "admin@letsearnify.com" && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link 
                        href="/admin" 
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 shadow-md transition-all"
                    >
                        <BriefcaseIcon className="w-5 h-5" />
                        Switch to Admin Portal
                    </Link>
                  </div>
              )}
           </nav>

           <div className="p-4 m-4 bg-gray-50 rounded-2xl border border-gray-100">
             <div className="flex items-center gap-3 mb-3">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                 {session?.user?.name?.[0] || "U"}
               </div>
               <div className="overflow-hidden">
                 <div className="font-bold text-sm text-gray-900 truncate">{session?.user?.name || "User"}</div>
                 <div className="text-xs text-gray-500 truncate">{session?.user?.email}</div>
               </div>
             </div>
             <button 
               onClick={() => signOut({ callbackUrl: "/" })}
               className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-red-600 bg-white border border-red-50 hover:bg-red-50 rounded-xl transition-all shadow-sm"
             >
               <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
               Sign Out
             </button>
           </div>
        </div>
      </div>
    </>
  )
}

function MobileNavItem({ href, icon, label, pathname, close, color }: { href: string, icon: React.ReactNode, label: string, pathname: string, close: () => void, color: string }) {
  const isActive = pathname === href
  
  const themeStyles: Record<string, { active: string, hover: string, text: string }> = {
    blue: { active: "bg-blue-50 text-blue-700", hover: "hover:text-blue-600 hover:bg-blue-50", text: "text-blue-600" },
    purple: { active: "bg-purple-50 text-purple-700", hover: "hover:text-purple-600 hover:bg-purple-50", text: "text-purple-600" },
    emerald: { active: "bg-emerald-50 text-emerald-700", hover: "hover:text-emerald-600 hover:bg-emerald-50", text: "text-emerald-600" },
    teal: { active: "bg-teal-50 text-teal-700", hover: "hover:text-teal-600 hover:bg-teal-50", text: "text-teal-600" },
    orange: { active: "bg-orange-50 text-orange-700", hover: "hover:text-orange-600 hover:bg-orange-50", text: "text-orange-600" },
    indigo: { active: "bg-indigo-50 text-indigo-700", hover: "hover:text-indigo-600 hover:bg-indigo-50", text: "text-indigo-600" },
    gray: { active: "bg-gray-100 text-gray-900", hover: "hover:text-gray-900 hover:bg-gray-100", text: "text-gray-900" },
    pink: { active: "bg-pink-50 text-pink-700", hover: "hover:text-pink-600 hover:bg-pink-50", text: "text-pink-600" }
  }

  const theme = themeStyles[color] || themeStyles.blue

  return (
    <Link 
      href={href} 
      onClick={close}
      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-[15px] font-medium group ${
        isActive 
          ? `${theme.active} shadow-sm` 
          : `text-gray-600 ${theme.hover}`
      }`}
    >
      <span className={`${isActive ? theme.text : "text-gray-400 group-hover:" + theme.text.replace("text-", "text-")} transition-colors`}>{icon}</span>
      {label}
    </Link>
  )
}
