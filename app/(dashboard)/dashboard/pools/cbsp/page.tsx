import { auth } from "@/auth"
import { redirect } from "next/navigation"
import CbspPoolContent from "./CbspPoolContent"

export const metadata = {
  title: "CBSP Pool - Reward Pools | LetsEarnify",
  description: "Learn how the Community Benefit Sharing Program (CBSP) Pool distributes weekly rewards to all eligible members.",
}

export default async function CbspPoolPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <div className="p-6 md:p-8">
      <CbspPoolContent />
    </div>
  )
}
