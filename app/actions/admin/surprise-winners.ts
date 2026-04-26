"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { checkTierUpgrade } from "@/lib/mlm"

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

export async function rewardSurpriseWinner(winnerId: string, amount: number, adminRewardNote: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    if (isNaN(amount) || amount <= 0) {
        return { success: false, error: "Invalid reward amount" }
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get Winner & User details
            const winner = await tx.surpriseWinner.findUnique({
                where: { id: winnerId },
                include: { user: true }
            })

            if (!winner) throw new Error("Winner not found")
            if (winner.status !== "PENDING") throw new Error("Reward already processed")

            // 2. Update Winner Status
            await tx.surpriseWinner.update({
                where: { id: winnerId },
                data: {
                    status: "REWARDED",
                    adminRewardNote,
                    rewardedAt: new Date()
                }
            })

            // 3. Update User Wallet (10 ARN = 1 USD)
            const usdAmount = amount / 10
            await tx.user.update({
                where: { id: winner.userId },
                data: {
                    arnBalance: { increment: amount },
                    balance: { increment: usdAmount }
                }
            })

            // 4. Create Transaction Record
            await tx.transaction.create({
                data: {
                    userId: winner.userId,
                    amount: usdAmount,
                    arnMinted: amount,
                    type: "REWARD",
                    status: "COMPLETED",
                    method: "SPIN",
                    description: "Company reward for Surprise Spin win"
                }
            })

            // 5. Send Notification
            const { createNotification } = await import("@/lib/notifications")
            await createNotification(
                winner.userId,
                "Surprise Spin Reward! 🎁",
                `Congratulations! You won a Surprise Spin reward. The company has credited you ${amount} ARN tokens.`,
                "REWARD"
            )

            // 6. Create MLM Log for consistency
            await tx.mLMLog.create({
                data: {
                    userId: winner.userId,
                    type: "SPIN_REWARD",
                    amount: amount,
                    description: `You’ve received ${amount} ARN tokens from the company as your Surprise Spin reward.`
                }
            })

            // 7. Update Tier Progress
            await checkTierUpgrade(winner.userId, tx)

            // 8. Log admin action
            await tx.adminLog.create({
                data: {
                    adminId: session.user.id,
                    targetUserId: winner.userId,
                    actionType: "SURPRISE_REWARD_ASSIGNED",
                    details: `Surprise Bonus reward of ${amount} ARN assigned: "${adminRewardNote}" (Winner ID: ${winnerId})`
                }
            })

            return { success: true }
        })

        revalidatePath("/admin/spin")
        revalidatePath("/dashboard")
        revalidatePath("/dashboard/wallet")
        return result
    } catch (error: any) {
        console.error("Reward Surprise Winner Error:", error)
        return { success: false, error: error.message || "Failed to process reward" }
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
