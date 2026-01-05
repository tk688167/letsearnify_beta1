import Link from "next/link"
import { auth, signOut } from "@/auth"
import { ArrowLeftStartOnRectangleIcon, HomeIcon, BriefcaseIcon, BanknotesIcon, ShoppingBagIcon, UserIcon, Cog6ToothIcon, GlobeAltIcon, CreditCardIcon } from "@heroicons/react/24/outline"
import { formatUserId } from "@/lib/utils"

import MobileNav from "./mobile-nav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden md:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="p-8 pb-4">
          <Link href="/dashboard">
            <h1 className="text-2xl font-serif font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer">
              Let'$Earnify
            </h1>
          </Link>
          <p className="text-xs text-gray-400 mt-1 font-medium tracking-wider uppercase">Beta Release</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <div className="px-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">Platform</div>
          <NavItem href="/dashboard" icon={<HomeIcon className="w-5 h-5"/>} label="Overview" color="blue" />
          <NavItem href="/dashboard/referrals" icon={<GlobeAltIcon className="w-5 h-5"/>} label="Partners" color="purple" />
          <NavItem href="/dashboard/tiers" icon={<div className="w-5 h-5 flex items-center justify-center font-serif font-bold">T</div>} label="Tier Progress" color="yellow" />
          <NavItem href="/dashboard/tasks" icon={<BriefcaseIcon className="w-5 h-5"/>} label="Task Center" color="emerald" />
          <NavItem href="/dashboard/investments" icon={<BanknotesIcon className="w-5 h-5"/>} label="Mudaraba Pool" color="teal" />
          <NavItem href="/dashboard/marketplace" icon={<ShoppingBagIcon className="w-5 h-5"/>} label="Marketplace" color="orange" />
          <NavItem href="/dashboard/wallet" icon={<CreditCardIcon className="w-5 h-5"/>} label="Wallet" color="indigo" />
          
          <div className="pt-8 px-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">Account</div>
          <NavItem href="/dashboard/profile" icon={<UserIcon className="w-5 h-5"/>} label="My Profile" color="gray" />
          <NavItem href="/dashboard/settings" icon={<Cog6ToothIcon className="w-5 h-5"/>} label="Settings" color="gray" />
        </nav>

        <div className="p-4 m-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              {session?.user?.name?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-sm text-gray-900 truncate">{session?.user?.name || "User"}</div>
              <div className="text-xs text-gray-500 truncate">{session?.user?.email}</div>
              <div className="text-[10px] font-mono text-blue-600 font-bold mt-0.5">{formatUserId(session?.user?.memberId)}</div>
            </div>
          </div>
          <form action={async () => {
            "use server"
            await signOut({ redirectTo: "/" })
          }}>
            <button className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-red-600 bg-white border border-red-50 hover:bg-red-50 rounded-xl transition-all shadow-sm">
              <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50/50">
        <MobileNav session={session} />
        {children}
      </main>
    </div>
  )
}

function NavItem({ href, icon, label, color }: { href: string, icon: React.ReactNode, label: string, color: string }) {
  const colorStyles: Record<string, string> = {
    blue: "hover:text-blue-600 hover:bg-blue-50 group-hover:text-blue-500",
    purple: "hover:text-purple-600 hover:bg-purple-50 group-hover:text-purple-500",
    emerald: "hover:text-emerald-600 hover:bg-emerald-50 group-hover:text-emerald-500",
    teal: "hover:text-teal-600 hover:bg-teal-50 group-hover:text-teal-500",
    orange: "hover:text-orange-600 hover:bg-orange-50 group-hover:text-orange-500",
    indigo: "hover:text-indigo-600 hover:bg-indigo-50 group-hover:text-indigo-500",
    gray: "hover:text-gray-900 hover:bg-gray-100 group-hover:text-gray-600"
  }

  const activeClass = colorStyles[color] || colorStyles.blue

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3.5 px-4 py-3 text-gray-600 hover:shadow-md hover:shadow-gray-200/50 rounded-xl transition-all duration-200 text-[15px] font-medium group ${activeClass}`}
    >
      <span className="text-gray-400 transition-colors">{icon}</span>
      {label}
    </Link>
  )
}
