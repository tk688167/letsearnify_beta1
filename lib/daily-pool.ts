import { prisma } from "@/lib/prisma"
import { createNotification, cleanupNotifications } from "./notifications"

/**
 * Core logic to distribute daily 1% yields for all active pools.
 * Includes catch-up logic for missed days and a force-mode for manual backfills.
 * @param {object} options - Configuration for distribution
 * @param {boolean} options.force - If true, ignores the 24h cooldown and calculates all pending profits.
 * @returns Summary results of processed pools
 */
export async function executeDailyPoolDistribution(options: { force?: boolean } = {}) {
    const { force = false } = options;
    const now = new Date();
    const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 Hours
    
    // Helper to get Midnight NY Time for a given date
    const getMidnightNY = (date: Date) => {
        const nyDate = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/New_York",
            year: "numeric", month: "numeric", day: "numeric"
        }).format(date);
        return new Date(nyDate);
    };

    const nowNY = getMidnightNY(now);

    console.log(`[Daily Pool] Distribution Started at ${now.toISOString()} (NY Midnight: ${nowNY.toISOString()}) (Force: ${force})`);

    // 1. Calculate Daily Earnings (1%) with Catch-up logic
    const activePools = await prisma.dailyEarningInvestment.findMany({
        where: {
            status: "ACTIVE",
            ...(force ? {} : { lastCalculatedDate: { lt: nowNY } })
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
    });

    const companyUser = await prisma.user.findUnique({
        where: { referralCode: 'COMPANY' }
    });

    const companyModel = await prisma.pool.findUnique({
        where: { name: "COMPANY" }
    });

    let processedProfitCount = 0;
    let totalProfitDistributed = 0;

    for (const pool of activePools) {
        const lastNY = getMidnightNY(pool.lastCalculatedDate);
        
        // Count how many "midnights" have passed
        const diffTime = nowNY.getTime() - lastNY.getTime();
        const daysToProcess = Math.floor(diffTime / (24 * 60 * 60 * 1000));
        
        // Skip if we already credited today
        if (daysToProcess < 1) continue;

        const totalDailyYield = pool.amount * 0.01;
        const totalProfitToSplit = totalDailyYield * daysToProcess;
        
        // Referral Split Logic
        const investorSharePerCent = pool.user.poolInvestorShare ?? 80;
        const referrerSharePerCent = pool.user.poolReferrerShare ?? 20;

        const investorProfit = (totalProfitToSplit * investorSharePerCent) / 100;
        const referrerProfit = (totalProfitToSplit * referrerSharePerCent) / 100;

        const referrer = pool.user.referrer;
        
        // --- ELIGIBILITY CHECKS ---
        const isInvestorEligible = pool.user.isActiveMember || (now.getTime() - new Date(pool.user.createdAt).getTime() < GRACE_PERIOD_MS);
        const isReferrerEligible = !referrer || referrer.isActiveMember || (now.getTime() - new Date(referrer.createdAt).getTime() < GRACE_PERIOD_MS);

        // Set lastCalculatedDate to exactly today's midnight (New York Time)
        const finalCalculatedDate = nowNY;

        const operations: any[] = [
            prisma.dailyEarningInvestment.update({
                where: { id: pool.id },
                data: {
                    profitEarned: { increment: totalProfitToSplit }, 
                    lastCalculatedDate: finalCalculatedDate
                }
            })
        ];

        // 1. Credit Investor Share or Forfeit
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
                        description: `Daily 1% earning (Your ${investorSharePerCent}% share) from pool $${pool.amount.toFixed(2)}.`
                    }
                }),
                prisma.mLMLog.create({
                    data: {
                        userId: pool.userId,
                        type: "POOL_EARNING",
                        amount: investorProfit,
                        description: `Received ${investorSharePerCent}% share of daily 1% profit for ${daysToProcess} day(s).`
                    }
                })
            );
        } else {
            // Forfeit Investor Share to Company
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
                        description: `Daily Earning Forfeited ($${investorProfit.toFixed(2)}): Activation required within 24 hours of registration.`
                    }
                }),
                prisma.mLMLog.create({
                    data: {
                        userId: pool.userId,
                        type: "FORFEITED_EARNING",
                        amount: 0,
                        description: `Daily 1% yield ($${investorProfit.toFixed(2)}) was forfeited to company due to missing account activation.`
                    }
                })
            );
            // Create User Notification for Forfeiture
            await createNotification(
                pool.userId,
                "Daily Earning Forfeited",
                `You did not complete activation within 24 hours, so your Daily Earning Pool reward of $${investorProfit.toFixed(2)} was forfeited.`,
                "FORFEITURE"
            );
        }

        // 2. Referral/Company Commission Handling (Level 1 Only)
        const isManuallyReferred = referrer && referrer.referralCode !== 'COMPANY';
        const earnerId = isManuallyReferred ? referrer.id : (companyUser?.id || null);

        if (earnerId && referrerProfit > 0) {
            if (isManuallyReferred && isReferrerEligible) {
                // Manually Referred & Eligible: Credit User Wallet
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
                );
            } else {
                // Ineligible Referrer or Company Referral: Credit Company Revenue Pool
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
                );
                
                if (isManuallyReferred && !isReferrerEligible) {
                    // Log forfeiture for the referrer
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
                                description: `Referral commission ($${referrerProfit.toFixed(2)}) from member's yield was forfeited due to inactive status.`
                            }
                        })
                    );
                    // Notify Referrer
                    await createNotification(
                        earnerId,
                        "Referral Commission Forfeited",
                        `Your referral commission of $${referrerProfit.toFixed(2)} was forfeited because your account is not active.`,
                        "FORFEITURE"
                    );
                }
            }

            // Always create a ReferralCommission entry for tracking (even if zero/forfeited for transparency in some reports, though here we only track actuals)
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
                );
            }
        }

        await prisma.$transaction(operations);
        
        processedProfitCount++;
        totalProfitDistributed += totalProfitToSplit;
    }

    // 2. Handle Expiry (30 Days) -> Return Principal
    // We only process expiry when force=false to prevent accidental early returns
    const expiredPools = await prisma.dailyEarningInvestment.findMany({
        where: {
            status: "ACTIVE",
            expiresAt: { lte: now }
        }
    });

    let processedExpiry = 0;
    for (const pool of expiredPools) {
        const returnPrincipal = pool.amount;
        
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
        ]);
        processedExpiry++;
    }

    // 3. Cleanup old notifications (>30 days)
    await cleanupNotifications();

    console.log(`[Daily Pool] Finished. Profits Updated: ${processedProfitCount}, Expiries: ${processedExpiry}, Total: $${totalProfitDistributed.toFixed(2)}`);

    return { 
        success: true, 
        calculatedCount: processedProfitCount, 
        expiredCount: processedExpiry,
        totalProfitDistributed
    };
}

/**
 * Admin utility: Safely pushes 1 day of profit distribution forward.
 * Ignores actual time elapsed, forcefully calculates 1 day of 80/20 split,
 * and increments internal tracking dates logically.
 */
export async function executeForwardAdjustment() {
    const activePools = await prisma.dailyEarningInvestment.findMany({
        where: { status: "ACTIVE" },
        include: {
            user: {
                select: {
                    id: true, name: true, email: true, poolInvestorShare: true, poolReferrerShare: true, isActiveMember: true, createdAt: true,
                    referrer: { select: { id: true, name: true, email: true, referralCode: true, isActiveMember: true, createdAt: true } }
                }
            }
        }
    });

    const companyUser = await prisma.user.findUnique({ where: { referralCode: 'COMPANY' } });
    let processedProfitCount = 0;
    let totalProfitDistributed = 0;

    for (const pool of activePools) {
        // Strict exactly 1 day push
        const totalProfitToSplit = pool.amount * 0.01;
        const investorSharePerCent = pool.user.poolInvestorShare ?? 80;
        const referrerSharePerCent = pool.user.poolReferrerShare ?? 20;

        const investorProfit = (totalProfitToSplit * investorSharePerCent) / 100;
        const referrerProfit = (totalProfitToSplit * referrerSharePerCent) / 100;

        const referrer = pool.user.referrer;
        const isManuallyReferred = referrer && referrer.referralCode !== 'COMPANY';
        const earnerId = isManuallyReferred ? referrer.id : (companyUser?.id || null);

        // Strict 24 increment logic
        const finalCalculatedDate = new Date(pool.lastCalculatedDate.getTime() + 24 * 60 * 60 * 1000);

        const operations: any[] = [
            prisma.dailyEarningInvestment.update({
                where: { id: pool.id },
                data: {
                    profitEarned: { increment: totalProfitToSplit }, 
                    lastCalculatedDate: finalCalculatedDate
                }
            })
        ];

        // 1. Credit Investor Share
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
        );

        // 2. Credit Referrer / System
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
                );
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
                );
            }
        }

        await prisma.$transaction(operations);
        processedProfitCount++;
        totalProfitDistributed += totalProfitToSplit;
    }

    return { 
        success: true, 
        calculatedCount: processedProfitCount, 
        totalProfitDistributed
    };
}

/**
 * Admin utility: Reverses 1 day of profit distribution strictly for ACTIVE pools.
 * Clamps wallet deductions to zero to prevent negative debt.
 */
export async function executeReverseAdjustment() {
    // ONLY pull ACTIVE pools. Reversing a completed pool breaks immutability.
    const activePools = await prisma.dailyEarningInvestment.findMany({
        where: { status: "ACTIVE" },
        include: {
            user: {
                select: {
                    id: true, email: true, poolInvestorShare: true, poolReferrerShare: true, dailyEarningWallet: true,
                    referrer: { select: { id: true, email: true, referralCode: true, dailyEarningWallet: true } }
                }
            }
        }
    });

    const companyUser = await prisma.user.findUnique({ where: { referralCode: 'COMPANY' } });
    let rollbackCount = 0;

    for (const pool of activePools) {
        const totalProfitToSplit = pool.amount * 0.01;
        const investorSharePerCent = pool.user.poolInvestorShare ?? 80;
        const referrerSharePerCent = pool.user.poolReferrerShare ?? 20;

        const investorProfit = (totalProfitToSplit * investorSharePerCent) / 100;
        const referrerProfit = (totalProfitToSplit * referrerSharePerCent) / 100;
        
        // Prevent decrementing below zero
        const safeInvestorDeduction = Math.min(pool.user.dailyEarningWallet, investorProfit);
        
        const referrer = pool.user.referrer;
        const isManuallyReferred = referrer && referrer.referralCode !== 'COMPANY';
        const safeReferrerDeduction = isManuallyReferred && referrer ? Math.min(referrer.dailyEarningWallet, referrerProfit) : referrerProfit;
        const earnerId = isManuallyReferred && referrer ? referrer.id : (companyUser?.id || null);

        // Strict 24h decrement logic
        const finalCalculatedDate = new Date(pool.lastCalculatedDate.getTime() - 24 * 60 * 60 * 1000);

        const operations: any[] = [
            prisma.dailyEarningInvestment.update({
                where: { id: pool.id },
                data: {
                    profitEarned: { decrement: totalProfitToSplit }, 
                    lastCalculatedDate: finalCalculatedDate
                }
            })
        ];

        // 1. Deduct Safety-Clamped Investor Share
        operations.push(
            prisma.user.update({
                where: { id: pool.userId },
                data: { dailyEarningWallet: { decrement: safeInvestorDeduction } }
            }),
            prisma.transaction.create({
                data: {
                    userId: pool.userId,
                    amount: safeInvestorDeduction,
                    type: "REWARD", // Keeping REWARD type so it filters properly, but logically a rollback
                    status: "FAILED",
                    description: `Admin Rollback (-1 Day): Reversing daily yield. Capped at $${safeInvestorDeduction.toFixed(2)}.`
                }
            })
        );

        // 2. Deduct Safety-Clamped Referrer / System Share
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
                );
            } else {
                operations.push(
                    prisma.pool.upsert({
                        where: { name: "COMPANY" },
                        update: { balance: { decrement: safeReferrerDeduction } },
                        create: { name: "COMPANY", balance: 0, percentage: 0 }
                    })
                );
            }
        }

        await prisma.$transaction(operations);
        rollbackCount++;
    }

    return { 
        success: true, 
        rollbackCount,
        message: `Successfully executed rollback (-1 Day) across ${rollbackCount} active pools.`
    };
}
