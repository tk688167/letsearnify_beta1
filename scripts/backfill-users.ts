import { prisma } from "../lib/prisma";
import { generateMemberId, generateReferralCode } from "../lib/mlm";

async function main() {
  console.log("🛠️ Starting Manual User Data Backfill...");
  
  const users = await prisma.user.findMany({
    select: { id: true, email: true, memberId: true, referralCode: true }
  });

  console.log(`Found ${users.length} users to audit.`);
  
  let fixedCount = 0;

  for (const user of users) {
    let updateNeeded = false;
    const updates: any = {};

    // 1. Fix Member ID if missing or CUID-style
    if (!user.memberId || user.memberId.length > 7 || /[a-z]/i.test(user.memberId)) {
      updates.memberId = generateMemberId();
      updateNeeded = true;
    }

    // 2. Fix Referral Code if missing
    if (!user.referralCode) {
      updates.referralCode = generateReferralCode();
      updateNeeded = true;
    }

    if (updateNeeded) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: updates
        });
        console.log(`✅ Fixed user: ${user.email} | New ID: ${updates.memberId || 'unchanged'} | New Ref: ${updates.referralCode || 'unchanged'}`);
        fixedCount++;
      } catch (err: any) {
        console.error(`❌ Failed to update ${user.email}:`, err.message);
      }
    }
  }

  console.log(`\n🎉 Backfill complete! Fixed ${fixedCount} users.`);
}

main()
  .catch(err => {
    console.error("❌ CRITICAL ERROR:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
