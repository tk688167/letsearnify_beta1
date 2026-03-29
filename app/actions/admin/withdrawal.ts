"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function getWithdrawalRequests() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return [];

    try {
        const requests = await prisma.transaction.findMany({
            where: {
                type: "WITHDRAWAL",
                status: "PENDING"
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        balance: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return requests;
    } catch (error) {
        console.error("Error fetching withdrawal requests:", error);
        return [];
    }
}

export async function processWithdrawal(transactionId: string, action: "APPROVE" | "REJECT") {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { user: true }
        });

        if (!transaction || transaction.type !== "WITHDRAWAL" || transaction.status !== "PENDING") {
            return { error: "Invalid withdrawal request." };
        }

        if (action === "REJECT") {
            await prisma.transaction.update({
                where: { id: transactionId },
                data: { status: "REJECTED" }
            });
            revalidatePath("/admin/withdrawals");
            return { success: true };
        }

        if (action === "APPROVE") {
            // Transactional update: Deduct balance AND update status
            await prisma.$transaction(async (tx) => {
                const user = await tx.user.findUnique({
                    where: { id: transaction.userId }
                });

                if (!user || user.balance < transaction.amount) {
                    throw new Error("Insufficient user balance for approval.");
                }

                await tx.user.update({
                    where: { id: transaction.userId },
                    data: { balance: { decrement: transaction.amount } }
                });

                await tx.transaction.update({
                    where: { id: transactionId },
                    data: { status: "APPROVED" }
                });

                // Audit Log
                await tx.adminLog.create({
                    data: {
                        adminId: session.user.id!,
                        targetUserId: transaction.userId,
                        actionType: "WITHDRAWAL_APPROVAL",
                        // @ts-ignore
                        details: `Approved withdrawal of $${transaction.amount} to ${transaction.destinationAddress}`
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
