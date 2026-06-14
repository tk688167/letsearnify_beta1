
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testInvestment() {
  const userId = "test-user-id" // Replace with a real user ID if possible, or create one
  const amount = 1.0

  try {
    // Create test user if not exists
    await prisma.user.upsert({
      where: { id: userId },
      update: { dailyEarningWallet: 100 },
      create: { 
        id: userId, 
        email: "test@example.com", 
        name: "Test User",
        dailyEarningWallet: 100 
      }
    })

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const nextCycleAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    console.log("Starting transaction...")
    const result = await prisma.$transaction(async (tx) => {
      console.log("Deducting from wallet...")
      await tx.user.update({
        where: { id: userId },
        data: { dailyEarningWallet: { decrement: amount } }
      })

      console.log("Creating investment...")
      const investment = await tx.dailyEarningInvestment.create({
        data: {
          userId: userId,
          amount: amount,
          status: "ACTIVE",
          profitEarned: 0,
          expiresAt: expiresAt,
          lastCalculatedDate: now,
          nextCycleAt: nextCycleAt
        }
      })

      console.log("Creating transaction...")
      await tx.transaction.create({
        data: {
          userId: userId,
          amount: amount,
          type: "INVESTMENT",
          status: "COMPLETED",
          description: `Daily Earning Pool Deposit (30 Day Lock)`
        }
      })

      return investment
    })

    console.log("Success:", result)
  } catch (error) {
    console.error("Test Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

testInvestment()
