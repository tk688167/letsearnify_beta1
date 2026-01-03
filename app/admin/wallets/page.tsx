
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { updateWallet } from "@/app/actions/admin/wallets"

export default async function AdminWalletsPage() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") redirect("/dashboard");

    const wallets = await prisma.platformWallet.findMany();

    return (
        <div className="p-6 md:p-10 space-y-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900">Wallet Management</h1>
            <p className="text-gray-500">Configure deposit addresses shown to users.</p>

            <div className="grid md:grid-cols-2 gap-8">
                {wallets.map((wallet) => (
                    <UpdateWalletForm key={wallet.id} wallet={wallet} />
                ))}
            </div>
        </div>
    )
}

function UpdateWalletForm({ wallet }: { wallet: any }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4">{wallet.network} Wallet</h3>
            <form action={async (formData) => {
                "use server"
                await updateWallet(wallet.network, formData.get("address") as string, wallet.qrCodePath)
            }} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
                    <input 
                        name="address" 
                        defaultValue={wallet.address} 
                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                    />
                 </div>
                 {/* QR Upload would go here - simplified for now */}
                 <button type="submit" className="w-full py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition">
                     Update Address
                 </button>
            </form>
        </div>
    )
}
