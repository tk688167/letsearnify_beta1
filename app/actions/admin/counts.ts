"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export interface PendingCounts {
  deposits: number
  withdrawals: number
}

export async function getPendingCounts(): Promise<PendingCounts> {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return { deposits: 0, withdrawals: 0 }
  }

  try {
    const [deposits, withdrawals] = await Promise.all([
      prisma.transaction.count({
        where: {
          type: "DEPOSIT",
          status: "PENDING",
          method: { startsWith: "TRC20" }
        }
      }),
      prisma.transaction.count({
        where: {
          type: "WITHDRAWAL",
          status: "PENDING"
        }
      })
    ])

    return { deposits, withdrawals }
  } catch (error) {
    console.error("Failed to fetch pending counts:", error)
    return { deposits: 0, withdrawals: 0 }
  }
}
