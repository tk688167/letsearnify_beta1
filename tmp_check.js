const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  // Delete the wrong Google account link from ictt9213
  // Keep 115153416362156068702 (the real one), delete 118273607167246537922
  const result = await p.account.deleteMany({
    where: {
      provider: 'google',
      providerAccountId: '118273607167246537922',
      userId: 'cmn3q831i00011yvgjih9mssm'
    }
  })
  console.log('Deleted:', result.count, 'wrong account link')

  // Verify
  const remaining = await p.account.findMany({
    where: { user: { email: 'ictt9213@gmail.com' } },
    select: { providerAccountId: true, provider: true }
  })
  console.log('Remaining accounts for ictt9213:', remaining)

  await p.$disconnect()
}

main()