import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [user, activeInvestments] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { balance: true, dailyEarningWallet: true }
      }),
      prisma.dailyEarningInvestment.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
      })
    ])

    return NextResponse.json({ 
      walletBalance: user?.balance || 0,
      dailyEarningWallet: user?.dailyEarningWallet || 0,
       activeInvestments 
    })
  } catch (error) {
    console.error("Fetch Daily Earning Error:", error)
    return NextResponse.json({ error: "Failed to fetch investments" }, { status: 500 })
  }
}
