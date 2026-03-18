export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProfileView from "./profile-view"
import { getMlmData } from "@/lib/services/mlm-service"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  let user;
  let teamSize = 0;

  try {
    // Fetch full user and real team count in parallel
    const [dbUser, mlmData] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          _count: {
            select: { referrals: true }
          }
        }
      }),
      getMlmData(session.user.id)
    ]);

    user = dbUser;
    // Priority: user.activeMembers (stored field, same source as dashboard)
    // Fallback: actual referral tree count (all 3 levels)
    teamSize = (dbUser as any)?.activeMembers || mlmData.stats.teamSize;
  } catch (error) {
    console.error("⚠️ Profile Page DB error:", error);
    user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      memberId: 0,
      createdAt: new Date(),
      _count: { referrals: 0 },
      tier: "NEWBIE",
      balance: 0,
      arnBalance: 0,
    } as any;
    teamSize = 0;
  }

  if (!user) {
    redirect("/login")
  }

  return <ProfileView user={user} teamSize={teamSize} />
}
