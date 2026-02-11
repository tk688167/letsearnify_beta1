import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic";

import DashboardClient from "./DashboardClient"
import { getDashboardData } from "@/lib/services/dashboard"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  const { user, pools, isOffline } = await getDashboardData(session.user.id);

  // Handle case where DB works but user not found (should be handled by auth redir normally)
  if (!user && !isOffline) {
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
        <DashboardClient 
            user={user} 
            pools={pools} 
            stats={{}} 
        />
      </>
  )
}
