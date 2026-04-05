import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function lockCountries() {
  console.log('🔒 Locking all countries except Pakistan...\n')

  // Update all countries except Pakistan to COMING_SOON
  const result = await prisma.merchantCountry.updateMany({
    where: {
      code: {
        not: 'PK'
      }
    },
    data: {
      status: 'COMING_SOON'
    }
  })

  console.log(`✅ Locked ${result.count} countries (set to COMING_SOON)`)
  
  // Verify Pakistan is ACTIVE
  const pakistan = await prisma.merchantCountry.findFirst({
    where: { code: 'PK' },
    include: { methods: true }
  })

  if (pakistan) {
    console.log(`\n✅ Pakistan Status: ${pakistan.status}`)
    console.log(`   Payment Methods: ${pakistan.methods.length}`)
    pakistan.methods.forEach(method => {
      console.log(`   - ${method.name}`)
    })
  }

  console.log('\n🎯 Country Status Summary:')
  const allCountries = await prisma.merchantCountry.findMany({
    orderBy: { name: 'asc' }
  })
  
  allCountries.forEach(country => {
    const emoji = country.status === 'ACTIVE' ? '✅' : '🔒'
    console.log(`   ${emoji} ${country.name} (${country.code}): ${country.status}`)
  })
}

lockCountries()
  .then(() => {
    console.log('\n🎉 Done!')
    prisma.$disconnect()
  })
  .catch((error: any) => {
    console.error('❌ Error:', error)
    prisma.$disconnect()
    process.exit(1)
  })
