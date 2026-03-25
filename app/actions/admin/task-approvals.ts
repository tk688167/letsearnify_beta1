"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { checkTierUpgrade } from "@/lib/mlm"

export async function getPendingCompletions() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

    return await prisma.taskCompletion.findMany({
        where: { status: "PENDING" },
        include: {
            task: true,
            user: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: "desc" }
    })
}

export async function approveTaskCompletion(completionId: string, remarks?: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" }

    try {
        const completion = await prisma.taskCompletion.findUnique({
            where: { id: completionId },
            include: { task: true }
        })

        if (!completion || completion.status !== "PENDING") {
            return { success: false, error: "Invalid completion record" }
        }

        const reward = completion.task.reward

        await prisma.$transaction(async (tx) => {
            // 1. Update completion status
            await tx.taskCompletion.update({
                where: { id: completionId },
                data: {
                    status: "APPROVED",
                    pointsEarned: reward,
                    remarks: remarks || "Approved by Admin"
                }
            })

            // 2. Credit REAL balance — no locked concept
            // Withdrawal is blocked by isActiveMember, not by locked wallet
            await tx.user.update({
                where: { id: completion.userId },
                data: {
                    arnBalance: { increment: reward * 10 },
                    balance: { increment: reward }
                }
            })

            // 3. Transaction record for wallet history
            await tx.transaction.create({
                data: {
                    userId: completion.userId,
                    type: "TASK_REWARD",
                    amount: reward,
                    status: "COMPLETED",
                    method: "SYSTEM",
                    description: `Task Approved: ${completion.task.title}`,
                    arnMinted: reward * 10
                }
            })

            // 4. MLM Log
            await tx.mLMLog.create({
                data: {
                    userId: completion.userId,
                    type: "TASK_REWARD",
                    amount: reward * 10,
                    description: `Earned ${reward * 10} ARN ($${reward.toFixed(2)}) for: ${completion.task.title}`
                }
            })
        }, {
            maxWait: 10000,
            timeout: 30000,
        })

        // Check tier upgrade (task ARN counts toward progress)
        await checkTierUpgrade(completion.userId)

        revalidatePath("/admin/tasks/approvals")
        revalidatePath("/dashboard")
        revalidatePath("/dashboard/tasks")
        revalidatePath("/dashboard/wallet")
        return { success: true }
    } catch (error: any) {
        console.error("Approval error:", error)
        return { success: false, error: `Failed: ${error.message?.substring(0, 200) || "Unknown error"}` }
    }
}

export async function rejectTaskCompletion(completionId: string, remarks?: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" }

    try {
        await prisma.taskCompletion.update({
            where: { id: completionId },
            data: { 
                status: "REJECTED",
                remarks: remarks || "Rejected by Admin"
            }
        })

        revalidatePath("/admin/tasks/approvals")
        revalidatePath("/dashboard/tasks")
        return { success: true }
    } catch (error: any) {
        console.error("Rejection error:", error)
        return { success: false, error: `Failed: ${error.message?.substring(0, 200) || "Unknown error"}` }
    }
}