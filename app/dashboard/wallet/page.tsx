import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DepositCryptoForm } from "./components/DepositCryptoForm"
import { BanknotesIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline"

export default async function WalletPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })
  
  if (!user) return null

  // Fetch Manual Crypto Deposit Data
  const wallets = await prisma.platformWallet.findMany();
  const recentDeposits = await prisma.transaction.findMany({
      where: { 
          userId: user.id,
          type: "DEPOSIT",
          method: { in: ["TRC20", "BEP20"] }
      },
      orderBy: { createdAt: "desc" },
      take: 5
  });

  const resolvedParams = await searchParams
  const activeTab = resolvedParams?.tab || "deposit"

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header - Simple & Clean */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
      </div>

      {/* Simplified Balance Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between shadow-sm">
          <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Balance</p>
              <h2 className="text-4xl font-bold text-gray-900">${user.balance.toFixed(2)}</h2>
          </div>
          <div className="flex gap-6">
              <div>
                  <span className="text-xs text-gray-400 block mb-1">Total Deposited</span>
                  <span className="font-semibold text-gray-700 block">${user.totalDeposit.toFixed(2)}</span>
              </div>
              <div className="w-px bg-gray-100 h-10"></div>
              <div>
                  <span className="text-xs text-gray-400 block mb-1">Pending</span>
                  <span className="font-semibold text-gray-700 block">$0.00</span>
              </div>
          </div>
      </div>

      {/* Tabs - Minimal */}
      <div className="flex border-b border-gray-200 mb-8">
          <a 
            href="/dashboard/wallet?tab=deposit" 
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'deposit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Deposit
          </a>
          <a 
            href="/dashboard/wallet?tab=withdraw" 
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'withdraw' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Withdraw
          </a>
          <a 
            href="/dashboard/wallet?tab=transfer" 
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'transfer' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Transfer
          </a>
      </div>

      {/* Content Area */}
      <div>
          {activeTab === 'deposit' && (
              <DepositCryptoForm wallets={wallets} recentDeposits={recentDeposits} />
          )}

          {activeTab === 'withdraw' && (
               <div className="py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                   <BanknotesIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                   <h3 className="text-gray-900 font-medium">Withdrawals</h3>
                   <p className="text-sm text-gray-500">Coming soon.</p>
               </div>
          )}

          {activeTab === 'transfer' && (
               <div className="py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                   <ArrowUpTrayIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                   <h3 className="text-gray-900 font-medium">Transfers</h3>
                   <p className="text-sm text-gray-500">Internal transfers are currently disabled.</p>
               </div>
          )}
      </div>
    </div>
  )
}
