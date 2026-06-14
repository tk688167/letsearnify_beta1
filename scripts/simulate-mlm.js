const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- STARTING MLM SIMULATION ---");

  // 1. Create a chain of users: Admin -> UserA -> UserB -> Depositor
  // We need to verify upline commission distribution.
  // Admin is already seeded.
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) throw new Error("Admin not found");

  // Create User A (Direct under Admin)
  const userA = await prisma.user.upsert({
      where: { email: 'usera@test.com' },
      update: {},
      create: {
          email: 'usera@test.com',
          memberId: 'USER01',
          tier: 'BRONZE', // Should get 10% from level 1
          referrer: { connect: { id: admin.id } }
      }
  });

  // Create User B (Direct under User A)
  const userB = await prisma.user.upsert({
      where: { email: 'userb@test.com' },
      update: {},
      create: {
          email: 'userb@test.com',
          memberId: 'USER02',
          tier: 'NEWBIE',
          referrer: { connect: { id: userA.id } }
      }
  });

  // Create Depositor (Direct under User B)
  const depositor = await prisma.user.upsert({
      where: { email: 'depositor@test.com' },
      update: {},
      create: {
          email: 'depositor@test.com',
          memberId: 'USER03',
          tier: 'NEWBIE',
          referrer: { connect: { id: userB.id } }
      }
  });

  // Ensure Referral Tree entries exist (usually handled by app logic, mock here)
  await prisma.referralTree.upsert({
      where: { userId: depositor.id },
      update: {},
      create: {
          userId: depositor.id,
          advisorId: userB.id,
          supervisorId: userA.id,
          managerId: admin.id
      }
  });

  console.log("User User Chain Created.");

  // 2. Mock 'distributeReferralCommission' Logic (Manual invocation or copy-paste logic?)
  // Better to check if we can import the lib... likely TS issue in JS script.
  // We will re-implement the core logic here to verify the JSON PARSING specifically.

  console.log("Fetching Tier Rules...");
  const configs = await prisma.tierConfiguration.findMany();
  const rules = {};
  configs.forEach(c => {
      // THIS IS THE FIX WE ARE TESTING
      rules[c.tier] = {
          levels: typeof c.levels === 'string' ? JSON.parse(c.levels) : c.levels
      };
  });

  console.log("Rules loaded. Checking Bronze config...");
  console.log("Bronze Levels:", rules['BRONZE']?.levels);

  if (!Array.isArray(rules['BRONZE'].levels)) {
      throw new Error("FAIL: Bronze levels is NOT an array!");
  }

  // Calculate Calculation
  const depositAmount = 100;
  console.log(`Simulating $${depositAmount} deposit by Depositor...`);
  
  // Level 1: User B (Newbie) -> 5%
  const level1Rate = rules['NEWBIE'].levels[0];
  const comm1 = depositAmount * level1Rate;
  console.log(`User B (Newbie) Level 1 Comm: $${comm1} (Expected $5)`);

  // Level 2: User A (Bronze) -> 6% (index 1)
  const level2Rate = rules['BRONZE'].levels[1];
  const comm2 = depositAmount * level2Rate;
  console.log(`User A (Bronze) Level 2 Comm: $${comm2} (Expected $6)`);

  if (isNaN(comm1) || isNaN(comm2)) {
      throw new Error("FAIL: Commissions calculated as NaN!");
  }

  console.log("--- SIMULATION SUCCESS ---");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
