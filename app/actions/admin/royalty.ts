
"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ROYALTY_POOL_NAME } from "@/lib/royalty"

export async function updateRoyaltyPercentage(percentage: number) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    if (session?.user?.id === "super-admin-id" || (session.user as any).role === "ADMIN") {
        // Authorized
    } else {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (user?.role !== "ADMIN") return { error: "Unauthorized" };
    }

    if (![1, 2].includes(percentage)) return { error: "Invalid percentage. Must be 1 or 2." };

    try {
        await prisma.pool.update({
            where: { name: ROYALTY_POOL_NAME },
            data: { percentage }
        });
        return { success: true };
    } catch (e) {
        return { error: "Database error" };
    }
}
