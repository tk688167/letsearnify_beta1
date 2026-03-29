
"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export type AdminDashboardStats = {
    totalUsers: number
    totalDeposited: number
    totalSignups: number
    totalUsersDeposited: number
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats | null> {
    const session = await auth()
    if (!session?.user?.id) return null
    
    // Authorization check
    const admin = await prisma.user.findUnique({ 
        where: { id: session.user.id },
        select: { role: true }
    })
    if (admin?.role !== "ADMIN") return null

    // Parallel fetch for speed
    const [totalUsers, totalDepositedResult, totalUsersDeposited] = await Promise.all([
        prisma.user.count(),
        prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { 
                type: { in: ['DEPOSIT', 'ADMIN_DEPOSIT'] }, // Count real + admin manual deposits 
                status: 'COMPLETED' 
            }
        }),
        prisma.user.count({ 
            where: { totalDeposit: { gt: 0 } }
        })
    ])

    return {
        totalUsers,
        totalDeposited: totalDepositedResult._sum.amount || 0,
        totalSignups: totalUsers, // Semantically the same for now
        totalUsersDeposited
    }
}
