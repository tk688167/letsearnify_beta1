export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import MobileNav from "./mobile-nav"
import { Sidebar } from "./sidebar"
import { BottomNav } from "./BottomNav"
import { SwipeContainer } from "./SwipeContainer"

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
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar session={session} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background pb-[80px] md:pb-0 relative transition-colors duration-300">
        <MobileNav session={session} />
        
        {/* Mobile Swipe Container + Children */}
        {/* Responsive Container */}
        <SwipeContainer>
            {children}
        </SwipeContainer>

        <BottomNav />
      </main>
    </div>
  )
}
