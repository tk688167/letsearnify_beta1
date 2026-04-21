"use server"

import { auth } from "@/auth"
import { executeForwardAdjustment, executeReverseAdjustment } from "@/lib/daily-pool"
import { revalidatePath } from "next/cache"

/**
 * Server Action for Admins to safely simulate a +1 Day Forward Adjustment.
 */
export async function triggerForwardAdjustment() {
    try {
        const session = await auth()
        
        // 1. Authorization Check
        if (session?.user?.role !== "ADMIN") {
            return { success: false, message: "Unauthorized. Admin access required." }
        }

        console.log(`[Admin Action] FORWARD ADJUSTMENT (+1 Day) triggered by ${session.user.email}`);

        // 2. Execute Logic
        const result = await executeForwardAdjustment()

        // 3. Revalidate Admin and User pages
        revalidatePath("/admin/daily-pools")
        revalidatePath("/dashboard/pools/daily-earning")
        revalidatePath("/dashboard/wallet")

        return { 
            success: true, 
            message: `Forward Adjustment (+1 Day) successful. Processed ${result.calculatedCount} pools. Total distributed: $${result.totalProfitDistributed.toFixed(2)}`,
            data: result
        }

    } catch (error: any) {
        console.error("Admin Action Error (Forward Adjustment):", error)
        return { success: false, message: error.message || "Failed to execute forward adjustment." }
    }
}

/**
 * Server Action for Admins to safely simulate a -1 Day Reverse Rollback.
 */
export async function triggerReverseAdjustment() {
    try {
        const session = await auth()
        
        // 1. Authorization Check
        if (session?.user?.role !== "ADMIN") {
            return { success: false, message: "Unauthorized. Admin access required." }
        }

        console.log(`[Admin Action] REVERSE ADJUSTMENT (-1 Day) triggered by ${session.user.email}`);

        // 2. Execute Logic
        const result = await executeReverseAdjustment()

        // 3. Revalidate Admin and User pages
        revalidatePath("/admin/daily-pools")
        revalidatePath("/dashboard/pools/daily-earning")
        revalidatePath("/dashboard/wallet")

        return { 
            success: true, 
            message: result.message,
            data: result
        }

    } catch (error: any) {
        console.error("Admin Reverse Error:", error)
        return { success: false, message: error.message || "Failed to execute reverse adjustment." }
    }
}
