const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log("🔧 Starting Login Fix...");

    // 1. Restore Admin
    const adminEmail = 'admin@letsearnify.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            name: 'Admin User'
        },
        create: {
            email: adminEmail,
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN',
            referralCode: 'COMPANY',
            balance: 10000.0,
            phoneNumber: "1234567890",
            isActiveMember: true
        }
    });
    console.log(`✅ Admin restored/updated: ${admin.email}`);
    console.log(`   Password: ${password}`);

    // 2. Check Existing Users & Fix One for Testing
    // Let's pick 'tk688167@gmail.com' from the debug list if it exists, or create a test user.
    const testUserEmail = 'tk688167@gmail.com';
    const user = await prisma.user.findUnique({ where: { email: testUserEmail } });

    if (user) {
        await prisma.user.update({
            where: { email: testUserEmail },
            data: { password: hashedPassword }
        });
        console.log(`✅ Reset password for existing user: ${testUserEmail}`);
        console.log(`   New Password: ${password}`);
    } else {
        console.log(`⚠️ User ${testUserEmail} not found, creating a new test user.`);
         await prisma.user.create({
            data: {
                email: 'test_user@letsearnify.com',
                name: 'Test User',
                password: hashedPassword,
                role: 'USER',
                referralCode: 'TESTUSER',
                referredByCode: 'COMPANY'
            }
        });
        console.log(`✅ Created test user: test_user@letsearnify.com / ${password}`);
    }

    // 3. Verify Counts
    const count = await prisma.user.count();
    console.log(`📊 Total Users now: ${count}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
