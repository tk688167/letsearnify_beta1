"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  HomeIcon, 
  UsersIcon, 
  BriefcaseIcon, 
  CreditCardIcon, 
  SparklesIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, color: 'blue' },
  { name: 'Spin', href: '/dashboard/spin', icon: SparklesIcon, color: 'pink' },
  { name: 'Tasks', href: '/dashboard/tasks', icon: BriefcaseIcon, color: 'emerald' },
  { name: 'Partner Program', href: '/dashboard/referrals', icon: UsersIcon, color: 'purple' },
  { name: 'Wallet', href: '/dashboard/wallet', icon: CreditCardIcon, color: 'indigo' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav-container fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border flex items-center justify-center px-1 py-2 md:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_-8px_30px_rgb(0,0,0,0.1)] h-[64px]">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        
        const colors: Record<string, string> = {
          blue: 'text-blue-600 dark:text-blue-400',
          purple: 'text-purple-600 dark:text-purple-400',
          emerald: 'text-emerald-600 dark:text-emerald-400',
          indigo: 'text-indigo-600 dark:text-indigo-400',
          pink: 'text-pink-600 dark:text-pink-400'
        }

        return (
          <Link 
            key={item.name} 
            href={item.href}
            className="relative flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-300"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`p-1.5 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-muted/80 scale-105 shadow-sm' 
                  : 'group-hover:bg-muted/50'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors duration-300 ${
                isActive ? colors[item.color] : 'text-muted-foreground group-hover:text-foreground'
              }`} />
            </motion.div>
            
            <span className={`text-[9px] font-bold tracking-tight transition-colors duration-300 ${
              isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
            }`}>
              {item.name}
            </span>

            {isActive && (
              <motion.div 
                layoutId="bottomNavIndicator"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
