import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { poolId, totalProfit, userSharePercentage, platformSharePercentage } = body;

    const parsedProfit = parseFloat(totalProfit);
    const parsedUserShare = parseFloat(userSharePercentage);
    
    if (isNaN(parsedProfit) || isNaN(parsedUserShare)) {
      return new NextResponse("Invalid profit calculations", { status: 400 });
    }

    const pool = await prisma.mudarabahPool.findUnique({
      where: { id: poolId },
      include: {
        investments: true
      }
    });

    if (!pool) return new NextResponse("Pool not found", { status: 404 });

    if (pool.totalDeposited <= 0 || pool.investments.length === 0) {
      return new NextResponse("No investments to distribute to", { status: 400 });
    }

    const totalUserProfitPool = parsedProfit * (parsedUserShare / 100);

    // Run this in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create Distribution Record
      const distribution = await tx.mudarabahDistribution.create({
        data: {
          poolId,
          totalProfit: parsedProfit,
          userSharePercentage: parsedUserShare,
          platformSharePercentage: parseFloat(platformSharePercentage || "0"),
        }
      });

      // 2. Distribute to each user proportionally
      for (const investment of pool.investments) {
        if (investment.status !== "ACTIVE") continue;

        const userShareOfPool = investment.amount / pool.totalDeposited;
        const profitForUser = totalUserProfitPool * userShareOfPool;

        if (profitForUser > 0) {
          // Update investment
          await tx.mudarabahInvestment.update({
            where: { id: investment.id },
            data: {
              profitEarned: { increment: profitForUser }
            }
          });

          // Update user balance
          await tx.user.update({
            where: { id: investment.userId },
            data: {
              balance: { increment: profitForUser }
            }
          });

          // Create transaction record
          await tx.transaction.create({
            data: {
              userId: investment.userId,
              amount: profitForUser,
              type: "MUDARABAH_REWARD",
              status: "COMPLETED",
              description: `Profit distribution: ${pool.title}`,
            }
          });
        }
      }

      return distribution;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST mudarabah distribute error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
