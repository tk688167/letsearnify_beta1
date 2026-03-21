import { prisma } from "@/lib/prisma"
export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { MerchantDepositsClient } from "./client"

export default async function MerchantDepositsPage() {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") redirect("/login")

    const transactions = await prisma.merchantTransaction.findMany({
        include: { user: { select: { id: true, name: true, email: true, memberId: true } } },
        orderBy: { createdAt: 'desc' }
    })

    return <MerchantDepositsClient transactions={JSON.parse(JSON.stringify(transactions))} />
}