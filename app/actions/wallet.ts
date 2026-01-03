"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const depositSchema = z.object({
    amount: z.number().min(1, "Minimum deposit is $1"),
    network: z.enum(["TRC20", "BEP20"]),
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

        // 1. Check uniqueness of TXID using Raw Query (Stale client workaround)
        const existingTxRaw: any[] = await prisma.$queryRaw`SELECT id FROM "Transaction" WHERE "txId" = ${txId} LIMIT 1`;
        if (existingTxRaw.length > 0) {
            console.warn(`[SubmitDeposit] Duplicate TXID found: ${txId}`);
            return { error: "This Transaction ID has already been submitted." };
        }

        // 2. Create Transaction using Raw Execute (Stale client workaround)
        // Need to generate CUID manually or let DB handle it? 
        // Prisma usually generates CUIDs on client side for `cuid()` default.
        // Postgres `cuid()` is not standard SQL.
        // I can import `cuid` library or generate a simple ID if I don't have it.
        // OR better: Since `id` has `@default(cuid())` in schema, does Postgres have a function/trigger for it? 
        // No, Prisma does it in the client.
        // If I skip ID in INSERT, Postgres will fail if no default is on the column.
        // Prisma schema `@default(cuid())` means Prisma Client generates it before sending to DB. Not DB level.
        // I MUST generate an ID.
        // I can use `crypto.randomUUID()` as a fallback for ID since it's a string field.
        
        const newId = crypto.randomUUID(); 
        const now = new Date();

        await prisma.$executeRaw`
            INSERT INTO "Transaction" (
                "id", "userId", "amount", "type", "status", "method", "description", "txId", "createdAt"
            ) VALUES (
                ${newId}, 
                ${session.user.id}, 
                ${amount}, 
                'DEPOSIT', 
                'PENDING', 
                ${network}, 
                ${`Manual Deposit via ${network}`}, 
                ${txId}, 
                ${now}
            )
        `;

        console.log(`[SubmitDeposit] Transaction created successfully: ${newId}`);
        revalidatePath("/dashboard/wallet");
        return { success: true };

    } catch (error: any) {
        console.error("Deposit Error Detailed:", error);
        return { error: `System Error: ${error.message || "Failed to process deposit."}` };
    }
}
