"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getUsersWithActiveCooldown() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return [];

    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const users = await prisma.user.findMany({
            where: {
                // @ts-ignore
                lastWithdrawalTime: {
                    gt: twentyFourHoursAgo
                }
            },
            select: {
                id: true,
                email: true,
                // @ts-ignore
                lastWithdrawalTime: true
            },
            orderBy: {
                // @ts-ignore
                lastWithdrawalTime: 'desc'
            }
        });
        return users;
    } catch (error) {
        console.error("Error fetching cooldown users:", error);
        return [];
    }
}

export async function resetWithdrawalTimer(userId: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                // @ts-ignore
                lastWithdrawalTime: null // Resetting to null effectively clears the timer
            }
        });

        // Audit Log
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id!,
                targetUserId: userId,
                actionType: "TIMER_RESET",
                details: "Manually reset withdrawal cooldown timer."
            }
        });
        
        revalidatePath("/admin/withdrawals");
        return { success: true };
    } catch (error: any) {
        console.error("Reset Timer Error:", error);
        return { error: error.message || "Failed to reset timer." };
    }
}
