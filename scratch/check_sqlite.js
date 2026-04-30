const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./prisma/dev.db'
      }
    }
  });

  try {
    const userCount = await prisma.user.count();
    console.log('SQLite Total User records:', userCount);
    
    const poolCount = await prisma.dailyEarningInvestment.count();
    console.log('SQLite Total DailyEarningInvestment records:', poolCount);
  } catch (error) {
    console.error('Error checking SQLite data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
