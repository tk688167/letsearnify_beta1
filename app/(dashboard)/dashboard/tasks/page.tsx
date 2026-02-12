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
  
  // Filter platform tasks (company status check could be moved to service, but keeping here for safety)
  const platformTasks = (platformTasksRaw as unknown as PlatformTask[]).filter(t => !t.company || t.company.status === "ACTIVE")

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
          const offers = await cpxAdapter.fetchOffers({ userId: user.id })
          
          // Map 'Offer' -> 'PlatformTask'
          externalTasks = offers.map(offer => ({
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
      cfxUrl = cpxAdapter.getWallUrl(user.id, user.name || "User", user.email || "")
  }

  // Merge Tasks: Platform (Internal) + External
  const allTasks = [...platformTasks, ...externalTasks].sort((a,b) => b.reward - a.reward) // Sort by highest reward

  // ------------------------------------------------------------------
  // MANUAL ACCESS CONTROL (Free vs Premium)
  // ------------------------------------------------------------------
  const isUnlocked = user && (user.isActiveMember || (user.totalDeposit ?? 0) >= 1.00);

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

  return (
      <div className="w-full max-w-5xl mx-auto py-6">
         <TaskPageClient 
            user={user} 
            platformTasks={allTasks} 
            cfxUrl={cfxUrl} 
            isUnlocked={isUnlocked}
         />
      </div>
  )
}
