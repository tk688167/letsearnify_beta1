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
    const userCount = await prisma.user.count();
    console.log('Total User records:', userCount);
    
    const poolCount = await prisma.dailyEarningInvestment.count();
    console.log('Total DailyEarningInvestment records:', poolCount);

    const transactions = await prisma.transaction.findMany({
        where: { method: 'DAILY_EARNING_POOL' },
        take: 10
    });
    console.log('Daily Earning Pool Transactions:', transactions.length);
    if (transactions.length > 0) {
        console.log('Sample transaction:', JSON.stringify(transactions[0], null, 2));
    }

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
