import { Metadata } from "next"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import PoolsPageContent from "@/app/components/pages/PoolsPageContent"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Reward Pools | LetsEarnify",
  description: "Discover our three powerful reward pools - CBSP Pool for community sharing, Royalty Pool for top performers, and Achievement Pool for milestone rewards.",
}

export default async function PoolsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActiveMember: true }
  })

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">Reward Pools</h1>
        <p className="text-muted-foreground">Explore our three reward systems designed to maximize your earnings</p>
      </header>
      <PoolsPageContent isActiveMember={user?.isActiveMember || false} />
    </div>
  )
}