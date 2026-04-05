import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedTasks() {
  console.log('🌱 Seeding sample tasks...')

  const sampleTasks = [
    {
      title: "Like Our Facebook Post",
      description: "Visit our Facebook page and like our latest post to earn ARN tokens. This helps us grow our community!",
      reward: 50,
      type: "SOCIAL",
      status: "ACTIVE",
      link: "https://facebook.com/letsearnify",
      imageUrl: null
    },
    {
      title: "Subscribe to Our YouTube Channel",
      description: "Subscribe to our YouTube channel and turn on notifications to stay updated with our latest videos and earn extra ARN!",
      reward: 100,
      type: "SOCIAL",
      status: "ACTIVE",
      link: "https://youtube.com/@letsearnify",
      imageUrl: null
    },
    {
      title: "Follow Us on Instagram",
      description: "Follow our Instagram profile for daily updates, tips, and exclusive content. Earn ARN tokens instantly!",
      reward: 75,
      type: "SOCIAL",
      status: "ACTIVE",
      link: "https://instagram.com/letsearnify",
      imageUrl: null
    },
    {
      title: "Share on Twitter",
      description: "Share our platform on Twitter (X) with your network and help spread the word. Include #LetsEarnify in your post!",
      reward: 80,
      type: "SOCIAL",
      status: "ACTIVE",
      link: "https://twitter.com/intent/tweet?text=Check%20out%20LetsEarnify!",
      imageUrl: null
    },
    {
      title: "Join Our Telegram Group",
      description: "Join our official Telegram community to connect with other users, get support, and receive exclusive announcements!",
      reward: 120,
      type: "SOCIAL",
      status: "ACTIVE",
      link: "https://t.me/letsearnify",
      imageUrl: null
    }
  ]

  for (const task of sampleTasks) {
    const existing = await prisma.task.findFirst({
      where: { title: task.title }
    })

    if (!existing) {
      await prisma.task.create({ data: task })
      console.log(`✅ Created task: ${task.title}`)
    } else {
      console.log(`⏭️  Task already exists: ${task.title}`)
    }
  }

  console.log('✨ Sample tasks seeding complete!')
}

seedTasks()
  .catch((e: any) => {
    console.error('❌ Error seeding tasks:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
