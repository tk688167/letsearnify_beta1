const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not defined');
    return;
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const count = await prisma.dailyEarningInvestment.count();
    console.log('Total DailyEarningInvestment records:', count);
    const pools = await prisma.dailyEarningInvestment.findMany({ take: 5 });
    console.log('Sample pools:', JSON.stringify(pools, null, 2));
  } catch (error) {
    console.error('Error checking pools:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
