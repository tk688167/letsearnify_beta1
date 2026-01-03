"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateSchema = z.object({
  name: z.enum(["CBSP", "Royalty", "Reward", "Emergency"]),
  amount: z.number().min(0, "Amount must be positive"),
  percentage: z.number().min(0).max(100, "Percentage must be between 0 and 100").optional(),
})

export async function getPools() {
    const pools = await prisma.pool.findMany();
    return pools;
}

export async function updatePool(data: { name: string, amount: number, percentage?: number }) {
  const session = await auth()
  
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const result = updateSchema.safeParse(data)
  
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { name, amount, percentage } = result.data

  try {
    // 1. Update Pool
    const pool = await prisma.pool.upsert({
        where: { name },
        update: { 
            balance: amount,
            ...(percentage !== undefined ? { percentage } : {})
        },
        create: {
            name,
            balance: amount,
            percentage: percentage || 0.0
        }
    })

    // 2. Log Action
    await prisma.adminLog.create({
        data: {
            adminId: session.user.id || "admin",
            actionType: "POOL_UPDATE",
            details: `Updated ${name} Pool: Balance=$${amount}, Percentage=${percentage ?? 'N/A'}%`,
        }
    })

    revalidatePath("/dashboard")
    revalidatePath("/admin/pools")
    
    return { success: true, pool }
  } catch (error) {
    console.error("Pool Update Error:", error)
    return { error: "Failed to update pool" }
  }
}
