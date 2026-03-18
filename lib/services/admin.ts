
import { prisma } from "@/lib/prisma"

export interface AdminUserListResult {
    users: any[];
    total: number;
    isOffline: boolean;
}

export async function getAdminUsers(limit = 2000): Promise<AdminUserListResult> {
    try {
        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    balance: true,
                    tier: true,
                    arnBalance: true,
                    activeMembers: true,
                    memberId: true,
                    isActiveMember: true 
                }
            }),
            prisma.user.count()
        ]);

        return { users, total, isOffline: false };

    } catch (error) {
        console.error("❌ Service Error [getAdminUsers]:", error);
        // Fallback Mock Data
        return { 
            users: [], 
            total: 0, 
            isOffline: true 
        };
    }
}
