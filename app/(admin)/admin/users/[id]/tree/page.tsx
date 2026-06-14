export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import AdminTreeClient from "./AdminTreeClient"
import { startOfDay } from "date-fns"

export default async function AdminUserTreePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth()
  // Admin layout already enforces role — just guard against unauthenticated requests
  if (!session?.user?.id) redirect("/login")

  // Fetch Target User with Deeply Nested Referrals (3 Levels)
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      referrer: {
        select: { name: true, referralCode: true }
      },
      referrals: { // Level 1
        include: {
          referrals: { // Level 2
            include: {
              referrals: true // Level 3
            }
          }
        }
      }
    }
  })

  if (!user) notFound()

  // Flatten the Tree
  const referralTree: any[] = []

  // Level 1
  if (user.referrals) {
      user.referrals.forEach((l1: any) => {
        referralTree.push({ ...l1, level: 1 })
        
        // Level 2
        if (l1.referrals) {
            l1.referrals.forEach((l2: any) => {
              referralTree.push({ ...l2, level: 2 })
              
              // Level 3
              if (l2.referrals) {
                  l2.referrals.forEach((l3: any) => {
                    referralTree.push({ ...l3, level: 3 })
                  })
              }
            })
        }
      })
  }

  // Calculate Stats
  const teamSize = referralTree.length
  
  // Total Earnings
  // Casting prisma to any to access potentially 'missing' models in old types
  const totalEarningsAgg = await (prisma as any).referralCommission.aggregate({
     where: { earnerId: user.id },
     _sum: { amount: true }
  })
  const totalEarnings = totalEarningsAgg._sum.amount || 0

  // Today's Earnings
  const todayEarningsAgg = await (prisma as any).referralCommission.aggregate({
     where: { 
        earnerId: user.id,
        createdAt: { gte: startOfDay(new Date()) }
     },
     _sum: { amount: true }
  })
  const todayEarnings = todayEarningsAgg._sum.amount || 0

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gray-50/50">
       <AdminTreeClient 
          user={{
             id: user.id,
             name: user.name,
             email: user.email,
             referralCode: user.referralCode,
             referrerName: user.referrer?.name,
             referrerCode: user.referrer?.referralCode
          }}
          stats={{
             teamSize,
             totalEarnings,
             todayEarnings
          }}
          referralTree={referralTree.map((n: any) => ({
             id: n.id,
             name: n.name,
             email: n.email,
             tier: n.tier,
             arnBalance: n.arnBalance || 0,
             createdAt: n.createdAt,
             level: n.level
          }))}
       />
    </div>
  )
}
