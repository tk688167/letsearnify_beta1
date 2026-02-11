import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { addUserPoints } from "@/lib/mlm"

export async function POST() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id

        // 1. Fetch User Status
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { 
                isActiveMember: true, 
                totalDeposit: true,
                lastSpinTime: true,
                tier: true
            }
        })

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        // 2. Enforce Active Status (Stage 2 Requirement)
        // Must have deposited at least once or be marked active
        if (!user.isActiveMember && (user.totalDeposit < 1.0)) {
            return NextResponse.json({ error: "Account must be activated with $1 deposit to spin." }, { status: 403 })
        }

        // 3. Enforce 24h Cooldown
        if (user.lastSpinTime) {
            const now = new Date()
            const diff = now.getTime() - new Date(user.lastSpinTime).getTime()
            const hours = diff / (1000 * 60 * 60)
            
            if (hours < 24) {
                const remaining = 24 - hours
                return NextResponse.json({ 
                    error: `Next spin available in ${Math.floor(remaining)}h ${Math.floor((remaining % 1) * 60)}m` 
                }, { status: 400 })
            }
        }

        // 4. Calculate Reward (Anti-Gravity Logic)
        // Base range: 5-50 points. Multiplier based on Tier.
        const tierMultipliers: Record<string, number> = {
            NEWBIE: 1,
            BRONZE: 1.2,
            SILVER: 1.5,
            GOLD: 2,
            PLATINUM: 3,
            DIAMOND: 5,
            EMERALD: 10
        }

        const multiplier = tierMultipliers[user.tier] || 1
        const basePoints = Math.floor(Math.random() * (50 - 5 + 1)) + 5 // Random 5-50
        const finalPoints = Math.floor(basePoints * multiplier)

        // 5. Execute Transaction (Atomic)
        await prisma.$transaction(async (tx) => {
            // Update User
            await tx.user.update({
                where: { id: userId },
                data: { 
                    lastSpinTime: new Date()
                    // Points updated via helper below, but we need to do it here or call helper
                }
            })

            // Add Points (Triggers Tier Check internally if used via lib, but here we do manually to be safe in tx)
            // actually we can just update here.
            await tx.user.update({
                where: { id: userId },
                data: { arnBalance: { increment: finalPoints } }
            })

            // Log Transaction
            await tx.transaction.create({
                data: {
                    userId,
                    amount: finalPoints,
                    type: "REWARD_ARN", // Special Type
                    status: "COMPLETED",
                    description: `Daily Spin Reward (${user.tier} Tier)`,
                    method: "SYSTEM"
                }
            })
        })
        
        // Trigger Tier Check (Async, non-blocking for response)
        // We can't await this inside the transaction easily if it uses `prisma` global. 
        // We'll call it fire-and-forget or await it here.
        await addUserPoints(userId, 0) // Just to trigger check, 0 points added.

        return NextResponse.json({ success: true, points: finalPoints })

    } catch (error: any) {
        console.error("Spin Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
