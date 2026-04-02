// ============================================================
// FILE: app/actions/spin.ts  (REPLACE)
// FIXES:
//   1. Removed deterministic logic — now truly random every spin
//   2. Creates Transaction record so wins show in wallet history
//   3. All rewards properly reflect in dashboard/wallet
// ============================================================

"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { addUserPoints } from "@/lib/mlm"
import { FREE_REWARDS, PREMIUM_REWARDS, SpinReward } from "@/lib/spin-config"
import { getSpinSettings } from "@/app/actions/admin/spin-rewards"
import { cookies } from "next/headers"

export async function executeSpin(type: "FREE" | "PREMIUM") {
    try {
        const session = await auth()
        if (!session?.user?.id) return { success: false, message: "Session expired. Please log in again." }
        
        const userId = session.user.id
        
        // Fetch User & Rewards & Settings safely
        const [user, dbRewards, spinSettings] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { 
                    id: true, 
                    createdAt: true,
                    lastSpinTime: true, 
                    lastPremiumSpinTime: true,
                    dailySpinCount: true, 
                    premiumBonusSpins: true,
                    lastSurpriseDate: true,
                    isActiveMember: true,
                    arnBalance: true,
                    balance: true
                }
            }).catch(e => {
                console.error("User fetch error in executeSpin:", e)
                return null
            }),
            prisma.spinReward.findMany({
                where: { spinType: type, isEnabled: true },
                orderBy: { order: "asc" }
            }).catch(e => {
                console.error("Rewards fetch error in executeSpin:", e)
                return [] as any[]
            }),
            getSpinSettings()
        ])
        
        let userRecord = user;
        if (!userRecord && userId === "super-admin-id") {
            const cookieStore = await cookies();
            const adminLastSpin = cookieStore.get("admin_lastSpinTime")?.value;
            const adminLastPremium = cookieStore.get("admin_lastPremiumSpinTime")?.value;

            userRecord = {
                id: userId,
                createdAt: new Date(),
                lastSpinTime: adminLastSpin ? new Date(adminLastSpin) : null,
                lastPremiumSpinTime: adminLastPremium ? new Date(adminLastPremium) : null,
                dailySpinCount: 0,
                premiumBonusSpins: 0,
                lastSurpriseDate: null,
                isActiveMember: true,
                arnBalance: 1000,
                balance: 5000.0
            } as any;
        }

        if (!userRecord) return { success: false, message: "User account not recognized. Please re-login." }

        // 1. Cooldown Checks (Server Side)
        const now = new Date()
        
        if (type === "FREE") {
            const lastSpin = userRecord.lastSpinTime ? new Date(userRecord.lastSpinTime) : null
            
            if (lastSpin) {
                const diffMs = now.getTime() - lastSpin.getTime()
                const diffHours = diffMs / (1000 * 60 * 60)
                
                if (diffHours < spinSettings.freeSpinCooldownHours) {
                     const remainingHours = Math.ceil(spinSettings.freeSpinCooldownHours - diffHours)
                     return { success: false, message: `Cooling down! Come back in ${remainingHours} hours.` }
                }
            }
        } else if (type === "PREMIUM") {
            if (!userRecord.isActiveMember) {
                return { success: false, message: `Unlock Premium Spins by activating elite membership in your wallet.` }
            }
            
            const lastPremiumSpin = userRecord.lastPremiumSpinTime ? new Date(userRecord.lastPremiumSpinTime) : null
            
            if (lastPremiumSpin) {
                const diffMs = now.getTime() - lastPremiumSpin.getTime()
                const diffHours = diffMs / (1000 * 60 * 60)
                
                if (diffHours < spinSettings.premiumSpinCooldownHours) {
                    if (userRecord.premiumBonusSpins > 0) {
                        // Use bonus spin — allow through
                    } else {
                         const remainingHours = Math.ceil(spinSettings.premiumSpinCooldownHours - diffHours)
                         return { success: false, message: `Premium Wheel refreshing! Come back in ${remainingHours} hours.` }
                    }
                }
            }
        }

        // 2. Load rewards (DB overrides defaults)
        let rewards: SpinReward[] = dbRewards.length > 0 ? dbRewards.map(r => ({
            ...r,
            type: r.type as any,
            textColor: r.textColor || undefined
        })) : (type === "FREE" ? FREE_REWARDS : PREMIUM_REWARDS)
        
        if (rewards.length === 0) {
            return { success: false, message: "No active rewards configured for this wheel." }
        }

        // A. Newbie Welcome Bonus
        if (type === "FREE") {
            const createdAt = new Date(userRecord.createdAt) 
            const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
            
            if (daysSinceCreation <= spinSettings.welcomeBonusDays) {
                rewards = rewards.filter(r => r.type !== "EMPTY" && r.type !== "TRY_AGAIN")
            }
        }

        let selectedReward: SpinReward | undefined

        // B. Monthly Surprise Logic
        const lastSurprise = userRecord.lastSurpriseDate ? new Date(userRecord.lastSurpriseDate) : null
        let forceSurprise = false
        if (!lastSurprise || (Date.now() - lastSurprise.getTime()) > (spinSettings.surpriseGiftIntervalDays * 24 * 60 * 60 * 1000)) {
            if (Math.random() < 0.2) forceSurprise = true
        }

        if (forceSurprise) {
            selectedReward = rewards.find(r => r.type === "SURPRISE")
        }

        if (!selectedReward) {
            const rand = Math.random()
            let cumulative = 0
            const totalProb = rewards.reduce((sum, r) => sum + r.probability, 0)
            const normalize = totalProb > 0 ? 1 / totalProb : 1

            for (const reward of rewards) {
                cumulative += reward.probability * normalize
                if (rand < cumulative) {
                    selectedReward = reward
                    break
                }
            }
        }
        
        if (!selectedReward) selectedReward = rewards[rewards.length - 1]

        // 3. Apply Rewards
        if (userId === "super-admin-id") {
            const cookieStore = await cookies();
            if (type === "FREE") {
                cookieStore.set("admin_lastSpinTime", new Date().toISOString());
            } else if (type === "PREMIUM") {
                cookieStore.set("admin_lastPremiumSpinTime", new Date().toISOString());
            }
            revalidatePath("/dashboard/spin")
            
            const cooldownHours = type === "FREE" ? spinSettings.freeSpinCooldownHours : spinSettings.premiumSpinCooldownHours
            const nextSpinTime = now.getTime() + (cooldownHours * 60 * 60 * 1000)
            
            return { success: true, reward: selectedReward, message: `[ADMIN SIM] You won ${selectedReward.label}!`, nextSpinTime }
        }

        let logDescription = `Won ${selectedReward.label} in ${type} Spin`
        let earnedAmount = 0
        let earnedArn = 0

        await prisma.$transaction(async (tx) => {
            if (selectedReward!.type === "ARN") {
                 earnedArn = selectedReward!.value
                 earnedAmount = selectedReward!.value / 10 
                 await tx.user.update({
                     where: { id: userId },
                     data: { 
                         arnBalance: { increment: earnedArn },
                         balance: { increment: earnedAmount }
                     }
                 })
            } else if (selectedReward!.type === "MONEY") {
                 earnedAmount = selectedReward!.value
                 earnedArn = selectedReward!.value * 10
                 await tx.user.update({
                     where: { id: userId },
                     data: { 
                         balance: { increment: earnedAmount },
                         arnBalance: { increment: earnedArn }
                     }
                 })
            } else if (selectedReward!.type === "BONUS_SPIN") {
                 await tx.user.update({
                     where: { id: userId },
                     data: { premiumBonusSpins: { increment: selectedReward!.value } }
                 })
            } else if (selectedReward!.type === "SURPRISE") {
                 const giftType = Math.random() > 0.5 ? "ARN" : "MONEY"
                 const giftValue = giftType === "ARN" ? 25 : 0.50
                 if (giftType === "ARN") {
                     earnedArn = giftValue
                     earnedAmount = giftValue / 10
                     await tx.user.update({ where: { id: userId }, data: { 
                         arnBalance: { increment: earnedArn },
                         balance: { increment: earnedAmount }
                     }})
                 } else {
                     earnedAmount = giftValue
                     earnedArn = giftValue * 10
                     await tx.user.update({ where: { id: userId }, data: { 
                         balance: { increment: earnedAmount },
                         arnBalance: { increment: earnedArn }
                     }})
                 }
                 logDescription = `Won SURPRISE GIFT (${giftType}: ${giftValue})`
                 await tx.user.update({ where: { id: userId }, data: { lastSurpriseDate: new Date() } })
            }

            if (earnedAmount > 0 || earnedArn > 0) {
                await tx.transaction.create({
                    data: {
                        userId,
                        amount: earnedAmount,
                        arnMinted: earnedArn,
                        type: "REWARD",
                        status: "COMPLETED",
                        method: "SPIN",
                        description: logDescription
                    }
                })
            }
            
            const updateData: any = {}
            if (type === "FREE") {
                 updateData.lastSpinTime = new Date()
                 updateData.dailySpinCount = { increment: 1 }
            } else if (type === "PREMIUM") {
                 const lastPremiumSpin = userRecord!.lastPremiumSpinTime ? new Date(userRecord!.lastPremiumSpinTime) : null
                 const diffHours = lastPremiumSpin ? (now.getTime() - lastPremiumSpin.getTime()) / (1000 * 60 * 60) : 999
                 if (diffHours >= spinSettings.premiumSpinCooldownHours) {
                     updateData.lastPremiumSpinTime = new Date()
                 } else {
                     updateData.premiumBonusSpins = { decrement: 1 }
                 }
            }

            await tx.user.update({ where: { id: userId }, data: updateData })
            await tx.mLMLog.create({
                data: {
                    userId,
                    type: "SPIN_REWARD",
                    amount: selectedReward!.value,
                    description: logDescription
                }
            })
        })

        revalidatePath("/dashboard/spin")
        revalidatePath("/dashboard")
        revalidatePath("/dashboard/wallet")
        
        const cooldownHours = type === "FREE" ? spinSettings.freeSpinCooldownHours : spinSettings.premiumSpinCooldownHours
        const nextSpinTime = now.getTime() + (cooldownHours * 60 * 60 * 1000)
        
        return { success: true, reward: selectedReward, message: `You won ${selectedReward.label}!`, nextSpinTime }

    } catch (e: any) {
        console.error("Spin Execution Error:", e)
        return { success: false, message: e.message || "Database connection interrupted. Your spin was not recorded, please try again." }
    }
}