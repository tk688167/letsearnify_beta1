"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getSurpriseWinners(status?: "PENDING" | "REWARDED" | "DISMISSED") {
    const session = await auth()
    if (!session?.user?.id) return []

    return await prisma.surpriseWinner.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: { id: true, name: true, email: true, arnBalance: true, balance: true }
            }
        }
    })
}

export async function rewardSurpriseWinner(winnerId: string, adminRewardNote: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    try {
        await prisma.surpriseWinner.update({
            where: { id: winnerId },
            data: {
                status: "REWARDED",
                adminRewardNote,
                rewardedAt: new Date()
            }
        })

        // Log admin action
        const winner = await prisma.surpriseWinner.findUnique({ where: { id: winnerId } })
        if (winner) {
            await prisma.adminLog.create({
                data: {
                    adminId: session.user.id,
                    targetUserId: winner.userId,
                    actionType: "SURPRISE_REWARD_ASSIGNED",
                    details: `Surprise Bonus reward assigned: "${adminRewardNote}" (Winner ID: ${winnerId})`
                }
            })
        }

        revalidatePath("/admin/spin")
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function dismissSurpriseWinner(winnerId: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    try {
        await prisma.surpriseWinner.update({
            where: { id: winnerId },
            data: { status: "DISMISSED" }
        })

        revalidatePath("/admin/spin")
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
