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


// --- NEW HELPER FUNCTIONS ---


export async function getAllCountries() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return []

    try {
        // Fetch all countries with necessary fields
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,currencies,flags')
        if (!res.ok) return []
        
        const data = await res.json()
        return data.map((c: any) => ({
            name: c.name.common,
            code: c.cca2,
            currency: c.currencies ? Object.keys(c.currencies)[0] : "USD",
            flag: c.flags.svg
        })).sort((a: any, b: any) => a.name.localeCompare(b.name))
    } catch (error) {
        console.error("GetAllCountries error:", error)
        return []
    }
}

export async function searchCountries(query: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return []

    if (!query || query.length < 2) return []

    try {
        const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fields=name,cca2,currencies,flags`)
        if (!res.ok) return []
        
        const data = await res.json()
        return data.slice(0, 5).map((c: any) => ({
            name: c.name.common,
            code: c.cca2,
            currency: c.currencies ? Object.keys(c.currencies)[0] : "USD",
            flag: c.flags.svg
        }))
    } catch (error) {
        console.error("Country search error:", error)
        return []
    }
}

export async function fetchExchangeRate(currency: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return 1.0

    if (!currency || currency === "USD") return 1.0

    try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD')
        if (!res.ok) return 1.0
        
        const data = await res.json()
        return data.rates[currency] || 1.0
    } catch (error) {
        console.error("Rate fetch error:", error)
        return 1.0
    }
}

export async function fetchCountryConfig(countryName: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }

    try {
        // 1. Fetch Country Code & Currency from RestCountries
        const countryRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`)
        
        if (!countryRes.ok) {
           return { error: "Country not found. Please check the spelling." }
        }

        const countryData = await countryRes.json()
        const country = countryData[0] // Take the first match

        const code = country.cca2
        const currencies = country.currencies ? Object.keys(country.currencies) : []
        const currency = currencies.length > 0 ? currencies[0] : "USD"

        // 2. Fetch Exchange Rate from Open Exchange Rates (Free Tier or similar free API)
        // Using open.er-api.com which is a free mirror of Open Exchange Rates
        let exchangeRate = 1.0
        
        if (currency !== "USD") {
            try {
                const rateRes = await fetch('https://open.er-api.com/v6/latest/USD')
                if (rateRes.ok) {
                    const rateData = await rateRes.json()
                    exchangeRate = rateData.rates[currency] || 1.0
                }
            } catch (err) {
                console.error("Failed to fetch exchange rate:", err)
                // Fallback to 1.0 or keep previous
            }
        }

        return {
            success: true,
            data: {
                name: country.name.common,
                code,
                currency,
                exchangeRate
            }
        }

    } catch (error: any) {
        return { error: "Failed to fetch country configuration: " + error.message }
    }
}

export async function syncAllExchangeRates() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }
    
    try {
        // Fetch latest rates once to minimize API calls
        const rateRes = await fetch('https://open.er-api.com/v6/latest/USD')
        if (!rateRes.ok) throw new Error("Failed to fetch rates")
        
        const rateData = await rateRes.json()
        const rates = rateData.rates

        const countries = await prisma.merchantCountry.findMany({
            where: { status: "ACTIVE" }
        })

        let updatedCount = 0

        for (const country of countries) {
            if (country.currency && country.currency !== "USD" && rates[country.currency]) {
                await prisma.merchantCountry.update({
                    where: { id: country.id },
                    data: { exchangeRate: rates[country.currency] } 
                })
                updatedCount++
            }
        }
        
        revalidatePath("/admin/settings/merchant")
        return { success: true, updated: updatedCount }

    } catch (error: any) {
        return { error: error.message }
    }
}


export async function addCountry(
    name: string, 
    code: string, 
    currency: string = "USD", 
    exchangeRate: number = 1.0, 
    status: "ACTIVE" | "COMING_SOON" = "COMING_SOON", 
    description?: string, 
    instruction?: string
) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }
    
    try {
        const existing = await prisma.merchantCountry.findFirst({
            where: { 
                name: {
                    equals: name,
                    // mode: 'insensitive' 
                } 
            }
        })

        if (existing) {
            return { error: `Country '${name}' already exists.` }
        }

        await prisma.merchantCountry.create({
            data: { 
                name, 
                code, 
                currency, 
                exchangeRate, 
                status, 
                description, 
                instruction 
            }
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

export async function updateCountryDetails(id: string, data: { description?: string, instruction?: string, withdrawalDescription?: string, withdrawalInstruction?: string, currency?: string, exchangeRate?: number }) {
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

export async function updatePaymentMethodDetails(
    id: string, 
    accountNumber?: string, 
    accountName?: string, 
    instructions?: string
) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" }
    
    try {
        await prisma.merchantPaymentMethod.update({
            where: { id },
            data: { 
                accountNumber: accountNumber || null, 
                accountName: accountName || null, 
                instructions: instructions || null 
            }
        })
        revalidatePath("/admin/settings/merchant")
        revalidatePath("/dashboard/wallet/merchant")
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
