import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import WelcomeContent from "./WelcomeContent"

export default async function WelcomePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  if (!session?.user?.id) redirect("/login")
  
  const [user, pools] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          referralCode: true,
          isActiveMember: true,
          // @ts-ignore - Field exists in schema but types may be stale
          isCbspMember: true,
          totalDeposit: true,
          tier: true
        }
      }),
      prisma.pool.findMany({
        orderBy: { updatedAt: 'desc' },
        select: {
            id: true,
            name: true,
            percentage: true,
            balance: true
        }
      })
  ])

  if (!user) return null

  return <WelcomeContent user={user} pools={pools} />
}
