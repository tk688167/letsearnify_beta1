const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const logs = await prisma.adminLog.findMany({
        where: { actionType: { contains: 'POOL' } },
        take: 20
    });
    console.log('Admin Logs for POOL:', JSON.stringify(logs, null, 2));

    const notifications = await prisma.adminNotification.findMany({
        take: 20
    });
    console.log('Admin Notifications:', JSON.stringify(notifications, null, 2));
  } catch (error) {
    console.error('Error checking logs:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
