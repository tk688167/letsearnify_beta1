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
       <div className="relative overflow-hidden rounded-3xl text-white mb-8 shadow-sm border border-border"
            style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #0f172a 100%)" }}>
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3" />
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
         
         <div className="relative z-10 px-6 sm:px-10 md:px-12 py-8 sm:py-10 text-left">
             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-blue-300/80 mb-3 sm:mb-4">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
               Secure Financial Hub
             </div>
             <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-white mb-2 sm:mb-3 drop-shadow-sm leading-tight">
                 Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-300">Wallet</span>
             </h1>
             <p className="text-blue-100/70 text-sm md:text-base max-w-xl font-medium">
                 Manage your balances, deposit funds securely, and track your financial transactions across the platform.
             </p>
         </div>
       </div>
       
       <WalletClient 
          user={user} 
          transactions={JSON.parse(JSON.stringify(transactions))} 
          platformWallets={wallets}
          merchantSettings={merchantSettings} 
       />
    </div>
  )
}