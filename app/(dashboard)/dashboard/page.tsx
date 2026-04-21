import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic";

import DashboardClient from "./DashboardClient"
import { getDashboardData } from "@/lib/services/dashboard"
import EligibilityBanner from "./EligibilityBanner"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  const { user, pools, isOffline, isMarketplaceLive, isMudarabahLive } = await getDashboardData(session.user.id);

  // Anti-Gravity: Handle Super Admin fallback
  let displayUser = user;
  if (!displayUser && (session.user as any).id === "super-admin-id") {
      const { DEFAULT_TIER_REQUIREMENTS } = await import("@/lib/mlm")
      displayUser = {
          id: "super-admin-id",
          name: "Super Admin",
          email: "admin@letsearnify.com",
          balance: 0,
          tier: "EMERALD",
          arnBalance: 0,
          memberId: "0000000",
          referralCode: "ADMIN",
          isActiveMember: true,
          totalDeposit: 5000,
          totalSignups: 0,
          qualifiedArn: 5000,
          tierRules: DEFAULT_TIER_REQUIREMENTS
      } as any;
  }

  // Handle case where DB works but user not found (should be handled by auth redir normally)
  if (!displayUser && !isOffline) {
       // Force logout or error page?
       // For now, redirect to login as session might be stale
       redirect("/login")
  }

  return (
      <>
        {isOffline && (
            <div className="mx-4 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                ⚠️ <strong>Offline Mode Active:</strong> Dashboard features are limited due to database connectivity.
            </div>
        )}
        <EligibilityBanner user={displayUser} />
        <DashboardClient 
            user={displayUser} 
            pools={pools} 
            stats={{}} 
            isMarketplaceLive={isMarketplaceLive}
            isMudarabahLive={isMudarabahLive}
        />
      </>
  )
}
