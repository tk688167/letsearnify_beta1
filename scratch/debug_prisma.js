
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  try {
    const userId = "clzu8p9w0000008mf3g8f8f8f" // Dummy ID or try to find a real one
    console.log("Testing Prisma query for Daily Earning Pool...")
    
    const [user, activeInvestments] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { 
            balance: true, 
            dailyEarningWallet: true,
            referrer: {
                select: { referralCode: true }
            }
        }
      }),
      prisma.dailyEarningInvestment.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' }
      })
    ])
    
    console.log("Success!", { user, investmentCount: activeInvestments.length })
  } catch (error) {
    console.error("Prisma Query Failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

test()
