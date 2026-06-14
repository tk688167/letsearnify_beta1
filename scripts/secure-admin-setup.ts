
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const ADMIN_EMAIL = "admin@letsearnify.com"
  const ADMIN_PASSWORD = "Admin@123"

  console.log("🔒 Starting Secure Admin Setup...")

  // 1. Hash the password
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

  // 2. Upsert the Designated Admin
  console.log(`👤 Upserting Admin User: ${ADMIN_EMAIL}`)
  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
    create: {
      email: ADMIN_EMAIL,
      name: "Super Admin",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
      referralCode: "ADMIN001", // manual set
    },
  })
  console.log("✅ Admin User Secured:", adminUser.email)

  // 3. Demote ALL other users who currently have ADMIN role
  console.log("🧹 Scanning for unauthorized admins...")
  const otherAdmins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
      NOT: {
        email: ADMIN_EMAIL
      }
    }
  })

  if (otherAdmins.length > 0) {
    console.log(`⚠️ Found ${otherAdmins.length} unauthorized admins. Demoting them to USER...`)
    const demotionResult = await prisma.user.updateMany({
      where: {
        role: "ADMIN",
        NOT: {
          email: ADMIN_EMAIL
        }
      },
      data: {
        role: "USER"
      }
    })
    console.log(`✅ Demoted ${demotionResult.count} users successfully.`)
  } else {
    console.log("✨ No unauthorized admins found.")
  }

  console.log("🎉 Admin Security Lockdown Complete!")
}

main()
  .catch((e: any) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
