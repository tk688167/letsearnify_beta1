
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Restoring All Defaults (Tiers, flags, etc)...')

  // 1. Seed Tier Configurations
  const tiers = [
      { tier: "NEWBIE", points: 0, members: 0 },
      { tier: "BRONZE", points: 100, members: 5 },
      { tier: "SILVER", points: 500, members: 20 },
      { tier: "GOLD", points: 2000, members: 50 },
      { tier: "PLATINUM", points: 5000, members: 100 },
      { tier: "DIAMOND", points: 15000, members: 250 },
      { tier: "EMERALD", points: 50000, members: 500 }
  ]

  for (const t of tiers) {
      await prisma.tierConfiguration.upsert({
          where: { tier: t.tier },
          update: { points: t.points, members: t.members },
          create: {
              tier: t.tier,
              points: t.points,
              members: t.members,
              levels: [] // Default empty levels
          }
      })
  }
  console.log('✅ Tiers Restored')

  // 2. Seed Feature Guard Flags (Coming Soon)
  const defaultFlags = {
      tasksEnabled: true,
      marketplaceEnabled: true,
      poolsEnabled: true,
      // Keep old keys just in case legacy logic uses them, but 'Enabled' suffix is what FeatureGuard checks
      tasks: { title: "Tasks", description: "Tasks", showIcon: false, gradientFrom: "", gradientTo: "" },
      pools: { title: "Pools", description: "Pools", showIcon: false, gradientFrom: "", gradientTo: "" },
      marketplace: { title: "Marketplace", description: "Marketplace", showIcon: false, gradientFrom: "", gradientTo: "" }
  }

  await prisma.systemConfig.upsert({
      where: { key: "COMING_SOON_CONFIG" },
      update: { value: defaultFlags },
      create: {
          key: "COMING_SOON_CONFIG",
          value: defaultFlags
      }
  })
  console.log('✅ Feature Flags Restored')

  // 3. Ensure Social Proof Data exists
  await prisma.socialProofSettings.upsert({
      where: { id: "default" }, // Assuming single row or verify schema
      // Actually schema uses CUID default, so we check findFirst
      update: {},
      create: {
          totalUsers: 14520,
          totalDeposited: 950000,
          totalPayouts: 420000,
          activeOnline: 560
      }
  }).catch(async () => {
       const exists = await prisma.socialProofSettings.findFirst()
       if(!exists) {
           await prisma.socialProofSettings.create({
               data: {
                  totalUsers: 14520,
                  totalDeposited: 950000,
                  totalPayouts: 420000,
                  activeOnline: 560
               }
           })
       }
  })
  console.log('✅ Social Proof Data Restored')

  console.log('✨ All System Defaults Restored!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
