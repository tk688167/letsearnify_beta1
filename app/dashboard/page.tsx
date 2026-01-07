import React, { Suspense } from "react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { TIER_RULES } from "@/lib/mlm"
import DashboardClient from "./components/DashboardClient"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  const [user, pools] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        tier: true,
        points: true,
        // @ts-ignore
        memberId: true, 
        referralCode: true,
        isActiveMember: true,
        totalDeposit: true,
        activeMembers: true,
      }
    }),
    prisma.pool.findMany()
  ])
  
  if (!user) return null

  // Pass tier rules for the client component to usage
  const userWithRules = {
      ...user,
      tierRules: TIER_RULES
  }

  return (
      <DashboardClient 
          user={userWithRules} 
          pools={pools} 
          stats={{}} // Stats fetched inside client or passed here if needed
      />
  )
}
