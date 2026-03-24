import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { checkTierUpgrade } from "@/lib/mlm"

/**
 * Spin Wheel API
 * - Uses SpinReward table from DB (admin-configurable labels/values/probabilities)
 * - Weighted random selection based on probability
 * - Free spin: 24h cooldown, requires active account
 * - Premium spin: uses premiumBonusSpins (earned via deposits)
 * - ARN rewards added to arnBalance (and balance at 10:1 ratio)
 * - All ARN earned counts toward tier progress
 */
export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id

        // Parse spin type from request body
        let spinType = "FREE"
        try {
            const body = await req.json()
            spinType = body.type === "PREMIUM" ? "PREMIUM" : "FREE"
        } catch {
            // Default to FREE if no body
        }

        // 1. Fetch User
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { 
                isActiveMember: true, 
                totalDeposit: true,
                lastSpinTime: true,
                lastPremiumSpinTime: true,
                dailySpinCount: true,
                premiumBonusSpins: true,
                tier: true
            }
        })

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        // 2. Enforce Active Status
        if (!user.isActiveMember) {
            return NextResponse.json({ error: "Account must be activated with $1 to spin." }, { status: 403 })
        }

        // 3. Enforce cooldown / spin availability
        if (spinType === "FREE") {
            if (user.lastSpinTime) {
                const now = new Date()
                const diff = now.getTime() - new Date(user.lastSpinTime).getTime()
                const hours = diff / (1000 * 60 * 60)
                
                if (hours < 24) {
                    const remaining = 24 - hours
                    return NextResponse.json({ 
                        error: `Next free spin in ${Math.floor(remaining)}h ${Math.floor((remaining % 1) * 60)}m` 
                    }, { status: 400 })
                }
            }
        } else {
            // PREMIUM spin — requires bonus spins
            if (!user.premiumBonusSpins || user.premiumBonusSpins <= 0) {
                return NextResponse.json({ 
                    error: "No premium spins available. Earn them through deposits." 
                }, { status: 400 })
            }
        }

        // 4. Fetch rewards from DB (admin-configured)
        let dbRewards = await prisma.spinReward.findMany({
            where: { 
                isEnabled: true,
                spinType: spinType
            },
            orderBy: { order: "asc" }
        })

        // Fallback to hardcoded if DB is empty
        if (dbRewards.length === 0) {
            dbRewards = await prisma.spinReward.findMany({
                where: { isEnabled: true },
                orderBy: { order: "asc" }
            })
        }

        if (dbRewards.length === 0) {
            return NextResponse.json({ error: "Spin rewards not configured. Contact admin." }, { status: 500 })
        }

        // 5. Weighted random selection
        const totalProbability = dbRewards.reduce((sum, r) => sum + r.probability, 0)
        let random = Math.random() * totalProbability
        let selectedReward = dbRewards[dbRewards.length - 1] // fallback to last

        for (const reward of dbRewards) {
            random -= reward.probability
            if (random <= 0) {
                selectedReward = reward
                break
            }
        }

        // 6. Calculate what to credit
        let arnToCredit = 0
        let usdToCredit = 0
        let bonusSpinsToAdd = 0
        let description = ""

        switch (selectedReward.type) {
            case "ARN":
                arnToCredit = selectedReward.value
                usdToCredit = selectedReward.value / 10  // 10 ARN = 1 USD
                description = `${spinType} Spin: Won ${selectedReward.value} ARN`
                break
            case "MONEY":
                usdToCredit = selectedReward.value
                arnToCredit = selectedReward.value * 10
                description = `${spinType} Spin: Won $${selectedReward.value.toFixed(2)}`
                break
            case "BONUS_SPIN":
                bonusSpinsToAdd = selectedReward.value
                description = `${spinType} Spin: Won ${selectedReward.value} bonus spins`
                break
            case "SURPRISE":
                // Surprise = random 10-50 ARN
                arnToCredit = Math.floor(Math.random() * 41) + 10
                usdToCredit = arnToCredit / 10
                description = `${spinType} Spin: Surprise gift of ${arnToCredit} ARN!`
                break
            case "TRY_AGAIN":
            case "EMPTY":
                description = `${spinType} Spin: ${selectedReward.label}`
                break
        }

        // 7. Execute transaction
        await prisma.$transaction(async (tx) => {
            // Update spin tracking
            const spinUpdate: any = {}
            if (spinType === "FREE") {
                spinUpdate.lastSpinTime = new Date()
                spinUpdate.dailySpinCount = { increment: 1 }
            } else {
                spinUpdate.lastPremiumSpinTime = new Date()
                spinUpdate.premiumBonusSpins = { decrement: 1 }
            }

            // Add bonus spins if won
            if (bonusSpinsToAdd > 0) {
                spinUpdate.premiumBonusSpins = { 
                    increment: bonusSpinsToAdd - (spinType === "PREMIUM" ? 1 : 0) 
                }
                // If premium spin and won bonus spins, net = bonusSpins - 1 used
                if (spinType === "PREMIUM") {
                    // Already decrementing 1 above, so just increment the won amount
                    spinUpdate.premiumBonusSpins = { increment: bonusSpinsToAdd - 1 }
                }
            }

            await tx.user.update({
                where: { id: userId },
                data: spinUpdate
            })

            // Credit ARN and USD if won something
            if (arnToCredit > 0 || usdToCredit > 0) {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        arnBalance: { increment: arnToCredit },
                        balance: { increment: usdToCredit }
                    }
                })
            }

            // Log transaction
            await tx.transaction.create({
                data: {
                    userId,
                    amount: usdToCredit,
                    arnMinted: arnToCredit,
                    type: spinType === "PREMIUM" ? "PREMIUM_SPIN" : "SPIN_REWARD",
                    status: "COMPLETED",
                    description,
                    method: "SYSTEM"
                }
            })

            // MLM Log
            if (arnToCredit > 0) {
                await tx.mLMLog.create({
                    data: {
                        userId,
                        type: "SPIN_REWARD",
                        amount: arnToCredit,
                        description
                    }
                })
            }
        }, {
            maxWait: 10000,
            timeout: 15000,
        })

        // Check tier upgrade (ARN from spins counts toward tier progress)
        if (arnToCredit > 0) {
            await checkTierUpgrade(userId)
        }

        // Return the reward in the format SpinWheel expects
        return NextResponse.json({ 
            success: true, 
            reward: {
                label: selectedReward.label,
                value: selectedReward.value,
                type: selectedReward.type,
                color: selectedReward.color,
                textColor: selectedReward.textColor,
                probability: selectedReward.probability
            },
            points: arnToCredit,
            message: description
        })

    } catch (error: any) {
        console.error("Spin Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}