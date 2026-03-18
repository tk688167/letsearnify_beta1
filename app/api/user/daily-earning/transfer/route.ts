import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, direction = "MAIN_TO_DAILY" } = await req.json()

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid transfer amount" }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { balance: true, dailyEarningWallet: true }
      })

      if (!user) throw new Error("User not found")

      if (direction === "MAIN_TO_DAILY") {
        if (user.balance < amount) throw new Error("Insufficient main wallet balance")
        
        const updated = await tx.user.update({
          where: { id: session.user.id },
          data: {
            balance: { decrement: amount },
            dailyEarningWallet: { increment: amount }
          }
        })

        await tx.transaction.create({
          data: {
            userId: session.user.id,
            type: "INTERNAL_TRANSFER",
            amount: amount,
            status: "COMPLETED",
            description: `Transferred $${amount.toFixed(2)} to Daily Earning Wallet`
          }
        })
        return updated
      } else {
        if (user.dailyEarningWallet < amount) throw new Error("Insufficient daily earning wallet balance")

        const updated = await tx.user.update({
          where: { id: session.user.id },
          data: {
            balance: { increment: amount },
            dailyEarningWallet: { decrement: amount }
          }
        })

        await tx.transaction.create({
          data: {
            userId: session.user.id,
            type: "INTERNAL_TRANSFER",
            amount: amount,
            status: "COMPLETED",
            description: `Transferred $${amount.toFixed(2)} to Main Wallet`
          }
        })
        return updated
      }
    })

    return NextResponse.json({ 
      success: true, 
      newMainBalance: result.balance,
      newDailyWallet: result.dailyEarningWallet
    })

  } catch (error: any) {
    console.error("Internal Transfer Error:", error)
    return NextResponse.json({ error: error.message || "Transfer failed" }, { status: 500 })
  }
}
