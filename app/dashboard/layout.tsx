import { auth } from "@/auth"
import MobileNav from "./mobile-nav"
import { Sidebar } from "./components/sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <Sidebar session={session} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50/50">
        <MobileNav session={session} />
        {children}
      </main>
    </div>
  )
}
