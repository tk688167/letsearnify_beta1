import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AchievementPoolContent from "./AchievementPoolContent"
import { prisma } from "@/lib/prisma"

export const metadata = {
  title: "Achievement Pool - Reward Pools | LetsEarnify",
  description: "Learn about Achievement Pool bonuses for completing milestones and achievements.",
}

export default async function AchievementPoolPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const rewardPool = await prisma.pool.findUnique({
    where: { name: "REWARD" }
  })

  // Default to 20% if not set in DB
  const percentage = rewardPool?.percentage ?? 20.0;
  const balance = rewardPool?.balance ?? 0.0;

  return (
    <div className="p-6 md:p-8">
      <AchievementPoolContent percentage={percentage} balance={balance} />
    </div>
  )
}
