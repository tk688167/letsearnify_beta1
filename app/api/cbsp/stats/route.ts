
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CBSP_POOL_NAME, CBSP_TIER_PERCENTAGES, calculateProjectedShare } from "@/lib/cbsp"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await auth()
    // Not requiring auth for basic stats, but needed for user specific projection
    
    // 1. Fetch Pool Data
    const pool = await prisma.pool.findUnique({
      where: { name: CBSP_POOL_NAME }
    })

    const poolBalance = pool?.balance || 0
    const weeklyProfitPercentage = pool?.percentage || 4.0

    // 2. Fetch Member Counts per Tier
    const tierCounts = await prisma.user.groupBy({
      by: ['tier'],
      where: { 
        // @ts-ignore - Field exists in schema, client generation stale
        isCbspMember: true 
      },
      _count: {
        _all: true
      }
    })

    // Map counts to a usable object
    const tierMap: Record<string, number> = {}
    let totalMembers = 0

    tierCounts.forEach(t => {
       // @ts-ignore
       const count = t._count?._all || 0
       tierMap[t.tier] = count
       totalMembers += count
    })

    // 3. User Specific Stats
    let userStats = null
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { 
            // @ts-ignore
            isCbspMember: true,
            tier: true
        }
      })

      if (user) {
        const tierCount = tierMap[user.tier] || 1 // Avoid div by 0
        // New Logic: (Pool * Tier%) / Count
        const percentage = CBSP_TIER_PERCENTAGES[user.tier] || 0
        const totalTierShare = calculateProjectedShare(poolBalance, percentage)
        // @ts-ignore
        const isMember = user.isCbspMember
        
        userStats = {
          isMember,
          tier: user.tier,
          potentialShare: totalTierShare / Math.max(1, tierCount)
        }
      }
    }

    return NextResponse.json({
        poolBalance,
        weeklyProfitPercentage,
        totalMembers,
        tierMap, // Return detailed counts for frontend
        userStats
    })

  } catch (error: any) {
    console.error("CBSP Stats Error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
