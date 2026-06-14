"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const depositSchema = z.object({
  countryCode: z.string(),
  paymentMethodId: z.string(),
  amount: z.number().positive(),
  localAmount: z.number().optional(),
  currency: z.string().optional(),
  screenshot: z.string(), // Base64 or file path
  note: z.string().optional()
})

const withdrawalSchema = z.object({
  countryCode: z.string(),
  paymentMethodId: z.string(),
  amount: z.number().positive(),
  localAmount: z.number().optional(),
  currency: z.string().optional(),
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
    
    // Unified Rate Logic: Use country setting or default to 1.0
    const finalRate = country?.exchangeRate || 1.0
    const currency = country?.currency || validated.currency || 'USD'
    
    // Identity Local Amount: Prefer the raw amount passed from frontend to avoid drift
    const convertedAmount = validated.localAmount || (validated.amount * finalRate)

    // Create merchant transaction
    const transaction = await prisma.merchantTransaction.create({
      data: {
        userId: session.user.id,
        countryCode: validated.countryCode,
        paymentMethodId: validated.paymentMethodId,
        type: "DEPOSIT",
        amount: validated.amount, // USD value
        
        // Save currency info & snapshot rate
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

import { getTierWithdrawLimit } from "@/lib/mlm"

export async function submitMerchantWithdrawal(data: z.infer<typeof withdrawalSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const validated = withdrawalSchema.parse(data)

    // 1. Check for Pending Withdrawals (Merchant or TRC20)
    const [pendingMerchant, pendingCrypto] = await Promise.all([
        prisma.merchantTransaction.findFirst({
            where: { userId: session.user.id, type: "WITHDRAWAL", status: "PENDING" }
        }),
        prisma.transaction.findFirst({
            where: { userId: session.user.id, type: "WITHDRAWAL", status: "PENDING" }
        })
    ]);

    if (pendingMerchant || pendingCrypto) {
        return { success: false, error: "You already have a pending withdrawal request." }
    }

    // 2. Fetch User & Validation
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true, arnBalance: true, lastWithdrawalTime: true, tier: true, isActiveMember: true }
    })

    if (!user) return { success: false, error: "User not found" }

    if (user.balance < validated.amount) {
      return { success: false, error: "Insufficient balance" }
    }

    if (!user.isActiveMember) {
        return { success: false, error: "You must activate your account ($1 deposit) before withdrawing." }
    }

    // 3. ARN Token Validation (10 ARN per $1)
    const arnRequired = validated.amount * 10;
    if (user.arnBalance < arnRequired) {
        return { success: false, error: `Insufficient ARN. You need ${arnRequired} ARN but have ${user.arnBalance.toFixed(2)}` };
    }

    // 4. Tier-Based Limit Validation
    const withdrawLimitPercent = getTierWithdrawLimit(user.tier || "NEWBIE");
    const maxWithdrawal = user.balance * (withdrawLimitPercent / 100);
    if (validated.amount > maxWithdrawal) {
        return { success: false, error: `Maximum withdrawal for your ${user.tier} tier is ${withdrawLimitPercent}% ($${maxWithdrawal.toFixed(2)}).` };
    }

    // 5. 24-Hour Cooldown Check
    if (user.lastWithdrawalTime) {
        const hoursSinceLast = (Date.now() - user.lastWithdrawalTime.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLast < 24) {
             const hoursRemaining = (24 - hoursSinceLast).toFixed(1);
             return { success: false, error: `Withdrawal limit: Once every 24 hours. Try again in ${hoursRemaining} hours.` };
        }
    }

    // 6. Fetch country to get rate
    const country = await prisma.merchantCountry.findFirst({
        where: { code: validated.countryCode }
    })
    
    // Unified Rate Logic: Use country setting or default to 1.0
    const finalRate = country?.exchangeRate || 1.0
    const currency = country?.currency || validated.currency || 'USD'
    
    // Identity Local Amount: Prefer raw amount from frontend
    const convertedAmount = validated.localAmount || (validated.amount * finalRate)

    // 7. Perform Transaction
    const transaction = await prisma.$transaction(async (tx) => {
        // Create merchant transaction
        const mt = await tx.merchantTransaction.create({
            data: {
                userId: session.user.id,
                countryCode: validated.countryCode,
                paymentMethodId: validated.paymentMethodId,
                type: "WITHDRAWAL",
                amount: validated.amount,
                currency,
                exchangeRate: finalRate,
                convertedAmount,
                accountNumber: validated.accountNumber,
                accountName: validated.accountName,
                note: validated.note,
                status: "PENDING"
            }
        });

        // Update user state
        await tx.user.update({
            where: { id: session.user.id },
            data: {
                lastWithdrawalTime: new Date(),
                balance: { decrement: validated.amount },
                arnBalance: { decrement: arnRequired }
            }
        });

        return mt;
    });

    revalidatePath("/dashboard/wallet")
    
    return { 
      success: true, 
      message: `Withdrawal request submitted successfully! Converted amount: ${convertedAmount.toFixed(2)} ${currency}.`,
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
