import { prisma } from "@/lib/prisma"
import { getTierRequirements, DEFAULT_TIER_REQUIREMENTS, checkAccountLock } from "@/lib/mlm"

export interface DashboardDataResult {
    user: any;
    pools: any[];
    isOffline: boolean;
    isMarketplaceLive: boolean;
    isMudarabahLive: boolean;
}

export async function getDashboardData(userId: string): Promise<DashboardDataResult> {
    try {
        await checkAccountLock(userId);

        const [
          user, 
          pools, 
          tierRules,
          cryptoPendingDeposits,
          cryptoPendingWithdrawals,
          cryptoCompletedWithdrawals,
          merchantPendingDeposits,
          merchantPendingWithdrawals,
          merchantCompletedWithdrawals,
          referralEarningsAgg,
          taskEarningsAgg,
          systemConfigMarketplace,
          systemConfigMudarabah
        ] = await Promise.all([
          prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              name: true,
              email: true,
              balance: true,
              tier: true,
              arnBalance: true,
              memberId: true, 
              referralCode: true,
              isActiveMember: true,
              totalDeposit: true,
              activeMembers: true,
              unlockExpiry: true,
              lastActivityAt: true,
            }
          }),
          prisma.pool.findMany(),
          getTierRequirements(prisma),
          prisma.transaction.aggregate({ where: { userId, type: "DEPOSIT", status: "PENDING" }, _sum: { amount: true } }),
          prisma.transaction.aggregate({ where: { userId, type: "WITHDRAWAL", status: "PENDING" }, _sum: { amount: true } }),
          prisma.transaction.aggregate({ where: { userId, type: "WITHDRAWAL", status: "COMPLETED" }, _sum: { amount: true } }),
          prisma.merchantTransaction.aggregate({ where: { userId, type: "DEPOSIT", status: "PENDING" }, _sum: { amount: true } }),
          prisma.merchantTransaction.aggregate({ where: { userId, type: "WITHDRAWAL", status: "PENDING" }, _sum: { amount: true } }),
          prisma.merchantTransaction.aggregate({ where: { userId, type: "WITHDRAWAL", status: { in: ["APPROVED", "COMPLETED"] } }, _sum: { amount: true } }),
          prisma.referralCommission.aggregate({ where: { earnerId: userId }, _sum: { amount: true } }),
          prisma.transaction.aggregate({ where: { userId, type: "TASK_REWARD", status: "COMPLETED" }, _sum: { amount: true } }),
          prisma.systemConfig.findUnique({ where: { key: "MARKETPLACE_MODE" } }),
          prisma.systemConfig.findUnique({ where: { key: "MUDARABAH_CONFIG" } })
        ]);

        if (!user) {
            return { user: null, pools: [], isOffline: false, isMarketplaceLive: false, isMudarabahLive: false };
        }

        // Count total signups AFTER we have user.referralCode
        const totalSignups = user.referralCode 
            ? await prisma.user.count({ where: { referredByCode: user.referralCode } }) 
            : 0;

        const pendingDeposit = (cryptoPendingDeposits._sum.amount || 0) + (merchantPendingDeposits._sum.amount || 0);
        const pendingWithdrawal = (cryptoPendingWithdrawals._sum.amount || 0) + (merchantPendingWithdrawals._sum.amount || 0);
        const totalWithdrawal = (cryptoCompletedWithdrawals._sum.amount || 0) + (merchantCompletedWithdrawals._sum.amount || 0);
        const referralEarnings = referralEarningsAgg._sum.amount || 0;
        const taskEarnings = taskEarningsAgg._sum.amount || 0;

        const userWithRules = {
            ...user,
            tierRules,
            totalSignups,
            pendingDeposit,
            pendingWithdrawal,
            totalWithdrawal,
            referralEarnings,
            taskEarnings
        }
        
        const isMarketplaceLive = (systemConfigMarketplace?.value as any)?.mode === "live";
        const isMudarabahLive = (systemConfigMudarabah?.value as any)?.isLive === true;

        return { 
            user: userWithRules, 
            pools: pools || [], 
            isOffline: false,
            isMarketplaceLive,
            isMudarabahLive
        };

    } catch (error) {
        console.error("⚠️ Dashboard Service Error [getDashboardData]:", error);
        const mockUser = {
            id: userId,
            name: "User (Offline)",
            email: "offline@local",
            balance: 0,
            tier: "NEWBIE",
            arnBalance: 0,
            memberId: "0000000",
            referralCode: "OFFLINE",
            isActiveMember: false,
            totalDeposit: 0,
            activeMembers: 0,
            totalSignups: 0,
            tierRules: DEFAULT_TIER_REQUIREMENTS
        };

        return { 
            user: mockUser, 
            pools: [], 
            isOffline: true,
            isMarketplaceLive: false,
            isMudarabahLive: false
        };
    }
}