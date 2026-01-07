
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    const email = "admin@letsearnify.com";
    const password = "Admin@123";
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log(`Seeding Admin: ${email}`);
    
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    let adminUser;

    if (existingAdmin) {
      console.log("User exists. Updating password and role...");
      // Update existing admin
      adminUser = await prisma.user.update({
        where: { email },
        data: {
          role: "ADMIN",
          password: hashedPassword,
          tier: "EMERALD", 
          isActiveMember: true
        }
      });
    } else {
      console.log("User does not exist. Creating new Admin...");
      // Create new admin
      adminUser = await prisma.user.create({
        data: {
          email,
          name: "System Administrator",
          password: hashedPassword,
          role: "ADMIN",
          tier: "EMERALD",
          isActiveMember: true,
          emailVerified: new Date(),
          referralCode: "ADMIN001",
          memberId: 100000 
        }
      });
    }

    console.log("✅ Admin Seeded Successfully.");
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role: ${adminUser.role}`);
    console.log(`Password Hash starts with: ${adminUser.password?.substring(0, 10)}...`);

  } catch (error: any) {
    console.error("❌ Admin Seed Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
