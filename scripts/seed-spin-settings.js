
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const DEFAULT_SETTINGS = {
  freeSpinCooldownHours: 48,
  premiumSpinCooldownHours: 24,
  premiumUnlockAmount: 1.0,
  welcomeBonusDays: 3,
  surpriseGiftIntervalDays: 30
}

async function main() {
  console.log('Seeding Spin Settings...')

  const existing = await prisma.systemConfig.findUnique({
      where: { key: "SPIN_CONFIG" }
  })

  if (!existing) {
      await prisma.systemConfig.create({
          data: {
              key: "SPIN_CONFIG",
              value: DEFAULT_SETTINGS
          }
      })
      console.log('Created default SPIN_CONFIG.')
  } else {
      console.log('SPIN_CONFIG already exists.')
  }
  
  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
