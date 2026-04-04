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
                referrer: {
                    select: { name: true, referralCode: true }
                },
                referralCommissions: { // Commissions earned by this user
                    orderBy: { createdAt: 'desc' },
                    take: 100,
                    include: {
                        sourceUser: {
                            select: { id: true, name: true, email: true, isActiveMember: true, lastUnlockAt: true }
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
                    lastUnlockAt: true,
                    createdAt: true,
                    referrals: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            tier: true,
                            arnBalance: true,
                            isActiveMember: true,
                            lastUnlockAt: true,
                            createdAt: true,
                            referrals: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    tier: true,
                                    arnBalance: true,
                                    isActiveMember: true,
                                    lastUnlockAt: true,
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
                            lastUnlockAt: true,
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
                lastUnlockAt: u.lastUnlockAt,
                createdAt: u.createdAt,
                level,
                advisorId: row.advisorId,
                supervisorId: row.supervisorId,
                managerId: row.managerId
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
            lastUnlockAt: Date | null;
            createdAt: Date;
        }, level: 1 | 2 | 3, advisorId?: string | null, supervisorId?: string | null, managerId?: string | null) => ({
            id: n.id,
            name: n.name,
            email: n.email,
            tier: n.tier,
            arnBalance: n.arnBalance,
            isActiveMember: n.isActiveMember,
            lastUnlockAt: n.lastUnlockAt,
            createdAt: n.createdAt,
            level,
            advisorId: advisorId || null,
            supervisorId: supervisorId || null,
            managerId: managerId || null
        });

        const fromNested: typeof fromTree = [];
        const pushIfNew = (
            raw: Parameters<typeof nodeFields>[0],
            level: 1 | 2 | 3,
            adv?: string | null,
            sup?: string | null,
            mgr?: string | null
        ) => {
            if (seenIds.has(raw.id)) return;
            seenIds.add(raw.id);
            fromNested.push(nodeFields(raw, level, adv, sup, mgr));
        };

        if (withNested?.referrals) {
            for (const l1 of withNested.referrals) {
                pushIfNew(l1, 1, userId, null, null);
                for (const l2 of l1.referrals ?? []) {
                    pushIfNew(l2, 2, l1.id, userId, null);
                    for (const l3 of l2.referrals ?? []) {
                        pushIfNew(l3, 3, l2.id, l1.id, userId);
                    }
                }
            }
        }

        const referralTree = [...fromTree, ...fromNested].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const referralUserIds = referralTree.map((n) => n.id);
        const referralWithdrawAgg = referralUserIds.length > 0
            ? await prisma.transaction.groupBy({
                by: ["userId"],
                where: {
                    userId: { in: referralUserIds },
                    type: "WITHDRAWAL",
                    status: "COMPLETED",
                },
                _sum: { amount: true },
            })
            : [];
        const referralWithdrawByUser = new Map(
            referralWithdrawAgg.map((row) => [row.userId, row._sum.amount || 0])
        );
        const referralTreeWithWithdrawals = referralTree.map((n) => ({
            ...n,
            withdrawnTotal: referralWithdrawByUser.get(n.id) || 0,
        }));

        // Match earned referral commissions with wallet transaction details
        const commissionTx = await prisma.transaction.findMany({
            where: { userId, type: "REFERRAL_COMMISSION" },
            orderBy: { createdAt: "desc" },
            take: 200,
            select: {
                id: true,
                amount: true,
                arnMinted: true,
                description: true,
                status: true,
                method: true,
                createdAt: true,
            },
        });
        const usedTx = new Set<string>();
        const matchedCommissions = (user.referralCommissions || []).map((c: any) => {
            const cTime = new Date(c.createdAt).getTime();
            const tx = commissionTx.find((t) => {
                if (usedTx.has(t.id)) return false;
                const sameAmount = Math.abs((t.amount || 0) - (c.amount || 0)) < 0.00001;
                const nearTime = Math.abs(new Date(t.createdAt).getTime() - cTime) <= 10 * 60 * 1000;
                return sameAmount && nearTime;
            });
            if (tx) usedTx.add(tx.id);
            return {
                ...c,
                txDescription: tx?.description || null,
                txArnMinted: tx?.arnMinted || 0,
                txStatus: tx?.status || null,
                txMethod: tx?.method || null,
                txCreatedAt: tx?.createdAt || null,
            };
        });
        // Keep compatibility with existing page prop mapping
        (user as any).referralsMade = matchedCommissions;

        // Attach source user withdrawal totals for Recent Network Earnings feed.
        const sourceUserIds = Array.from(
            new Set(
                ((user as any).referralsMade || [])
                    .map((c: any) => c.sourceUserId)
                    .filter(Boolean)
            )
        ) as string[];

        const withdrawalAgg = sourceUserIds.length > 0
            ? await prisma.transaction.groupBy({
                by: ["userId"],
                where: {
                    userId: { in: sourceUserIds },
                    type: "WITHDRAWAL",
                    status: "COMPLETED",
                },
                _sum: { amount: true },
            })
            : [];

        const withdrawalBySource = new Map(
            withdrawalAgg.map((row) => [row.userId, row._sum.amount || 0])
        );

        (user as any).referralsMade = ((user as any).referralsMade || []).map((c: any) => ({
            ...c,
            sourceUserWithdrawn: withdrawalBySource.get(c.sourceUserId) || 0,
        }));

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

        // Count direct signups (L1 only)
        const totalSignups = await prisma.user.count({
            where: { referredByCode: user.referralCode }
        });

        // teamSize = total signups across all 3 levels (not just active)
        return { 
            user: { ...user, totalSignups }, 
            referralTree: referralTreeWithWithdrawals, 
            stats: {
                teamSize: referralTreeWithWithdrawals.length,
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