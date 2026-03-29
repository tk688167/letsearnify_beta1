import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ReferralView from "./referral-view"
import { startOfDay } from "date-fns"
import type { Tier } from "@prisma/client"

type DownlineRow = {
  id: string
  name: string | null
  email: string | null
  tier: Tier
  points: number
  createdAt: Date
}

type DownlineNode = DownlineRow & { level: 1 | 2 | 3 }

export default async function ReferralsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // User row + commissions; downline uses ReferralTree (same source as MLM payouts).
  // Depth from "me": L1 = my direct referrals (advisorId === me), L2 = their referrals
  // (supervisorId === me), L3 (managerId === me). Matches register.ts / auth.ts tree setup.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      referralsMade: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          sourceUser: {
            select: { name: true, email: true },
          },
        },
      },
    },
  })

  if (!user) redirect("/login")

  const downlineSelect = {
    id: true,
    name: true,
    email: true,
    tier: true,
    points: true,
    createdAt: true,
  } as const

  const [level1, level2, level3] = await Promise.all([
    prisma.user.findMany({
      where: {
        id: { not: user.id },
        referralTree: { advisorId: user.id },
      },
      select: downlineSelect,
    }),
    prisma.user.findMany({
      where: {
        id: { not: user.id },
        referralTree: { supervisorId: user.id },
      },
      select: downlineSelect,
    }),
    prisma.user.findMany({
      where: {
        id: { not: user.id },
        referralTree: { managerId: user.id },
      },
      select: downlineSelect,
    }),
  ])

  const byId = new Map<string, DownlineNode>()
  const put = (n: DownlineRow, level: 1 | 2 | 3) => {
    const prev = byId.get(n.id)
    if (!prev || level < prev.level) byId.set(n.id, { ...n, level })
  }
  for (const n of level1) put(n, 1)
  for (const n of level2) put(n, 2)
  for (const n of level3) put(n, 3)

  const referralTree = Array.from(byId.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  // Calculate Stats
  const teamSize = referralTree.length
  
  // Total Earnings
  const totalEarningsAgg = await prisma.referralCommission.aggregate({
     where: { earnerId: user.id },
     _sum: { amount: true }
  })
  const totalEarnings = totalEarningsAgg._sum.  amount || 0

  // Today's Earnings
  const todayEarningsAgg = await prisma.referralCommission.aggregate({
     where: { 
        earnerId: user.id,
        createdAt: { gte: startOfDay(new Date()) }
     },
     _sum: { amount: true }
  })
  const todayEarnings = todayEarningsAgg._sum.amount || 0

  return (
    <div className="p-4 md:p-10 min-h-screen bg-gray-50/50">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
             <h1 className="text-3xl font-serif font-bold text-gray-900">Partner Program</h1>
             <p className="text-gray-500 mt-1">Track your team, earnings, and progress to the next tier.</p>
          </div>
       </div>

       <ReferralView 
          user={{
             name: user.name,
             tier: user.tier,
             points: user.points,
             referralCode: user.referralCode,
             balance: user.balance
          }}
          stats={{
             teamSize,
             totalEarnings,
             todayEarnings
          }}
          referralTree={referralTree.map(n => ({
             id: n.id,
             name: n.name,
             email: n.email,
             tier: n.tier,
             points: n.points,
             createdAt: n.createdAt,
             level: n.level
          }))}
          commissions={user.referralsMade.map(c => ({
             id: c.id,
             amount: c.amount,
             level: c.level,
             sourceUser: c.sourceUser,
             createdAt: c.createdAt
          }))}
       />
    </div>
  )
}
