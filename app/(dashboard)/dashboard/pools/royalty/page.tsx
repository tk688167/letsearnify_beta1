import { auth } from "@/auth"
import { redirect } from "next/navigation"
import RoyaltyPoolContent from "./RoyaltyPoolContent"
import { FeatureGuard } from "../../FeatureGuard"

export const metadata = {
  title: "Royalty Pool - Reward Pools | LetsEarnify",
  description: "Learn how the Royalty Pool rewards top performers in Platinum, Diamond, and Emerald tiers with monthly distributions.",
}

export default async function RoyaltyPoolPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <FeatureGuard title="Royalty Pool" feature="royalty">
      <div className="p-6 md:p-8">
        <RoyaltyPoolContent />
      </div>
    </FeatureGuard>
  )
}
