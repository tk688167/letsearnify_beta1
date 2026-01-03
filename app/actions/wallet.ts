"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { deposit } from "@/lib/actions"

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
        
        // Delegate to the unified deposit action which handles verification and DB updates
        // We use the same signature as defined in lib/actions
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
