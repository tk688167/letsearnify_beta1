
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning up old tasks...')

  // Delete all TaskCompletions first (referential integrity)
  const completions = await prisma.taskCompletion.deleteMany({})
  console.log(`Deleted ${completions.count} task completions.`)

  // Delete all Tasks
  const tasks = await prisma.task.deleteMany({})
  console.log(`Deleted ${tasks.count} tasks.`)

  console.log('✨ Task cleanup finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
