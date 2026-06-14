import { prisma } from "@/lib/prisma"
import { createNotification, cleanupNotifications } from "./notifications"

const CYCLE_MS = 24 * 60 * 60 * 1000         // 24 hours in milliseconds
const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000  // 24-hour new-user grace period

/**
 * Core logic to distribute daily 1% yields for all active pools.
 * Uses a per-pool 24-hour cycle timer (nextCycleAt) instead of NY Midnight batching.
 * Includes catch-up logic: if multiple cycles are overdue they are all credited in one run.
 * @param {object} options - Configuration for distribution
 * @param {boolean} options.force - If true, ignores nextCycleAt check and processes all active pools.
 * @returns Summary results of processed pools
 */
export async function executeDailyPoolDistribution(options: { force?: boolean } = {}) {
    const { force = false } = options
    const now = new Date()

    console.log(`[Daily Pool] Distribution Started at ${now.toISOString()} (Force: ${force})`)

    // 1. Fetch all ACTIVE pools whose next cycle is due (nextCycleAt <= now)
    const duePools = await prisma.dailyEarningInvestment.findMany({
        where: {
            status: "ACTIVE",
            ...(force ? {} : { nextCycleAt: { lte: now } })
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    memberId: true,
                    referredByCode: true,
                    poolInvestorShare: true,
                    poolReferrerShare: true,
                    isActiveMember: true,
                    createdAt: true,
                    referrer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            referralCode: true,
                            isActiveMember: true,
                            createdAt: true
                        }
                    }
                }
            }
        }
    })

    const companyUser = await prisma.user.findUnique({
        where: { referralCode: "COMPANY" }
    })

    let processedProfitCount = 0
    let totalProfitDistributed = 0

    for (const pool of duePools) {
        // --- Catch-up: count how many full 24h cycles have elapsed since nextCycleAt ---
        let cycleTime = new Date(pool.nextCycleAt)
        let pendingCycles = 0
        while (cycleTime <= now) {
            pendingCycles++
            cycleTime = new Date(cycleTime.getTime() + CYCLE_MS)
        }

        if (pendingCycles < 1) continue

        // cycleTime is now the first future cycle time (after all due cycles are processed)
        const finalNextCycleAt = cycleTime
        const lastProcessedCycleAt = new Date(finalNextCycleAt.getTime() - CYCLE_MS)

        // --- Profit Calculation ---
        const totalDailyYield = pool.amount * 0.01
        const totalProfitToSplit = totalDailyYield * pendingCycles

        const investorSharePerCent = pool.user.poolInvestorShare ?? 80
        const referrerSharePerCent = pool.user.poolReferrerShare ?? 20

        const investorProfit = (totalProfitToSplit * investorSharePerCent) / 100
        const referrerProfit = (totalProfitToSplit * referrerSharePerCent) / 100

        const referrer = pool.user.referrer

        // --- Eligibility Checks (evaluated at current processing time) ---
        const isInvestorEligible =
            pool.user.isActiveMember ||
            now.getTime() - new Date(pool.user.createdAt).getTime() < GRACE_PERIOD_MS

        const isReferrerEligible =
            !referrer ||
            referrer.isActiveMember ||
            now.getTime() - new Date(referrer.createdAt).getTime() < GRACE_PERIOD_MS

        // Build atomic operation list
        const operations: any[] = [
            // Always advance timer and accumulate profit on the pool record
            prisma.dailyEarningInvestment.update({
                where: { id: pool.id },
                data: {
                    profitEarned: { increment: totalProfitToSplit },
                    lastCalculatedDate: lastProcessedCycleAt,
                    nextCycleAt: finalNextCycleAt
                }
            })
        ]

        // --- 1. Investor Share: Credit or Forfeit ---
        if (isInvestorEligible) {
            operations.push(
                prisma.user.update({
                    where: { id: pool.userId },
                    data: { dailyEarningWallet: { increment: investorProfit } }
                }),
                prisma.transaction.create({
                    data: {
                        userId: pool.userId,
                        amount: investorProfit,
                        type: "REWARD",
                        status: "COMPLETED",
                        description: `Daily 1% earning (Your ${investorSharePerCent}% share) from pool $${pool.amount.toFixed(2)} — ${pendingCycles} cycle(s).`
                    }
                }),
                prisma.mLMLog.create({
                    data: {
                        userId: pool.userId,
                        type: "POOL_EARNING",
                        amount: investorProfit,
                        description: `Received ${investorSharePerCent}% share of daily 1% profit for ${pendingCycles} cycle(s).`
                    }
                })
            )
        } else {
            // Forfeit investor share to Company
            operations.push(
                prisma.pool.upsert({
                    where: { name: "COMPANY" },
                    update: { balance: { increment: investorProfit } },
                    create: { name: "COMPANY", balance: investorProfit, percentage: 0 }
                }),
                prisma.transaction.create({
                    data: {
                        userId: pool.userId,
                        amount: 0,
                        type: "FORFEITED_EARNING",
                        status: "FAILED",
                        description: `Daily Earning Forfeited ($${investorProfit.toFixed(2)}): Account activation required.`
                    }
                }),
                prisma.mLMLog.create({
                    data: {
                        userId: pool.userId,
                        type: "FORFEITED_EARNING",
                        amount: 0,
                        description: `Daily 1% yield ($${investorProfit.toFixed(2)}) forfeited to company — account not active.`
                    }
                })
            )
        }

        // --- 2. Referral / Company Commission Handling (Level 1 Only) ---
        const isManuallyReferred = referrer && referrer.referralCode !== "COMPANY"
        const earnerId = isManuallyReferred ? referrer.id : (companyUser?.id || null)

        if (earnerId && referrerProfit > 0) {
            if (isManuallyReferred && isReferrerEligible) {
                // Manually referred & eligible → credit referrer
                operations.push(
                    prisma.user.update({
                        where: { id: earnerId },
                        data: { dailyEarningWallet: { increment: referrerProfit } }
                    }),
                    prisma.transaction.create({
                        data: {
                            userId: earnerId,
                            amount: referrerProfit,
                            type: "COMMISSION",
                            status: "COMPLETED",
                            description: `Referral Earning (${referrerSharePerCent}% share) from ${pool.user.name || pool.user.id.slice(-5)}'s Daily Pool.`
                        }
                    }),
                    prisma.mLMLog.create({
                        data: {
                            userId: earnerId,
                            type: "REFERRAL_EARNING",
                            amount: referrerProfit,
                            description: `Earned ${referrerSharePerCent}% referral share from member's daily pool yield.`
                        }
                    })
                )
            } else {
                // Ineligible referrer or company referral → credit Company pool
                operations.push(
                    prisma.pool.upsert({
                        where: { name: "COMPANY" },
                        update: { balance: { increment: referrerProfit } },
                        create: { name: "COMPANY", balance: referrerProfit, percentage: 0 }
                    }),
                    prisma.adminLog.create({
                        data: {
                            adminId: "SYSTEM",
                            actionType: "COMPANY_REVENUE",
                            details: isManuallyReferred
                                ? `Forfeited ${referrerSharePerCent}% referral profit ($${referrerProfit.toFixed(2)}) from inactive referrer ${referrer.email}.`
                                : `Received ${referrerSharePerCent}% referral profit ($${referrerProfit.toFixed(2)}) from un-referred user ${pool.user.email}.`
                        }
                    })
                )

                if (isManuallyReferred && !isReferrerEligible) {
                    operations.push(
                        prisma.transaction.create({
                            data: {
                                userId: earnerId,
                                amount: 0,
                                type: "FORFEITED_COMMISSION",
                                status: "FAILED",
                                description: `Referral Earning Forfeited ($${referrerProfit.toFixed(2)}): Account activation required.`
                            }
                        }),
                        prisma.mLMLog.create({
                            data: {
                                userId: earnerId,
                                type: "FORFEITED_COMMISSION",
                                amount: 0,
                                description: `Referral commission ($${referrerProfit.toFixed(2)}) forfeited due to inactive account.`
                            }
                        })
                    )
                    // Notify referrer of forfeited commission
                    await createNotification(
                        earnerId,
                        "Referral Commission Forfeited",
                        "Your referral commission was forfeited because your account is not active.",
                        "FORFEITURE"
                    )
                }
            }

            // Always record ReferralCommission entry for transparency
            if (isReferrerEligible || !isManuallyReferred) {
                operations.push(
                    prisma.referralCommission.create({
                        data: {
                            earnerId: earnerId,
                            sourceUserId: pool.userId,
                            amount: isReferrerEligible ? referrerProfit : 0,
                            level: 1,
                            percentage: referrerSharePerCent,
                            category: "DAILY_POOL"
                        }
                    })
                )
            }
        }

        // Execute all DB writes atomically
        await prisma.$transaction(operations)

        // --- Post-transaction Notifications (no amounts per approved spec) ---
        if (isInvestorEligible) {
            await createNotification(
                pool.userId,
                "Daily Earning Credited",
                "Your Daily Earning Pool profit has been successfully credited.",
                "REWARD"
            )
        } else {
            await createNotification(
                pool.userId,
                "Daily Earning Not Credited",
                "Your Daily Earning Pool profit was not credited due to inactivity during the 24-hour cycle.",
                "FORFEITURE"
            )
        }

        processedProfitCount++
        totalProfitDistributed += totalProfitToSplit
    }

    // 2. Handle Expiry (30 Days) → Return Principal
    const expiredPools = await prisma.dailyEarningInvestment.findMany({
        where: {
            status: "ACTIVE",
            expiresAt: { lte: now }
        }
    })

    let processedExpiry = 0
    for (const pool of expiredPools) {
        const returnPrincipal = pool.amount

        await prisma.$transaction([
            prisma.dailyEarningInvestment.update({
                where: { id: pool.id },
                data: { status: "COMPLETED" }
            }),
            prisma.user.update({
                where: { id: pool.userId },
                data: { dailyEarningWallet: { increment: returnPrincipal } }
            }),
            prisma.transaction.create({
                data: {
                    userId: pool.userId,
                    amount: returnPrincipal,
                    type: "REWARD",
                    status: "COMPLETED",
                    description: `Daily Earnings Pool completed. Returned principal $${pool.amount.toFixed(2)} to Daily Wallet.`
                }
            })
        ])
        processedExpiry++
    }

    // 3. Cleanup old notifications (>30 days)
    await cleanupNotifications()

    console.log(`[Daily Pool] Finished. Pools Processed: ${processedProfitCount}, Expiries: ${processedExpiry}, Total: $${totalProfitDistributed.toFixed(2)}`)

    return {
        success: true,
        calculatedCount: processedProfitCount,
        expiredCount: processedExpiry,
        totalProfitDistributed
    }
}

/**
 * Admin utility: Safely pushes 1 day of profit distribution forward.
 * Advances nextCycleAt by exactly 24h and credits 1 day of profit.
 */
export async function executeForwardAdjustment() {
    const activePools = await prisma.dailyEarningInvestment.findMany({
        where: { status: "ACTIVE" },
        include: {
            user: {
                select: {
                    id: true, name: true, email: true,
                    poolInvestorShare: true, poolReferrerShare: true,
                    isActiveMember: true, createdAt: true,
                    referrer: {
                        select: { id: true, name: true, email: true, referralCode: true, isActiveMember: true, createdAt: true }
                    }
                }
            }
        }
    })

    const companyUser = await prisma.user.findUnique({ where: { referralCode: "COMPANY" } })
    let processedProfitCount = 0
    let totalProfitDistributed = 0

    for (const pool of activePools) {
        const totalProfitToSplit = pool.amount * 0.01
        const investorSharePerCent = pool.user.poolInvestorShare ?? 80
        const referrerSharePerCent = pool.user.poolReferrerShare ?? 20
        const investorProfit = (totalProfitToSplit * investorSharePerCent) / 100
        const referrerProfit = (totalProfitToSplit * referrerSharePerCent) / 100

        const referrer = pool.user.referrer
        const isManuallyReferred = referrer && referrer.referralCode !== "COMPANY"
        const earnerId = isManuallyReferred ? referrer.id : (companyUser?.id || null)

        // Advance both timer fields by exactly 24 hours
        const newNextCycleAt = new Date(pool.nextCycleAt.getTime() + CYCLE_MS)
        const newLastCalculatedDate = new Date(pool.lastCalculatedDate.getTime() + CYCLE_MS)

        const operations: any[] = [
            prisma.dailyEarningInvestment.update({
                where: { id: pool.id },
                data: {
                    profitEarned: { increment: totalProfitToSplit },
                    lastCalculatedDate: newLastCalculatedDate,
                    nextCycleAt: newNextCycleAt
                }
            }),
            // Force-credit always ignores eligibility (admin intent)
            prisma.user.update({
                where: { id: pool.userId },
                data: { dailyEarningWallet: { increment: investorProfit } }
            }),
            prisma.transaction.create({
                data: {
                    userId: pool.userId,
                    amount: investorProfit,
                    type: "REWARD",
                    status: "COMPLETED",
                    description: `Admin Forward Sync: Added 1 day profit (${investorSharePerCent}% share).`
                }
            }),
            prisma.mLMLog.create({
                data: {
                    userId: pool.userId,
                    type: "POOL_EARNING",
                    amount: investorProfit,
                    description: `[Manual Sync] Received ${investorSharePerCent}% share for 1 forced day.`
                }
            })
        ]

        if (earnerId && referrerProfit > 0) {
            if (isManuallyReferred) {
                operations.push(
                    prisma.user.update({
                        where: { id: earnerId },
                        data: { dailyEarningWallet: { increment: referrerProfit } }
                    }),
                    prisma.transaction.create({
                        data: {
                            userId: earnerId,
                            amount: referrerProfit,
                            type: "COMMISSION",
                            status: "COMPLETED",
                            description: `Admin Forward Sync: Manual referral credit from ${pool.user.email} pool.`
                        }
                    })
                )
            } else {
                operations.push(
                    prisma.pool.upsert({
                        where: { name: "COMPANY" },
                        update: { balance: { increment: referrerProfit } },
                        create: { name: "COMPANY", balance: referrerProfit, percentage: 0 }
                    }),
                    prisma.adminLog.create({
                        data: {
                            adminId: "SYSTEM",
                            actionType: "COMPANY_REVENUE",
                            details: `Admin Forward Sync: Credited un-referred profit from ${pool.user.email}.`
                        }
                    })
                )
            }
        }

        await prisma.$transaction(operations)
        processedProfitCount++
        totalProfitDistributed += totalProfitToSplit
    }

    return {
        success: true,
        calculatedCount: processedProfitCount,
        totalProfitDistributed
    }
}

/**
 * Admin utility: Reverses 1 day of profit distribution strictly for ACTIVE pools.
 * Clamps wallet deductions to zero to prevent negative debt.
 * Decrements nextCycleAt by exactly 24h to keep timer in sync.
 */
export async function executeReverseAdjustment() {
    const activePools = await prisma.dailyEarningInvestment.findMany({
        where: { status: "ACTIVE" },
        include: {
            user: {
                select: {
                    id: true, email: true,
                    poolInvestorShare: true, poolReferrerShare: true, dailyEarningWallet: true,
                    referrer: { select: { id: true, email: true, referralCode: true, dailyEarningWallet: true } }
                }
            }
        }
    })

    const companyUser = await prisma.user.findUnique({ where: { referralCode: "COMPANY" } })
    let rollbackCount = 0

    for (const pool of activePools) {
        const totalProfitToSplit = pool.amount * 0.01
        const investorSharePerCent = pool.user.poolInvestorShare ?? 80
        const referrerSharePerCent = pool.user.poolReferrerShare ?? 20
        const investorProfit = (totalProfitToSplit * investorSharePerCent) / 100
        const referrerProfit = (totalProfitToSplit * referrerSharePerCent) / 100

        // Prevent decrementing below zero
        const safeInvestorDeduction = Math.min(pool.user.dailyEarningWallet, investorProfit)

        const referrer = pool.user.referrer
        const isManuallyReferred = referrer && referrer.referralCode !== "COMPANY"
        const safeReferrerDeduction = isManuallyReferred && referrer
            ? Math.min(referrer.dailyEarningWallet, referrerProfit)
            : referrerProfit
        const earnerId = isManuallyReferred && referrer ? referrer.id : (companyUser?.id || null)

        // Decrement both timer fields by exactly 24 hours
        const newNextCycleAt = new Date(pool.nextCycleAt.getTime() - CYCLE_MS)
        const newLastCalculatedDate = new Date(pool.lastCalculatedDate.getTime() - CYCLE_MS)

        const operations: any[] = [
            prisma.dailyEarningInvestment.update({
                where: { id: pool.id },
                data: {
                    profitEarned: { decrement: totalProfitToSplit },
                    lastCalculatedDate: newLastCalculatedDate,
                    nextCycleAt: newNextCycleAt
                }
            }),
            prisma.user.update({
                where: { id: pool.userId },
                data: { dailyEarningWallet: { decrement: safeInvestorDeduction } }
            }),
            prisma.transaction.create({
                data: {
                    userId: pool.userId,
                    amount: safeInvestorDeduction,
                    type: "REWARD",
                    status: "FAILED",
                    description: `Admin Rollback (-1 Day): Reversing daily yield. Capped at $${safeInvestorDeduction.toFixed(2)}.`
                }
            })
        ]

        if (earnerId && referrerProfit > 0) {
            if (isManuallyReferred && referrer) {
                operations.push(
                    prisma.user.update({
                        where: { id: earnerId },
                        data: { dailyEarningWallet: { decrement: safeReferrerDeduction } }
                    }),
                    prisma.transaction.create({
                        data: {
                            userId: earnerId,
                            amount: safeReferrerDeduction,
                            type: "COMMISSION",
                            status: "FAILED",
                            description: `Admin Rollback (-1 Day): Reversed referral credit from ${pool.user.email}.`
                        }
                    })
                )
            } else {
                operations.push(
                    prisma.pool.upsert({
                        where: { name: "COMPANY" },
                        update: { balance: { decrement: safeReferrerDeduction } },
                        create: { name: "COMPANY", balance: 0, percentage: 0 }
                    })
                )
            }
        }

        await prisma.$transaction(operations)
        rollbackCount++
    }

    return {
        success: true,
        rollbackCount,
        message: `Successfully executed rollback (-1 Day) across ${rollbackCount} active pools.`
    }
}
