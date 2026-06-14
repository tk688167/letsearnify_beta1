"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Validation Schemas
const createCompanySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  logoUrl: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
})

const updateCompanySchema = createCompanySchema.partial()

export async function createCompany(formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

    const rawData = {
        name: formData.get("name"),
        logoUrl: formData.get("logoUrl"),
        status: formData.get("status") || "ACTIVE",
    }

    const validated = createCompanySchema.parse(rawData)

    await prisma.company.create({
        data: {
            name: validated.name as string, // Zod infers correctly but TS here might need assurance or careful typing
            logoUrl: validated.logoUrl,
            status: validated.status as string,
        }
    })

    revalidatePath("/admin/tasks")
    return { success: true }
}

export async function updateCompany(id: string, formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

    const rawData = {
        name: formData.get("name"),
        logoUrl: formData.get("logoUrl"),
        status: formData.get("status"),
    }

    // Filter out nulls/undefined for partial update
    const dataToValidate: any = {}
    if (rawData.name) dataToValidate.name = rawData.name
    if (rawData.logoUrl) dataToValidate.logoUrl = rawData.logoUrl
    if (rawData.status) dataToValidate.status = rawData.status

    const validated = updateCompanySchema.parse(dataToValidate)

    await prisma.company.update({
        where: { id },
        data: validated
    })

    revalidatePath("/admin/tasks")
    return { success: true }
}

export async function deleteCompany(id: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

    await prisma.company.delete({ where: { id } })
    revalidatePath("/admin/tasks")
    return { success: true }
}

export async function getCompanies() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

    return await prisma.company.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { tasks: true } } }
    })
}

export async function toggleCompanyStatus(id: string, currentStatus: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    
    await prisma.company.update({
        where: { id },
        data: { status: newStatus }
    })
    
    revalidatePath("/admin/tasks")
    revalidatePath("/dashboard/tasks") // Sync to user side
    return { success: true }
}
