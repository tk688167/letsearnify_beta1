const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetUser() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: { 
        balance: 10.0, 
        isMudarabaUnlocked: false,
        mudarabaUnlockedAt: null,
        password: hashedPassword
      },
      create: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        balance: 10.0,
        isMudarabaUnlocked: false,
        memberId: 'TEST001',
        referralCode: 'TEST001'
      }
    });
    console.log('User test@example.com reset with password: password123, balance: $10');
  } catch (e) {
    console.error('Failed to reset user:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetUser();
