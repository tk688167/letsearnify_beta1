
export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AdminWalletManager from "./manager"

export default async function AdminWalletsPage() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") redirect("/dashboard");

    // Fetch only TRC20 wallet or all and let manager filter, but better to just fetch all
    let wallets: any[] = [];
    try {
        wallets = await prisma.platformWallet.findMany();
    } catch (error) {
        console.error("Admin Wallets Offline Mode:", error);
        wallets = [];
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Wallet Management</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Configure deposit addresses shown to users.</p>

            <AdminWalletManager wallets={wallets} />
        </div>
    )
}

