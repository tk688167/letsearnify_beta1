
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding basic tasks...')

  // Tasks to seed
  const tasks = [
    {
      title: 'Follow our Facebook Page',
      description: 'Follow the official LetsEarnify Facebook page to stay updated with the latest news and announcements.',
      reward: 5.0,
      type: 'SOCIAL',
      status: 'ACTIVE',
      link: 'https://www.facebook.com/share/1GMtvr2t3n/',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg'
    },
    {
      title: 'Follow us on Instagram',
      description: 'Follow our Instagram profile for daily updates and community highlights.',
      reward: 5.0,
      type: 'SOCIAL',
      status: 'ACTIVE',
      link: 'https://www.instagram.com/lets_earnifyoffical?utm_source=qr&igsh=OTJybTA2d2Z4bGQ3',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg'
    },
    {
      title: 'Subscribe to YouTube Channel',
      description: 'Subscribe to our YouTube channel for tutorials, webinars, and success stories.',
      reward: 10.0,
      type: 'SOCIAL',
      status: 'ACTIVE',
      link: 'https://www.youtube.com/@LetsEarnify', // Placeholder or real if provided later
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg'
    },
    {
      title: 'Join Telegram Channel',
      description: 'Join our Telegram channel for instant alerts and community discussions.',
      reward: 5.0,
      type: 'SOCIAL',
      status: 'ACTIVE',
      link: 'https://t.me/letsearnify', // Placeholder
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg'
    },
    {
      title: 'Join Facebook Group',
      description: 'Join our exclusive Facebook Community Group to connect with other earners.',
      reward: 5.0,
      type: 'SOCIAL',
      status: 'ACTIVE',
      link: 'https://www.facebook.com/groups/letsearnify', // Placeholder
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg'
    },
    {
      title: 'Verify Your Profile',
      description: 'Complete your profile information to verify your account and unlock more features.',
      reward: 15.0,
      type: 'APP', // APP type tasks might be internal
      status: 'ACTIVE',
      link: '/dashboard/profile',
      imageUrl: 'https://heroicons.com/static/check-badge.svg' // Conceptual
    },
    {
      title: 'Refer a User',
      description: 'Invite a friend to join LetsEarnify using your referral link.',
      reward: 20.0,
      type: 'APP',
      status: 'ACTIVE',
      link: '/dashboard/referrals',
      imageUrl: 'https://heroicons.com/static/user-group.svg' // Conceptual
    }
  ]

  for (const task of tasks) {
    // Check if exists
    const exists = await prisma.task.findFirst({
        where: { title: task.title }
    })

    if (!exists) {
        await prisma.task.create({
            data: task
        })
        console.log(`Created task: ${task.title}`)
    } else {
        console.log(`Task already exists: ${task.title}`)
        // Optional: Update link if changed
        if (task.link && exists.link !== task.link) {
             await prisma.task.update({
                 where: { id: exists.id },
                 data: { link: task.link }
             })
             console.log(`Updated link for: ${task.title}`)
        }
    }
  }

  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
