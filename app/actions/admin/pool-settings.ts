"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Updates a user's pool sharing percentages (Investor share vs Referrer share).
 */
export async function updateUserPoolSharing(userId: string, investorShare: number, referrerShare: number) {
    try {
        const session = await auth()
        
        // 1. Authorization Check
        if (session?.user?.role !== "ADMIN") {
            return { success: false, message: "Unauthorized. Admin access required." }
        }

        // 2. Multi-sum validation
        if (investorShare + referrerShare !== 100) {
            return { success: false, message: "Total share must exactly equal 100%." }
        }

        if (investorShare < 0 || referrerShare < 0) {
            return { success: false, message: "Percentages cannot be negative." }
        }

        console.log(`[Admin Action] Updating Pool Sharing for ${userId}: Investor ${investorShare}%, Referrer ${referrerShare}%`);

        // 3. Update User
        await prisma.user.update({
            where: { id: userId },
            data: {
                poolInvestorShare: investorShare,
                poolReferrerShare: referrerShare
            } as any
        })

        // 4. Revalidate
        revalidatePath("/admin/daily-pools")
        revalidatePath("/dashboard/pools/daily-earning")

        return { 
            success: true, 
            message: `Sharing settings updated: Investor ${investorShare}%, Referrer ${referrerShare}%`
        }

    } catch (error: any) {
        console.error("Admin Action Error (Pool Sharing):", error)
        return { success: false, message: error.message || "Failed to update pool sharing settings." }
    }
}
