import { prisma } from "../lib/prisma";

async function main() {
  console.log("🔄 Migrating REWARD pool to ACHIEVEMENT pool...");
  
  try {
    const rewardPool = await prisma.pool.findUnique({
      where: { name: "REWARD" }
    });

    if (rewardPool) {
      console.log(`Found REWARD pool with balance: ${rewardPool.balance}`);
      
      // We can't update the 'name' field if it's part of the @id or @unique in a simple way
      // easier to upsert the ACHIEVEMENT pool and delete REWARD
      await prisma.pool.upsert({
        where: { name: "ACHIEVEMENT" },
        update: { 
          balance: { increment: rewardPool.balance },
          percentage: rewardPool.percentage
        },
        create: {
          name: "ACHIEVEMENT",
          balance: rewardPool.balance,
          percentage: rewardPool.percentage
        }
      });
      
      await prisma.pool.delete({
        where: { name: "REWARD" }
      });
      
      console.log("✅ Successfully migrated REWARD to ACHIEVEMENT");
    } else {
      console.log("⚠️ No REWARD pool found. Migration skipped.");
    }
  } catch (err: any) {
    console.error("❌ Migration failed:", err.message);
  }
}

main()
  .catch(err => {
    console.error("❌ CRITICAL ERROR:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
