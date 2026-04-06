import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { unlockUserAccount } from "@/lib/mlm";

export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, balance: true, isActiveMember: true, referredByCode: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.isActiveMember) {
            return NextResponse.json({ error: "Account is already unlocked." }, { status: 400 });
        }

        if (user.balance < 1.0) {
            return NextResponse.json({ error: "Insufficient wallet balance. You need at least $1.00 to unlock your account." }, { status: 400 });
        }

        // Fix null referredByCode before transaction
        if (!user.referredByCode) {
            await prisma.user.update({
                where: { id: userId },
                data: { referredByCode: 'COMPANY' }
            });
        }

        // Perform the Unlock in an isolated Transaction with extended timeout
        await prisma.$transaction(async (prismaTx: any) => {
            // Deduct from Balance
            await prismaTx.user.update({
                where: { id: userId },
                data: {
                    balance: { decrement: 1.0 },
                    arnBalance: { decrement: 10.0 }
                }
            });

            // Log Transaction
            await prismaTx.transaction.create({
                data: {
                    userId: userId,
                    amount: 1.0,
                    type: "UNLOCK_FEE",
                    status: "COMPLETED",
                    description: "Paid $1.00 to unlock account and features.",
                }
            });

            // Trigger activation distributions
            await unlockUserAccount(userId, prismaTx);
        }, {
            maxWait: 10000,
            timeout: 30000,
        });

        return NextResponse.json({ success: true, message: "Account successfully unlocked." });

    } catch (error: any) {
        console.error("Account Unlock Error:", error);
        return NextResponse.json({ error: error.message || "Failed to unlock account" }, { status: 500 });
    }
}
