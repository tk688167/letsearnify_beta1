import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"

dotenv.config()
const prisma = new PrismaClient()

async function migrate() {
  console.log("🚀 Starting Locked Balance Migration...")

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { lockedBalance: { gt: 0 } },
          { lockedArnBalance: { gt: 0 } }
        ]
      }
    })

    console.log(`🔍 Found ${users.length} users with locked funds.`)

    for (const user of users) {
      console.log(`📦 Migrating ${user.email || user.id}:`)
      console.log(`   - Locked USD: ${user.lockedBalance} -> 0`)
      console.log(`   - Locked ARN: ${user.lockedArnBalance} -> 0`)

      await prisma.user.update({
        where: { id: user.id },
        data: {
          balance: { increment: user.lockedBalance || 0 },
          arnBalance: { increment: user.lockedArnBalance || 0 },
          lockedBalance: 0,
          lockedArnBalance: 0
        }
      })
    }

    console.log("✅ Migration completed successfully!")
  } catch (error) {
    console.error("❌ Migration failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

migrate()
