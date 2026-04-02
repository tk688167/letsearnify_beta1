import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

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
    const [activations, totalCount, aggregateStats, poolConfig] = await Promise.all([
        prisma.unlockActivation.findMany({
            where,
            include: { user: { select: { name: true, email: true } } },
            orderBy: { [sortBy]: sortOrder },
            skip,
            take: limit
        }),
        prisma.unlockActivation.count({ where }),
        // Calculate Totals over ALL time
        prisma.unlockActivation.aggregate({
            _sum: {
                amount: true,
                achievementPool: true
            }
        }),
        // Fetch Pool Config
        prisma.pool.findUnique({
            where: { name: "REWARD" },
            select: { percentage: true }
        })
    ])

    return NextResponse.json({
        data: activations,
        meta: {
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
        },
        totals: {
            totalDeposits: aggregateStats._sum.amount || 0,
            totalPoolContribution: aggregateStats._sum.achievementPool || 0
        },
        config: {
            percentage: poolConfig?.percentage ?? 20.0
        }
    })

  } catch (error: any) {
    console.error("Admin Achievement History Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
