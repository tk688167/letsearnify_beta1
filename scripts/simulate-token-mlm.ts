// @ts-nocheck
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { processMlmDeposit } from '../lib/mlm';

// Helper to create unique user
async function createUser(name, refBy) {
    const uniqueSuffix = Math.random().toString(36).substring(7);
    const code = `REF_${Math.random().toString(36).substring(7).toUpperCase()}`;
    return await prisma.user.create({
        data: {
            memberId: Math.random().toString(36).substring(7),
            name: `${name} ${uniqueSuffix}`,
            email: `${name.toLowerCase()}.${uniqueSuffix}@test.local`,
            referralCode: code,
            referredByCode: refBy ? refBy.referralCode : null,
            tier: "NEWBIE",
            balance: 0,
            arnBalance: 0,
            isActiveMember: false
        }
    });
}

// Helper to create tree relation
async function createTree(user, advisor, supervisor, manager) {
    await prisma.referralTree.create({
        data: {
            userId: user.id,
            advisorId: advisor?.id,
            supervisorId: supervisor?.id,
            managerId: manager?.id
        }
    });
}

async function main() {
    console.log("🚀 Starting Token MLM Simulation...");

    // Clean DB (Optional/Dangerous - verify manually if needed)
    // await prisma.mLMLog.deleteMany();
    // await prisma.referralCommission.deleteMany();

    // 1. Create User Chain: GrandUpline (Gold) -> Upline (Bronze) -> Downline (Newbie)
    const grandUpline = await createUser("GrandUpline", null);
    // Manually set GrandUpline to GOLD + ARN to verify L2 commission
    await prisma.user.update({
        where: { id: grandUpline.id },
        data: { tier: "GOLD", arnBalance: 2500 }
    });

    const upline = await createUser("Upline", grandUpline);
    // Set Upline to BRONZE
    await prisma.user.update({
        where: { id: upline.id },
        data: { tier: "BRONZE", arnBalance: 150 }
    });

    const downline = await createUser("Downline", upline);

    // Create Tree Structures (Mocking what ReferenceHook would do)
    await createTree(grandUpline, null, null, null);
    await createTree(upline, grandUpline, null, null);
    await createTree(downline, upline, grandUpline, null);

    console.log(`\n👥 Created Chain: ${grandUpline.name} (Gold) -> ${upline.name} (Bronze) -> ${downline.name}`);

    // 2. Process Deposit for Downline
    const DEPOSIT_AMOUNT = 100.0;
    const TX_ID = `TX_${Date.now()}`;
    
    // Create Dummy Transaction Record first (required by db constraint usually, or mocked)
    await prisma.transaction.create({
        data: {
            id: TX_ID,
            userId: downline.id,
            amount: DEPOSIT_AMOUNT,
            type: "DEPOSIT",
            status: "COMPLETED",
            description: "Simulation Deposit"
        }
    });

    console.log(`\n💰 Processing Deposit of $${DEPOSIT_AMOUNT} for ${downline.name}...`);
    
    // 3. ACTUAL LOGIC CALL
    await processMlmDeposit(downline.id, DEPOSIT_AMOUNT, TX_ID);

    console.log("\n✅ Deposit Processed. Verifying results...");

    // 4. Verify Results
    const updatedDownline = await prisma.user.findUnique({ where: { id: downline.id } });
    console.log(`   - Downline ARN: ${updatedDownline?.arnBalance} (Expected: 1000)`);
    console.log(`   - Downline Active: ${updatedDownline?.isActiveMember}`);

    const updatedUpline = await prisma.user.findUnique({ where: { id: upline.id } });
    console.log(`   - Upline (Bronze) Balance: $${updatedUpline?.balance} (Expected +$7.00)`);

    const updatedGrand = await prisma.user.findUnique({ where: { id: grandUpline.id } });
    console.log(`   - GrandUpline (Gold) Balance: $${updatedGrand?.balance} (Expected +$3.00)`);
}

main()
  .catch((e: any) => console.error(e))
  .finally(async () => await prisma.$disconnect());
