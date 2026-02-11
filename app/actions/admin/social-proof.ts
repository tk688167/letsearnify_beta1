"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

// --- STATS MANAGEMENT ---

export async function getSocialProofStats() {
    try {
        // Parallel Usage of Prisma Aggregations
        const [userCount, activeCount, depositSum, payoutSum] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { isActiveMember: true } }),
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { type: "DEPOSIT", status: "COMPLETED" }
            }),
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { type: "WITHDRAWAL", status: "COMPLETED" }
            })
        ])

        return {
            totalUsers: userCount,
            totalDeposited: depositSum._sum.amount || 0,
            totalPayouts: payoutSum._sum.amount || 0,
            activeOnline: activeCount, // Using 'activeOnline' key to maintain frontend compatibility
            updatedAt: new Date()
        }
    } catch (error) {
        console.error("DB Stats Aggregation Failed:", error)
        return {
            totalUsers: 0,
            totalDeposited: 0,
            totalPayouts: 0,
            activeOnline: 0,
            updatedAt: new Date()
        }
    }
}

// Previously updateSocialProofStats - Removed as stats are now auto-calculated.
// Keeping a dummy function or just removing it? Removing it is cleaner, but need to check usage in client.
// I will verify client usage next and remove the call there.


// --- ANALYTICS HISTORY ---

export async function getAnalyticsHistory() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return null

    try {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const [users, transactions] = await Promise.all([
            prisma.user.findMany({
                where: { createdAt: { gte: thirtyDaysAgo } },
                select: { createdAt: true }
            }),
            prisma.transaction.findMany({
                where: { 
                    createdAt: { gte: thirtyDaysAgo },
                    status: "COMPLETED"
                },
                select: { createdAt: true, type: true, amount: true }
            })
        ])

        // Helper to format date as YYYY-MM-DD
        const formatDate = (date: Date) => date.toISOString().split('T')[0]

        // Initialize Map for last 30 days
        const historyMap = new Map<string, { users: number, deposits: number, payouts: number }>()
        for (let i = 0; i < 30; i++) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            historyMap.set(formatDate(d), { users: 0, deposits: 0, payouts: 0 })
        }

        // Fill Data
        users.forEach(u => {
            const date = formatDate(u.createdAt)
            if (historyMap.has(date)) {
                historyMap.get(date)!.users += 1
            }
        })

        transactions.forEach(t => {
            const date = formatDate(t.createdAt)
            if (historyMap.has(date)) {
                const entry = historyMap.get(date)!
                if (t.type === "DEPOSIT") entry.deposits += t.amount
                else if (t.type === "WITHDRAWAL") entry.payouts += t.amount
            }
        })

        // Convert to Array and Sort by Date Ascending
        const history = Array.from(historyMap.entries())
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date))

        return history
    } catch (error) {
        console.error("Failed to fetch analytics history:", error)
        return []
    }
}

// --- ACTIVITY LOGS ---

export async function getRecentActivity() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return []

    try {
        const [users, transactions] = await Promise.all([
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, name: true, email: true, createdAt: true }
            }),
            prisma.transaction.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } },
                where: { status: "COMPLETED" } 
            })
        ])

        // Combine and format
        const activity = [
            ...users.map(u => ({
                id: `join-${u.id}`,
                type: 'USER_JOIN',
                description: `New user joined: ${u.name} (${u.email})`,
                date: u.createdAt,
                amount: null
            })),
            ...transactions.map(t => ({
                id: `tx-${t.id}`,
                type: t.type, // DEPOSIT or WITHDRAWAL
                description: `${t.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'} approved for ${t.user.name}`,
                date: t.createdAt,
                amount: t.amount
            }))
        ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10)

        return activity
    } catch (error) {
        console.error("Failed to fetch activity:", error)
        return []
    }
}

// --- PAYOUT PROOF MANAGEMENT ---

export async function getPayoutProofs() {
    try {
        return await prisma.payoutProof.findMany({
            orderBy: { date: 'desc' }
        })
    } catch (error) {
        console.error("DB Connection Failed (Payout Proofs):", error)
        return [] // Return empty array so page doesn't crash
    }
}

export async function addPayoutProof(data: {
    imageUrl: string,
    amount: number,
    userName: string,
    method: string
}) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized", success: false }
    }

    try {
        await prisma.payoutProof.create({
            data: {
                imageUrl: data.imageUrl,
                amount: data.amount,
                userName: data.userName,
                method: data.method,
                date: new Date()
            }
        })
        
        revalidatePath("/")
        revalidatePath("/dashboard/welcome")
        return { success: true }
    } catch (error) {
        console.error("Failed to add proof:", error)
        return { error: "Failed to add proof", success: false }
    }
}

export async function deletePayoutProof(id: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized", success: false }
    }

    try {
        await prisma.payoutProof.delete({
            where: { id }
        })
        
        revalidatePath("/")
        revalidatePath("/dashboard/welcome")
        return { success: true }

    } catch (error) {
        return { error: "Failed to delete", success: false }
    }
}
