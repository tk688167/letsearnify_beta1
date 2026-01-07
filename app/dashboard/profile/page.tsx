import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProfileView from "./profile-view"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch full user data including referral counts
  const user: any = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    include: {
      _count: {
        select: { referrals: true }
      }
    }
  })

  if (!user) {
    redirect("/login")
  }

  return <ProfileView user={user} />
}
