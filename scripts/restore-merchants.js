
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Restoring Merchants...')

  // 1. Pakistan (Active)
  // Using 'name' as unique identifier
  const pk = await prisma.merchantCountry.upsert({
    where: { name: 'Pakistan' },
    update: { status: 'ACTIVE', code: 'PK' },
    create: {
      code: 'PK',
      name: 'Pakistan',
      currency: 'PKR',
      status: 'ACTIVE',
    }
  })

  // Add a default contact for Pakistan if none exists
  const existingContacts = await prisma.merchantContact.findMany({
    where: { countryId: pk.id }
  })

  if (existingContacts.length === 0) {
      await prisma.merchantContact.create({
          data: {
              countryId: pk.id,
              name: 'Official Agent 1',
              phone: '+92 300 0000000', // Placeholder as requested
              // Note: 'telegram' and 'isActive' might not be in the schema shown earlier, 
              // checking schema again... schema says: id, countryId, name, phone. 
              // NO telegram or isActive in MerchantContact model in schema.prisma!
              // I will stick to schema: name, phone.
          }
      })
      console.log('✅ Added placeholder contact for Pakistan')
  }

  // 2. India (Coming Soon)
  await prisma.merchantCountry.upsert({
    where: { name: 'India' },
    update: { status: 'COMING_SOON', code: 'IN' },
    create: {
      code: 'IN',
      name: 'India',
      currency: 'INR',
      status: 'COMING_SOON',
    }
  })

  // 3. Bangladesh (Coming Soon)
  await prisma.merchantCountry.upsert({
    where: { name: 'Bangladesh' },
    update: { status: 'COMING_SOON', code: 'BD' },
    create: {
      code: 'BD',
      name: 'Bangladesh',
      currency: 'BDT',
      status: 'COMING_SOON',
    }
  })
  
  // 4. Indonesia (Coming Soon - "Other")
  await prisma.merchantCountry.upsert({
    where: { name: 'Indonesia' },
    update: { status: 'COMING_SOON', code: 'ID' },
    create: {
      code: 'ID',
      name: 'Indonesia',
      currency: 'IDR',
      status: 'COMING_SOON',
    }
  })

  console.log('✅ Merchants Restored Successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
