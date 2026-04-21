"use server"

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { finalizeDeposit } from "@/lib/mlm"
import { createNotification } from "@/lib/notifications"

// ─────────────────────────────────────────────────────────────────────────────
// approveDeposit — looks up by transaction UUID (id), NOT by txId.
//
// Previously this function accepted txId as the parameter and did a raw SQL
// lookup WHERE "txId" = $txId. For Binance deposits, txId stores a base64
// image string (the payment screenshot), making this lookup inherently
// unreliable. The fix: accept the transaction's database UUID (id) directly
// and use the standard Prisma findUnique call.
//
// The admin page now passes d.id instead of d.txId! to this function.
// ─────────────────────────────────────────────────────────────────────────────
export async function approveDeposit(transactionId: string) {
    const session = await auth();
    console.log(`[ApproveDeposit] Started for Transaction ID: ${transactionId} by Admin: ${session?.user?.id}`);

    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    try {
        // Look up by stable UUID — works correctly for both TRC20 and Binance
        const tx = await prisma.transaction.findUnique({
            where: { id: transactionId },
            select: {
                id: true,
                userId: true,
                amount: true,
                status: true,
                type: true,
                txId: true,
                method: true,
            },
        })

        if (!tx || tx.type !== "DEPOSIT") {
            console.error(`[ApproveDeposit] Transaction not found for ID: ${transactionId}`);
            return { error: "Transaction not found" }
        }
        
        console.log(`[ApproveDeposit] Transaction found: ${tx.id} | Method: ${tx.method} | Status: ${tx.status}`);

        if (tx.status !== "PENDING") {
            return { error: "Transaction already processed" }
        }

        const depositAmount = Number(tx.amount);

        await prisma.$transaction(async (prismaTx: any) => {
            console.log(`[ApproveDeposit] Starting DB Transaction for User ${tx.userId}`);

            // 1. Mark transaction as COMPLETED
            await prismaTx.transaction.update({
                where: { id: tx.id },
                data: { status: "COMPLETED" },
            })

            // 2. Credit user main wallet balance ONLY.
            // ⚠️ Daily Earning Pool and Mudarabah Pool must NOT be auto-credited on deposit.
            // Pools are funded exclusively via manual user transfer (Transfer tab → MAIN_TO_DAILY / MAIN_TO_MUDARABAH).
            // Auto-crediting here caused double-counting: $10 deposit → $10 main + $10 daily = $20 exposure.
            await prismaTx.user.update({
                where: { id: tx.userId },
                data: {
                    balance: { increment: depositAmount }
                }
            });
            console.log(`[ApproveDeposit] Credited $${depositAmount} to user main wallet only`);

            // 3. Finalize Deposit: mints ARN tokens, updates totalDeposit, runs tier check
            // @ts-ignore
            await finalizeDeposit(tx.userId, depositAmount, tx.id, `Deposit approved (ID: ${transactionId})`, prismaTx);

            // 4. Log Admin Action
            await prismaTx.adminLog.create({
                data: {
                    adminId: session.user.id!,
                    targetUserId: tx.userId,
                    actionType: "DEPOSIT_APPROVAL",
                    // @ts-ignore
                    details: `Approved ${tx.method} deposit of $${depositAmount} (Transaction ID: ${transactionId}${tx.txId ? `, Ref: ${tx.txId}` : ""})`
                }
            });
            console.log("[ApproveDeposit] Admin log created");

            // 5. Notify User
            await createNotification(
                tx.userId,
                "Deposit Approved",
                `Your ${tx.method} deposit of $${depositAmount.toFixed(2)} has been successfully credited to your main wallet.`,
                "TRANSACTION"
            );

        }, { maxWait: 5000, timeout: 15000 });

        revalidatePath("/admin/deposits")
        revalidatePath("/dashboard")
        revalidatePath("/dashboard/wallet")

        return { success: true }
    } catch (error: unknown) {
        console.error("Approval Error Detailed:", error)
        return { error: error instanceof Error ? error.message : "Internal Server Error" }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// rejectDeposit — also migrated to UUID-based lookup for the same reason.
// ─────────────────────────────────────────────────────────────────────────────
export async function rejectDeposit(transactionId: string, reason: string) {
    const session = await auth();
    console.log(`[RejectDeposit] Started for Transaction ID: ${transactionId} by Admin: ${session?.user?.id}`);

    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    try {
        // Look up by stable UUID
        const tx = await prisma.transaction.findUnique({
            where: { id: transactionId },
            select: {
                id: true,
                userId: true,
                status: true,
                type: true,
                txId: true,
                method: true,
                amount: true,
                description: true,
            },
        })

        if (!tx || tx.type !== "DEPOSIT") {
            console.error(`[RejectDeposit] Transaction not found for ID: ${transactionId}`);
            return { error: "Transaction not found" }
        }

        if (tx.status !== "PENDING") {
            console.warn(`[RejectDeposit] Transaction ${tx.id} is not PENDING (Status: ${tx.status})`);
            return { error: "Transaction already processed" }
        }

        await prisma.$transaction(async (prismaTx: any) => {
            await prismaTx.transaction.update({
                where: { id: tx.id },
                data: {
                    status: "FAILED",
                    description: tx.description
                        ? `${tx.description}\nRejected: ${reason}`
                        : `Rejected: ${reason}`,
                },
            })

            await prismaTx.adminLog.create({
                data: {
                    adminId: session.user.id!,
                    targetUserId: tx.userId,
                    actionType: "DEPOSIT_REJECTION",
                    details: `Rejected ${tx.method} deposit of $${tx.amount} (Transaction ID: ${transactionId}${tx.txId ? `, Ref: ${tx.txId}` : ""}). Reason: ${reason}`
                }
            });
            console.log("[RejectDeposit] Rejection logged and transaction updated.");

            await createNotification(
                tx.userId,
                "Deposit Rejected",
                `Your ${tx.method} deposit of $${tx.amount.toFixed(2)} was rejected. Reason: ${reason}`,
                "TRANSACTION"
            );

        }, { maxWait: 5000, timeout: 15000 });

        revalidatePath("/admin/deposits")
        revalidatePath("/dashboard/wallet")

        return { success: true }
    } catch (error: unknown) {
        console.error("Rejection Error:", error)
        return { error: error instanceof Error ? error.message : "Internal Server Error" }
    }
}
