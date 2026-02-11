const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding System Config...");

  // 1. Welcome Slider
  const sliderKey = "WELCOME_SLIDER";
  const sliderValue = JSON.stringify([
    { text: "Welcome to Let's Earnify Beta!", active: true, icon: "🚀" },
    { text: "Complete daily tasks to earn rewards.", active: true, icon: "✅" },
    { text: "Invite friends and grow your team!", active: true, icon: "👥" }
  ]);

  await prisma.systemConfig.upsert({
    where: { key: sliderKey },
    update: {},
    create: { key: sliderKey, value: sliderValue }
  });
  console.log("Seeded Welcome Slider.");

  // 2. Platform Stats
  const statsKey = "PLATFORM_STATS";
  const statsValue = JSON.stringify({
    totalUsers: "150+",
    totalDeposited: "$5,000",
    totalWithdrawn: "$1,200",
    totalRewards: "$3,500",
    serviceStatus: "Operational",
    partnersCount: "12"
  });

  await prisma.systemConfig.upsert({
    where: { key: statsKey },
    update: {},
    create: { key: statsKey, value: statsValue }
  });
  console.log("Seeded Platform Stats.");

  console.log("System Config Seeding Complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
