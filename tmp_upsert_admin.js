const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { id: "super-admin-id" },
    update: {
      arnBalance: 1000 // Reset test balance
    },
    create: {
      id: "super-admin-id",
      email: "mock-admin-emergency@letsearnify.com",
      name: "Super Admin",
      role: "ADMIN",
      balance: 5000,
      arnBalance: 1000,
      mudarabahBalance: 0,
      isActiveMember: true,
      totalDeposit: 5000,
      tier: "EMERALD"
    }
  });
  console.log("Super admin correctly seeded!");
}
main().catch(console.error).finally(()=>prisma.$disconnect());
