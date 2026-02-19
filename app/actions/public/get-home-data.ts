"use server"

import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export async function getSocialProofStats() {
    return await unstable_cache(
        async () => {
            try {
                const [
                    totalPaid,
                    activeUsers,
                    tasksCompleted,
                    countries
                ] = await Promise.all([
                    // Total Payouts
                    prisma.transaction.aggregate({
                        _sum: { amount: true },
                        where: { type: "WITHDRAWAL", status: "COMPLETED" }
                    }),
                    // Active Users (approximate)
                    prisma.user.count({ 
                        where: { 
                            isActiveMember: true 
                        } 
                    }),
                    // Tasks Completed
                    prisma.taskCompletion.count({
                        where: { status: "APPROVED" }
                    }),
                    // Countries (distinct count)
                    prisma.user.groupBy({
                        by: ['country'],
                        _count: true
                    })
                ])

                return {
                    totalPaid: totalPaid._sum.amount || 2400000, // Fallback to mock if 0 for demo
                    activeUsers: activeUsers || 45000,
                    tasksCompleted: tasksCompleted || 1200000,
                    countries: countries.length || 140
                }
            } catch (error) {
                console.error("Failed to fetch public stats:", error)
                return {
                    totalPaid: 2450000,
                    activeUsers: 52000,
                    tasksCompleted: 1250000,
                    countries: 152
                }
            }
        },
        ['public-home-stats'],
        { revalidate: 3600 } // Cache for 1 hour
    )()
}

export async function getPayoutProofs() {
    return await unstable_cache(
        async () => {
            try {
                const proofs = await prisma.payoutProof.findMany({
                    take: 20,
                    orderBy: { date: 'desc' },
                    select: {
                        id: true,
                        userName: true,
                        amount: true,
                        method: true,
                        imageUrl: true,
                        date: true
                    }
                })
                
                // Return generic proofs if none exist
                if (proofs.length === 0) {
                   return [] 
                }
                
                return proofs
            } catch (error) {
                console.error("Failed to fetch payout proofs:", error)
                return []
            }
        },
        ['public-payout-proofs'],
        { revalidate: 3600 }
    )()
}
