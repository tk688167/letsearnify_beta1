import Link from "next/link"
import { signOut } from "@/auth"
import ThemeToggle from "@/app/components/ui/ThemeToggle"
import { prisma } from "@/lib/prisma"
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
  ChartBarIcon,
  ChartPieIcon,
  LockClosedIcon
} from "@heroicons/react/24/outline"
import { formatUserId } from "@/lib/utils"
import Logo from "@/app/components/ui/Logo"
import { SidebarNav } from "./SidebarNav"

export async function Sidebar({ session }: { session: any }) {
  let isActiveMember = false;
  if (session?.user?.id) {
    if (session.user.id === "super-admin-id") {
      isActiveMember = true;
    } else {
      try {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { isActiveMember: true }
        });
        isActiveMember = user?.isActiveMember || false;
      } catch {
        isActiveMember = false;
      }
    }
  }

  return (
    <aside className="w-72 bg-card border-r border-border hidden md:flex flex-col overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 transition-colors duration-300">
      <div className="p-8 pb-4 flex items-center justify-between">
        <div className="-ml-2">
          <Logo size="lg" />
        </div>
        <ThemeToggle />
      </div>
      <div className="px-8 -mt-2 mb-4">
        <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase">Beta Release</p>
      </div>
      
      <SidebarNav isActiveMember={isActiveMember} session={session} />

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
        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard/settings"
            className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-muted-foreground bg-background border border-border hover:bg-muted/60 hover:border-border rounded-xl transition-all shadow-sm"
          >
            <Cog6ToothIcon className="w-4 h-4" />
            Settings
          </Link>
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
      </div>
    </aside>
  )
}