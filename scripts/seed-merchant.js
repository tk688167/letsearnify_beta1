const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding merchant data...')

  // 1. Create Pakistan (Active)
  const pk = await prisma.merchantCountry.upsert({
    where: { name: 'Pakistan' },
    update: {},
    create: {
      name: 'Pakistan',
      code: 'PK',
      status: 'ACTIVE',
      currency: 'PKR',
      methods: {
        create: [
          { name: 'EasyPaisa' },
          { name: 'JazzCash' },
          { name: 'Bank Transfer' },
          { name: 'SadaPay' }
        ]
      },
      contacts: {
        create: [
          { name: 'Merchant Support 1', phone: '+92317229711' },
          { name: 'Merchant Support 2', phone: '+923133890629' }
        ]
      }
    }
  })
  console.log('Created/Updated Pakistan:', pk.name)

  // 2. Create Other Countries (Coming Soon)
  const others = [
    { name: 'India', code: 'IN' },
    { name: 'Bangladesh', code: 'BD' },
    { name: 'Philippines', code: 'PH' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'UAE', code: 'AE' }
  ]

  for (const c of others) {
    const res = await prisma.merchantCountry.upsert({
      where: { name: c.name },
      update: {},
      create: {
        name: c.name,
        code: c.code,
        status: 'COMING_SOON'
      }
    })
    console.log('Created/Updated:', res.name)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
