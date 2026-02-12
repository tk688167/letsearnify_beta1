
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Copy paste form lib/spin-config.ts because we can't import TS file in JS script easily without ts-node set up perfectly
const FREE_REWARDS = [
    { label: "5 ARN", value: 5, type: "ARN", probability: 0.30, color: "#eef2ff", textColor: "#4f46e5" }, 
    { label: "7 ARN", value: 7, type: "ARN", probability: 0.25, color: "#e0e7ff", textColor: "#4338ca" }, 
    { label: "10 ARN", value: 10, type: "ARN", probability: 0.15, color: "#c7d2fe", textColor: "#3730a3" }, 
    { label: "Try Again", value: 0, type: "TRY_AGAIN", probability: 0.15, color: "#f3f4f6", textColor: "#6b7280" }, 
    { label: "Bonus Spin", value: 1, type: "BONUS_SPIN", probability: 0.10, color: "#d1fae5", textColor: "#059669" }, 
    { label: "Surprise!", value: 0, type: "SURPRISE", probability: 0.05, color: "#fce7f3", textColor: "#db2777" }, 
]

const PREMIUM_REWARDS = [
    { label: "20 ARN", value: 20, type: "ARN", probability: 0.25, color: "linear-gradient(135deg, #FFD700 0%, #FDB931 100%)", textColor: "#78350f" }, 
    { label: "50 ARN", value: 50, type: "ARN", probability: 0.25, color: "linear-gradient(135deg, #FDB931 0%, #FFD700 100%)", textColor: "#78350f" },
    { label: "100 ARN", value: 100, type: "ARN", probability: 0.15, color: "linear-gradient(135deg, #bfdbfe 0%, #60a5fa 100%)", textColor: "#1e3a8a" }, 
    { label: "+3 Spins", value: 3, type: "BONUS_SPIN", probability: 0.15, color: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)", textColor: "#064e3b" }, 
    { label: "$0.10", value: 0.10, type: "MONEY", probability: 0.10, color: "linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)", textColor: "#7f1d1d" }, 
    { label: "Mega Gift", value: 0, type: "SURPRISE", probability: 0.10, color: "linear-gradient(135deg, #d8b4fe 0%, #a855f7 100%)", textColor: "#581c87" }, 
]

async function main() {
  console.log('Seeding Spin Rewards...')

  const count = await prisma.spinReward.count()
  if (count > 0) {
      console.log('Spin Rewards already seeded.')
      return
  }

  for (let i = 0; i < FREE_REWARDS.length; i++) {
      const r = FREE_REWARDS[i]
      await prisma.spinReward.create({
          data: {
              ...r,
              spinType: "FREE",
              order: i
          }
      })
  }

  for (let i = 0; i < PREMIUM_REWARDS.length; i++) {
      const r = PREMIUM_REWARDS[i]
      await prisma.spinReward.create({
          data: {
              ...r,
              spinType: "PREMIUM",
              order: i
          }
      })
  }
  
  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
