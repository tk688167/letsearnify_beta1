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
  } catch (error) {
    console.error("Create Country Error:", error)
    return { success: false, error: "Failed to create country" }
  }
}

export async function updateCountry(id: string, data: { name?: string, code?: string, currency?: string, status?: string, exchangeRate?: number, serviceFee?: number }) {
  try {
    await prisma.merchantCountry.update({ where: { id }, data })
    revalidatePath("/admin/merchant")
    revalidatePath("/dashboard/wallet")
    return { success: true, message: "Country updated successfully" }
  } catch (error) {
    return { success: false, error: "Failed to update country" }
  }
}

export async function deleteCountry(id: string) {
  try {
    await prisma.merchantCountry.delete({ where: { id } })
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
      data: { countryId, name: data.name, accountNumber: data.accountNumber, accountName: data.accountName, instructions: data.instructions }
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
    await prisma.merchantPaymentMethod.update({ where: { id }, data })
    revalidatePath("/admin/merchant")
    revalidatePath("/dashboard/wallet")
    return { success: true, message: "Payment method updated" }
  } catch (error) {
    return { success: false, error: "Failed to update payment method" }
  }
}

export async function deletePaymentMethod(id: string) {
  try {
    await prisma.merchantPaymentMethod.delete({ where: { id } })
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

    // 1. Pre-load imports outside transaction
    const { checkTierUpgrade, TIER_COMMISSIONS } = await import("@/lib/mlm")

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

            // 6. Check if user is active — if so, distribute referral commissions
            // Per PDF: "When Talha deposits, Ali receives his referral reward"
            const user = await tx.user.findUnique({
                where: { id: transaction.userId },
                select: { isActiveMember: true }
            })

            if (user?.isActiveMember) {
                // Distribute commissions to upline (L1, L2, L3)
                const tree = await tx.referralTree.findUnique({
                    where: { userId: transaction.userId }
                })

                if (tree) {
                    const sourceUser = await tx.user.findUnique({
                        where: { id: transaction.userId },
                        select: { name: true, email: true }
                    })
                    const sourceName = sourceUser?.name || sourceUser?.email || "a team member"

                    const uplineIds = [tree.advisorId, tree.supervisorId, tree.managerId].filter(Boolean) as string[]

                    for (let i = 0; i < uplineIds.length; i++) {
                        const uplineId = uplineIds[i]
                        const level = i + 1

                        const referrer = await tx.user.findUnique({
                            where: { id: uplineId },
                            select: { id: true, tier: true, isActiveMember: true }
                        })
                        if (!referrer) continue

                        const currentTier = (referrer.tier || "NEWBIE").toUpperCase();
                        const validTier = TIER_COMMISSIONS[currentTier] ? currentTier : "NEWBIE"
                        const rates = TIER_COMMISSIONS[validTier]
                        const rate = level === 1 ? rates.L1 : level === 2 ? rates.L2 : rates.L3

                        console.log(`[Merchant] Distributing commission: Earner=${uplineId}, Tier=${validTier}, Level=${level}, Rate=${rate}%`);

                        if (rate > 0) {
                            const commissionUSD = amount * (rate / 100)
                            const commissionARN = commissionUSD * 10

                            await tx.user.update({
                                where: { id: uplineId },
                                data: referrer.isActiveMember ? {
                                    arnBalance: { increment: commissionARN },
                                    balance: { increment: commissionUSD }
                                } : {
                                    lockedArnBalance: { increment: commissionARN },
                                    lockedBalance: { increment: commissionUSD }
                                }
                            })

                            await tx.referralCommission.create({
                                data: {
                                    earnerId: uplineId,
                                    sourceUserId: transaction.userId,
                                    amount: commissionUSD,
                                    level: level,
                                    percentage: rate
                                }
                            })

                            if (referrer.isActiveMember) {
                                await tx.transaction.create({
                                    data: {
                                        userId: uplineId,
                                        amount: commissionUSD,
                                        arnMinted: commissionARN,
                                        type: "REFERRAL_COMMISSION",
                                        status: "COMPLETED",
                                        method: "SYSTEM",
                                        description: `L${level} commission (${rate}%) from ${sourceName}'s $${amount.toFixed(2)} deposit`
                                    }
                                })
                            }
                        }
                    }
                }

                // Check tier upgrade for the depositor
                await checkTierUpgrade(transaction.userId, tx)
            }
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

    await prisma.$transaction(async (tx: any) => {
        await tx.merchantTransaction.update({
            where: { id: transactionId },
            data: { status: 'REJECTED' }
        })

        await tx.adminLog.create({
            data: {
                adminId: session.user.id || "SYSTEM",
                targetUserId: transactionId, // Or find the actual user id if needed
                actionType: "MERCHANT_REJECTION",
                details: `Rejected merchant transaction ID: ${transactionId}`
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