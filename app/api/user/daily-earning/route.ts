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
            walletBalance: ADMIN_USER_OBJECT.totalDeposit,
            dailyEarningWallet: 0,
            isUnattached: false,
            activeInvestments: []
        })
    }

    // Isolate User Profile Query
    let user = null;
    let userError = null;
    try {
        user = await prisma.user.findUnique({
            where: { id: userId },
            select: { 
                balance: true, 
                dailyEarningWallet: true,
                referrer: {
                    select: { referralCode: true }
                }
            }
        });
    } catch (e: any) {
        console.error("[API] User Query Failed:", e);
        userError = e.message;
    }

    // Isolate Investments Query
    let activeInvestments: any[] = [];
    let investmentsError = null;
    try {
        activeInvestments = await prisma.dailyEarningInvestment.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' }
        });
    } catch (e: any) {
        console.error("[API] Investments Query Failed:", e);
        investmentsError = e.message;
    }

    if (!user && !userError) {
      console.warn(`[API] Daily Earning: User ${userId} not found in database.`);
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    if (userError || (investmentsError && activeInvestments.length === 0 && !user)) {
        return NextResponse.json({ 
            error: "Database Query Failure",
            userError,
            investmentsError
        }, { status: 500 });
    }

    const totalPendingProfit = activeInvestments.reduce((sum, inv) => sum + (inv.pendingInvestorProfit || 0), 0)

    return NextResponse.json({ 
      walletBalance: user?.balance || 0,
      dailyEarningWallet: user?.dailyEarningWallet || 0,
      totalPendingProfit,
      isUnattached: !user?.referrer || user?.referrer?.referralCode === "COMPANY",
      activeInvestments,
      _debug: { userError, investmentsError }
    })
  } catch (error: any) {
    console.error("Fetch Daily Earning Error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch investments",
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
