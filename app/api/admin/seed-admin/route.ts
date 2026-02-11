import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Use environment variables for consistency with emergency admin login
    const email = process.env.ADMIN_EMAIL || "admin@letsearnify.com";
    const password = process.env.ADMIN_PASSWORD || "Admin@123";
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    let adminUser;

    if (existingAdmin) {
      // Update existing admin
      adminUser = await prisma.user.update({
        where: { email },
        data: {
          role: "ADMIN",
          password: hashedPassword, // Reset password to match env variable
          tier: "EMERALD", 
          isActiveMember: true,
          emailVerified: new Date()
        }
      });
    } else {
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
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Admin user '${email}' seeded successfully.`,
      user: { id: adminUser.id, email: adminUser.email, role: adminUser.role }
    });

  } catch (error: any) {
    console.error("Admin Seed Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
