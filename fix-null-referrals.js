const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  // Find all users with null referredByCode
  const users = await p.user.findMany({
    where: { referredByCode: null },
    select: { id: true, email: true, name: true }
  })
  
  console.log('Users with null referredByCode:', users.length)
  users.forEach(u => console.log(' -', u.email || u.name || u.id))

  if (users.length > 0) {
    // Fix them all
    const result = await p.user.updateMany({
      where: { referredByCode: null },
      data: { referredByCode: 'COMPANY' }
    })
    console.log('Fixed', result.count, 'users')
  }

  await p.$disconnect()
}

main()