"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getMerchantSettings() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return []
    
    return await prisma.merchantCountry.findMany({
        include: {
            methods: true,
            contacts: true
        },
        orderBy: {
            createdAt: 'asc'
        }
    })
}

export async function addCountry(name: string, code: string, status: "ACTIVE" | "COMING_SOON" = "COMING_SOON", description?: string, instruction?: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }
    
    try {
        const existing = await prisma.merchantCountry.findFirst({
            where: { 
                name: {
                    equals: name,
                    mode: 'insensitive' // Case insensitive check
                } 
            }
        })

        if (existing) {
            return { error: `Country '${name}' already exists.` }
        }

        await prisma.merchantCountry.create({
            data: { name, code, status, description, instruction }
        })
        revalidatePath("/admin/settings/merchant")
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}

export async function updateCountryStatus(id: string, status: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }
    
    try {
        await prisma.merchantCountry.update({
            where: { id },
            data: { status }
        })
        revalidatePath("/admin/settings/merchant")
        revalidatePath("/dashboard/wallet/merchant-deposit")
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}

export async function updateCountryDetails(id: string, data: { description?: string, instruction?: string, withdrawalDescription?: string, withdrawalInstruction?: string }) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }
    
    try {
        await prisma.merchantCountry.update({
            where: { id },
            data
        })
        revalidatePath("/admin/settings/merchant")
        revalidatePath("/dashboard/wallet/merchant-deposit")
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}

export async function deleteCountry(id: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }
    
    try {
        await prisma.merchantCountry.delete({
            where: { id }
        })
        revalidatePath("/admin/settings/merchant")
        revalidatePath("/dashboard/wallet/merchant-deposit")
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}

export async function addPaymentMethod(countryId: string, name: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }
    
    try {
        await prisma.merchantPaymentMethod.create({
            data: { countryId, name }
        })
        revalidatePath("/admin/settings/merchant")
        revalidatePath("/dashboard/wallet/merchant-deposit")
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}

export async function updatePaymentMethod(id: string, name: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }
    
    try {
        await prisma.merchantPaymentMethod.update({
            where: { id },
            data: { name }
        })
        revalidatePath("/admin/settings/merchant")
        revalidatePath("/dashboard/wallet/merchant-deposit")
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}

export async function deletePaymentMethod(id: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }
    
    try {
        await prisma.merchantPaymentMethod.delete({
            where: { id }
        })
        revalidatePath("/admin/settings/merchant")
        revalidatePath("/dashboard/wallet/merchant-deposit")
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}

export async function addMerchantContact(countryId: string, name: string, phone: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }
    
    try {
        await prisma.merchantContact.create({
            data: { countryId, name, phone }
        })
        revalidatePath("/admin/settings/merchant")
        revalidatePath("/dashboard/wallet/merchant-deposit")
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}

export async function updateMerchantContact(id: string, name: string, phone: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }
    
    try {
        await prisma.merchantContact.update({
            where: { id },
            data: { name, phone }
        })
        revalidatePath("/admin/settings/merchant")
        revalidatePath("/dashboard/wallet/merchant-deposit")
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}

export async function deleteMerchantContact(id: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }
    
    try {
        await prisma.merchantContact.delete({
            where: { id }
        })
        revalidatePath("/admin/settings/merchant")
        revalidatePath("/dashboard/wallet/merchant-deposit")
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}
