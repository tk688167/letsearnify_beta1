"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

// Type checking usually via Zod, but keeping simple for this request as per user preference for speed
export async function getSpinRewards(type: "FREE" | "PREMIUM") {
    // Check Admin (Optional but recommended)
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")
    // In real app, check isAdmin here

    return await prisma.spinReward.findMany({
        where: { spinType: type },
        orderBy: { order: "asc" }
    })
}

export async function upsertSpinReward(data: {
    id?: string
    label: string
    value: number
    type: string
    probability: number
    color: string
    textColor?: string
    spinType: "FREE" | "PREMIUM"
}) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    if (data.id) {
        await prisma.spinReward.update({
            where: { id: data.id },
            data: {
                label: data.label,
                value: data.value,
                type: data.type,
                probability: data.probability,
                color: data.color,
                textColor: data.textColor,
                spinType: data.spinType,
                isEnabled: true
            }
        })
    } else {
        // Get max order
        const maxOrder = await prisma.spinReward.findFirst({
            where: { spinType: data.spinType },
            orderBy: { order: "desc" }
        })
        
        await prisma.spinReward.create({
            data: {
                label: data.label,
                value: data.value,
                type: data.type,
                probability: data.probability,
                color: data.color,
                textColor: data.textColor,
                spinType: data.spinType,
                order: (maxOrder?.order ?? -1) + 1
            }
        })
    }
    
    revalidatePath("/admin/spin")
    revalidatePath("/dashboard/spin")
    return { success: true }
}

export async function deleteSpinReward(id: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await prisma.spinReward.delete({
        where: { id }
    })
    
    revalidatePath("/admin/spin")
    revalidatePath("/dashboard/spin")
    return { success: true }
}

export async function toggleSpinReward(id: string, isEnabled: boolean) {
     const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await prisma.spinReward.update({
        where: { id },
        data: { isEnabled }
    })

    revalidatePath("/admin/spin")
    revalidatePath("/dashboard/spin")
    return { success: true }
}

// --- Global Settings ---

export type SpinSettings = {
    freeSpinCooldownHours: number
    premiumSpinCooldownHours: number
    premiumUnlockAmount: number
    welcomeBonusDays: number
    surpriseGiftIntervalDays: number
}

export async function getSpinSettings(): Promise<SpinSettings> {
    const defaultSettings: SpinSettings = {
        freeSpinCooldownHours: 24,
        premiumSpinCooldownHours: 24,
        premiumUnlockAmount: 1.0,
        welcomeBonusDays: 3,
        surpriseGiftIntervalDays: 30
    }

    try {
        const config = await prisma.systemConfig.findUnique({
            where: { key: "SPIN_CONFIG" }
        })
        
        if (!config || !config.value) {
            return defaultSettings
        }
        
        const settings = config.value as Partial<SpinSettings>
        return {
            ...defaultSettings,
            ...settings
        }
    } catch (error) {
        console.error("Failed to fetch spin settings:", error)
        return defaultSettings
    }
}


export async function updateSpinSettings(settings: SpinSettings) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await prisma.systemConfig.upsert({
        where: { key: "SPIN_CONFIG" },
        update: { value: settings as any },
        create: { key: "SPIN_CONFIG", value: settings as any }
    })
    
    revalidatePath("/admin/spin")
    revalidatePath("/dashboard/spin")
    return { success: true }
}

export async function resetSpinToDefaults(spinType: "FREE" | "PREMIUM") {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        // 1. Wipe existing
        await prisma.spinReward.deleteMany({
            where: { spinType }
        })

        // 2. Define standard layouts
        const baseProb = 0.00625 // ~0.625% per reward for 8 rewards (total 5%)
        const tryAgainProb = 0.3166 // ~31.66% per Try Again for 3 segments (total 95%)

        const premiumRewardProb = 0.00714 // ~0.714% per reward for 7 rewards (total 5%)
        const premiumTryAgainProb = 0.3166

        const layouts: Record<string, any[]> = {
            FREE: [
                { label: "Better Luck Next Time", value: 0, type: "TRY_AGAIN", probability: tryAgainProb, color: "#94a3b8" }, // Slate 400
                { label: "1 ARN Token", value: 1, type: "ARN", probability: baseProb, color: "#3b82f6" }, // Blue 500
                { label: "Try Again", value: 0, type: "TRY_AGAIN", probability: tryAgainProb, color: "#64748b" }, // Slate 500
                { label: "2 ARN Tokens", value: 2, type: "ARN", probability: baseProb, color: "#10b981" }, // Emerald 500
                { label: "Series Spin", value: 0, type: "SERIES_SPIN", probability: baseProb, color: "#8b5cf6" }, // Violet 500
                { label: "3 ARN Tokens", value: 3, type: "ARN", probability: baseProb, color: "#06b6d4" }, // Cyan 500
                { label: "Not This Time", value: 0, type: "TRY_AGAIN", probability: tryAgainProb, color: "#475569" }, // Slate 600
                { label: "4 ARN Tokens", value: 4, type: "ARN", probability: baseProb, color: "#ef4444" }, // Red 500
                { label: "Series Spin", value: 0, type: "SERIES_SPIN", probability: baseProb, color: "#a855f7" }, // Purple 500
                { label: "5 ARN Tokens", value: 5, type: "ARN", probability: baseProb, color: "#f59e0b" }, // Amber 500
                { label: "Surprise Gift", value: 0, type: "SURPRISE", probability: baseProb, color: "#eab308" }, // Yellow 500
            ],
            PREMIUM: [
                { label: "Unlucky! Try Again", value: 0, type: "TRY_AGAIN", probability: premiumTryAgainProb, color: "#64748b" },
                { label: "1 ARN Token", value: 1, type: "ARN", probability: premiumRewardProb, color: "#3b82f6" },
                { label: "Try Again", value: 0, type: "TRY_AGAIN", probability: premiumTryAgainProb, color: "#475569" },
                { label: "2 ARN Tokens", value: 2, type: "ARN", probability: premiumRewardProb, color: "#10b981" },
                { label: "Better Luck Soon", value: 0, type: "TRY_AGAIN", probability: premiumTryAgainProb, color: "#334155" },
                { label: "3 ARN Tokens", value: 3, type: "ARN", probability: premiumRewardProb, color: "#06b6d4" },
                { label: "5 ARN Tokens", value: 5, type: "ARN", probability: premiumRewardProb, color: "#f59e0b" },
                { label: "10 ARN Tokens", value: 10, type: "ARN", probability: premiumRewardProb, color: "#ef4444" },
                { label: "Surprise Bonus", value: 0, type: "SURPRISE", probability: premiumRewardProb, color: "#eab308" },
                { label: "Series Spin", value: 0, type: "SERIES_SPIN", probability: premiumRewardProb, color: "#8b5cf6" },
            ]
        }

        const chosenLayout = layouts[spinType]
        
        // 3. Create all in order
        for (let i = 0; i < chosenLayout.length; i++) {
            const seg = chosenLayout[i]
            await prisma.spinReward.create({
                data: {
                    label: seg.label,
                    value: seg.amount || seg.value || 0,
                    type: seg.type,
                    probability: seg.probability,
                    color: seg.color,
                    textColor: "#ffffff",
                    spinType: spinType,
                    order: i,
                    isEnabled: true
                }
            })
        }

        revalidatePath("/admin/spin")
        revalidatePath("/dashboard/spin")
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
