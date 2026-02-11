
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@letsearnify.com';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  console.log(`Seeding Admin User: ${email}`);

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
        role: 'ADMIN',
        isActiveMember: true,
        tier: 'EMERALD'
    },
    create: {
      email,
      name: 'Super Admin',
      password: hashedPassword,
      role: 'ADMIN',
      referralCode: 'ADMIN',
      // referredByCode: 'SYSTEM', // Root user has no referrer
      memberId: "000001",
      isActiveMember: true,
      tier: 'EMERALD',
      totalDeposit: 1000,
      balance: 1000,
      points: 10000
    },
  });

  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
