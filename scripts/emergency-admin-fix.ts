import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Force production database connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const ADMIN_EMAIL = 'admin@letsearnify.com';
const ADMIN_PASSWORD = 'Admin@123';

async function emergencyAdminFix() {
  console.log('🚨 EMERGENCY ADMIN FIX - PRODUCTION DATABASE');
  console.log('============================================\n');
  
  try {
    // Test connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Connected to production database\n');
    
    // Step 1: Delete ALL existing admin users
    console.log('2️⃣ Removing any existing admin users...');
    const deleteResult = await prisma.$executeRaw`
      DELETE FROM "User" WHERE email = ${ADMIN_EMAIL};
    `;
    console.log(`✅ Deleted ${deleteResult} existing admin user(s)\n`);
    
    // Step 2: Generate fresh bcrypt hash
    console.log('3️⃣ Generating secure password hash...');
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    console.log(`✅ Hash generated: ${passwordHash.substring(0, 20)}...\n`);
    
    // Step 3: Insert admin user using raw SQL
    console.log('4️⃣ Creating admin user in production database...');
    await prisma.$executeRaw`
      INSERT INTO "User" (
        id,
        "memberId",
        email,
        name,
        password,
        role,
        tier,
        "tierStatus",
        "isActiveMember",
        "emailVerified",
        "referralCode",
        "arnBalance",
        "activeMembers",
        "totalDeposit",
        "createdAt",
        "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        '0000001',
        ${ADMIN_EMAIL},
        'System Administrator',
        ${passwordHash},
        'ADMIN',
        'EMERALD',
        'CURRENT',
        true,
        NOW(),
        'ADMIN001',
        0,
        0,
        0,
        NOW(),
        NOW()
      );
    `;
    console.log('✅ Admin user created successfully\n');
    
    // Step 4: Verify admin exists
    console.log('5️⃣ Verifying admin user...');
    const admin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      }
    });
    
    if (!admin) {
      throw new Error('Admin user not found after creation!');
    }
    
    console.log('✅ Admin user verified:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}\n`);
    
    // Step 5: Test password verification
    console.log('6️⃣ Testing password verification...');
    const isValid = await bcrypt.compare(ADMIN_PASSWORD, admin.password!);
    
    if (!isValid) {
      throw new Error('Password verification FAILED!');
    }
    
    console.log('✅ Password verification PASSED\n');
    
    // Final confirmation
    console.log('═══════════════════════════════════════════');
    console.log('🎉 ADMIN ACCESS RESTORED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════\n');
    console.log('CONFIRMED WORKING CREDENTIALS:');
    console.log(`  📧 Email: ${ADMIN_EMAIL}`);
    console.log(`  🔑 Password: ${ADMIN_PASSWORD}`);
    console.log('\nYou can now login at: https://letsearnify.com/login');
    console.log('═══════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute
emergencyAdminFix()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
