import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AchievementPoolContent from "./AchievementPoolContent"
import { FeatureGuard } from "../../FeatureGuard"

export const metadata = {
  title: "Achievement Pool - Reward Pools | LetsEarnify",
  description: "Learn about Achievement Pool bonuses for completing milestones and achievements.",
}

export default async function AchievementPoolPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <FeatureGuard title="Achievement Pool" feature="pools">
      <div className="p-6 md:p-8">
        <AchievementPoolContent />
      </div>
    </FeatureGuard>
  )
}
