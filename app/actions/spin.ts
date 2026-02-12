"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { addUserPoints } from "@/lib/mlm"
import { FREE_REWARDS, PREMIUM_REWARDS, SpinReward } from "@/lib/spin-config"
import { getSpinSettings } from "@/app/actions/admin/spin-rewards"

export async function executeSpin(type: "FREE" | "PREMIUM") {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")
    
    const userId = session.user.id
    
    // Fetch User & Rewards & Settings in Parallel
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
        }),
        prisma.spinReward.findMany({
            where: { spinType: type, isEnabled: true },
            orderBy: { order: "asc" }
        }),
        getSpinSettings()
    ])
    
    if (!user) throw new Error("User not found")

    // 1. Cooldown Checks (Server Side)
    const now = new Date()
    
    if (type === "FREE") {
        const lastSpin = user.lastSpinTime ? new Date(user.lastSpinTime) : null
        
        // Dynamic Cooldown Check
        if (lastSpin) {
            const diffMs = now.getTime() - lastSpin.getTime()
            const diffHours = diffMs / (1000 * 60 * 60)
            
            if (diffHours < spinSettings.freeSpinCooldownHours) {
                 const remainingHours = Math.ceil(spinSettings.freeSpinCooldownHours - diffHours)
                 return { success: false, message: `Cooling down! Come back in ${remainingHours} hours.` }
            }
        }
    } else if (type === "PREMIUM") {
        // Dynamic Unlock Check (Active Member Logic usually handles this, but let's be safe if we want to change logic later)
        if (!user.isActiveMember) {
             // In future, could check totalDeposit >= spinSettings.premiumUnlockAmount specifically
            return { success: false, message: `Unlock Premium Spins by depositing at least $${spinSettings.premiumUnlockAmount}.` }
        }
        
        // Dynamic 24h Cooldown Check
        const lastPremiumSpin = user.lastPremiumSpinTime ? new Date(user.lastPremiumSpinTime) : null
        
        if (lastPremiumSpin) {
            const diffMs = now.getTime() - lastPremiumSpin.getTime()
            const diffHours = diffMs / (1000 * 60 * 60)
            
            if (diffHours < spinSettings.premiumSpinCooldownHours) {
                if (user.premiumBonusSpins > 0) {
                    // Use bonus spin
                } else {
                     const remainingHours = Math.ceil(spinSettings.premiumSpinCooldownHours - diffHours)
                     return { success: false, message: `Premium Wheel refreshing! Come back in ${remainingHours} hours.` }
                }
            }
        }
    }

    // 2. Smart Reward Logic
    let rewards: SpinReward[] = dbRewards.length > 0 ? dbRewards.map(r => ({
        ...r,
        type: r.type as any,
        textColor: r.textColor || undefined
    })) : (type === "FREE" ? FREE_REWARDS : PREMIUM_REWARDS)
    
    // A. Newbie Logic (First X Days -> Better Odds)
    if (type === "FREE") {
        const createdAt = new Date(user.createdAt) 
        const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        
        if (daysSinceCreation <= spinSettings.welcomeBonusDays) {
            rewards = rewards.filter(r => r.type !== "EMPTY" && r.type !== "TRY_AGAIN")
        }
    }

    // B. Monthly Surprise Logic (Dynamic Interval)
    const lastSurprise = user.lastSurpriseDate ? new Date(user.lastSurpriseDate) : null
    let forceSurprise = false
    
    if (!lastSurprise || (Date.now() - lastSurprise.getTime()) > (spinSettings.surpriseGiftIntervalDays * 24 * 60 * 60 * 1000)) {
        if (Math.random() < 0.2) { 
             forceSurprise = true
        }
    }

    // RNG Selection
    let selectedReward: SpinReward | undefined
    
    if (forceSurprise) {
        selectedReward = rewards.find(r => r.type === "SURPRISE")
    }

    if (!selectedReward) {
        // Standard Weighted RNG
        const rand = Math.random()
        let cumulative = 0
        
        // Normalize probabilities if we filtered the list (for Newbies)
        const totalProb = rewards.reduce((sum, r) => sum + r.probability, 0)
        const normalize = 1 / totalProb

        for (const reward of rewards) {
            cumulative += reward.probability * normalize
            if (rand < cumulative) {
                selectedReward = reward
                break
            }
        }
    }
    
    if (!selectedReward) selectedReward = rewards[rewards.length - 1] // Fallback

    // Apply Rewards
    try {
        let logDescription = `Won ${selectedReward.label} in ${type} Spin`

        if (selectedReward.type === "ARN") {
             await addUserPoints(userId, selectedReward.value)
        } else if (selectedReward.type === "MONEY") {
             await prisma.user.update({
                 where: { id: userId },
                 data: { balance: { increment: selectedReward.value } }
             })
        } else if (selectedReward.type === "BONUS_SPIN") {
             await prisma.user.update({
                 where: { id: userId },
                 data: { premiumBonusSpins: { increment: selectedReward.value } }
             })
        } else if (selectedReward.type === "SURPRISE") {
             // Handle Surprise: Give a chunk of ARN or Money
             // Implementation: Random gift
             const giftType = Math.random() > 0.5 ? "ARN" : "MONEY"
             const giftValue = giftType === "ARN" ? 25 : 0.50
             
             if (giftType === "ARN") await addUserPoints(userId, giftValue)
             else await prisma.user.update({ where: { id: userId }, data: { balance: { increment: giftValue } }})
             
             logDescription = `Won SURPRISE GIFT (${giftType}: ${giftValue})`
             
             // Update lastSurpriseDate
             await prisma.user.update({
                 where: { id: userId },
                 data: { lastSurpriseDate: new Date() }
             })
        }
        
        // Update User State (Cooldowns / Counts)
        const updateData: any = {}
        if (type === "FREE") {
             updateData.lastSpinTime = new Date()
             updateData.dailySpinCount = { increment: 1 }
        } else if (type === "PREMIUM") {
             // Independent tracking: Use lastPremiumSpinTime
             // Only decrement bonus spins if we used one (bypass logic), otherwise just set timer
             const lastPremiumSpin = user.lastPremiumSpinTime ? new Date(user.lastPremiumSpinTime) : null
             const diffHours = lastPremiumSpin ? (now.getTime() - lastPremiumSpin.getTime()) / (1000 * 60 * 60) : 999
             
             if (diffHours >= spinSettings.premiumSpinCooldownHours) {
                 // Used Daily Spin
                 updateData.lastPremiumSpinTime = new Date()
             } else {
                 // Used Bonus Spin
                 updateData.premiumBonusSpins = { decrement: 1 }
             }
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData
        })
        
        // Log Activity
        await prisma.mLMLog.create({
            data: {
                userId,
                type: "SPIN_REWARD",
                amount: selectedReward.value,
                description: logDescription
            }
        })

        revalidatePath("/dashboard/spin")
        return { success: true, reward: selectedReward, message: `You won ${selectedReward.label}!` }

    } catch (e) {
        console.error("Spin Error:", e)
        return { success: false, message: "Spin failed. Please try again." }
    }
}
