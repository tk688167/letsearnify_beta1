const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  const users = await p.user.findMany({
    select: { email: true, memberId: true },
    take: 10
  })
  console.log(JSON.stringify(users, null, 2))
  await p.$disconnect()
}

main()