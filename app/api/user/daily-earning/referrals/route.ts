import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ADMIN_USER_OBJECT } from "@/lib/admin-credentials"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Handle synthetic admin user who doesn't exist in the DB
    if (userId === ADMIN_USER_OBJECT.id) {
        return NextResponse.json({
            totalReferralEarnings: 0,
            referrals: []
        })
    }

    // 1. Get total referral earnings from DAILY_POOL category
    const settledEarningsResult = await prisma.referralCommission.aggregate({
      where: {
        earnerId: userId,
        category: "DAILY_POOL",
        status: "SETTLED"
      },
      _sum: { amount: true }
    })

    const pendingEarningsResult = await prisma.referralCommission.aggregate({
      where: {
        earnerId: userId,
        category: "DAILY_POOL",
        status: "PENDING"
      },
      _sum: { amount: true }
    })

    const totalSettledEarnings = settledEarningsResult._sum.amount || 0
    const totalPendingEarnings = pendingEarningsResult._sum.amount || 0

    // 2. Get all direct referrals (level 1)
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, pendingReferralWallet: true }
    })

    if (!currentUser?.referralCode) {
      return NextResponse.json({
        totalSettledEarnings: 0,
        totalPendingEarnings: 0,
        totalReferralEarnings: 0,
        referrals: []
      })
    }

    const referrals = await prisma.user.findMany({
      where: {
        referredByCode: currentUser.referralCode
      },
      select: {
        id: true,
        name: true,
        email: true,
        memberId: true,
        image: true,
        createdAt: true,
        dailyEarningInvestments: {
          where: {
            status: "ACTIVE"
          },
          select: {
            amount: true
          }
        }
      }
    })

    // 3. For each referral, calculate how much commission they've generated for the current user
    const referralStats = await Promise.all(referrals.map(async (ref) => {
      const settledResult = await prisma.referralCommission.aggregate({
        where: {
          earnerId: userId,
          sourceUserId: ref.id,
          category: "DAILY_POOL",
          status: "SETTLED"
        },
        _sum: { amount: true }
      })

      const pendingResult = await prisma.referralCommission.aggregate({
        where: {
          earnerId: userId,
          sourceUserId: ref.id,
          category: "DAILY_POOL",
          status: "PENDING"
        },
        _sum: { amount: true }
      })

      const totalInvested = ref.dailyEarningInvestments.reduce((sum, inv) => sum + inv.amount, 0)
      const settledEarningsGenerated = settledResult._sum.amount || 0
      const pendingEarningsGenerated = pendingResult._sum.amount || 0

      return {
        id: ref.id,
        name: ref.name,
        email: ref.email,
        memberId: ref.memberId,
        image: ref.image,
        joinedAt: ref.createdAt,
        totalInvested,
        settledEarningsGenerated,
        pendingEarningsGenerated,
        // Kept for backward compatibility if needed temporarily
        earningsGenerated: settledEarningsGenerated + pendingEarningsGenerated
      }
    }))

    // Sort by earnings generated desc
    referralStats.sort((a, b) => b.earningsGenerated - a.earningsGenerated)

    return NextResponse.json({
      totalSettledEarnings,
      totalPendingEarnings,
      totalReferralEarnings: totalSettledEarnings + totalPendingEarnings,
      referrals: referralStats
    })

  } catch (error: any) {
    console.error("Fetch Daily Earning Referrals Error:", {
      message: error.message,
      stack: error.stack,
      userId: (await auth())?.user?.id
    })
    return NextResponse.json({ error: "Failed to fetch referral data" }, { status: 500 })
  }
}
