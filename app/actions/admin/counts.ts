"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export interface PendingCounts {
  deposits: number
  withdrawals: number
  merchantDeposits: number
}

export async function getPendingCounts(): Promise<PendingCounts> {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return { deposits: 0, withdrawals: 0, merchantDeposits: 0 }
    }

    const [deposits, withdrawals, merchantDeposits] = await Promise.all([
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
      }),
      prisma.merchantTransaction.count({
        where: {
          status: "PENDING"
        }
      })
    ])

    return { deposits, withdrawals, merchantDeposits }
  } catch (error) {
    console.error("Failed to fetch pending counts:", error)
    return { deposits: 0, withdrawals: 0, merchantDeposits: 0 }
  }
}