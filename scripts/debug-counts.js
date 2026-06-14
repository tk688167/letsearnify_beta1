const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Checking Transaction Counts...')
  
  // Check distinct types and statuses to see casing
  const types = await prisma.transaction.groupBy({
    by: ['type'],
    _count: { type: true }
  })
  console.log('Transaction Types found:', types)

  const statuses = await prisma.transaction.groupBy({
    by: ['status'],
    _count: { status: true }
  })
  console.log('Transaction Statuses found:', statuses)

  // Explicit count check (Case Sensitive)
  const pendingDeposits = await prisma.transaction.count({
    where: {
      type: 'DEPOSIT',
      status: 'PENDING'
    }
  })
  console.log('Explicit Count (DEPOSIT, PENDING):', pendingDeposits)

  // Explicit count check (Lower Case?)
  const lowerPending = await prisma.transaction.count({
    where: {
      type: 'deposit',
      status: 'pending'
    }
  })
  console.log('Explicit Count (deposit, pending):', lowerPending)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
