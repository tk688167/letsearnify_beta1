import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import TierProgressView from "./tier-progress-view"

import { getTierRules } from "@/lib/mlm"

export default async function TierPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  let user, tierConfig, totalEarnings = 0;
  let referralTree: any[] = [];

  try {
      tierConfig = await getTierRules();
      
      user = await prisma.user.findUnique({
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
      
      if (user) {
          // Flatten the Tree
          user.referrals.forEach((l1: any) => {
            referralTree.push({ ...l1, level: 1 })
            l1.referrals.forEach((l2: any) => {
              referralTree.push({ ...l2, level: 2 })
              l2.referrals.forEach((l3: any) => {
                referralTree.push({ ...l3, level: 3 })
              })
            })
          })
          
           const totalEarningsAgg = await prisma.referralCommission.aggregate({
              where: { earnerId: user.id },
              _sum: { amount: true }
           })
           totalEarnings = totalEarningsAgg._sum.amount || 0
      }
  } catch (error) {
      console.error("⚠️ Tiers Page Offline Mode:", error);
      tierConfig = { 
          NEWBIE: { arn: 0, directs: 0 }, 
          BRONZE: { arn: 100, directs: 2 }, 
          SILVER: { arn: 500, directs: 5 }, 
          GOLD: { arn: 2000, directs: 10 }, 
          PLATINUM: { arn: 10000, directs: 20 }, 
          DIAMOND: { arn: 50000, directs: 50 }, 
          EMERALD: { arn: 100000, directs: 100 } 
      };
      user = {
          tier: "NEWBIE",
          arnBalance: 0,
          activeMembers: 0,
      } as any;
  }

  if (!user) redirect("/login")
  
  const teamSize = referralTree.length

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gray-50/50 space-y-12">
       
       <TierProgressView 
          user={{ tier: user.tier, arnBalance: user.arnBalance || 0 }}
          stats={{ teamSize: user.activeMembers || teamSize }}
          tierConfig={tierConfig}
       />


    </div>
  )
}
