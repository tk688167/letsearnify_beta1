"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getPendingCompletions() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

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
    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" }
    }

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
            // 1. Update Completion Status
            await tx.taskCompletion.update({
                where: { id: completionId },
                data: {
                    status: "APPROVED",
                    pointsEarned: reward,
                    remarks: remarks || "Approved by Admin"
                }
            })

            // 2. Credit User Balance
            await tx.user.update({
                where: { id: completion.userId },
                data: {
                    arnBalance: { increment: reward }
                }
            })

            // 3. Create Transaction Record
            await tx.transaction.create({
                data: {
                    userId: completion.userId,
                    type: "TASK_REWARD",
                    amount: reward,
                    status: "COMPLETED",
                    method: "SYSTEM", // Added method
                    description: `Task Approved: ${completion.task.title}`,
                    arnMinted: reward
                }
            })
        })

        revalidatePath("/admin/tasks/approvals")
        return { success: true }
    } catch (error: any) {
        console.error("Approval error:", error)
        // Return specific error message for debugging
        return { success: false, error: error.message || "Failed to approve task" }
    }
}

export async function rejectTaskCompletion(completionId: string, remarks?: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" }
    }

    try {
        await prisma.taskCompletion.update({
            where: { id: completionId },
            data: { 
                status: "REJECTED",
                remarks: remarks || "Rejected by Admin"
            }
        })

        revalidatePath("/admin/tasks/approvals")
        return { success: true }
    } catch (error) {
        console.error("Rejection error:", error)
        return { success: false, error: "Failed to reject task" }
    }
}
