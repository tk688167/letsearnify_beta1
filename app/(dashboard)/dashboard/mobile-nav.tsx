"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import ThemeToggle from "@/app/components/ui/ThemeToggle"
import { 
  Bars3BottomLeftIcon, 
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
  ChartBarIcon,
} from "@heroicons/react/24/outline"
import { Session } from "next-auth"
import { signOut } from "next-auth/react"
import Logo from "@/app/components/ui/Logo" 

export default function MobileNav({ session }: { session: Session | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const pathname = usePathname()

  const closeMenu = () => {
    setIsOpen(false)
    document.body.classList.remove('side-nav-open')
  }
  const toggleMenu = () => {
    const nextState = !isOpen
    setIsOpen(nextState)
    if (nextState) {
        document.body.classList.add('side-nav-open')
    } else {
        document.body.classList.remove('side-nav-open')
    }
  }

  const toggleProfile = () => setIsProfileOpen(!isProfileOpen)

  // Init theme
  if (typeof window !== 'undefined' && !localStorage.getItem('theme-init')) {
     const saved = localStorage.getItem('theme')
     if (saved === 'dark') document.documentElement.classList.add('dark')
     localStorage.setItem('theme-init', 'true')
  }

  return (
    <>
      <style jsx global>{`
        body.side-nav-open .bottom-nav-container {
          display: none !important;
        }
      `}</style>
      
      {/* Mobile Header - Refined */}
      <header className="sticky top-0 z-[60] bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex justify-between items-center md:hidden h-[64px] transition-colors duration-300">
         <div className="flex items-center gap-3">
            {/* Modern Menu Trigger */}
            <button 
              onClick={toggleMenu}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-card border border-border shadow-sm text-foreground active:scale-95 transition-all hover:bg-muted"
            >
               <Bars3BottomLeftIcon className="w-5 h-5" />
            </button>
             
             <div className="flex items-center gap-3">
               <Logo size="sm" />
               <ThemeToggle />
             </div>
         </div>

         {/* Interactive Profile Icon */}
         <div className="relative">
            <button 
               onClick={toggleProfile}
               className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20 ring-2 ring-background active:scale-95 transition-transform"
            >
               {session?.user?.name?.[0] || "U"}
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
               <>
                  <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                     <div className="p-3 border-b border-border">
                        <p className="font-bold text-foreground text-sm truncate">{session?.user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                     </div>
                     <div className="p-2 space-y-1">
                        <Link 
                           href="/dashboard/profile" 
                           onClick={() => setIsProfileOpen(false)}
                           className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                           <UserIcon className="w-4 h-4"/> My Profile
                        </Link>
                     </div>
                     <div className="p-2 border-t border-border">
                        <button 
                           onClick={() => signOut({ callbackUrl: "/" })}
                           className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                           <ArrowLeftStartOnRectangleIcon className="w-4 h-4"/> Sign Out
                        </button>
                     </div>
                  </div>
               </>
            )}
         </div>
      </header>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 top-[64px] z-[55] bg-black/50 backdrop-blur-[2px] md:hidden animate-in fade-in duration-200"
          onClick={closeMenu}
        />
      )}

      {/* Drawer Panel - Reduced Width (w-64 = 256px) */}
      <div className={`fixed inset-y-0 left-0 top-[64px] z-[58] w-64 bg-background/95 backdrop-blur-xl border-r border-border shadow-2xl transform transition-transform duration-300 ease-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
             <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                <div className="px-4 pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Platform</div>
                <MobileNavItem href="/dashboard/welcome" icon={<GlobeAltIcon className="w-5 h-5"/>} label="Explorer" pathname={pathname} close={closeMenu} color="blue" />
                <MobileNavItem href="/dashboard" icon={<HomeIcon className="w-5 h-5"/>} label="Overview" pathname={pathname} close={closeMenu} color="gray" />
                
                <div className="mt-6 px-4 pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Growth</div>
                <MobileNavItem href="/dashboard/tasks" icon={<BriefcaseIcon className="w-5 h-5"/>} label="Task Center" pathname={pathname} close={closeMenu} color="indigo" />
                <MobileNavItem href="/dashboard/tiers" icon={<div className="w-5 h-5 flex items-center justify-center font-serif font-bold">T</div>} label="Tier System" pathname={pathname} close={closeMenu} color="yellow" />
                <MobileNavItem href="/dashboard/referrals" icon={<UserIcon className="w-5 h-5"/>} label="Partners" pathname={pathname} close={closeMenu} color="purple" />
                
                <div className="mt-6 px-4 pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Finance</div>
                <MobileNavItem href="/dashboard/pools" icon={<ChartBarIcon className="w-5 h-5"/>} label="Reward Pools" pathname={pathname} close={closeMenu} color="blue" />
                <MobileNavItem href="/dashboard/investments" icon={<BanknotesIcon className="w-5 h-5"/>} label="Mudaraba Pool" pathname={pathname} close={closeMenu} color="teal" />
                <MobileNavItem href="/dashboard/marketplace" icon={<ShoppingBagIcon className="w-5 h-5"/>} label="Marketplace" pathname={pathname} close={closeMenu} color="orange" />
                <MobileNavItem href="/dashboard/wallet" icon={<CreditCardIcon className="w-5 h-5"/>} label="My Wallet" pathname={pathname} close={closeMenu} color="emerald" />
                
                 <div className="mt-6 px-4 pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Settings</div>
                 <MobileNavItem href="/dashboard/profile" icon={<UserIcon className="w-5 h-5"/>} label="Profile" pathname={pathname} close={closeMenu} color="gray" />
                 <MobileNavItem href="/dashboard/settings" icon={<Cog6ToothIcon className="w-5 h-5"/>} label="Settings" pathname={pathname} close={closeMenu} color="gray" />

               {session?.user?.email === "admin@letsearnify.com" && (
                   <div className="mt-4 pt-4 border-t border-border">
                     <Link 
                         href="/admin" 
                         onClick={closeMenu}
                         className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 shadow-md transition-all"
                     >
                         <BriefcaseIcon className="w-5 h-5" />
                         Switch to Admin
                     </Link>
                   </div>
               )}
            </nav>
        </div>
      </div>
    </>
  )
}

function MobileNavItem({ href, icon, label, pathname, close, color }: { href: string, icon: React.ReactNode, label: string, pathname: string, close: () => void, color: string }) {
  const isActive = pathname === href
  
  const themeStyles: Record<string, { active: string, hover: string, text: string, border: string }> = {
    blue: { active: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300", hover: "hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500" },
    purple: { active: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300", hover: "hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500" },
    emerald: { active: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300", hover: "hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500" },
    teal: { active: "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300", hover: "hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/10", text: "text-teal-600 dark:text-teal-400", border: "border-teal-500" },
    orange: { active: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300", hover: "hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500" },
    indigo: { active: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300", hover: "hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500" },
    gray: { active: "bg-muted text-foreground", hover: "hover:text-foreground hover:bg-muted", text: "text-foreground", border: "border-foreground" },
    yellow: { active: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300", hover: "hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/10", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-500" },
    pink: { active: "bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300", hover: "hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/10", text: "text-pink-600 dark:text-pink-400", border: "border-pink-500" }
  }

  const theme = themeStyles[color] || themeStyles.blue

  return (
    <Link 
      href={href} 
      onClick={close}
      className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group ${
        isActive 
          ? `${theme.active} shadow-sm` 
          : `text-muted-foreground hover:bg-muted ${theme.hover}`
      }`}
    >
      {isActive && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${theme.active.split(' ')[0].replace('bg-', 'bg-').replace('/20', '')}`} />}
      <span className={`${isActive ? theme.text : "text-muted-foreground group-hover:" + theme.text.replace("text-", "text-")} transition-colors`}>{icon}</span>
      {label}
    </Link>
  )
}
