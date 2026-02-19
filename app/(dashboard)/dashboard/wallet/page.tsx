export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import WalletClient from "./wallet-view"

export default async function WalletPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  let user: any, wallets: any[] = [], transactions: any[] = [], merchantSettings: any[] = [];

  try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })
      
      if (user) {
          // Fetch needed data
          [wallets, transactions, merchantSettings] = await Promise.all([
             prisma.platformWallet.findMany(),
             prisma.transaction.findMany({
                  where: { userId: user.id },
                  orderBy: { createdAt: "desc" },
                  take: 10
              }),
             prisma.merchantCountry.findMany({
                  include: { methods: true, contacts: true },
                  orderBy: { createdAt: 'asc' }
              })
          ]);
      } else if (session.user.id === "super-admin-id") {
          // Handle Emergency Admin when not in DB
          user = {
              id: "super-admin-id",
              name: "Super Admin",
              email: "admin@letsearnify.com",
              balance: 5000.0,
              tier: "EMERALD",
              arnBalance: 1000,
              isActiveMember: true,
              totalDeposit: 5000.0
          };
          [wallets, merchantSettings] = await Promise.all([
              prisma.platformWallet.findMany(),
              prisma.merchantCountry.findMany({
                  include: { methods: true, contacts: true },
                  orderBy: { createdAt: 'asc' }
              })
          ]);
      }
  } catch (error) {
      console.error("⚠️ Wallet Offline Mode:", error);
      user = {
          id: session.user.id,
          name: session.user.name || "User",
          email: session.user.email || "offline@local",
          balance: 0,
          tier: "NEWBIE",
          arnBalance: 0,
          isActiveMember: false,
          totalDeposit: 0
      } as any;
  }
  
  if (!user) {
      redirect("/login")
  }

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
