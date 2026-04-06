import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Use a transaction to ensure atomic balance deduction and flag update
    const result = await (prisma as any).$transaction(async (tx: any) => {
      // 1. Fetch user status and balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, 
          balance: true, 
          isMudarabaUnlocked: true 
        }
      });

      if (!user) {
        throw new Error("User not found");
      }

      // 2. Prevent double unlock
      if (user.isMudarabaUnlocked) {
        return { success: true, message: "Mudaraba access is already unlocked." };
      }

      // 3. Check sufficient balance
      if (user.balance < 1.0) {
        throw new Error("Insufficient balance. You need $1.00 to unlock Mudaraba Pools.");
      }

      // 4. Atomic updates
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: 1.0 },
          isMudarabaUnlocked: true,
          mudarabaUnlockedAt: new Date(),
        }
      });

      // 5. Create transaction record
      await tx.transaction.create({
        data: {
          userId: userId,
          amount: 1.0,
          type: "MUDARABA_UNLOCK_FEE",
          status: "COMPLETED",
          method: "SYSTEM",
          description: "Mudaraba Pool Access Unlock Fee"
        }
      });

      // 6. Log for MLM tracking if needed
      await tx.mLMLog.create({
        data: {
          userId: userId,
          type: "MUDARABA_UNLOCK",
          amount: 1.0,
          description: "Paid $1.00 to unlock Mudaraba Pool access."
        }
      });

      return { success: true, message: "Mudaraba Pool access successfully unlocked!" };
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Mudarabah unlock error:", error);
    return new NextResponse(error.message || "Failed to unlock Mudaraba access", { status: 400 });
  }
}
