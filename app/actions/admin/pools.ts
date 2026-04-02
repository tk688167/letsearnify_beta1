"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

async function isAdmin() {
    const session = await auth()
    if (!session?.user?.id) return false
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    })
    return user?.role === "ADMIN"
}

/**
 * Updates the percentage allocation for the Achievement (REWARD) Pool.
 * Stored in the Pool table under 'REWARD' name.
 */
export async function updateAchievementPercentage(percentage: number) {
    try {
        if (!(await isAdmin())) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.pool.update({
            where: { name: "REWARD" },
            data: { percentage }
        })

        revalidatePath("/admin/pools/achievement")
        return { success: true }
    } catch (error: any) {
        console.error("Update Achievement Percentage Error:", error)
        return { success: false, error: error.message || "Failed to update percentage" }
    }
}

/**
 * Updates the percentage allocation for the CBSP Pool.
 */
export const updateCbspPercentage = async (percentage: number) => {
    try {
        if (!(await isAdmin())) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.pool.update({
            where: { name: "CBSP" },
            data: { percentage }
        })

        revalidatePath("/admin/pools/cbspool")
        return { success: true }
    } catch (error: any) {
        console.error("Update CBSP Percentage Error:", error)
        return { success: false, error: error.message || "Failed to update percentage" }
    }
}
