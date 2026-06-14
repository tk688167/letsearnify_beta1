"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function updateTierConfig(tierName: string, data: { points: number, members: number }) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
      console.error("Unauthorized Tier Update Attempt");
      throw new Error("Unauthorized");
  }

  console.log("Tier Upsert Request:", { tierName, data });

  try {
      // Use upsert to handle both creation (if missing) and update
      await prisma.tierConfiguration.upsert({
        where: { tier: tierName },
        update: {
          requiredArn: data.points,
          members: data.members
        },
        create: {
          tier: tierName,
          requiredArn: data.points,
          members: data.members,
          levels: { L1: 0, L2: 0, L3: 0 } // Default levels, can be updated later if needed
        }
      })
  } catch (e) {
      console.error(`[TierUpsert] Failed:`, e);
      throw e;
  }

  revalidatePath("/admin/tiers/manage")
  revalidatePath("/dashboard") 
  revalidatePath("/dashboard/tiers")
  revalidatePath("/dashboard/referrals")
}

