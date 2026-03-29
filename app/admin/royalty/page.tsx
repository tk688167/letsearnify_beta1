
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import RoyaltyHistorySection from "../components/RoyaltyHistorySection"

export default async function RoyaltyAdminPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")
    
    // Server-side check for admin
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    })

    if (user?.role !== "ADMIN") redirect("/dashboard")

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Royalty Pool Management</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Monitor contributions and configure monthly distribution rates for top-tier members.
                </p>
            </div>
            
            <RoyaltyHistorySection />
        </div>
    )
}
