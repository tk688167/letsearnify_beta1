const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const countries = [
  { name: 'United States', code: 'US', currency: 'USD' },
  { name: 'United Kingdom', code: 'UK', currency: 'GBP' },
  { name: 'United Arab Emirates', code: 'UAE', currency: 'AED' },
  { name: 'India', code: 'IN', currency: 'INR' },
  { name: 'Bangladesh', code: 'BD', currency: 'BDT' },
  { name: 'Nepal', code: 'NP', currency: 'NPR' },
]

async function main() {
  console.log('Seeding additional countries...')

  for (const country of countries) {
    const existing = await prisma.merchantCountry.findFirst({
        where: { name: country.name }
    })

    if (existing) {
        console.log(`Skipping ${country.name} (already exists)`)
    } else {
        await prisma.merchantCountry.create({
            data: {
                name: country.name,
                code: country.code,
                currency: country.currency,
                status: 'COMING_SOON' // Default to Coming Soon
            }
        })
        console.log(`Created ${country.name}`)
    }
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
