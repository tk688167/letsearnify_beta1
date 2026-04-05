import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupPakistanMethods() {
  console.log('🧹 Cleaning up Pakistan payment methods...\n')

  // Get Pakistan
  const pakistan = await prisma.merchantCountry.findFirst({
    where: { code: 'PK' },
    include: { methods: true }
  })

  if (!pakistan) {
    console.log('❌ Pakistan not found')
    return
  }

  console.log(`📍 Found Pakistan with ${pakistan.methods.length} methods`)

  // Delete methods that are NOT EasyPaisa or JazzCash
  const methodsToDelete = pakistan.methods.filter(
    m => m.name !== 'Easypaisa' && m.name !== 'JazzCash'
  )

  for (const method of methodsToDelete) {
    await prisma.merchantPaymentMethod.delete({
      where: { id: method.id }
    })
    console.log(`   ❌ Removed: ${method.name}`)
  }

  // Verify final state
  const updated = await prisma.merchantCountry.findFirst({
    where: { code: 'PK' },
    include: { methods: true }
  })

  console.log('\n✅ Pakistan now has only:')
  updated?.methods.forEach((m: any) => {
    console.log(`   ✓ ${m.name}`)
  })
  
  console.log('\n🎉 Cleanup complete!')
}

cleanupPakistanMethods()
  .then(() => prisma.$disconnect())
  .catch((error: any) => {
    console.error('Error:', error)
    prisma.$disconnect()
    process.exit(1)
  })
