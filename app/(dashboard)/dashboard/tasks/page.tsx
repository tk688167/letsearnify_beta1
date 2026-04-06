import React from "react"
import { auth } from "@/auth"

import TaskPageClient from "./components/TaskPageClient"
import { CpxResearchAdapter } from "@/lib/networks/adapters/CpxResearchAdapter"
import { getTaskData } from "@/lib/services/tasks"

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  const session = await auth()
  
  if (!session?.user?.id) return null

  // PRODUCTION-READY: Strict Type Definition
  interface PlatformTask {
    id: string
    title: string
    description: string
    reward: number
    type: string
    status: string
    completionStatus?: string | null 
    completionRemarks?: string | null // Syncing with getUserTasks return type
    link?: string | null
    createdAt: Date
    company?: {
      name: string
      logoUrl: string | null
      status: string
    } | null
  }

  const { platformTasks: platformTasksRaw, user, isOffline } = await getTaskData(session.user.id);
  
  // Anti-Gravity: Handle Super Admin
  let displayUser = user;
  if (!displayUser && session.user.id === "super-admin-id") {
      displayUser = {
          id: "super-admin-id",
          name: "Super Admin",
          email: "admin@letsearnify.com",
          isActiveMember: true,
          totalDeposit: 5000
      } as any;
  }
  
  if (!displayUser) {
      return (
          <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground mb-2">Account Not Ready</h2>
                  <p className="text-muted-foreground">Please contact support if this persists.</p>
              </div>
          </div>
      )
  }

  // Filter platform tasks
  const platformTasks = (platformTasksRaw as unknown as PlatformTask[]).filter((t: any) => !t.company || t.company.status === "ACTIVE")

  // ------------------------------------------------------------------
  // EXTERNAL NETWORK INTEGRATION (CPX Research)
  // ------------------------------------------------------------------
  
  // 1. Instantiate Adapter Directly (Avoids Singleton RefError)
  const cpxAdapter = new CpxResearchAdapter()
  
  let externalTasks: PlatformTask[] = []
  let cfxUrl = ""

  if (cpxAdapter) {
      // 2. Fetch Live Offers
      try {
          // Note: using '127.0.0.1' as fallback IP, but in prod you should get real IP from headers
          const offers = await cpxAdapter.fetchOffers({ userId: displayUser.id })
          
          // Map 'Offer' -> 'PlatformTask'
          externalTasks = offers.map((offer: any) => ({
              id: `ext-${offer.id}`,
              title: offer.title,
              description: offer.description,
              reward: offer.payout, // Map payout to reward
              type: 'SURVEY',       // Enforce type
              status: 'ACTIVE',
              link: offer.link,
              createdAt: new Date(),
              company: {
                  name: 'CPX Research',
                   // Use Logo from adapter if available, else standard
                  logoUrl: 'https://cpx-research.com/assets/images/logo-cpx.png', 
                  status: 'ACTIVE'
              }
          }))
      } catch (err) {
          console.error("Failed to fetch external tasks", err)
      }

      // 3. Generate Secure Wall URL
      cfxUrl = cpxAdapter.getWallUrl(displayUser.id, displayUser.name || "User", displayUser.email || "")
  }

  // Merge Tasks: Platform (Internal) + External
  const allTasks = [...platformTasks, ...externalTasks].sort((a,b) => b.reward - a.reward) // Sort by highest reward

  // ------------------------------------------------------------------
  // MANUAL ACCESS CONTROL (Free vs Premium)
  // ------------------------------------------------------------------
  const isUnlocked = displayUser && displayUser.isActiveMember;

  // Still check for Global "Coming Soon" config, but don't block basic task view
  const { getComingSoonConfig } = await import("@/app/actions/admin/settings")
  const config = await getComingSoonConfig()
  
  if (config?.tasksEnabled === false) {
     const { ComingSoon } = await import("@/app/(dashboard)/dashboard/ComingSoon")
     return (
        <div className="w-full max-w-5xl mx-auto py-6">
             <div className="mb-6">
                 <h1 className="text-3xl font-serif font-bold text-gray-900">Task Marketplace</h1>
             </div>
             <ComingSoon feature="tasks" config={config} />
        </div>
     )
  }

  const { FeatureGuard } = await import("@/app/(dashboard)/dashboard/FeatureGuard")

  return (
      <FeatureGuard feature="tasks" previewMode={true} title="Task Marketplace">
        <div className="w-full max-w-5xl mx-auto py-6">
           <TaskPageClient 
              user={user} 
              platformTasks={allTasks} 
              cfxUrl={cfxUrl} 
              isUnlocked={isUnlocked}
           />
        </div>
      </FeatureGuard>
  )
}
