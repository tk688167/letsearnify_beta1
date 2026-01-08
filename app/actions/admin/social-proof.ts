"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

// --- STATS MANAGEMENT ---

export async function getSocialProofStats() {
    // Singleton pattern: get the first one or create default
    let stats = await prisma.socialProofSettings.findFirst()
    
    if (!stats) {
        stats = await prisma.socialProofSettings.create({
            data: {
                totalUsers: 15420,
                totalDeposited: 452000.00,
                totalPayouts: 125000.00,
                activeOnline: 450
            }
        })
    }
    
    return stats
}

export async function updateSocialProofStats(data: {
    totalUsers: number,
    totalDeposited: number,
    totalPayouts: number,
    activeOnline: number
}) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized", success: false }
    }

    try {
        const current = await getSocialProofStats()
        
        await prisma.socialProofSettings.update({
            where: { id: current.id },
            data: {
                totalUsers: data.totalUsers,
                totalDeposited: data.totalDeposited,
                totalPayouts: data.totalPayouts,
                activeOnline: data.activeOnline
            }
        })

        revalidatePath("/")
        revalidatePath("/dashboard/welcome")
        return { success: true }
    } catch (error) {
        console.error("Failed to update stats:", error)
        return { error: "Failed to update stats", success: false }
    }
}

// --- PAYOUT PROOF MANAGEMENT ---

export async function getPayoutProofs() {
    return await prisma.payoutProof.findMany({
        orderBy: { date: 'desc' }
    })
}

export async function addPayoutProof(data: {
    imageUrl: string,
    amount: number,
    userName: string,
    method: string
}) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized", success: false }
    }

    try {
        await prisma.payoutProof.create({
            data: {
                imageUrl: data.imageUrl,
                amount: data.amount,
                userName: data.userName,
                method: data.method,
                date: new Date()
            }
        })
        
        revalidatePath("/")
        revalidatePath("/dashboard/welcome")
        return { success: true }
    } catch (error) {
        console.error("Failed to add proof:", error)
        return { error: "Failed to add proof", success: false }
    }
}

export async function deletePayoutProof(id: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized", success: false }
    }

    try {
        await prisma.payoutProof.delete({
            where: { id }
        })
        
        revalidatePath("/")
        revalidatePath("/dashboard/welcome")
        return { success: true }

    } catch (error) {
        return { error: "Failed to delete", success: false }
    }
}
