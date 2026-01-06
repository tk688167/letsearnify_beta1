import { auth } from "@/auth"
import MobileNav from "../dashboard/mobile-nav"
import { Sidebar } from "../dashboard/components/sidebar"

export default async function WelcomeLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar - Reusing Dashboard Sidebar */}
      <Sidebar session={session} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50/50">
        <MobileNav session={session} />
        {children}
      </main>
    </div>
  )
}
