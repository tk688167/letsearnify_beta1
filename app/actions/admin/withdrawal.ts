"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createNotification } from "@/lib/notifications"

// ─── Helper: Fetch Payment Methods with fallback ──────────────────────────
async function fetchPaymentMethods() {
    try {
        // Try to fetch from paymentMethod first
        const methods = await prisma.paymentMethod.findMany();
        if (methods && methods.length > 0) {
            return methods;
        }
    } catch (error) {
        // Silently continue to next attempt
    }
    
    try {
        // Try merchantPaymentMethod
        const methods = await prisma.merchantPaymentMethod.findMany();
        if (methods && methods.length > 0) {
            return methods;
        }
    } catch (error) {
        // Silently continue
    }
    
    // Return empty array if both fail
    return [];
}

// ─── Helper: Resolve Payment Method Name ──────────────────────────────────
function resolveMethodName(r: any, paymentMethods: any[]): string {
    // 1. Check if transaction has paymentMethodId with matched method
    if (r.paymentMethodId && paymentMethods.length > 0) {
        const matched = paymentMethods.find((m: any) => m.id === r.paymentMethodId);
        if (matched?.name) {
            const name = matched.name.toLowerCase();
            if (name.includes("easypaisa")) return "EasyPaisa";
            if (name.includes("jazzcash")) return "JazzCash";
            // Return the actual name if it's not EasyPaisa or JazzCash
            return matched.name;
        }
    }
    
    // 2. Check method field
    if (r.method) {
        const methodLower = r.method.toLowerCase();
        if (methodLower.includes("easypaisa")) return "EasyPaisa";
        if (methodLower.includes("jazzcash")) return "JazzCash";
        if (methodLower.includes("easypaisa/jazzcash")) {
            if (r.accountNumber && r.accountNumber.startsWith("03")) {
                return "EasyPaisa";
            }
            return "EasyPaisa";
        }
        // If method is "Easypaisa" or "JazzCash" with exact match
        if (methodLower === "easypaisa") return "EasyPaisa";
        if (methodLower === "jazzcash") return "JazzCash";
    }
    
    // 3. Check paymentMethod name directly
    if (r.paymentMethod?.name) {
        const name = r.paymentMethod.name.toLowerCase();
        if (name.includes("easypaisa")) return "EasyPaisa";
        if (name.includes("jazzcash")) return "JazzCash";
        return r.paymentMethod.name;
    }
    
    // 4. Fallback: check account number
    if (r.accountNumber && r.accountNumber.startsWith("03")) {
        return "EasyPaisa";
    }
    
    // 5. Check if there's a rawMethod from the transaction
    if (r.rawMethod) {
        const raw = r.rawMethod.toLowerCase();
        if (raw.includes("easypaisa")) return "EasyPaisa";
        if (raw.includes("jazzcash")) return "JazzCash";
    }
    
    return "Local Agent";
}

// ─── Main: Get Withdrawal Requests ────────────────────────────────────────
export async function getWithdrawalRequests() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return [];

    try {
        // Fetch payment methods first (outside Promise.all to handle errors better)
        const paymentMethods = await fetchPaymentMethods();

        // Fetch transactions
        const [cryptoRequests, merchantRequests] = await Promise.all([
            prisma.transaction.findMany({
                where: { 
                    type: "WITHDRAWAL",
                },
                include: { 
                    user: { 
                        select: { 
                            id: true, 
                            email: true, 
                            balance: true, 
                            name: true 
                        } 
                    }
                },
                orderBy: { createdAt: "desc" }
            }),
            prisma.merchantTransaction.findMany({
                where: { 
                    type: "WITHDRAWAL",
                },
                include: { 
                    user: { 
                        select: { 
                            id: true, 
                            email: true, 
                            balance: true, 
                            name: true 
                        } 
                    }
                },
                orderBy: { createdAt: "desc" }
            })
        ]);

        // Map crypto requests
        const cryptoMapped = cryptoRequests.map((r: any) => ({
            id: r.id,
            userId: r.userId,
            amount: r.amount,
            status: r.status,
            type: "CRYPTO" as const,
            destinationAddress: r.destinationAddress || "",
            method: r.method || "TRC20",
            createdAt: r.createdAt,
            user: r.user,
            convertedAmount: r.convertedAmount,
            exchangeRate: r.exchangeRate,
            currency: r.currency,
            paymentMethod: r.paymentMethod,
            rate: r.exchangeRate,
            accountNo: r.accountNumber,
            accountName: r.accountName || null,
            detectedMethod: null,
            rawMethod: r.method || null
        }));

        // Map merchant requests with detected method
        const merchantMapped = merchantRequests.map((r: any) => {
            const detectedMethod = resolveMethodName(r, paymentMethods);
            
            return {
                id: r.id,
                userId: r.userId,
                amount: r.amount,
                status: r.status,
                type: "MERCHANT" as const,
                destinationAddress: `${r.accountName || ''} (${r.accountNumber || ''}) - ${r.currency || 'PKR'}`,
                method: r.method || `Merchant (${r.countryCode || 'PK'})`,
                createdAt: r.createdAt,
                user: r.user,
                convertedAmount: r.convertedAmount,
                exchangeRate: r.exchangeRate,
                currency: r.currency,
                paymentMethod: r.paymentMethod,
                rate: r.exchangeRate,
                accountNo: r.accountNumber,
                accountName: r.accountName,
                detectedMethod: detectedMethod,
                rawMethod: r.method || null
            };
        });

        // Combine and sort
        const unified = [...cryptoMapped, ...merchantMapped].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return unified;
    } catch (error) {
        console.error("Error fetching withdrawal requests:", error);
        return [];
    }
}

// ─── Process Withdrawal ────────────────────────────────────────────────────
export async function processWithdrawal(transactionId: string, action: "APPROVE" | "REJECT") {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    try {
        // Try to find in Transaction first
        let transaction: any = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { user: true }
        });

        let isMerchant = false;
        if (!transaction) {
            transaction = await prisma.merchantTransaction.findUnique({
                where: { id: transactionId },
                include: { user: true }
            });
            isMerchant = true;
        }

        if (!transaction || transaction.type !== "WITHDRAWAL" || transaction.status !== "PENDING") {
            return { error: "Invalid withdrawal request." };
        }

        const userId = transaction.userId;
        const amount = transaction.amount;
        const arnToRefund = amount * 10;

        if (action === "REJECT") {
            await prisma.$transaction(async (tx: any) => {
                // 1. Update Transaction Status
                if (isMerchant) {
                    await tx.merchantTransaction.update({
                        where: { id: transactionId },
                        data: { status: "REJECTED" }
                    });
                } else {
                    await tx.transaction.update({
                        where: { id: transactionId },
                        data: { status: "REJECTED" }
                    });
                }

                // 2. Refund Balance AND ARN Tokens
                await tx.user.update({
                    where: { id: userId },
                    data: { 
                        balance: { increment: amount },
                        arnBalance: { increment: arnToRefund }
                    }
                });

                // 3. Audit Log - Check if adminLog model exists
                try {
                    await tx.adminLog.create({
                        data: {
                            adminId: session.user.id!,
                            targetUserId: userId,
                            actionType: "WITHDRAWAL_REJECTION",
                            details: `Rejected ${isMerchant ? 'Merchant' : 'TRC20'} withdrawal of $${amount}. USD and ARN tokens refunded.`
                        }
                    });
                } catch (logError) {
                    console.error("Failed to create admin log:", logError);
                    // Continue even if logging fails
                }
            });

            await createNotification(
                userId,
                "Withdrawal Rejected",
                `Your withdrawal request of $${amount.toFixed(2)} was rejected. The USD balance and ARN tokens have been fully refunded.`,
                "TRANSACTION"
            );

            revalidatePath("/admin/withdrawals");
            return { success: true };
        }

        if (action === "APPROVE") {
            await prisma.$transaction(async (tx: any) => {
                // 1. Update Status
                if (isMerchant) {
                    await tx.merchantTransaction.update({
                        where: { id: transactionId },
                        data: { status: "APPROVED" }
                    });
                } else {
                    await tx.transaction.update({
                        where: { id: transactionId },
                        data: { status: "COMPLETED" } 
                    });
                }

                // 2. Audit Log - Check if adminLog model exists
                try {
                    await tx.adminLog.create({
                        data: {
                            adminId: session.user.id!,
                            targetUserId: userId,
                            actionType: "WITHDRAWAL_APPROVAL",
                            details: `Approved ${isMerchant ? 'Merchant' : 'TRC20'} withdrawal of $${amount}.`
                        }
                    });
                } catch (logError) {
                    console.error("Failed to create admin log:", logError);
                    // Continue even if logging fails
                }
            });

            await createNotification(
                userId,
                "Withdrawal Approved",
                `Your withdrawal of $${amount.toFixed(2)} was successfully processed to your ${isMerchant ? 'Local Agent' : 'Crypto'} account.`,
                "TRANSACTION"
            );

            revalidatePath("/admin/withdrawals");
            return { success: true };
        }

        return { error: "Invalid action" };
    } catch (error: any) {
        console.error("Process Withdraw Error:", error);
        return { error: error.message || "Failed to process withdrawal." };
    }
}