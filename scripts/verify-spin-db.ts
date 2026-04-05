
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking Prisma Client properties...')
  
  if ('spinReward' in prisma) {
    console.log('✅ prisma.spinReward exists')
  } else {
    console.error('❌ prisma.spinReward DOES NOT exist')
  }

  // Check types via a real query (if it runs, valid SQL is generated, meaning schema is actively known by engine)
  try {
    const rewards = await prisma.spinReward.findMany({ take: 1 })
    console.log('✅ Successfully queried spinReward')
  } catch (e) {
    console.error('❌ Failed to query spinReward:', e)
  }

  // Check User field
  try {
    // We don't need a real user, just checking if the query builder accepts the select
    // However, strictly speaking, TS errors happen at compile time. Runtime might accept it if the DB column exists.
    // But this script running via tsx will compile it.
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        lastPremiumSpinTime: true,
        premiumBonusSpins: true
      }
    })
    console.log('✅ Successfully selected lastPremiumSpinTime from User')
  } catch (e) {
    console.error('❌ Failed to select lastPremiumSpinTime:', e)
  }
}

main()
  .catch((e: any) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
