"use server"

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { finalizeDeposit } from "@/lib/mlm"

export async function approveDeposit(transactionId: string) {
    const session = await auth()

    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    try {
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

        if (tx.status !== "PENDING") {
            return { error: "Transaction already processed" }
        }

        const depositAmount = Number(tx.amount)

        await prisma.$transaction(async (prismaTx) => {
            await prismaTx.transaction.update({
                where: { id: tx.id },
                data: { status: "COMPLETED" },
            })

            await prismaTx.user.update({
                where: { id: tx.userId },
                data: {
                    balance: { increment: depositAmount },
                },
            })

            await finalizeDeposit(tx.userId, depositAmount, tx.id, `Deposit #${tx.id}`, prismaTx)

            await prismaTx.adminLog.create({
                data: {
                    adminId: session.user.id!,
                    targetUserId: tx.userId,
                    actionType: "DEPOSIT_APPROVAL",
                    details: `Approved deposit of $${depositAmount} (Transaction: ${tx.id}${tx.txId ? `, Ref: ${tx.txId}` : ""})`,
                },
            })
        }, { maxWait: 5000, timeout: 15000 })

        revalidatePath("/admin/deposits")
        revalidatePath("/dashboard")
        revalidatePath("/dashboard/wallet")

        return { success: true }
    } catch (error: unknown) {
        console.error("Approval Error Detailed:", error)
        return { error: error instanceof Error ? error.message : "Internal Server Error" }
    }
}

export async function rejectDeposit(transactionId: string, reason: string) {
    const session = await auth()

    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    try {
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

            await prismaTx.adminLog.create({
                data: {
                    adminId: session.user.id!,
                    targetUserId: tx.userId,
                    actionType: "DEPOSIT_REJECTION",
                    details: `Rejected deposit (Transaction: ${tx.id}${tx.txId ? `, Ref: ${tx.txId}` : ""}). Reason: ${reason}`,
                },
            })
        }, { maxWait: 5000, timeout: 15000 })

        revalidatePath("/admin/deposits")
        revalidatePath("/dashboard/wallet")

        return { success: true }
    } catch (error: unknown) {
        console.error("Rejection Error:", error)
        return { error: error instanceof Error ? error.message : "Internal Server Error" }
    }
}
