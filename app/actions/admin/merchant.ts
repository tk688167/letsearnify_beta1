"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
// @ts-ignore
import { checkAndUpgradeTier } from "@/lib/mlm"

export async function creditMerchantDeposit(userId: string, amount: number, note: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }

    if (!userId || amount <= 0) return { error: "Invalid input data" }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Update User Balance & Data
            // We set isActiveMember to true if amount >= 1 directly here for safety, 
            // though checkAndUpgradeTier might also do checks.
            const user = await tx.user.update({
                where: { id: userId },
                data: {
                    balance: { increment: amount },
                    totalDeposit: { increment: amount },
                    isActiveMember: true 
                }
            })

            // 2. Create Transaction Record
            await tx.transaction.create({
                data: {
                    userId,
                    amount,
                    type: "MERCHANT_DEPOSIT", 
                    status: "COMPLETED",
                    method: "Merchant (EasyPaisa/JazzCash)",
                    description: `Credited by Admin (Merchant Assisted) - ${note}`
                }
            })

            // 3. Admin Log
            await tx.adminLog.create({
                data: {
                    adminId: session.user.id!,
                    targetUserId: userId,
                    actionType: "MERCHANT_DEPOSIT_CREDIT",
                    details: `Credited $${amount} to ${user.email} via Merchant. Note: ${note}`
                }
            })
        })

        // 4. Trigger MLM/Tier Check
        try {
            await checkAndUpgradeTier(userId)
        } catch (e) {
            console.error("Tier upgrade check failed but deposit succeeded:", e)
        }

        revalidatePath(`/admin/users/${userId}`)
        revalidatePath("/admin/users")
        
        return { success: true }
    } catch (error: any) {
        console.error("Merchant Credit Error:", error)
        return { error: error.message || "Failed to credit deposit" }
    }
}
