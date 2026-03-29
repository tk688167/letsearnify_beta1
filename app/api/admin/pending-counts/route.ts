import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [deposits, withdrawals] = await Promise.all([
      prisma.transaction.count({
        where: {
          type: "DEPOSIT",
          status: "PENDING",
          method: { startsWith: "TRC20" }
        }
      }),
      prisma.transaction.count({
        where: {
          type: "WITHDRAWAL",
          status: "PENDING"
        }
      })
    ])

    return NextResponse.json({ 
        deposits, 
        withdrawals,
        // Helper debug info
        timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("API Error fetching pending counts:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
