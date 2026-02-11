                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import ReferralView from "@/app/(dashboard)/dashboard/referrals/referral-view"
import { getTierRules } from "@/lib/mlm"
import { startOfDay } from "date-fns"

export default async function AdminUserTreePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // Verify Admin Role
  const admin = await prisma.user.findUnique({ 
     where: { id: session.user.id },
     select: { role: true }
  })

  if (admin?.role !== "ADMIN") {
      redirect("/dashboard")
  }

  // Fetch Target User with Deeply Nested Referrals (3 Levels)
  // Casting partial Query to any to bypass stale TS types in IDE
  const user = await (prisma.user as any).findUnique({
    where: { id: params.id },
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
      referralsMade: { // Commissions Earned
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

  const tierRules = await getTierRules()

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gray-50/50">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
             <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-bold rounded text-xs uppercase">Admin View</span>
             </div>
             <h1 className="text-3xl font-serif font-bold text-gray-900">Tree for {user.name}</h1>
             <p className="text-gray-500 mt-1">Viewing referral structure for {user.email}</p>
          </div>
       </div>

       <ReferralView 
          user={{
             name: user.name,
             tier: user.tier,
             arnBalance: user.arnBalance,
             referralCode: user.referralCode,
             balance: user.balance
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
          commissions={user.referralsMade ? user.referralsMade.map((c: any) => ({
             id: c.id,
             amount: c.amount,
             level: c.level,
             sourceUser: c.sourceUser,
             createdAt: c.createdAt
          })) : []}
          tierConfig={tierRules}
       />
    </div>
  )
}
