"use server"

import { auth } from "@/auth"
import { executeDailyPoolDistribution } from "@/lib/daily-pool"
import { revalidatePath } from "next/cache"

/**
 * Server Action for Admins to manually trigger the Daily Pool Profit Distribution.
 * This skips the CRON_SECRET check as it's protected by Admin session.
 */
export async function triggerDailyPoolDistribution() {
    try {
        const session = await auth()
        
        // 1. Authorization Check
        if (session?.user?.role !== "ADMIN") {
            return { success: false, message: "Unauthorized. Admin access required." }
        }

        console.log(`[Admin Action] Manual Daily Pool Distribution triggered by ${session.user.email}`);

        // 2. Execute Shared Logic
        const result = await executeDailyPoolDistribution()

        // 3. Revalidate Admin and User pages
        revalidatePath("/admin/daily-pools")
        revalidatePath("/dashboard/pools/daily-earning")
        revalidatePath("/dashboard/wallet")

        return { 
            success: true, 
            message: `Successfully processed ${result.calculatedCount} pools and ${result.expiredCount} expiries. Total profit distributed: $${result.totalProfitDistributed.toFixed(2)}`,
            data: result
        }

    } catch (error: any) {
        console.error("Admin Action Error (Daily Pool):", error)
        return { success: false, message: error.message || "Failed to execute distribution." }
    }
}
