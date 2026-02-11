export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProfileView from "./profile-view"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  let user;

  try {
      user = await prisma.user.findUnique({
        where: {
          id: session.user.id
        },
        include: {
          _count: {
            select: { referrals: true }
          }
        }
      })
  } catch (error) {
       console.error("⚠️ Profile Page Offline Mode:", error);
       user = {
           id: session.user.id,
           name: session.user.name,
           email: session.user.email,
           memberId: 0,
           createdAt: new Date(),
           _count: { referrals: 0 },
           tier: "NEWBIE"
       } as any;
  }

  if (!user) {
    redirect("/login")
  }

  return <ProfileView user={user} />
}
