"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Search for a user by ID, email, name, or member ID and return their current spin timer status
 * Supports partial matching for email and name fields
 */
export async function searchUserForSpinReset(userId: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required")
    }

    if (!userId || userId.trim() === "") {
        return { success: false, message: "Search term is required" }
    }

    const searchTerm = userId.trim()

    try {
        // Flexible search: supports ID, email, name, or username
        // Try exact ID match first, then fallback to partial matches
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: searchTerm }, // Exact ID match
                    { email: { contains: searchTerm, mode: 'insensitive' } }, // Partial email
                    { name: { contains: searchTerm, mode: 'insensitive' } }, // Partial name
                    { memberId: searchTerm }, // Exact memberId match
                ]
            },
            select: {
                id: true,
                memberId: true,
                name: true,
                email: true,
                lastSpinTime: true,
                lastPremiumSpinTime: true,
                isActiveMember: true,
                createdAt: true
            }
        })

        if (!user) {
            return { success: false, message: "No user found matching your search" }
        }

        // Calculate time since last spins
        const now = new Date()
        let freeSpinStatus = "Available"
        let premiumSpinStatus = "Available"
        let freeSpinHoursRemaining = 0
        let premiumSpinHoursRemaining = 0

        if (user.lastSpinTime) {
            const hoursSinceFreeSpin = (now.getTime() - user.lastSpinTime.getTime()) / (1000 * 60 * 60)
            if (hoursSinceFreeSpin < 48) {
                freeSpinStatus = "On Cooldown"
                freeSpinHoursRemaining = Math.ceil(48 - hoursSinceFreeSpin)
            }
        }

        if (user.lastPremiumSpinTime) {
            const hoursSincePremiumSpin = (now.getTime() - user.lastPremiumSpinTime.getTime()) / (1000 * 60 * 60)
            if (hoursSincePremiumSpin < 24) {
                premiumSpinStatus = "On Cooldown"
                premiumSpinHoursRemaining = Math.ceil(24 - hoursSincePremiumSpin)
            }
        }

        if (!user.isActiveMember) {
            premiumSpinStatus = "Locked (Not Active Member)"
        }

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isActiveMember: user.isActiveMember,
                lastSpinTime: user.lastSpinTime,
                lastPremiumSpinTime: user.lastPremiumSpinTime,
                freeSpinStatus,
                premiumSpinStatus,
                freeSpinHoursRemaining,
                premiumSpinHoursRemaining
            }
        }
    } catch (error) {
        console.error("Error searching user:", error)
        return { success: false, message: "An error occurred while searching for the user" }
    }
}

/**
 * Reset the Free Spin timer for a user (sets lastSpinTime to null)
 */
export async function resetFreeSpinTimer(userId: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required")
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true }
        })

        if (!user) {
            return { success: false, message: "User not found" }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { lastSpinTime: null }
        })

        // Log admin action
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id!,
                targetUserId: userId,
                actionType: "SPIN_TIMER_RESET",
                details: `Reset Free Spin timer for ${user.email || user.name || user.id}`
            }
        })

        revalidatePath("/admin/spin")
        revalidatePath("/dashboard/spin")

        return { 
            success: true, 
            message: `Free Spin timer reset successfully for ${user.email || user.name}` 
        }
    } catch (error) {
        console.error("Error resetting free spin timer:", error)
        return { success: false, message: "Failed to reset Free Spin timer" }
    }
}

/**
 * Reset the Premium Spin timer for a user (sets lastPremiumSpinTime to null)
 */
export async function resetPremiumSpinTimer(userId: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required")
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true }
        })

        if (!user) {
            return { success: false, message: "User not found" }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { lastPremiumSpinTime: null }
        })

        // Log admin action
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id!,
                targetUserId: userId,
                actionType: "SPIN_TIMER_RESET",
                details: `Reset Premium Spin timer for ${user.email || user.name || user.id}`
            }
        })

        revalidatePath("/admin/spin")
        revalidatePath("/dashboard/spin")

        return { 
            success: true, 
            message: `Premium Spin timer reset successfully for ${user.email || user.name}` 
        }
    } catch (error) {
        console.error("Error resetting premium spin timer:", error)
        return { success: false, message: "Failed to reset Premium Spin timer" }
    }
}
