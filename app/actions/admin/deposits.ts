"use server"

import { auth } from "@/auth"
<<<<<<< HEAD
import { prisma } from "@/lib/prisma"
import { finalizeDeposit } from "@/lib/mlm"
=======
>>>>>>> 77e88c235ee4b257f41ca79fc42314bdcb7eb2ec
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { finalizeDeposit } from "@/lib/mlm"

<<<<<<< HEAD
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
=======
export async function approveDeposit(transactionId: string) {
    const session = await auth()
>>>>>>> 77e88c235ee4b257f41ca79fc42314bdcb7eb2ec

    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    try {
<<<<<<< HEAD
        // Look up by stable UUID — works correctly for both TRC20 and Binance
        const tx = await prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!tx) {
            console.error(`[ApproveDeposit] Transaction not found for ID: ${transactionId}`);
            return { error: "Transaction not found" };
        }
        console.log(`[ApproveDeposit] Transaction found: ${tx.id} | Method: ${tx.method} | Status: ${tx.status}`);
=======
        const tx = await prisma.transaction.findUnique({
            where: { id: transactionId },
            select: {
                id: true,
                userId: true,
                amount: true,
                status: true,
                type: true,
                txId: true,
            },
        })

        if (!tx || tx.type !== "DEPOSIT") {
            return { error: "Transaction not found" }
        }
>>>>>>> 77e88c235ee4b257f41ca79fc42314bdcb7eb2ec

        if (tx.status !== "PENDING") {
            return { error: "Transaction already processed" }
        }

<<<<<<< HEAD
        const depositAmount = Number(tx.amount);

        await prisma.$transaction(async (prismaTx: any) => {
            console.log(`[ApproveDeposit] Starting DB Transaction for User ${tx.userId}`);

            // 1. Mark transaction as COMPLETED
=======
        const depositAmount = Number(tx.amount)

        await prisma.$transaction(async (prismaTx) => {
>>>>>>> 77e88c235ee4b257f41ca79fc42314bdcb7eb2ec
            await prismaTx.transaction.update({
                where: { id: tx.id },
                data: { status: "COMPLETED" },
            })

<<<<<<< HEAD
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
=======
            await prismaTx.user.update({
                where: { id: tx.userId },
                data: {
                    balance: { increment: depositAmount },
                },
            })

            await finalizeDeposit(tx.userId, depositAmount, tx.id, `Deposit #${tx.id}`, prismaTx)

>>>>>>> 77e88c235ee4b257f41ca79fc42314bdcb7eb2ec
            await prismaTx.adminLog.create({
                data: {
                    adminId: session.user.id!,
                    targetUserId: tx.userId,
                    actionType: "DEPOSIT_APPROVAL",
<<<<<<< HEAD
                    // @ts-ignore
                    details: `Approved ${tx.method} deposit of $${depositAmount} (Transaction ID: ${transactionId})`
                }
            });
            console.log("[ApproveDeposit] Admin log created");
        });
=======
                    details: `Approved deposit of $${depositAmount} (Transaction: ${tx.id}${tx.txId ? `, Ref: ${tx.txId}` : ""})`,
                },
            })
        }, { maxWait: 5000, timeout: 15000 })
>>>>>>> 77e88c235ee4b257f41ca79fc42314bdcb7eb2ec

        revalidatePath("/admin/deposits")
        revalidatePath("/dashboard")
        revalidatePath("/dashboard/wallet")

        return { success: true }
    } catch (error: unknown) {
        console.error("Approval Error Detailed:", error)
        return { error: error instanceof Error ? error.message : "Internal Server Error" }
    }
}

<<<<<<< HEAD
// ─────────────────────────────────────────────────────────────────────────────
// rejectDeposit — also migrated to UUID-based lookup for the same reason.
// ─────────────────────────────────────────────────────────────────────────────
export async function rejectDeposit(transactionId: string, reason: string) {
    const session = await auth();
    console.log(`[RejectDeposit] Started for Transaction ID: ${transactionId} by Admin: ${session?.user?.id}`);
=======
export async function rejectDeposit(transactionId: string, reason: string) {
    const session = await auth()
>>>>>>> 77e88c235ee4b257f41ca79fc42314bdcb7eb2ec

    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    try {
<<<<<<< HEAD
        // Look up by stable UUID
        const tx = await prisma.transaction.findUnique({
            where: { id: transactionId },
            select: { id: true, status: true, userId: true, method: true, amount: true }
        });

        if (!tx) {
            console.error(`[RejectDeposit] Transaction not found for ID: ${transactionId}`);
            return { error: "Transaction not found" };
        }

        if (tx.status !== "PENDING") {
            console.warn(`[RejectDeposit] Transaction ${tx.id} is not PENDING (Status: ${tx.status})`);
            return { error: "Transaction already processed" };
        }

        await prisma.$transaction(async (prismaTx: any) => {
            await prismaTx.transaction.update({
                where: { id: tx.id },
                data: {
                    status: "FAILED",
                    description: `Rejected: ${reason}`
                }
            });

=======
        const tx = await prisma.transaction.findUnique({
            where: { id: transactionId },
            select: {
                id: true,
                userId: true,
                status: true,
                type: true,
                txId: true,
                description: true,
            },
        })

        if (!tx || tx.type !== "DEPOSIT") {
            return { error: "Transaction not found" }
        }

        if (tx.status !== "PENDING") {
            return { error: "Transaction already processed" }
        }

        await prisma.$transaction(async (prismaTx) => {
            await prismaTx.transaction.update({
                where: { id: tx.id },
                data: {
                    status: "FAILED",
                    description: tx.description
                        ? `${tx.description}\nRejected: ${reason}`
                        : `Rejected: ${reason}`,
                },
            })

>>>>>>> 77e88c235ee4b257f41ca79fc42314bdcb7eb2ec
            await prismaTx.adminLog.create({
                data: {
                    adminId: session.user.id!,
                    targetUserId: tx.userId,
                    actionType: "DEPOSIT_REJECTION",
<<<<<<< HEAD
                    details: `Rejected ${tx.method} deposit of $${tx.amount} (Transaction ID: ${transactionId}). Reason: ${reason}`
                }
            });
            console.log("[RejectDeposit] Rejection logged and transaction updated.");
        });
=======
                    details: `Rejected deposit (Transaction: ${tx.id}${tx.txId ? `, Ref: ${tx.txId}` : ""}). Reason: ${reason}`,
                },
            })
        }, { maxWait: 5000, timeout: 15000 })
>>>>>>> 77e88c235ee4b257f41ca79fc42314bdcb7eb2ec

        revalidatePath("/admin/deposits")
        revalidatePath("/dashboard/wallet")

        return { success: true }
    } catch (error: unknown) {
        console.error("Rejection Error:", error)
        return { error: error instanceof Error ? error.message : "Internal Server Error" }
    }
}
