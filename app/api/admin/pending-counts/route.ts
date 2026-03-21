import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ deposits: 0, withdrawals: 0, merchantDeposits: 0 })
    }

    const [deposits, withdrawals, merchantDeposits] = await Promise.all([
      prisma.transaction.count({ where: { type: "DEPOSIT", status: "PENDING" } }),
      prisma.transaction.count({ where: { type: "WITHDRAWAL", status: "PENDING" } }),
      prisma.merchantTransaction.count({ where: { status: "PENDING" } }),
    ])

    return NextResponse.json({ deposits, withdrawals, merchantDeposits })
  } catch (error) {
    console.error("Pending counts error:", error)
    return NextResponse.json({ deposits: 0, withdrawals: 0, merchantDeposits: 0 })
  }
}