"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const depositSchema = z.object({
  countryCode: z.string(),
  paymentMethodId: z.string(),
  amount: z.number().positive(),
  screenshot: z.string(), // Base64 or file path
  note: z.string().optional()
})

const withdrawalSchema = z.object({
  countryCode: z.string(),
  paymentMethodId: z.string(),
  amount: z.number().positive(),
  accountNumber: z.string().min(1, "Account number is required"),
  accountName: z.string().min(1, "Account name is required"),
  note: z.string().optional()
})

export async function submitMerchantDeposit(data: z.infer<typeof depositSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const validated = depositSchema.parse(data)

    // NEW: Fetch country to get rate
    const country = await prisma.merchantCountry.findFirst({
        where: { code: validated.countryCode }
    })
    
    // Apply fixed PKR rule or use dynamic rate
    const finalRate = country?.currency === 'PKR' ? 300 : (country?.exchangeRate || 1.0)
    const convertedAmount = validated.amount * finalRate
    const currency = country?.currency || 'USD'

    // Create merchant transaction
    const transaction = await prisma.merchantTransaction.create({
      data: {
        userId: session.user.id,
        countryCode: validated.countryCode,
        paymentMethodId: validated.paymentMethodId,
        type: "DEPOSIT",
        amount: validated.amount,
        
        // Save currency info
        currency,
        exchangeRate: finalRate,
        convertedAmount,

        screenshot: validated.screenshot,
        note: validated.note,
        status: "PENDING"
      }
    })

    revalidatePath("/dashboard/wallet")
    
    return { 
      success: true, 
      message: "Deposit request submitted successfully! Admin will review and approve shortly.",
      transactionId: transaction.id
    }
  } catch (error: any) {
    console.error("Merchant deposit error:", error)
    return { success: false, error: error.message || "Failed to submit deposit" }
  }
}

export async function submitMerchantWithdrawal(data: z.infer<typeof withdrawalSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const validated = withdrawalSchema.parse(data)

    // Check user balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true }
    })

    if (!user || user.balance < validated.amount) {
      return { success: false, error: "Insufficient balance" }
    }

    // NEW: Fetch country to get rate
    const country = await prisma.merchantCountry.findFirst({
        where: { code: validated.countryCode }
    })
    
    // Apply fixed PKR rule or use dynamic rate
    const finalRate = country?.currency === 'PKR' ? 300 : (country?.exchangeRate || 1.0)
    const convertedAmount = validated.amount * finalRate
    const currency = country?.currency || 'USD'


    // Create merchant transaction
    const transaction = await prisma.merchantTransaction.create({
      data: {
        userId: session.user.id,
        countryCode: validated.countryCode,
        paymentMethodId: validated.paymentMethodId,
        type: "WITHDRAWAL",
        amount: validated.amount,

        // Save currency info
        currency,
        exchangeRate: finalRate,
        convertedAmount,

        accountNumber: validated.accountNumber,
        accountName: validated.accountName,
        note: validated.note,
        status: "PENDING"
      }
    })

    revalidatePath("/dashboard/wallet")
    
    return { 
      success: true, 
      message: "Withdrawal request submitted successfully! Your funds will be processed within 24-48 hours.",
      transactionId: transaction.id
    }
  } catch (error: any) {
    console.error("Merchant withdrawal error:", error)
    return { success: false, error: error.message || "Failed to submit withdrawal" }
  }
}

export async function getUserMerchantTransactions() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const transactions = await prisma.merchantTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return { success: true, transactions }
  } catch (error: any) {
    console.error("Get merchant transactions error:", error)
    return { success: false, error: error.message }
  }
}
