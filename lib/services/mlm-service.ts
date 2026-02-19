
import { prisma } from "@/lib/prisma"
import { startOfDay } from "date-fns"

export interface MlmDataResult {
    user: any;
    referralTree: any[];
    stats: {
        teamSize: number;
        totalEarnings: number;
        todayEarnings: number;
    };
    isOffline: boolean;
}

export async function getMlmData(userId: string): Promise<MlmDataResult> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                referrals: { // Level 1
                    include: {
                        referrals: { // Level 2
                            include: {
                                referrals: true // Level 3
                            }
                        }
                    }
                },
                referralsMade: { // Commissions Earned
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                    include: {
                        sourceUser: {
                            select: { name: true, email: true }
                        }
                    }
                }
            }
        });

        if (!user) {
            if (userId === "super-admin-id") {
                return {
                    user: {
                        id: userId,
                        name: "Super Admin",
                        email: "admin@letsearnify.com",
                        tier: "EMERALD",
                        memberId: "777777",
                        referralCode: "SUPER-ADMIN",
                        isActiveMember: true,
                        balance: 5000.0,
                        arnBalance: 1000,
                        activeMembers: 10,
                        referralsMade: []
                    },
                    referralTree: [],
                    stats: {
                        teamSize: 10,
                        totalEarnings: 1500.0,
                        todayEarnings: 25.0
                    },
                    isOffline: false
                };
            }
            return { user: null, referralTree: [], stats: { teamSize: 0, totalEarnings: 0, todayEarnings: 0 }, isOffline: false };
        }

        // Process Referral Tree
        let referralTree: any[] = [];
        // Flatten the Tree
        if (user.referrals) {
            user.referrals.forEach((l1: any) => {
                referralTree.push({ ...l1, level: 1 })
                if (l1.referrals) {
                    l1.referrals.forEach((l2: any) => {
                        referralTree.push({ ...l2, level: 2 })
                        if (l2.referrals) {
                            l2.referrals.forEach((l3: any) => {
                                referralTree.push({ ...l3, level: 3 })
                            })
                        }
                    })
                }
            })
        }

        // Stats Aggregation
        const totalEarningsAgg = await prisma.referralCommission.aggregate({
            where: { earnerId: userId },
            _sum: { amount: true }
        });

        const todayEarningsAgg = await prisma.referralCommission.aggregate({
            where: { 
                earnerId: userId,
                createdAt: { gte: startOfDay(new Date()) }
            },
            _sum: { amount: true }
        });

        return { 
            user, 
            referralTree, 
            stats: {
                teamSize: referralTree.length,
                totalEarnings: totalEarningsAgg._sum.amount || 0,
                todayEarnings: todayEarningsAgg._sum.amount || 0
            },
            isOffline: false 
        };

    } catch (error) {
        console.error("⚠️ MLM Service Error [getMlmData]:", error);
        return { 
            user: { 
                id: userId, 
                name: "User (Offline)", 
                tier: "NEWBIE", 
                points: 0, 
                activeMembers: 0,
                referralCode: "OFFLINE",
                balance: 0,
                referralsMade: [] 
            }, 
            referralTree: [], 
            stats: { teamSize: 0, totalEarnings: 0, todayEarnings: 0 }, 
            isOffline: true 
        };
    }
}
