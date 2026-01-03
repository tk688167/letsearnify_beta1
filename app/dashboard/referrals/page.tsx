import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ReferralView from "./referral-view"
import { startOfDay } from "date-fns"

export default async function ReferralsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // Fetch User with Deeply Nested Referrals (3 Levels)
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

  if (!user) redirect("/login")

  // Flatten the Tree
  const referralTree: any[] = []

  // Level 1
  user.referrals.forEach(l1 => {
    referralTree.push({ ...l1, level: 1 })
    
    // Level 2
    l1.referrals.forEach(l2 => {
      referralTree.push({ ...l2, level: 2 })
      
      // Level 3
      l2.referrals.forEach(l3 => {
        referralTree.push({ ...l3, level: 3 })
      })
    })
  })

  // Calculate Stats
  const teamSize = referralTree.length
  
  // Total Earnings
  const totalEarningsAgg = await prisma.referralCommission.aggregate({
     where: { earnerId: user.id },
     _sum: { amount: true }
  })
  const totalEarnings = totalEarningsAgg._sum.amount || 0

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
    <div className="p-6 md:p-10 min-h-screen bg-gray-50/50">
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
