"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateWallet(network: string, address: string, qrCodePath: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    try {
        await prisma.platformWallet.update({
            where: { network },
            data: { address, qrCodePath }
        });

        revalidatePath("/admin/wallets");
        revalidatePath("/dashboard/wallet"); 
        return { success: true };
    } catch (error) {
        console.error("Update Wallet Error:", error);
        return { error: "Failed to update wallet" };
    }
}
