"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createDailyPool(amount: number) {
    try {
        const session = await auth()
        if (!session?.user?.id) return { error: "Unauthorized" }

        if (amount < 1) return { error: "Minimum pool amount is $1.00" }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { dailyEarningWallet: true }
        })

        if (!user || user.dailyEarningWallet < amount) {
            return { error: "Insufficient balance in Daily Earnings Wallet" }
        }

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)

        await prisma.$transaction(async (tx: any) => {
            await tx.user.update({
                where: { id: session.user.id },
                data: { dailyEarningWallet: { decrement: amount } }
            })

            await tx.dailyEarningInvestment.create({
                data: {
                    userId: session.user.id!,
                    amount: amount,
                    status: "ACTIVE",
                    expiresAt: expiresAt,
                    lastCalculatedDate: new Date()
                }
            })

            await tx.transaction.create({
                data: {
                    userId: session.user.id!,
                    amount: amount,
                    type: "INVESTMENT",
                    status: "COMPLETED",
                    method: "DAILY_EARNING_POOL",
                    description: `Started Daily Earnings Pool with $${amount}`
                }
            })
        })

        revalidatePath("/dashboard/pools/daily-earning")
        return { success: true, message: `Pool of $${amount} activated for 30 days.` }

    } catch (error: any) {
        console.error("Create Pool Error:", error)
        return { error: error.message || "Something went wrong" }
    }
}

export async function transferToMainWallet(amount: number) {
    try {
        const session = await auth()
        if (!session?.user?.id) return { error: "Unauthorized" }

        if (amount <= 0) return { error: "Amount must be greater than 0" }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { dailyEarningWallet: true }
        })

        if (!user || user.dailyEarningWallet < amount) {
            return { error: "Insufficient balance in Daily Earnings Wallet" }
        }

        await prisma.$transaction(async (tx: any) => {
            await tx.user.update({
                where: { id: session.user.id },
                data: {
                    dailyEarningWallet: { decrement: amount },
                    balance: { increment: amount }
                }
            })

            await tx.transaction.create({
                data: {
                    userId: session.user.id!,
                    amount: amount,
                    type: "TRANSFER",
                    status: "COMPLETED",
                    method: "SYSTEM",
                    description: `Transferred $${amount} from Daily Earnings Wallet to Main Wallet`
                }
            })
        })

        revalidatePath("/dashboard/pools/daily-earning")
        revalidatePath("/dashboard/wallet")
        return { success: true, message: `Transferred $${amount} to Main Wallet.` }

    } catch (error: any) {
        console.error("Transfer Error:", error)
        return { error: error.message || "Something went wrong" }
    }
}

export async function getDailyPools() {
    try {
        const session = await auth()
        if (!session?.user?.id) return { error: "Unauthorized" }

        const pools = await prisma.dailyEarningInvestment.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        })

        return { success: true, pools }
    } catch (error) {
        return { error: "Failed to fetch pools" }
    }
}

export async function transferToDailyWallet(amount: number) {
    try {
        const session = await auth()
        if (!session?.user?.id) return { error: "Unauthorized" }

        if (amount <= 0) return { error: "Amount must be greater than 0" }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { balance: true }
        })

        if (!user || (user.balance || 0) < amount) {
            return { error: "Insufficient balance in Main Wallet" }
        }

        await prisma.$transaction(async (tx: any) => {
            await tx.user.update({
                where: { id: session.user.id },
                data: {
                    balance: { decrement: amount },
                    dailyEarningWallet: { increment: amount }
                }
            })

            await tx.transaction.create({
                data: {
                    userId: session.user.id!,
                    amount: amount,
                    type: "TRANSFER",
                    status: "COMPLETED",
                    method: "SYSTEM",
                    description: `Transferred $${amount} from Main Wallet to Daily Earnings Wallet`
                }
            })
        })

        revalidatePath("/dashboard/pools/daily-earning")
        revalidatePath("/dashboard/wallet")
        return { success: true, message: `Transferred $${amount} to Daily Earnings Wallet.` }

    } catch (error: any) {
        console.error("Transfer Error:", error)
        return { error: error.message || "Something went wrong" }
    }
}