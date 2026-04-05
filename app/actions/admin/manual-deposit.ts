"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { finalizeDeposit } from "@/lib/mlm"
import { revalidatePath } from "next/cache"

export async function processManualDeposit(userId: string, amount: number, note: string) {
    const session = await auth();
    
    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    if (!amount || amount <= 0) {
        return { success: false, error: "Invalid amount" };
    }

    try {
        await prisma.$transaction(async (prismaTx: any) => {
            // 1. Create COMPLETED Transaction Record
            const tx = await prismaTx.transaction.create({
                data: {
                    userId,
                    amount,
                    type: "DEPOSIT",
                    status: "COMPLETED",
                    method: "MANUAL_ADMIN_CREDIT",
                    description: `Admin Credit: ${note}`,
                    // Generate a pseudo-TXID for tracking
                    txId: `MANUAL-${Date.now()}-${Math.random().toString(36).substring(7)}`.toUpperCase()
                }
            });

            // 2. Update User Balance (Credit ARN & Track Total Deposit - Sync with standard deposit)
            const arnAmount = amount * 10;
            
            await prismaTx.user.update({
                where: { id: userId },
                data: { 
                    balance: { increment: amount },
                    dailyEarningWallet: { increment: amount }
                }
            });

            // 3. Finalize
            await finalizeDeposit(userId, amount, tx.id, `Manual Deposit #${tx.id}`, prismaTx);

            // 6. Log Admin Action
            await prismaTx.adminLog.create({
                data: {
                    adminId: session.user.id!,
                    targetUserId: userId,
                    actionType: "MANUAL_DEPOSIT",
                    details: `Credited $${amount} to User ${userId}. Note: ${note}`
                }
            });
        });

        revalidatePath("/admin/users");
        revalidatePath(`/admin/users/${userId}`);
        return { success: true, message: "Deposit processed and user features unlocked." };

    } catch (error: any) {
        console.error("Manual Deposit Error:", error);
        return { success: false, error: error.message || "Failed to process deposit" };
    }
}
