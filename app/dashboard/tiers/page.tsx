import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import TierProgressView from "./tier-progress-view"

import { getTierRules } from "@/lib/mlm"

export default async function TierPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // Fetch Dynamic Rules
  const tierConfig = await getTierRules();

  // Fetch User & Team Data
  // We need the full tree for the "Referral Tree" requirement below the tiers
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      referrals: { // Level 1
        include: {
          referrals: { // Level 2
            include: {
              referrals: true // Level 3
            }
          }
        }
      },
      referralsMade: { // Commissions
         orderBy: { createdAt: 'desc' },
         take: 50,
         include: {
            sourceUser: {
               select: { name: true, email: true }
            }
         }
      }
    }
  })

  if (!user) redirect("/login")

  // Flatten the Tree
  const referralTree: any[] = []
  user.referrals.forEach(l1 => {
    referralTree.push({ ...l1, level: 1 })
    l1.referrals.forEach(l2 => {
      referralTree.push({ ...l2, level: 2 })
      l2.referrals.forEach(l3 => {
        referralTree.push({ ...l3, level: 3 })
      })
    })
  })

  const teamSize = referralTree.length

  // Calculate Total Earnings (Quick Aggregate)
   const totalEarningsAgg = await prisma.referralCommission.aggregate({
      where: { earnerId: user.id },
      _sum: { amount: true }
   })
   const totalEarnings = totalEarningsAgg._sum.amount || 0

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gray-50/50 space-y-12">
       
       <TierProgressView 
          user={{ tier: user.tier, points: user.points }}
          stats={{ teamSize: user.activeMembers || teamSize }}
          tierConfig={tierConfig}
       />


    </div>
  )
}
