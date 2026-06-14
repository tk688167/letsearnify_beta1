const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Checking Users in Database...");

    const userCount = await prisma.user.count();
    console.log(`Total Users: ${userCount}`);

    const admin = await prisma.user.findUnique({
        where: { email: 'admin@letsearnify.com' }
    });

    if (admin) {
        console.log("✅ Admin found:");
        console.log(` - ID: ${admin.id}`);
        console.log(` - Email: ${admin.email}`);
        console.log(` - Role: ${admin.role}`);
        console.log(` - Password Hash: ${admin.password ? admin.password.substring(0, 10) + '...' : 'NULL'}`);
    } else {
        console.log("❌ Admin NOT found!");
    }

    const firstfew = await prisma.user.findMany({ take: 5 });
    console.log("First 5 users:", firstfew.map(u => ({ email: u.email, role: u.role })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
