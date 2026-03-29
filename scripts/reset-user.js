const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetUser(email) {
  if (!email) {
    console.error("Please provide an email address.");
    console.log("Usage: node scripts/reset-user.js <email>");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    console.log(`Resetting user: ${user.name} (${user.email})...`);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        tier: 'NEWBIE',
        tierStatus: 'CURRENT', // Ensure this enum value exists in your schema/client
        points: 0,
        activeMembers: 0,
        totalDeposit: 0,
        isActiveMember: false
      }
    });

    console.log("✅ User reset successful!");
    console.log("Tier: ", updated.tier);
    console.log("Status: ", updated.tierStatus);
    console.log("Points: ", updated.points);
  } catch (error) {
    console.error("Error resetting user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
resetUser(email);
