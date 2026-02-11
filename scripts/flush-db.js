
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    if (process.argv[2] !== '--FORCE-FLUSH') {
        console.error("⛔ SAFETY LOCK: To flush the database, you must run this script with the '--FORCE-FLUSH' argument.");
        console.error("Example: node scripts/flush-db.js --FORCE-FLUSH");
        process.exit(1);
    }

    console.log("⚠️  STARTING DATABASE FLUSH...");

    // 1. Delete dependent data first
    console.log("Cleaning Logs & Analytics...");
    await prisma.adminLog.deleteMany({});
    await prisma.mLMLog.deleteMany({});
    await prisma.visit.deleteMany({});
    
    // Check if these models exist (not in viewed schema but might exist in DB)
    // await prisma.notification.deleteMany({}); 

    console.log("Cleaning Financial Data...");
    await prisma.referralCommission.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.investment.deleteMany({});
    await prisma.wallet.deleteMany({}); // User wallets
    await prisma.paymentMethod.deleteMany({});

    console.log("Cleaning Tasks & Activities...");
    await prisma.taskCompletion.deleteMany({});
    await prisma.task.deleteMany({}); // Optional: keep system tasks? Assuming flush all.

    console.log("Cleaning User Relations...");
    await prisma.referralTree.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.session.deleteMany({});

    // 2. Delete Users (Keep Admin? Or Re-create?)
    // User requested "admin credentials demo same". 
    // Safest is to delete ALL and re-seed to ensure clean state.
    console.log("Cleaning Users...");
    await prisma.user.deleteMany({});

    // 3. Delete System Config (Pools/Wallets/Gigs)
    console.log("Cleaning System Config...");
    await prisma.pool.deleteMany({});
    await prisma.platformWallet.deleteMany({});
    await prisma.gig.deleteMany({});

    console.log("✅ DATABASE CLEARED.");

    // --- RE-SEEDING ---
    console.log("🌱 Re-seeding Admin & System Data...");

    // 1. Create Admin
    const adminEmail = 'admin@letsearnify.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN',
            referralCode: 'COMPANY',
            balance: 0.0, // Start with 0 as requested
            phoneNumber: "1234567890"
        }
    });
    console.log(`Created Admin: ${admin.email}`);

    // 2. Create Pools
    const pools = [
        { name: 'CBSP', balance: 0.0, percentage: 5.0 },
        { name: 'Royalty', balance: 0.0, percentage: 2.0 },
        { name: 'Reward', balance: 0.0, percentage: 0.0 },
        { name: 'Emergency', balance: 0.0, percentage: 0.0 }
    ];

    for (const pool of pools) {
        await prisma.pool.create({ data: pool });
    }
    console.log("Pools seeded.");

    // 3. Create Platform Wallets
    const wallets = [
        { network: 'TRC20', address: 'TMXUP3y6hL8amGc4SnAMhyhMKW9PRKTEth', qrCodePath: '/qr-placeholder.png' },
        { network: 'BEP20', address: '0x39Ca8dE5795AdE004eB1E7C6cA1171eaEC832CF4', qrCodePath: '/qr-placeholder.png' }
    ];

    for (const w of wallets) {
        await prisma.platformWallet.create({ data: w });
    }
    console.log("Platform Wallets seeded.");

    console.log("🚀 FLUSH & SEED COMPLETE!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
