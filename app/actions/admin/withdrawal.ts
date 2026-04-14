"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function getWithdrawalRequests() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return [];

    try {
        const [cryptoRequests, merchantRequests] = await Promise.all([
            prisma.transaction.findMany({
                where: { type: "WITHDRAWAL", status: "PENDING" },
                include: { user: { select: { id: true, email: true, balance: true } } },
                orderBy: { createdAt: "desc" }
            }),
            prisma.merchantTransaction.findMany({
                where: { type: "WITHDRAWAL", status: "PENDING" },
                include: { user: { select: { id: true, email: true, balance: true } } },
                orderBy: { createdAt: "desc" }
            })
        ]);

        // Map to a common format
        const unified = [
            ...cryptoRequests.map(r => ({
                id: r.id,
                userId: r.userId,
                amount: r.amount,
                status: r.status,
                type: "CRYPTO",
                destinationAddress: r.destinationAddress,
                method: r.method || "TRC20",
                createdAt: r.createdAt,
                user: r.user
            })),
            ...merchantRequests.map(r => ({
                id: r.id,
                userId: r.userId,
                amount: r.amount,
                status: r.status,
                type: "MERCHANT",
                destinationAddress: `${r.accountName} (${r.accountNumber}) - ${r.currency}`,
                method: `Merchant (${r.countryCode})`,
                createdAt: r.createdAt,
                user: r.user
            }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return unified;
    } catch (error) {
        console.error("Error fetching withdrawal requests:", error);
        return [];
    }
}

export async function processWithdrawal(transactionId: string, action: "APPROVE" | "REJECT") {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    try {
        // Try to find in Transaction first
        let transaction: any = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { user: true }
        });

        let isMerchant = false;
        if (!transaction) {
            transaction = await prisma.merchantTransaction.findUnique({
                where: { id: transactionId },
                include: { user: true }
            });
            isMerchant = true;
        }

        if (!transaction || transaction.type !== "WITHDRAWAL" || transaction.status !== "PENDING") {
            return { error: "Invalid withdrawal request." };
        }

        const userId = transaction.userId;
        const amount = transaction.amount;
        const arnToRefund = amount * 10;

        if (action === "REJECT") {
            await prisma.$transaction(async (tx: any) => {
                // 1. Update Transaction Status
                if (isMerchant) {
                    await tx.merchantTransaction.update({
                        where: { id: transactionId },
                        data: { status: "REJECTED" }
                    });
                } else {
                    await tx.transaction.update({
                        where: { id: transactionId },
                        data: { status: "REJECTED" }
                    });
                }

                // 2. Refund Balance AND ARN Tokens
                await tx.user.update({
                    where: { id: userId },
                    data: { 
                        balance: { increment: amount },
                        arnBalance: { increment: arnToRefund }
                    }
                });

                // 3. Audit Log
                await tx.adminLog.create({
                    data: {
                        adminId: session.user.id!,
                        targetUserId: userId,
                        actionType: "WITHDRAWAL_REJECTION",
                        details: `Rejected ${isMerchant ? 'Merchant' : 'TRC20'} withdrawal of $${amount}. USD and ARN tokens refunded.`
                    }
                });
            });

            revalidatePath("/admin/withdrawals");
            return { success: true };
        }

        if (action === "APPROVE") {
            await prisma.$transaction(async (tx: any) => {
                // 1. Update Status
                if (isMerchant) {
                    await tx.merchantTransaction.update({
                        where: { id: transactionId },
                        data: { status: "COMPLETED" } // Merchant typically uses COMPLETED/APPROVED
                    });
                } else {
                    await tx.transaction.update({
                        where: { id: transactionId },
                        data: { status: "COMPLETED" } // Normalized to match Merchant withdrawal status
                    });
                }

                // 2. Audit Log
                await tx.adminLog.create({
                    data: {
                        adminId: session.user.id!,
                        targetUserId: userId,
                        actionType: "WITHDRAWAL_APPROVAL",
                        details: `Approved ${isMerchant ? 'Merchant' : 'TRC20'} withdrawal of $${amount}.`
                    }
                });
            });

            revalidatePath("/admin/withdrawals");
            return { success: true };
        }

    } catch (error: any) {
        console.error("Process Withdraw Error:", error);
        return { error: error.message || "Failed to process withdrawal." };
    }
}
