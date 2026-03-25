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
                referrals: { // Level 1 — ALL users who used this user's referral code
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        tier: true,
                        arnBalance: true,
                        isActiveMember: true,
                        createdAt: true,
                        referrals: { // Level 2
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                tier: true,
                                arnBalance: true,
                                isActiveMember: true,
                                createdAt: true,
                                referrals: { // Level 3
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        tier: true,
                                        arnBalance: true,
                                        isActiveMember: true,
                                        createdAt: true,
                                    }
                                }
                            }
                        }
                    }
                },
                referralsMade: { // Commissions earned by this user
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
            return { user: null, referralTree: [], stats: { teamSize: 0, totalEarnings: 0, todayEarnings: 0 }, isOffline: false };
        }

        // Build referral tree — show ALL signups (not just active)
        // Per PDF: "Each user who joins using your referral code = 1 Signup"
        // "There are no restrictions, every valid referral is counted equally"
        let referralTree: any[] = [];
        
        if (user.referrals) {
            user.referrals.forEach((l1: any) => {
                referralTree.push({ 
                    id: l1.id, name: l1.name, email: l1.email, 
                    tier: l1.tier, arnBalance: l1.arnBalance,
                    isActiveMember: l1.isActiveMember,
                    createdAt: l1.createdAt, level: 1 
                })
                if (l1.referrals) {
                    l1.referrals.forEach((l2: any) => {
                        referralTree.push({ 
                            id: l2.id, name: l2.name, email: l2.email, 
                            tier: l2.tier, arnBalance: l2.arnBalance,
                            isActiveMember: l2.isActiveMember,
                            createdAt: l2.createdAt, level: 2 
                        })
                        if (l2.referrals) {
                            l2.referrals.forEach((l3: any) => {
                                referralTree.push({ 
                                    id: l3.id, name: l3.name, email: l3.email, 
                                    tier: l3.tier, arnBalance: l3.arnBalance,
                                    isActiveMember: l3.isActiveMember,
                                    createdAt: l3.createdAt, level: 3 
                                })
                            })
                        }
                    })
                }
            })
        }

        // Stats
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

        // teamSize = total signups across all 3 levels (not just active)
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
                arnBalance: 0, 
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