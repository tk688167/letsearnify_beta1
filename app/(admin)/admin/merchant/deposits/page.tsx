import { prisma } from "@/lib/prisma"
export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { MerchantDepositsClient } from "./client"

export default async function MerchantDepositsPage() {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") redirect("/login")

    try {
        const transactions = await prisma.merchantTransaction.findMany({
            include: { user: { select: { id: true, name: true, email: true, memberId: true } } },
            orderBy: { createdAt: 'desc' }
        })

        return <MerchantDepositsClient transactions={JSON.parse(JSON.stringify(transactions))} />
    } catch (error) {
        console.error("Merchant Deposits Page Error:", error)
        return (
            <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-red-200 dark:border-red-900/30">
                <h2 className="text-xl font-bold text-foreground mb-2">Failed to load transactions</h2>
                <p className="text-sm text-muted-foreground">There was an error connecting to the database. Please try again later.</p>
            </div>
        )
    }
}