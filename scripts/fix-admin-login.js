
/**
 * Fix Admin Login Script
 * - Finds or creates the admin user
 * - Resets the password to match ADMIN_PASSWORD env var
 * - Also sets role=ADMIN, isActiveMember=true
 */
// Manually load .env file
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    const val = trimmed.substring(eqIdx + 1).trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    if (!process.env[key]) process.env[key] = val;
  }
}
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@letsearnify.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@123';

async function main() {
  console.log('🔧 Admin Login Fix Script');
  console.log('=========================');
  console.log(`📧 Target Email: ${ADMIN_EMAIL}`);
  console.log(`🔑 Using Password: ${ADMIN_PASSWORD}`);
  console.log('');

  // Check if admin user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    select: { id: true, email: true, role: true, password: true, isActiveMember: true },
  });

  if (existingUser) {
    console.log('✅ Admin user found in database.');
    console.log(`   Role: ${existingUser.role}`);
    console.log(`   Active: ${existingUser.isActiveMember}`);

    // Test current password
    if (existingUser.password) {
      const passwordWorks = await bcrypt.compare(ADMIN_PASSWORD, existingUser.password);
      if (passwordWorks) {
        console.log('');
        console.log('🎉 Password is already correct! Login should work.');
        console.log('   If you are still unable to log in, the issue may be:');
        console.log('   1. The role is not ADMIN (role shown above)');
        console.log('   2. The emergency bypass env vars are wrong');
        if (existingUser.role !== 'ADMIN') {
          console.log('⚠️  Role is NOT ADMIN — fixing...');
        }
      } else {
        console.log('❌ Password mismatch! Resetting password...');
      }
    } else {
      console.log('⚠️  No password set. Setting one now...');
    }

    // Always reset to ensure consistency
    const newHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: {
        password: newHash,
        role: 'ADMIN',
        isActiveMember: true,
        emailVerified: new Date(),
        tier: 'EMERALD',
        tierStatus: 'CURRENT',
      },
    });
    console.log('✅ Password reset and role confirmed as ADMIN.');

  } else {
    console.log('❌ Admin user NOT found. Creating a new one...');
    const newHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: 'Super Admin',
        password: newHash,
        role: 'ADMIN',
        referralCode: 'ADMIN001',
        memberId: '000001',
        isActiveMember: true,
        emailVerified: new Date(),
        tier: 'EMERALD',
        tierStatus: 'CURRENT',
        arnBalance: 0,
        activeMembers: 0,
        totalDeposit: 0,
      },
    });
    console.log('✅ Admin user created.');
  }

  // Final verification
  const finalUser = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    select: { id: true, email: true, role: true, password: true, isActiveMember: true },
  });

  const finalCheck = await bcrypt.compare(ADMIN_PASSWORD, finalUser.password);

  console.log('');
  console.log('=== FINAL VERIFICATION ===');
  console.log(`Email: ${finalUser.email}`);
  console.log(`Role:  ${finalUser.role}`);
  console.log(`Active:${finalUser.isActiveMember}`);
  console.log(`Password hash check: ${finalCheck ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');

  if (finalCheck && finalUser.role === 'ADMIN') {
    console.log('🎉 SUCCESS! Admin login is now fixed.');
    console.log('');
    console.log('Login credentials:');
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
  } else {
    console.log('❌ Something still looks wrong. Check the output above.');
  }
}

main()
  .catch((e) => {
    console.error('Script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
