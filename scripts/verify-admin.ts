import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verifyAndCreateAdmin() {
  console.log('🔍 Connecting to production database...');
  
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@letsearnify.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
  
  try {
    // Step 1: Check if admin user exists
    console.log(`\n📋 Checking for admin user: ${ADMIN_EMAIL}`);
    
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        tier: true,
        isActiveMember: true,
        emailVerified: true,
      }
    });

    if (existingAdmin) {
      console.log('✅ Admin user found in database:');
      console.log(`   - ID: ${existingAdmin.id}`);
      console.log(`   - Email: ${existingAdmin.email}`);
      console.log(`   - Name: ${existingAdmin.name}`);
      console.log(`   - Role: ${existingAdmin.role}`);
      console.log(`   - Tier: ${existingAdmin.tier}`);
      console.log(`   - Active: ${existingAdmin.isActiveMember}`);
      console.log(`   - Email Verified: ${existingAdmin.emailVerified ? 'Yes' : 'No'}`);
      console.log(`   - Has Password: ${existingAdmin.password ? 'Yes' : 'No'}`);
      
      // Step 2: Verify password
      if (existingAdmin.password) {
        console.log('\n🔐 Testing password verification...');
        const passwordMatch = await bcrypt.compare(ADMIN_PASSWORD, existingAdmin.password);
        
        if (passwordMatch) {
          console.log('✅ Password verification PASSED');
          console.log('\n🎉 Admin login should work with these credentials:');
          console.log(`   Email: ${ADMIN_EMAIL}`);
          console.log(`   Password: ${ADMIN_PASSWORD}`);
          return;
        } else {
          console.log('❌ Password verification FAILED - resetting password...');
        }
      }
      
      // Step 3: Reset password if verification failed
      console.log('\n🔄 Updating admin password...');
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          tier: 'EMERALD',
          isActiveMember: true,
          emailVerified: new Date(),
        }
      });
      
      console.log('✅ Admin password reset successfully');
      
    } else {
      console.log('❌ Admin user NOT found in database');
      console.log('\n🔨 Creating new admin user...');
      
      // Step 4: Create new admin user
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: 'System Administrator',
          password: hashedPassword,
          role: 'ADMIN',
          tier: 'EMERALD',
          tierStatus: 'CURRENT',
          isActiveMember: true,
          emailVerified: new Date(),
          referralCode: 'ADMIN001',
          arnBalance: 0,
          activeMembers: 0,
          totalDeposit: 0,
        }
      });
      
      console.log('✅ Admin user created successfully:');
      console.log(`   - ID: ${newAdmin.id}`);
      console.log(`   - Email: ${newAdmin.email}`);
    }
    
    // Step 5: Final verification
    console.log('\n🔍 Final verification...');
    const verifyAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL }
    });
    
    if (verifyAdmin?.password) {
      const finalCheck = await bcrypt.compare(ADMIN_PASSWORD, verifyAdmin.password);
      
      if (finalCheck) {
        console.log('✅ Final password verification PASSED');
        console.log('\n🎉 CONFIRMED WORKING CREDENTIALS:');
        console.log(`   Email: ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log('\n📝 You can now login to production with these credentials.');
      } else {
        console.log('❌ Final verification FAILED');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyAndCreateAdmin()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error: any) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
