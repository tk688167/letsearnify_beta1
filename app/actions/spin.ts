"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { addUserPoints } from "@/lib/mlm"
import { FREE_REWARDS, PREMIUM_REWARDS, SpinReward } from "@/lib/spin-config"
import { getSpinSettings } from "@/app/actions/admin/spin-rewards"
import { cookies } from "next/headers"

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

    if (!userRecord) throw new Error("User not found")

    // 1. Cooldown Checks (Server Side)
    const now = new Date()
    
    if (type === "FREE") {
        const lastSpin = userRecord.lastSpinTime ? new Date(userRecord.lastSpinTime) : null
        
        // Dynamic Cooldown Check (Hardcoded to 24 hours for FREE spins)
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
            return { success: false, message: `Unlock Premium Spins by depositing at least $${spinSettings.premiumUnlockAmount}.` }
        }
        
        const lastPremiumSpin = userRecord.lastPremiumSpinTime ? new Date(userRecord.lastPremiumSpinTime) : null
        
        if (lastPremiumSpin) {
            const diffMs = now.getTime() - lastPremiumSpin.getTime()
            const diffHours = diffMs / (1000 * 60 * 60)
            
            if (diffHours < spinSettings.premiumSpinCooldownHours) {
                if (userRecord.premiumBonusSpins > 0) {
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
    
    // A. Newbie Logic
    if (type === "FREE") {
        const createdAt = new Date(userRecord.createdAt) 
        const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        
        if (daysSinceCreation <= spinSettings.welcomeBonusDays) {
            rewards = rewards.filter(r => r.type !== "EMPTY" && r.type !== "TRY_AGAIN")
        }
    }

    // B. Monthly Surprise Logic
    const lastSurprise = userRecord.lastSurpriseDate ? new Date(userRecord.lastSurpriseDate) : null
    let forceSurprise = false
    
    if (!lastSurprise || (Date.now() - lastSurprise.getTime()) > (spinSettings.surpriseGiftIntervalDays * 24 * 60 * 60 * 1000)) {
        if (Math.random() < 0.2) { 
             forceSurprise = true
        }
    }

    // RNG Selection / Deterministic Selection
    let selectedReward: SpinReward | undefined
    if (forceSurprise) {
        selectedReward = rewards.find(r => r.type === "SURPRISE")
    }

    if (!selectedReward) {
        if (type === "FREE") {
            // Apply deterministic, controlled logic for FREE spins based on existing spin history
            const spinCount = userRecord.dailySpinCount; // Tracks total free spins explicitly
            
            // "Good" rewards are ARN rewards
            const goodRewards = rewards.filter(r => r.type === "ARN");
            // "Bad" rewards are TRY_AGAIN (yielding 0 points)
            const badRewards = rewards.filter(r => r.type === "TRY_AGAIN");

            // For the first two spins (0, 1), give a reasonably good reward (e.g. 5 ARN or 7 ARN)
            if (spinCount < 2) {
                // Ensure good rewards exist as fallback
                if (goodRewards.length > 0) {
                     // Prefer the lower values between 5 and 7 ARN
                     const fiveArn = goodRewards.find(r => r.value === 5)
                     const sevenArn = goodRewards.find(r => r.value === 7)
                     
                     if (spinCount === 0 && fiveArn) selectedReward = fiveArn;
                     else if (spinCount === 1 && sevenArn) selectedReward = sevenArn;
                     else selectedReward = goodRewards[0]; // fallback
                }
            } else {
                // Cycle: 1 Good Spin followed by 2 Bad Spins
                // Pattern starting from spinCount 2: 
                // spinCount 2: (2-2)%3 = 0 -> Good
                // spinCount 3: (3-2)%3 = 1 -> Bad
                // spinCount 4: (4-2)%3 = 2 -> Bad
                const cyclePosition = (spinCount - 2) % 3;

                if (cyclePosition === 0 && goodRewards.length > 0) {
                     // Prefer lower ARNs for "Good" outcome to not break bank
                     const lowArn = goodRewards.find(r => r.value <= 7);
                     selectedReward = lowArn || goodRewards[0];
                } else if (badRewards.length > 0) {
                     selectedReward = badRewards[0]; // "Try Again"
                }
            }
        }

        // Standard probability RNG if deterministic logic didn't hit or it's PREMIUM
        if (!selectedReward) {
            const rand = Math.random()
            let cumulative = 0
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
    }
    
    if (!selectedReward) selectedReward = rewards[rewards.length - 1]

    // Apply Rewards
    try {
        if (userId === "super-admin-id") {
            const cookieStore = await cookies();
            if (type === "FREE") {
                cookieStore.set("admin_lastSpinTime", new Date().toISOString());
            } else if (type === "PREMIUM") {
                cookieStore.set("admin_lastPremiumSpinTime", new Date().toISOString());
            }
            revalidatePath("/dashboard/spin")
            return { success: true, reward: selectedReward, message: `[ADMIN SIM] You won ${selectedReward.label}!` }
        }

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
             const giftType = Math.random() > 0.5 ? "ARN" : "MONEY"
             const giftValue = giftType === "ARN" ? 25 : 0.50
             
             if (giftType === "ARN") await addUserPoints(userId, giftValue)
             else await prisma.user.update({ where: { id: userId }, data: { balance: { increment: giftValue } }})
             
             logDescription = `Won SURPRISE GIFT (${giftType}: ${giftValue})`
             
             await prisma.user.update({
                 where: { id: userId },
                 data: { lastSurpriseDate: new Date() }
             })
        }
        
        const updateData: any = {}
        if (type === "FREE") {
             updateData.lastSpinTime = new Date()
             updateData.dailySpinCount = { increment: 1 }
        } else if (type === "PREMIUM") {
             const lastPremiumSpin = userRecord.lastPremiumSpinTime ? new Date(userRecord.lastPremiumSpinTime) : null
             const diffHours = lastPremiumSpin ? (now.getTime() - lastPremiumSpin.getTime()) / (1000 * 60 * 60) : 999
             
             if (diffHours >= spinSettings.premiumSpinCooldownHours) {
                 updateData.lastPremiumSpinTime = new Date()
             } else {
                 updateData.premiumBonusSpins = { decrement: 1 }
             }
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData
        })
        
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
