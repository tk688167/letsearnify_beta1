import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import WalletClient from "./wallet-view"

export default async function WalletPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })
  
  if (!user) return null

  // Fetch needed data
  const wallets = await prisma.platformWallet.findMany();
  
  // Use same logic as previous page for transactions/history
  // Previous page fetched 'recentDeposits', but WalletClient asks for 'transactions'
  // Let's fetch pure transactions
  const transactions = await prisma.transaction.findMany({
      where: { 
          userId: user.id
      },
      orderBy: { createdAt: "desc" },
      take: 10
  });

  const merchantSettings = await prisma.merchantCountry.findMany({
      include: { methods: true, contacts: true },
      orderBy: { createdAt: 'asc' }
  });

  // Pass everything to the Client Component
  return (
    <div className="p-6 max-w-7xl mx-auto">
       <div className="mb-8">
         <h1 className="text-3xl font-serif font-bold text-gray-900">My Wallet</h1>
         <p className="text-gray-500">Manage your funds and transactions.</p>
       </div>
       
       <WalletClient 
          user={user} 
          transactions={transactions} 
          platformWallets={wallets}
          merchantSettings={merchantSettings} 
       />
    </div>
  )
}
