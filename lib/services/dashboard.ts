
import { prisma } from "@/lib/prisma"
import { getTierRequirements, DEFAULT_TIER_REQUIREMENTS } from "@/lib/mlm"

export interface DashboardDataResult {
    user: any;
    pools: any[];
    isOffline: boolean;
}

export async function getDashboardData(userId: string): Promise<DashboardDataResult> {
    try {
        const [user, pools, tierRules] = await Promise.all([
          prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              name: true,
              email: true,
              balance: true,
              tier: true,
              arnBalance: true,
              // @ts-ignore
              memberId: true, 
              referralCode: true,
              isActiveMember: true,
              totalDeposit: true,
              activeMembers: true,
            }
          }),
          prisma.pool.findMany(),
          getTierRequirements(prisma)
        ]);

        if (!user) return { user: null, pools: [], isOffline: false };

        const userWithRules = {
            ...user,
            tierRules: tierRules
        }

        return { 
            user: userWithRules, 
            pools: pools || [], 
            isOffline: false 
        };

    } catch (error) {
        console.error("⚠️ Dashboard Service Error [getDashboardData]:", error);
        // Fallback Data
        const mockUser = {
            id: userId,
            name: "User (Offline)",
            email: "offline@local",
            balance: 0,
            tier: "NEWBIE",
            arnBalance: 0,
            memberId: 0,
            referralCode: "OFFLINE",
            isActiveMember: false,
            totalDeposit: 0,
            activeMembers: 0,
            tierRules: DEFAULT_TIER_REQUIREMENTS
        };

        return { 
            user: mockUser, 
            pools: [], 
            isOffline: true 
        };
    }
}
