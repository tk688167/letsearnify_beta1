import { prisma } from '../lib/prisma';

async function main() {
  try {
    const email = "admin_tester@letsearnify.com";
    console.log(`Promoting User: ${email}`);
    
    const user = await prisma.user.update({
      where: { email },
      data: {
        role: "ADMIN"
      }
    });

    console.log("✅ User Promoted Successfully.");
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);

  } catch (error: any) {
    console.error("❌ Promotion Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
