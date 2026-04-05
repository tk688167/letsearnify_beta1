const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPools() {
  const pools = await prisma.dailyEarningInvestment.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      userId: true,
      amount: true,
      profitEarned: true,
      createdAt: true,
      lastCalculatedDate: true
    }
  });

  console.log(`Found ${pools.length} active pools.`);
  pools.forEach(p => {
    const now = new Date();
    const timeSinceLast = now.getTime() - p.lastCalculatedDate.getTime();
    const daysToProcess = Math.floor(timeSinceLast / (24 * 60 * 60 * 1000));
    console.log(`Pool ${p.id}: Created ${p.createdAt.toISOString()}, Last Calc ${p.lastCalculatedDate.toISOString()}, Profit ${p.profitEarned}, Days Pending: ${daysToProcess}`);
  });
}

checkPools().catch(console.error).finally(() => prisma.$disconnect());
