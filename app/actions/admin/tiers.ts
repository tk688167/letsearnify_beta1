"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function updateTierConfig(id: string, data: { points: number, members: number }) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

  await prisma.tierConfiguration.update({
    where: { id },
    data: {
      points: data.points,
      members: data.members
    }
  })

  revalidatePath("/admin/tiers/manage")
  revalidatePath("/dashboard") 
  revalidatePath("/dashboard/tiers")
  revalidatePath("/dashboard/referrals")
}
