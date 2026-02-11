
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
        <div className="p-6 md:p-10 space-y-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900">Wallet Management</h1>
            <p className="text-gray-500">Configure deposit addresses shown to users.</p>

            <AdminWalletManager wallets={wallets} />
        </div>
    )
}

