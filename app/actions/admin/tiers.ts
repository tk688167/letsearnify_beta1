"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function updateTierConfig(id: string, data: { points: number, members: number }) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
      console.error("Unauthorized Tier Update Attempt");
      throw new Error("Unauthorized");
  }



  try {
      await prisma.tierConfiguration.update({
        where: { tier: id }, // 'id' contains the tier name (e.g. "BRONZE")
        data: {
          requiredArn: data.points,
          members: data.members
        }
      })
  } catch (e) {
      console.error(`[TierUpdate] Failed:`, e);
      throw e;
  }

  revalidatePath("/admin/tiers/manage")
  revalidatePath("/dashboard") 
  revalidatePath("/dashboard/tiers")
  revalidatePath("/dashboard/referrals")
}
