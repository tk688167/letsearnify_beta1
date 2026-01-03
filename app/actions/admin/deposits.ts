"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { processDeposit } from "@/lib/mlm" // Reusing the deposit processor logic fro MLM updates?
// Actually prompt says "No CBSP, Referral... automated distributions included". 
// BUT prompt says "Approved: ... User dashboard shows $1 active deposit". 
// `processDeposit` updates `totalDeposit` and triggers MLM Active Status checks. 
// It DOES NOT do referral commissions. BUT `distributeReferralCommission` is separate.
// Wait, `processDeposit` updates `totalDeposit` which unlocks features (Good).
// It also increments active members for upline (Good).
// Does it trigger commissions? No. Commissions are usually triggered by Investment/Purchase.
// Deposit just adds balance.
// However, typically "Deposit" implies adding balance.
// I will stick to just updating balance + totalDeposit + isActiveMember?
// Re-reading code: `processDeposit` does update totalDeposit and checks Active Member status. It DOES NOT add to balance.
// So I should: 1. Update Balance. 2. Call processDeposit logic manually or verify what it does.

import { revalidatePath } from "next/cache"

export async function approveDeposit(txId: string) {
    const session = await auth();
    console.log(`[ApproveDeposit] Started for TXID: ${txId} by Admin: ${session?.user?.id}`);

    if (session?.user?.role !== "ADMIN") {
        console.error("[ApproveDeposit] Unauthorized access attempt");
        return { error: "Unauthorized" };
    }

    try {
        // Workaround for Stale Prisma Client: Use Raw Query to find transaction by txId
        // This bypasses the validation error for 'txId' attribute not being in the generated client.
        const result: any[] = await prisma.$queryRaw`SELECT * FROM "Transaction" WHERE "txId" = ${txId} LIMIT 1`;
        const tx = result[0];
        
        if (!tx) {
            console.error(`[ApproveDeposit] Transaction not found for TXID: ${txId}`);
            return { error: "Transaction not found" };
        }
        console.log(`[ApproveDeposit] Transaction found (Raw):`);
        // tx might have different casing or types depending on raw output, but Prisma usually maps to model casing if possible, 
        // OR returns strict DB column names. Prisma uses quotes in schema, defaults strictly.
        // Let's ensure accessing properties safely.
        // In Postgres, if table is "Transaction", columns are "id", "userId", "amount", etc. 
        // NOTE: Raw query returns objects with keys matching DB columns.
        // If Prisma maps `txId` to `txId` in DB? Yes generally.
        // Use standard property access.

        if (tx.status !== "PENDING") {
            console.warn(`[ApproveDeposit] Transaction ${tx.id} is not PENDING (Status: ${tx.status})`);
            return { error: "Transaction already processed" };
        }

        const depositAmount = Number(tx.amount); // Ensure number

        await prisma.$transaction(async (prismaTx) => {
            console.log(`[ApproveDeposit] Starting DB Transaction for User ${tx.userId}`);

            // 1. Update Transaction
            await prismaTx.transaction.update({
                where: { id: tx.id },
                data: { status: "COMPLETED" }
            });
            console.log("[ApproveDeposit] Transaction status updated to COMPLETED");

            // 2. Update User Balance
            await prismaTx.user.update({
                where: { id: tx.userId },
                data: { balance: { increment: depositAmount } }
            });
            console.log(`[ApproveDeposit] User balance incremented by ${depositAmount}`);
            
            // 3. Update User Total Deposit
            const user = await prismaTx.user.update({
                where: { id: tx.userId },
                data: { totalDeposit: { increment: depositAmount } }
            });
            console.log(`[ApproveDeposit] Total deposit updated. New Total: ${user.totalDeposit}`);

            // 4. Check Active Status
             if (!user.isActiveMember && user.totalDeposit >= 1.0) {
                 console.log("[ApproveDeposit] Upgrading user to Active Member");
                 await prismaTx.user.update({
                     where: { id: tx.userId },
                     data: { isActiveMember: true }
                 });
                 
                 // Update Upline
                 const tree = await prismaTx.referralTree.findUnique({ where: { userId: tx.userId }});
                 if (tree?.advisorId) {
                     console.log(`[ApproveDeposit] Incrementing active members for advisor ${tree.advisorId}`);
                     // Safe update with existence check implied by FK usually, but let's be safe
                     try {
                        await prismaTx.user.update({
                            where: { id: tree.advisorId },
                            data: { activeMembers: { increment: 1 } }
                        });
                     } catch (uplineError) {
                         console.error("[ApproveDeposit] Failed to update advisor usage, continuing...", uplineError);
                         // Don't block deposit approval for upline stats error? 
                         // Ideally we should consistency, but blocking money is bad. 
                         // Sticking to re-throw for data integrity.
                         throw uplineError; 
                     }
                 }
             }

            // 5. Log Admin Action
            await prismaTx.adminLog.create({
                data: {
                    adminId: session.user.id!,
                    targetUserId: tx.userId,
                    actionType: "DEPOSIT_APPROVAL",
                    // @ts-ignore
                    // details: `Approved deposit of $${tx.amount} (TXID: ${tx.txId})`
                    details: `Approved deposit of $${depositAmount} (TXID: ${txId})` 
                }
            });
            console.log("[ApproveDeposit] Admin log created");
        });

        revalidatePath("/admin/deposits");
        return { success: true };

    } catch (error: any) {
        console.error("Approval Error Detailed:", error);
        return { error: error.message || "Internal Server Error" };
    }
}

export async function rejectDeposit(txId: string, reason: string) {
    const session = await auth();
    console.log(`[RejectDeposit] Started for TXID: ${txId} by Admin: ${session?.user?.id}`);

    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    try {
        // Workaround for Stale Client: Lookup ID via Raw Query
        const result: any[] = await prisma.$queryRaw`SELECT id FROM "Transaction" WHERE "txId" = ${txId} LIMIT 1`;
        const tx = result[0];

        if (!tx) {
            console.error(`[RejectDeposit] Transaction not found for TXID: ${txId}`);
            return { error: "Transaction not found" };
        }

        await prisma.$transaction(async (prismaTx) => {
             // Safe update securely by ID (standard field)
             await prismaTx.transaction.update({
                where: { id: tx.id }, 
                data: { 
                    status: "FAILED",
                    description: `Rejected: ${reason}` 
                }
            });

             await prismaTx.adminLog.create({
                data: {
                    adminId: session.user.id!,
                    actionType: "DEPOSIT_REJECTION",
                    details: `Rejected deposit (TXID: ${txId}). Reason: ${reason}`
                }
            });
            console.log("[RejectDeposit] Rejection logged and transaction updated.");
        });

        revalidatePath("/admin/deposits");
        return { success: true };
    } catch (error: any) {
        console.error("Rejection Error:", error);
        return { error: error.message || "Internal Server Error" };
    }
}
