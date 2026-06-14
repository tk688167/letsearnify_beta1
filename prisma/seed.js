const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@letsearnify.com'
  const password = 'admin@123'
  const name = 'Admin User'

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', referralCode: 'COMPANY' },
    create: {
      email,
      name,
      password: hashedPassword,
      role: 'ADMIN',
      referralCode: 'COMPANY',
    },
  })

  console.log({ user })

  // Seed Pools
  const pools = [
    { name: 'CBSP', balance: 0.0, percentage: 5.0 }, // 5% fee usually
    { name: 'Royalty', balance: 0.0, percentage: 2.0 },
    { name: 'Reward', balance: 3100.0, percentage: 0.0 },
    { name: 'Emergency', balance: 8900.0, percentage: 0.0 }
  ]

  for (const pool of pools) {
    await prisma.pool.upsert({
      where: { name: pool.name },
      update: {}, // Don't overwrite if exists
      create: pool
    })
  }
  console.log("Pools seeded")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
