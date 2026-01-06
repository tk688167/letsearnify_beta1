
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
    const [contributions, totalCount, adminStats] = await Promise.all([
        prisma.cbspContribution.findMany({
            where,
            include: { user: { select: { name: true, email: true } } },
            orderBy: { [sortBy]: sortOrder },
            skip,
            take: limit
        }),
        prisma.cbspContribution.count({ where }),
        // Calculate Totals over ALL time
        prisma.cbspContribution.aggregate({
            _sum: {
                depositAmount: true,
                contributionAmount: true
            }
        }),
        // Fetch Pool Config
        prisma.pool.findUnique({
            where: { name: "CBSP" },
            select: { percentage: true }
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
            totalPoolContribution: adminStats._sum.contributionAmount || 0
        },
        config: {
            percentage: adminStats[3]?.percentage ?? 4.0 // Use fetched percentage or default
        }
    })

  } catch (error: any) {
    console.error("Admin CBSP History Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
