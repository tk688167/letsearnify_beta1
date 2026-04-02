export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import WalletClient from "./wallet-view"
import { getTierWithdrawLimit } from "@/lib/mlm"

export default async function WalletPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  let user: any, wallets: any[] = [], transactions: any[] = [], merchantSettings: any[] = [];

  try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })
      
      if (user) {
          const [platformWallets, systemTransactions, merchantTransactions, merchantCountries] = await Promise.all([
             prisma.platformWallet.findMany(),
             prisma.transaction.findMany({
                  where: { userId: user.id },
                  orderBy: { createdAt: "desc" }
              }),
             // Fetch merchant transactions (deposits & withdrawals) for this user
             prisma.merchantTransaction.findMany({
                  where: { userId: user.id },
                  orderBy: { createdAt: "desc" }
             }),
             prisma.merchantCountry.findMany({
                  include: { methods: true, contacts: true },
                  orderBy: { createdAt: 'asc' }
              })
          ]);

          wallets = platformWallets;
          merchantSettings = merchantCountries;

          // Merge merchant transactions into the main transactions array
          // so they show in wallet history with proper status (PENDING/APPROVED/REJECTED)
          const mappedMerchantTx = merchantTransactions.map((mtx: any) => ({
            id: mtx.id,
            userId: mtx.userId,
            amount: mtx.amount,
            arnMinted: mtx.type === 'DEPOSIT' && mtx.status === 'APPROVED' ? mtx.amount * 10 : 0,
            type: mtx.type === 'DEPOSIT' ? 'DEPOSIT' : 'WITHDRAWAL',
            status: mtx.status === 'APPROVED' ? 'COMPLETED' : mtx.status === 'REJECTED' ? 'FAILED' : 'PENDING',
            method: 'MERCHANT',
            description: mtx.type === 'DEPOSIT' 
              ? `Merchant deposit via ${mtx.countryCode} (${mtx.currency || 'Local'})` 
              : `Merchant withdrawal via ${mtx.countryCode} (${mtx.currency || 'Local'})`,
            createdAt: mtx.createdAt,
            _isMerchant: true, // flag to avoid duplicates
          }));

          // Filter out system transactions that were created by merchant approval
          // (they have method: "MERCHANT" and would duplicate the merchant tx)
          const systemTxFiltered = systemTransactions.filter((tx: any) => 
            !(tx.method === 'MERCHANT' && mappedMerchantTx.some((mtx: any) => 
              mtx.status === 'COMPLETED' && 
              Math.abs(new Date(tx.createdAt).getTime() - new Date(mtx.createdAt).getTime()) < 60000 &&
              tx.amount === mtx.amount
            ))
          );

          // Combine and sort by date
          transactions = [...systemTxFiltered, ...mappedMerchantTx]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      if (user) {
          user.withdrawalLimit = getTierWithdrawLimit(user.tier);
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

  return (
    <div className="p-6 max-w-7xl mx-auto">

       <WalletClient 
          user={user} 
          transactions={JSON.parse(JSON.stringify(transactions))} 
          platformWallets={wallets}
          merchantSettings={merchantSettings} 
       />
    </div>
  )
}