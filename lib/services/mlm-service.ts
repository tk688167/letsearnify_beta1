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

        // Network depth (L1 / L2 / L3) from the logged-in user's perspective matches
        // ReferralTree: advisorId = direct upline, supervisorId = upline's upline, managerId = third upline.
        // For viewer V: downline at L1 has advisorId === V, L2 has supervisorId === V, L3 has managerId === V.
        const nestedSelect = {
            referrals: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    tier: true,
                    arnBalance: true,
                    isActiveMember: true,
                    createdAt: true,
                    referrals: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            tier: true,
                            arnBalance: true,
                            isActiveMember: true,
                            createdAt: true,
                            referrals: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    tier: true,
                                    arnBalance: true,
                                    isActiveMember: true,
                                    createdAt: true,
                                },
                            },
                        },
                    },
                },
            },
        } as const;

        const [treeRows, withNested] = await Promise.all([
            prisma.referralTree.findMany({
                where: {
                    OR: [
                        { advisorId: userId },
                        { supervisorId: userId },
                        { managerId: userId },
                    ],
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            tier: true,
                            arnBalance: true,
                            isActiveMember: true,
                            createdAt: true,
                        },
                    },
                },
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: nestedSelect,
            }),
        ]);

        const fromTree = treeRows.map((row) => {
            const u = row.user;
            let level: 1 | 2 | 3;
            if (row.advisorId === userId) level = 1;
            else if (row.supervisorId === userId) level = 2;
            else level = 3;

            return {
                id: u.id,
                name: u.name,
                email: u.email,
                tier: u.tier,
                arnBalance: u.arnBalance,
                isActiveMember: u.isActiveMember,
                createdAt: u.createdAt,
                level,
            };
        });

        const seenIds = new Set(fromTree.map((n) => n.id));

        // Legacy / edge: nested referredByCode chain if ReferralTree row was missing
        const nodeFields = (n: {
            id: string;
            name: string | null;
            email: string | null;
            tier: any;
            arnBalance: number;
            isActiveMember: boolean;
            createdAt: Date;
        }, level: 1 | 2 | 3) => ({
            id: n.id,
            name: n.name,
            email: n.email,
            tier: n.tier,
            arnBalance: n.arnBalance,
            isActiveMember: n.isActiveMember,
            createdAt: n.createdAt,
            level,
        });

        const fromNested: typeof fromTree = [];
        const pushIfNew = (
            raw: Parameters<typeof nodeFields>[0],
            level: 1 | 2 | 3
        ) => {
            if (seenIds.has(raw.id)) return;
            seenIds.add(raw.id);
            fromNested.push(nodeFields(raw, level));
        };

        if (withNested?.referrals) {
            for (const l1 of withNested.referrals) {
                pushIfNew(l1, 1);
                for (const l2 of l1.referrals ?? []) {
                    pushIfNew(l2, 2);
                    for (const l3 of l2.referrals ?? []) {
                        pushIfNew(l3, 3);
                    }
                }
            }
        }

        const referralTree = [...fromTree, ...fromNested].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

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