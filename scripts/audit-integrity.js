const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- STARTING INTEGRITY AUDIT ---");

  // 1. Validate Tiers
  const validTiers = ['NEWBIE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'EMERALD'];
  const users = await prisma.user.findMany({ select: { id: true, email: true, tier: true } });
  
  const invalidTiers = users.filter(u => !validTiers.includes(u.tier));
  if (invalidTiers.length > 0) {
      console.error(`[CRITICAL] Found ${invalidTiers.length} users with invalid Tiers:`);
      invalidTiers.forEach(u => console.log(` - User ${u.email}: ${u.tier}`));
  } else {
      console.log("[OK] All user tiers are valid.");
  }

  // 2. Validate JSON configurations
  const configs = await prisma.systemConfig.findMany();
  console.log(`[INFO] Checking ${configs.length} SystemConfig entries for valid JSON...`);
  
  for (const config of configs) {
      try {
          JSON.parse(config.value);
      } catch (e) {
          console.error(`[CRITICAL] Invalid JSON in SystemConfig key '${config.key}':`, config.value);
      }
  }
  console.log("[OK] SystemConfig JSON validation complete.");

  // 3. User Stats
  console.log(`[INFO] Total Users: ${users.length}`);
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (admin) {
      console.log(`[OK] Admin found: ${admin.email} (ID: ${admin.memberId})`);
  } else {
      console.error("[CRITICAL] No Admin user found!");
  }

  console.log("--- AUDIT COMPLETE ---");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
