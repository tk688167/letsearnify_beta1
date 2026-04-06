export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if feature is live
    const config = await prisma.systemConfig.findUnique({
      where: { key: "MUDARABAH_CONFIG" }
    });

    const configValue = config?.value as unknown as { isLive?: boolean } | null;
    const isLiveFeature = configValue?.isLive;

    if (!isLiveFeature) {
      // Returns empty or error if not live
      return NextResponse.json({ 
        isFeatureLive: false,
        pools: [],
        userWallet: { balance: 0, totalInvested: 0, totalProfit: 0, history: [] }
      });
    }

    // Fetch user details for access verification
    const user = await (prisma as any).user.findUnique({
      where: { id: session.user.id },
      select: { mudarabahBalance: true, isMudarabaUnlocked: true }
    });

    const isUnlocked = user?.isMudarabaUnlocked === true;

    if (!isUnlocked) {
      return NextResponse.json({
        isFeatureLive: true,
        isUnlocked: false,
        pools: [],
        userWallet: {
          balance: user?.mudarabahBalance || 0,
          totalInvested: 0,
          totalProfit: 0,
          investments: [],
        }
      });
    }

    // Fetch live pools
    const pools = await (prisma as any).mudarabahPool.findMany({
      where: { isLive: true },
      orderBy: { createdAt: "desc" }
    });

    // Fetch user's investments
    const investments = await (prisma as any).mudarabahInvestment.findMany({
      where: { userId: session.user.id },
      include: {
        pool: { select: { title: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const totalInvested = investments.reduce((sum: number, inv: any) => sum + inv.amount, 0);
    const totalProfit = investments.reduce((sum: number, inv: any) => sum + inv.profitEarned, 0);

    return NextResponse.json({
      isFeatureLive: true,
      isUnlocked: true,
      pools,
      userWallet: {
        balance: user?.mudarabahBalance || 0,
        totalInvested,
        totalProfit,
        investments,
      }
    });

  } catch (error) {
    console.error("GET user mudarabah pools error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
