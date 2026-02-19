import Link from "next/link"
import { signOut } from "@/auth"
import ThemeToggle from "@/app/components/ui/ThemeToggle"
import { 
  ArrowLeftStartOnRectangleIcon, 
  HomeIcon, 
  BriefcaseIcon, 
  BanknotesIcon, 
  ShoppingBagIcon, 
  UserIcon, 
  Cog6ToothIcon, 
  GlobeAltIcon, 
  CreditCardIcon,
  SparklesIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"
import { formatUserId } from "@/lib/utils"
import Logo from "@/app/components/ui/Logo"

export function Sidebar({ session }: { session: any }) {
  return (
    <aside className="w-72 bg-card border-r border-border hidden md:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 transition-colors duration-300">
      <div className="p-8 pb-4 flex items-center justify-between">
        <div className="-ml-2">
          <Logo size="lg" />
        </div>
        <ThemeToggle />
      </div>
      <div className="px-8 -mt-2 mb-4">
        <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase">Beta Release</p>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <div className="px-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Platform</div>
        <NavItem href="/dashboard/welcome" icon={<GlobeAltIcon className="w-5 h-5"/>} label="Welcome" color="blue" />
        <NavItem href="/dashboard" icon={<HomeIcon className="w-5 h-5"/>} label="Overview" color="gray" />
        <NavItem href="/dashboard/spin" icon={<SparklesIcon className="w-5 h-5"/>} label="Spin" color="pink" />
        <NavItem href="/dashboard/referrals" icon={<GlobeAltIcon className="w-5 h-5"/>} label="Partners" color="purple" />
        <NavItem href="/dashboard/tiers" icon={<div className="w-5 h-5 flex items-center justify-center font-serif font-bold">T</div>} label="Tier Progress" color="yellow" />
        <NavItem href="/dashboard/tasks" icon={<BriefcaseIcon className="w-5 h-5"/>} label="Task Center" color="emerald" />
        <NavItem href="/dashboard/pools" icon={<ChartBarIcon className="w-5 h-5"/>} label="Reward Pools" color="blue" />
        <NavItem href="/dashboard/investments" icon={<BanknotesIcon className="w-5 h-5"/>} label="Mudaraba Pool" color="teal" />
        <NavItem href="/dashboard/marketplace" icon={<ShoppingBagIcon className="w-5 h-5"/>} label="Marketplace" color="orange" />
        <NavItem href="/dashboard/wallet" icon={<CreditCardIcon className="w-5 h-5"/>} label="Wallet" color="indigo" />
        
        <div className="pt-8 px-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Account</div>
        <NavItem href="/dashboard/profile" icon={<UserIcon className="w-5 h-5"/>} label="My Profile" color="gray" />
        <NavItem href="/dashboard/settings" icon={<Cog6ToothIcon className="w-5 h-5"/>} label="Settings" color="gray" />
      </nav>

      {session?.user?.email === "admin@letsearnify.com" && (
         <div className="px-4 mb-2">
            <Link 
              href="/admin"
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-lg shadow-primary/20"
            >
              <BriefcaseIcon className="w-5 h-5" />
              Switch to Admin Portal
            </Link>
         </div>
      )}

      <div className="p-4 m-4 bg-muted/30 rounded-2xl border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            {session?.user?.name?.[0] || "U"}
          </div>
          <div className="overflow-hidden">
            <div className="font-bold text-sm text-foreground truncate">{session?.user?.name || "User"}</div>
            <div className="text-xs text-muted-foreground truncate">{session?.user?.email}</div>
            <div className="text-[10px] font-mono text-primary font-bold mt-0.5">{formatUserId(session?.user?.memberId)}</div>
          </div>
        </div>
        <form action={async () => {
          "use server"
          await signOut({ redirectTo: "/" })
        }}>
          <button className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-destructive bg-background border border-border hover:bg-destructive/10 hover:border-destructive/30 rounded-xl transition-all shadow-sm">
            <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}

function NavItem({ href, icon, label, color }: { href: string, icon: React.ReactNode, label: string, color: string }) {
  const colorStyles: Record<string, string> = {
    blue: "hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    purple: "hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20",
    emerald: "hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
    teal: "hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20",
    orange: "hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20",
    indigo: "hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
    gray: "hover:text-foreground hover:bg-muted",
    yellow: "hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
    pink: "hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20"
  }

  const activeClass = colorStyles[color] || colorStyles.blue

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3.5 px-4 py-3 text-muted-foreground hover:shadow-md hover:shadow-muted/50 dark:hover:shadow-none rounded-xl transition-all duration-200 text-[15px] font-medium group ${activeClass}`}
    >
      <span className="text-muted-foreground/70 group-hover:text-current transition-colors">{icon}</span>
      {label}
    </Link>
  )
}
