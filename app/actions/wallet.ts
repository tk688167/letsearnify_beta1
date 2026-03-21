// ============================================================
// FILE: app/actions/wallet.ts  (REPLACE)
// FIX: Added arnBalance check before withdrawal deduction
// Everything else is identical to your original
// ============================================================

"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { deposit } from "@/lib/actions"
import { getTierWithdrawLimit } from "@/lib/mlm"

const depositSchema = z.object({
    amount: z.number().min(1, "Minimum deposit is $1"),
    network: z.enum(["TRC20"]),
    txId: z.string().min(5, "Invalid Transaction ID"),
})

export async function submitDeposit(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const rawData = {
        amount: parseFloat(formData.get("amount") as string),
        network: formData.get("network"),
        txId: formData.get("txId")
    }

    const validated = depositSchema.safeParse(rawData);

    if (!validated.success) {
        return { error: validated.error.issues[0].message || "Invalid input" };
    }

    const { amount, network, txId } = validated.data;

    try {
        console.log(`[SubmitDeposit] Processing for User: ${session.user.id}, TXID: ${txId}, Amount: ${amount}`);
        
        const result = await deposit(amount, "CRYPTO", { network, txHash: txId });
        
        if (result.success) {
             revalidatePath("/dashboard/wallet");
             return { success: true };
        } else {
             return { error: result.message || "Deposit failed" };
        }

    } catch (error: any) {
        console.error("Deposit Error Detailed:", error);
        return { error: error.message || "Failed to process deposit." };
    }
}

import { createInvoice } from "@/lib/nowpayments";

export async function createNowPaymentsInvoice(amount: number, method: "BTC" | "CARD") {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    if (amount < 1) return { error: "Minimum deposit is $1" };

    try {
        const transaction = await prisma.transaction.create({
            data: {
                userId: session.user.id,
                amount: amount,
                type: "DEPOSIT",
                status: "PENDING",
                method: method === "CARD" ? "Credit Card (NOWPayments)" : "Bitcoin (NOWPayments)",
                description: "Initiating NOWPayments..."
            }
        });

        const invoice = await createInvoice(amount, "usd", transaction.id, `Deposit for User ${session.user.id}`);

        if (!invoice.invoice_url) {
             throw new Error("Failed to generate payment link.");
        }

        await prisma.transaction.update({
             where: { id: transaction.id },
             data: { 
                 txId: invoice.id,
                 description: `[NOWPAYMENTS] Invoice: ${invoice.id}`
             }
        });

        return { success: true, url: invoice.invoice_url };

    } catch (error: any) {
        console.error("NOWPayments Error:", error);
        return { error: error.message || "Failed to initiate payment" };
    }
}

const withdrawalSchema = z.object({
    amount: z.number().positive("Amount must be positive"),
    address: z.string().min(10, "Invalid TRC20 Address"),
})

export async function submitWithdrawal(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const rawData = {
        amount: parseFloat(formData.get("amount") as string),
        address: formData.get("address"),
    }

    const validated = withdrawalSchema.safeParse(rawData);

    if (!validated.success) {
        return { error: validated.error.issues[0].message || "Invalid input" };
    }

    const { amount, address } = validated.data;

    try {
        // 1. Check for Pending Withdrawals
        const existingPending = await prisma.transaction.findFirst({
            where: {
                userId: session.user.id,
                type: "WITHDRAWAL",
                status: "PENDING"
            }
        });

        if (existingPending) {
            return { error: "You already have a pending withdrawal request." };
        }

        // 2. Cooldown Check (24 Hours)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            // @ts-ignore
            select: { balance: true, arnBalance: true, lastWithdrawalTime: true, tier: true, isActiveMember: true }
        });

        if (!user) {
            return { error: "User not found." };
        }

        // Must be activated
        if (!user.isActiveMember) {
            return { error: "You must activate your account ($1 deposit) before withdrawing." };
        }

        if (user.balance < amount) {
            return { error: "Insufficient balance." };
        }

        // ╔══════════════════════════════════════════════════════════╗
        // ║  FIX: Check ARN balance before deducting                ║
        // ╚══════════════════════════════════════════════════════════╝
        const arnRequired = amount * 10;
        if (user.arnBalance < arnRequired) {
            return { error: `Insufficient ARN tokens. You need ${arnRequired} ARN but have ${user.arnBalance.toFixed(2)} ARN.` };
        }

        // Dynamic Tier-Based Validation
        const withdrawLimitPercent = getTierWithdrawLimit(user.tier || "NEWBIE");
        const maxWithdrawal = user.balance * (withdrawLimitPercent / 100);
        
        if (amount > maxWithdrawal) {
             return { error: `You can withdraw a maximum of ${withdrawLimitPercent}% of your total balance based on your ${user.tier} status.` };
        }

        // @ts-ignore
        if (user.lastWithdrawalTime) {
            // @ts-ignore
            const hoursSinceLast = (Date.now() - user.lastWithdrawalTime.getTime()) / (1000 * 60 * 60);
            if (hoursSinceLast < 24) {
                 const hoursRemaining = (24 - hoursSinceLast).toFixed(1);
                 return { error: `Withdrawal limit: Once every 24 hours. Try again in ${hoursRemaining} hours.` };
            }
        }

        // 3. Create Withdrawal Request & Update Timer
        await prisma.$transaction([
            prisma.transaction.create({
                data: {
                    userId: session.user.id,
                    amount: amount,
                    type: "WITHDRAWAL",
                    status: "PENDING",
                    method: "TRC20",
                    // @ts-ignore
                    destinationAddress: address,
                    description: `Withdrawal to ${address}`
                }
            }),
            prisma.user.update({
                where: { id: session.user.id },
                data: { 
                    // @ts-ignore
                    lastWithdrawalTime: new Date(),
                    balance: { decrement: amount },
                    arnBalance: { decrement: arnRequired }
                }
            })
        ]);

        revalidatePath("/dashboard/wallet");
        return { success: true };

    } catch (error: any) {
        console.error("Withdrawal Error Detailed:", error);
        return { error: error.message || "Failed to submit withdrawal request due to an internal error." };
    }
}