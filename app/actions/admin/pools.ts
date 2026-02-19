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
  
  if (session?.user?.id === "super-admin-id" || session?.user?.role === "ADMIN") {
    // Authorized
  } else {
    throw new Error("Unauthorized")
  }

  const result = updateSchema.safeParse(data)
  
  if (!result.success) {
    return { error: result.error.issues[0].message }
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

export async function updateCbspPercentage(percentage: number) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    if (session?.user?.id === "super-admin-id" || (session.user as any).role === "ADMIN") {
        // Authorized
    } else {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (user?.role !== "ADMIN") return { error: "Unauthorized" };
    }

    if (percentage < 0 || percentage > 100) return { error: "Invalid percentage" };

    try {
        const pool = await prisma.pool.upsert({
            where: { name: "CBSP" },
            update: { percentage },
            create: {
                name: "CBSP",
                balance: 0,
                percentage,
                description: "Company Business Share Profit Pool"
            }
        });

        await prisma.adminLog.create({
            data: {
                adminId: session.user.id!,
                actionType: "POOL_CONFIG_UPDATE",
                details: `Updated CBSP Percentage to ${percentage}%`
            }
        });

        revalidatePath("/admin/pools/cbspool");
        return { success: true, percentage };
    } catch (e: any) {
        return { error: e.message || "Failed to update percentage" };
    }
}
