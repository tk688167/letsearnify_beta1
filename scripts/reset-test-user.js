const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetUser() {
  try {
    const user = await prisma.user.update({
      where: { email: 'letsearnify6@gmail.com' },
      data: { 
        balance: 10.0, 
        isMudarabaUnlocked: false,
        mudarabaUnlockedAt: null
      }
    });
    console.log('User letsearnify6@gmail.com reset: balance=$10, isMudarabaUnlocked=false');
  } catch (e) {
    console.error('Failed to reset user:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetUser();
