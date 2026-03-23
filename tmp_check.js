const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  // Create a COMPANY system user to hold the referral code
  const companyUser = await p.user.upsert({
    where: { email: 'system@letsearnify.com' },
    update: { referralCode: 'COMPANY' },
    create: {
      email: 'system@letsearnify.com',
      name: 'LetsEarnify System',
      referralCode: 'COMPANY',
      role: 'ADMIN',
      isActiveMember: true,
      emailVerified: new Date(),
      tier: 'EMERALD',
      arnBalance: 0,
      balance: 0,
      totalDeposit: 0,
      activeMembers: 0
    }
  })
  console.log('Created/updated COMPANY user:', companyUser.email, companyUser.referralCode)

  // Now fix all users with null referredByCode
  const result = await p.user.updateMany({
    where: { referredByCode: null },
    data: { referredByCode: 'COMPANY' }
  })
  console.log('Fixed', result.count, 'users with null referredByCode')

  await p.$disconnect()
}

main()