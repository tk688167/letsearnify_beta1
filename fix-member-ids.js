const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

function generateMemberId() {
  return Math.floor(1000000 + Math.random() * 9000000).toString()
}

async function main() {
  const users = await p.user.findMany({
    where: { memberId: '' },
    select: { id: true, email: true, memberId: true }
  })

  console.log('Users missing memberId:', users.length)

  for (const user of users) {
    const newId = generateMemberId()
    try {
      await p.user.update({
        where: { id: user.id },
        data: { memberId: newId }
      })
      console.log('  Fixed:', user.email, '->', 'LEU-' + newId)
    } catch (err) {
      const retryId = generateMemberId()
      await p.user.update({
        where: { id: user.id },
        data: { memberId: retryId }
      })
      console.log('  Fixed (retry):', user.email, '->', 'LEU-' + retryId)
    }
  }

  console.log('Done!')
  await p.$disconnect()
}

main()