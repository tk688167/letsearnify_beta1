export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import MobileNav from "./mobile-nav"
import { Sidebar } from "./sidebar"
import { BottomNav } from "./BottomNav"
import { SwipeContainer } from "./SwipeContainer"
import { getExchangeRates } from "@/lib/currency"
import { CurrencyProvider } from "@/app/components/providers/CurrencyProvider"

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

  let user = null;
  if (session?.user?.id) {
    try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isActiveMember: true, currency: true }
      });
    } catch (error) {
      console.error("Layout Fetch User Failed:", error);
    }
  }

  const isActiveMember = user?.isActiveMember || false;
  const rates = await getExchangeRates();

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar session={session} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background pb-[80px] md:pb-0 relative transition-colors duration-300">
        <MobileNav session={session} isActiveMember={isActiveMember} />

        
        {/* Mobile Swipe Container + Children */}
        {/* Responsive Container */}
        <CurrencyProvider rates={rates} userCurrency={user?.currency || 'USD'}>
          <SwipeContainer>
              {children}
          </SwipeContainer>
        </CurrencyProvider>

        <BottomNav />
      </main>
    </div>
  )
}
