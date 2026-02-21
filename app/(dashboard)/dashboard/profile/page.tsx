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
      // Anti-Gravity: Handle Super Admin Bypass
      if (session.user.id === "super-admin-id") {
          user = {
            id: "super-admin-id",
            name: "Super Admin",
            email: session.user.email,
            memberId: "777777",
            createdAt: new Date(),
            _count: { referrals: 0 },
            tier: "EMERALD",
            isActiveMember: true,
            kycStatus: "VERIFIED",
            image: null,
            balance: 5000,
            arnBalance: 1000,
            phoneNumber: "+1234567890",
            country: "United States",
            referralCode: "SUPER-ADMIN"
          } as any;
      } else {
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
      }
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
