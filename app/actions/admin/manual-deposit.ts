"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { processCbspContribution } from "@/lib/cbsp"
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
        await prisma.$transaction(async (prismaTx) => {
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

            // 2. Update User Balance
            await prismaTx.user.update({
                where: { id: userId },
                data: { balance: { increment: amount } }
            });

            // 3. Update User Total Deposit
            const user = await prismaTx.user.update({
                where: { id: userId },
                data: { totalDeposit: { increment: amount } }
            });

            // 4. Check & Unlock Active Status (The "Real Money" effect)
            if (!user.isActiveMember && user.totalDeposit >= 1.0) {
                 await prismaTx.user.update({
                     where: { id: userId },
                     data: { isActiveMember: true }
                 });
                 
                 // Update Upline - Critical for MLM unlocking
                 const tree = await prismaTx.referralTree.findUnique({ where: { userId }});
                 if (tree?.advisorId) {
                    try {
                        await prismaTx.user.update({
                            where: { id: tree.advisorId },
                            data: { activeMembers: { increment: 1 } }
                        });
                    } catch (uplineError) {
                        console.error("Failed to update upline stats:", uplineError);
                        // Start non-blocking error, but don't fail the deposit
                    }
                 }
            }

            // 5. CBSP Contribution (Pools)
            // This ensures the deposit contributes to the community pools
            await processCbspContribution(userId, amount, tx.txId!, `Manual Deposit #${tx.id}`, prismaTx);

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
