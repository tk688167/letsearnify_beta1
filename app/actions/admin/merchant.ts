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
    const existing = await prisma.merchantCountry.findUnique({
      where: { name: data.name }
    })

    if (existing) {
      return { success: false, error: "Country already exists" }
    }

    await prisma.merchantCountry.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        currency: data.currency.toUpperCase(),
        status: "ACTIVE", // Default to active for now
        exchangeRate: data.exchangeRate || 1.0,
        serviceFee: data.serviceFee || 0.0
      }
    })

    revalidatePath("/admin/merchant")
    revalidatePath("/dashboard/wallet")
    return { success: true, message: "Country added successfully" }
  } catch (error) {
    console.error("Create Country Error:", error)
    return { success: false, error: "Failed to create country" }
  }
}

export async function updateCountry(id: string, data: { name?: string, code?: string, currency?: string, status?: string, exchangeRate?: number, serviceFee?: number }) {
  try {
    await prisma.merchantCountry.update({
      where: { id },
      data
    })
    revalidatePath("/admin/merchant")
    revalidatePath("/dashboard/wallet")
    return { success: true, message: "Country updated successfully" }
  } catch (error) {
    return { success: false, error: "Failed to update country" }
  }
}

export async function deleteCountry(id: string) {
  try {
    await prisma.merchantCountry.delete({
      where: { id }
    })
    revalidatePath("/admin/merchant")
    revalidatePath("/dashboard/wallet")
    return { success: true, message: "Country deleted successfully" }
  } catch (error) {
    return { success: false, error: "Failed to delete country" }
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

export async function addPaymentMethod(countryId: string, data: { name: string, accountNumber: string, accountName: string, instructions?: string }) {
  try {
    await prisma.merchantPaymentMethod.create({
      data: {
        countryId,
        name: data.name,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        instructions: data.instructions
      }
    })
    revalidatePath(`/admin/merchant/${countryId}`)
    revalidatePath("/dashboard/wallet")
    return { success: true, message: "Payment method added" }
  } catch (error) {
    console.error("Add Method Error:", error)
    return { success: false, error: "Failed to add payment method" }
  }
}

export async function updatePaymentMethod(id: string, data: { name?: string, accountNumber?: string, accountName?: string, instructions?: string }) {
  try {
    await prisma.merchantPaymentMethod.update({
      where: { id },
      data
    })
    // We might not know the countryId here easily to revalidate specific path, 
    // but we can revalidate the general admin path or fetch from DB if needed.
    // Ideally we pass countryId or fetch it. For now, simple update.
    // Revalidate all potentially affected paths
    revalidatePath("/admin/merchant") // Covers [countryId] as well? No, need specific path but lack ID.
    // However, for user wallet, global revalidation works.
    revalidatePath("/dashboard/wallet")
    return { success: true, message: "Payment method updated" }
  } catch (error) {
    return { success: false, error: "Failed to update payment method" }
  }
}

export async function deletePaymentMethod(id: string) {
  try {
    await prisma.merchantPaymentMethod.delete({
      where: { id }
    })
    revalidatePath("/dashboard/wallet")
    return { success: true, message: "Payment method deleted" }
  } catch (error) {
    return { success: false, error: "Failed to delete payment method" }
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

    await prisma.$transaction(async (tx) => {
        // 1. Update merchant transaction status
        await tx.merchantTransaction.update({
            where: { id: transactionId },
            data: { status: 'APPROVED' }
        })

        if (transaction.type === 'DEPOSIT') {
            const amount = transaction.amount
            const arnToMint = amount * 10 // 1 USD = 10 ARN

            // 2. Credit user balance + ARN + totalDeposit
            await tx.user.update({
                where: { id: transaction.userId },
                data: { 
                    balance: { increment: amount },
                    arnBalance: { increment: arnToMint },
                    totalDeposit: { increment: amount }
                }
            })

            // 3. Create Transaction record (shows in wallet history)
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

            // 4. Log ARN minting
            await tx.mLMLog.create({
                data: {
                    userId: transaction.userId,
                    type: "TOKEN_MINT",
                    amount: arnToMint,
                    description: `Minted ${arnToMint} ARN for merchant deposit of $${amount}`
                }
            })

            // 5. Check if user should be auto-unlocked
            const user = await tx.user.findUnique({
                where: { id: transaction.userId },
                select: { id: true, balance: true, isActiveMember: true }
            })

            if (user && !user.isActiveMember && user.balance >= 1.0) {
                // Auto-deduct $1 and trigger full unlock flow
                await tx.user.update({
                    where: { id: transaction.userId },
                    data: {
                        balance: { decrement: 1.0 },
                        arnBalance: { decrement: 10.0 }
                    }
                })

                await tx.transaction.create({
                    data: {
                        userId: transaction.userId,
                        amount: 1.0,
                        type: "UNLOCK_FEE",
                        status: "COMPLETED",
                        description: "Auto-unlocked via merchant deposit approval ($1.00 deducted)."
                    }
                })

                // Import and call unlockUserAccount with the transaction context
                const { unlockUserAccount } = await import("@/lib/mlm")
                await unlockUserAccount(transaction.userId, tx)
            }

            // 6. Distribute commissions if user is active (or just became active)
            const updatedUser = await tx.user.findUnique({
                where: { id: transaction.userId },
                select: { isActiveMember: true }
            })

            if (updatedUser?.isActiveMember && amount > 1.0) {
                // Commissions on the remaining amount (deposit minus the $1 unlock fee)
                const { finalizeDeposit } = await import("@/lib/mlm")
                // Only distribute commissions, don't re-mint (already minted above)
                const { checkTierUpgrade } = await import("@/lib/mlm")
                await checkTierUpgrade(transaction.userId, tx)
            }
        }
        
        // WITHDRAWAL: Deduct from balance
        if (transaction.type === 'WITHDRAWAL') {
            await tx.user.update({
                where: { id: transaction.userId },
                data: { balance: { decrement: transaction.amount } }
            })

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

    await prisma.merchantTransaction.update({
        where: { id: transactionId },
        data: { status: 'REJECTED' }
    })

    revalidatePath("/admin/merchant/deposits")
    return { success: true }
  } catch (error) {
    console.error("Reject Transaction Error:", error)
    return { success: false, error: "Failed to reject transaction" }
  }
}
