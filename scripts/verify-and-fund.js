const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAndFundUser() {
  try {
    const user = await prisma.user.update({
      where: { email: 'testuser_mudaraba@example.com' },
      data: { 
        emailVerified: new Date(),
        balance: 10.0, 
        isMudarabaUnlocked: false,
        mudarabaUnlockedAt: null
      }
    });
    console.log('User testuser_mudaraba@example.com verified and funded with $10.');
  } catch (e) {
    console.error('Failed to verify user:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAndFundUser();
