
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { ROYALTY_POOL_NAME } from "@/lib/royalty"

// Helper to determine if user is admin - basic check
async function isAdmin(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    })
    return user?.role === "ADMIN"
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
        where.user = {
            name: { contains: search, mode: "insensitive" }
        }
    }

    // Fetch Data
    const [contributions, totalCount, adminStats, poolConfig] = await Promise.all([
        prisma.royaltyContribution.findMany({
            where,
            include: { user: { select: { name: true, email: true, tier: true } } }, // Included tier for context
            orderBy: { [sortBy]: sortOrder },
            skip,
            take: limit
        }),
        prisma.royaltyContribution.count({ where }),
        // Calculate Totals over ALL time
        prisma.royaltyContribution.aggregate({
            _sum: {
                depositAmount: true,
                contributionAmount: true
            }
        }),
        // Fetch Pool Config
        prisma.pool.findUnique({
            where: { name: ROYALTY_POOL_NAME },
            select: { percentage: true, balance: true }
        })
    ])

    return NextResponse.json({
        data: contributions,
        meta: {
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
        },
        totals: {
            totalDeposits: adminStats._sum.depositAmount || 0,
            totalPoolContribution: adminStats._sum.contributionAmount || 0,
            currentBalance: poolConfig?.balance || 0
        },
        config: {
            percentage: poolConfig?.percentage ?? 1.0 // Default 1.0 for Royalty
        }
    })

  } catch (error: any) {
    console.error("Admin Royalty History Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
