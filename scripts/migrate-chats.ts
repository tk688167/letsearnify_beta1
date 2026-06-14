import { prisma } from '../lib/prisma'

async function main() {
  console.log('🚀 Starting chat migration...')

  try {
    // 1. Get all unique users who have chat messages
    const distinctUserIds = await (prisma as any).chatMessage.findMany({
      where: { conversationId: null },
      distinct: ['userId'],
      select: { userId: true },
    })

    console.log(`Found ${distinctUserIds.length} users with existing messages.`)

    for (const { userId } of distinctUserIds) {
      if (!userId) continue

      console.log(`Processing user: ${userId}`)

      // 2. Create a default "General Support" conversation for the user
      const conversation = await (prisma as any).chatConversation.create({
        data: {
          userId,
          title: 'General Support',
          status: 'OPEN',
        },
      })

      // 3. Link all messages of this user to this conversation
      const updated = await (prisma as any).chatMessage.updateMany({
        where: { userId, conversationId: null },
        data: { conversationId: conversation.id },
      })

      console.log(`Moved ${updated.count} messages to conversation: ${conversation.id}`)
    }

    console.log('✅ Migration completed successfully!')
  } catch (err) {
    console.error('❌ Migration logic error:', err)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    // Note: Disconnect is handled inside our prisma singleton usually, 
    // but in a script we might want it. However, prisma proxy doesn't expose it directly.
  })
