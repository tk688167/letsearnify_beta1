export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import MobileNav from "./mobile-nav"
import { Sidebar } from "./sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let session;
  try {
      session = await auth();
  } catch (error) {
      console.error("Layout Auth Session Failed:", error);
      // Mock session to prevent layout crash
      session = { 
          user: { name: "Guest (Offline)", email: "offline@local", role: "USER" },
          expires: new Date(Date.now() + 86400 * 1000).toISOString()
      } as any; 
  }

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
