"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

// --- Country Management ---

export async function getCountries() {
  try {
    const countries = await prisma.merchantCountry.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { methods: true } } }
    })
    return { success: true, data: countries }
  } catch (error) {
    return { success: false, error: "Failed to fetch countries" }
  }
}

export async function createCountry(data: { name: string, code: string, currency: string, exchangeRate?: number, serviceFee?: number }) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return { success: false, error: "Unauthorized" }
    }

    const existing = await prisma.merchantCountry.findUnique({ where: { name: data.name } })
    if (existing) return { success: false, error: "Country already exists" }

    await prisma.merchantCountry.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        currency: data.currency.toUpperCase(),
        status: "ACTIVE",
        exchangeRate: data.exchangeRate || 1.0,
        serviceFee: data.serviceFee || 0.0
      }
    })

    revalidatePath("/admin/merchant")
    revalidatePath("/dashboard/wallet")
    return { success: true, message: "Country added successfully" }
  } catch (error: any) {
    console.error("Create Country Error:", error)
    return { success: false, error: `Failed to create country: ${error?.message || "Unknown error"}` }
  }
}

export async function updateCountry(id: string, data: { name?: string, code?: string, currency?: string, status?: string, exchangeRate?: number, serviceFee?: number }) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return { success: false, error: "Unauthorized" }
    }

    await prisma.merchantCountry.update({ where: { id }, data })
    revalidatePath("/admin/merchant")
    revalidatePath("/dashboard/wallet")
    return { success: true, message: "Country updated successfully" }
  } catch (error: any) {
    console.error("Update Country Error:", error)
    return { success: false, error: `Failed to update country: ${error?.message || "Unknown error"}` }
  }
}

export async function deleteCountry(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return { success: false, error: "Unauthorized" }
    }

    await prisma.merchantCountry.delete({ where: { id } })
    revalidatePath("/admin/merchant")
    revalidatePath("/dashboard/wallet")
    return { success: true, message: "Country deleted successfully" }
  } catch (error: any) {
    console.error("Delete Country Error:", error)
    return { success: false, error: `Failed to delete country: ${error?.message || "Unknown error"}` }
  }
}

// --- Payment Method Management ---

export async function getPaymentMethods(countryId: string) {
  try {
    const methods = await prisma.merchantPaymentMethod.findMany({
      where: { countryId },
      orderBy: { name: 'asc' }
    })
    return { success: true, data: methods }
  } catch (error) {
    return { success: false, error: "Failed to fetch payment methods" }
  }
}

export async function addPaymentMethod(countryId: string, data: { name: string, accountNumber: string, accountName: string, iban?: string, instructions?: string }) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return { success: false, error: "Unauthorized" }
    }

    // Normalize data: ensure empty strings are treated as null if they are optional
    const normalizedData = {
      countryId,
      name: data.name,
      accountNumber: data.accountNumber,
      accountName: data.accountName,
      iban: data.iban && data.iban.trim() !== "" ? data.iban : null,
      instructions: data.instructions && data.instructions.trim() !== "" ? data.instructions : null
    }

    await prisma.merchantPaymentMethod.create({
      data: normalizedData
    })
    
    revalidatePath(`/admin/merchant/${countryId}`)
    revalidatePath("/admin/merchant")
    revalidatePath("/dashboard/wallet")
    return { success: true, message: "Payment method added" }
  } catch (error: any) {
    console.error("Add Method Error:", error)
    return { success: false, error: `Failed to add payment method: ${error?.message || "Unknown error"}` }
  }
}

export async function updatePaymentMethod(id: string, data: { name?: string, accountNumber?: string, accountName?: string, iban?: string, instructions?: string }) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return { success: false, error: "Unauthorized" }
    }

    await prisma.merchantPaymentMethod.update({ where: { id }, data })
    revalidatePath("/admin/merchant")
    revalidatePath("/dashboard/wallet")
    return { success: true, message: "Payment method updated" }
  } catch (error: any) {
    console.error("Update Method Error:", error)
    return { success: false, error: `Failed to update payment method: ${error?.message || "Unknown error"}` }
  }
}

export async function deletePaymentMethod(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return { success: false, error: "Unauthorized" }
    }

    // Find countryId before deletion for revalidation
    const method = await prisma.merchantPaymentMethod.findUnique({ 
        where: { id },
        select: { countryId: true }
    })

    await prisma.merchantPaymentMethod.delete({ where: { id } })
    
    if (method?.countryId) {
        revalidatePath(`/admin/merchant/${method.countryId}`)
    }
    revalidatePath("/admin/merchant")
    revalidatePath("/dashboard/wallet")
    return { success: true, message: "Payment method deleted" }
  } catch (error: any) {
    console.error("Delete Method Error:", error)
    return { success: false, error: `Failed to delete payment method: ${error?.message || "Unknown error"}` }
  }
}

export async function approveMerchantTransaction(transactionId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return { success: false, error: "Unauthorized" }
    }

    const transaction = await prisma.merchantTransaction.findUnique({
        where: { id: transactionId }
    })

    if (!transaction || transaction.status !== 'PENDING') {
        return { success: false, error: "Transaction not found or already processed" }
    }

    // 1. Pre-load imports outside transaction
    const { checkTierUpgrade } = await import("@/lib/mlm")

    await prisma.$transaction(async (tx: any) => {
        // 2. Update merchant transaction status
        await tx.merchantTransaction.update({
            where: { id: transactionId },
            data: { status: 'APPROVED' }
        })

        if (transaction.type === 'DEPOSIT') {
            const amount = transaction.amount
            const arnToMint = amount * 10 // 10 ARN = 1 USD

            // 3. Credit user balance + ARN + totalDeposit
            await tx.user.update({
                where: { id: transaction.userId },
                data: { 
                    balance: { increment: amount },
                    arnBalance: { increment: arnToMint },
                    totalDeposit: { increment: amount }
                }
            })

            // 4. Create Transaction record
            await tx.transaction.create({
                data: {
                    userId: transaction.userId,
                    amount: amount,
                    arnMinted: arnToMint,
                    type: "DEPOSIT",
                    status: "COMPLETED",
                    method: "MERCHANT",
                    description: `Merchant deposit via ${transaction.countryCode} (${transaction.currency || 'USD'})`
                }
            })

            // 5. Log ARN minting
            await tx.mLMLog.create({
                data: {
                    userId: transaction.userId,
                    type: "TOKEN_MINT",
                    amount: arnToMint,
                    description: `Minted ${arnToMint} ARN for merchant deposit of $${amount}`
                }
            })

            // 6. Check for Tier Upgrades (Deposits contribute to Tier ARN)
            await checkTierUpgrade(transaction.userId, tx)
        }
        
        // 7. Audit log Entry
        await tx.adminLog.create({
            data: {
                adminId: session.user.id || "SYSTEM",
                targetUserId: transaction.userId,
                actionType: "MERCHANT_APPROVAL",
                details: `Approved ${transaction.type} of ${transaction.amount} via ${transaction.paymentMethodId || 'MERCHANT'}. ID: ${transaction.id}`
            }
        })
        
        // WITHDRAWAL
        if (transaction.type === 'WITHDRAWAL') {
            await tx.transaction.create({
                data: {
                    userId: transaction.userId,
                    amount: transaction.amount,
                    type: "WITHDRAWAL",
                    status: "COMPLETED",
                    method: "MERCHANT",
                    description: `Merchant withdrawal via ${transaction.countryCode} (${transaction.currency || 'USD'})`
                }
            })
        }
    }, {
        maxWait: 10000,
        timeout: 30000,
    })
    
    revalidatePath("/admin/merchant/deposits")
    revalidatePath("/dashboard/wallet")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("Approve Transaction Error:", error)
    return { success: false, error: `FAILED: ${error?.message?.substring(0, 200) || "Unknown error"}` }
  }
}

export async function rejectMerchantTransaction(transactionId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return { success: false, error: "Unauthorized" }
    }

    const transaction = await prisma.merchantTransaction.findUnique({
        where: { id: transactionId }
    })

    if (!transaction || transaction.status !== 'PENDING') {
        return { success: false, error: "Transaction not found or already processed" }
    }

    await prisma.$transaction(async (tx: any) => {
        await tx.merchantTransaction.update({
            where: { id: transactionId },
            data: { status: 'REJECTED' }
        })

        if (transaction.type === 'WITHDRAWAL') {
            const arnToRefund = transaction.amount * 10;
            await tx.user.update({
                where: { id: transaction.userId },
                data: {
                    balance: { increment: transaction.amount },
                    arnBalance: { increment: arnToRefund }
                }
            })
        }

        await tx.adminLog.create({
            data: {
                adminId: session.user.id || "SYSTEM",
                targetUserId: transaction.userId,
                actionType: "MERCHANT_REJECTION",
                details: `Rejected merchant ${transaction.type.toLowerCase()} ID: ${transactionId}`
            }
        })
    })

    revalidatePath("/admin/merchant/deposits")
    return { success: true }
  } catch (error: any) {
    console.error("Reject Transaction Error:", error)
    return { success: false, error: `FAILED: ${error?.message?.substring(0, 200) || "Unknown error"}` }
  }
}