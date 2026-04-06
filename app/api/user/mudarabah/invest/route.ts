import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { poolId, amount } = body;

    const depositAmount = parseFloat(amount);
    
    if (isNaN(depositAmount) || depositAmount < 1) {
      return new NextResponse("Invalid amount, minimum is $1", { status: 400 });
    }

    // Fetch user and pool
    const [user, pool, config] = await Promise.all([
      (prisma as any).user.findUnique({ where: { id: session.user.id } }),
      (prisma as any).mudarabahPool.findUnique({ where: { id: poolId } }),
      prisma.systemConfig.findUnique({ where: { key: "MUDARABAH_CONFIG" } })
    ]);

    const configValue = config?.value as unknown as { isLive?: boolean } | null;
    if (!configValue?.isLive) {
      return new NextResponse("Mudarabah Pools feature is currently in Dev Mode.", { status: 403 });
    }

    if (!user) return new NextResponse("User not found", { status: 404 });

    if (!user.isMudarabaUnlocked) {
      return new NextResponse("Access Locked. You must pay the $1 Mudaraba activation fee first.", { status: 403 });
    }
    
    if (!pool || !pool.isLive) {
      return new NextResponse("Pool not found or is not live", { status: 404 });
    }

    if (pool.status !== "OPEN" && pool.status !== "ACTIVE") {
      return new NextResponse("This pool is no longer accepting deposits", { status: 400 });
    }

    if (depositAmount < pool.minDeposit || depositAmount > pool.maxDeposit) {
      return new NextResponse(`Deposit must be between $${pool.minDeposit} and $${pool.maxDeposit}`, { status: 400 });
    }

    // Check if adding this deposit exceeds pool target (optional, but good practice)
    if (pool.totalDeposited + depositAmount > pool.targetAmount) {
      return new NextResponse(`This deposit exceeds the pool's remaining capacity of $${pool.targetAmount - pool.totalDeposited}`, { status: 400 });
    }

    if (user.mudarabahBalance < depositAmount) {
      return new NextResponse(`Insufficient Mudarabah Available Balance. You have $${user.mudarabahBalance} available.`, { status: 400 });
    }

    // Execute investment transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Deduct from Mudarabah Wallet
      await tx.user.update({
        where: { id: user.id },
        data: { mudarabahBalance: { decrement: depositAmount } }
      });

      // Add to Pool Total
      const updatedPool = await tx.mudarabahPool.update({
        where: { id: pool.id },
        data: { 
          totalDeposited: { increment: depositAmount },
          status: (pool.totalDeposited + depositAmount) >= pool.targetAmount ? "ACTIVE" : pool.status 
        }
      });

      // Create Investment Record
      // Using an upsert or let users have multiple investments in same pool? Multiple shouldn't hurt, but grouping is better.
      // We'll create a new record for each transaction for better tracking.
      const investment = await tx.mudarabahInvestment.create({
        data: {
          userId: user.id,
          poolId: pool.id,
          amount: depositAmount,
          status: "ACTIVE",
          profitEarned: 0,
        }
      });

      // Log transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: depositAmount,
          type: "MUDARABAH_INVESTMENT",
          status: "COMPLETED",
          description: `Investment in Mudarabah Pool: ${pool.title}`,
        }
      });

      return { investment, updatedPool };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST mudarabah invest error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
