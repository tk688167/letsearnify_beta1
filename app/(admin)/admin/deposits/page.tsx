import { prisma } from "@/lib/prisma" 
import ClientDepositsPage from "./client-page" 

// ─── Helpers (unchanged) ─────────────────────────────────────────────────────
async function fetchPaymentMethods(): Promise<any[]> {
  try {
    return await (prisma as any).merchantPaymentMethod.findMany()
  } catch {
    try {
      return await (prisma as any).MerchantPaymentMethod.findMany()
    } catch (err) {
      console.error("Could not fetch payment methods in server page:", err)
      return []
    }
  }
}

function resolveMerchantMethodName(r: any, paymentMethods: any[]): string {
  const matched = paymentMethods.find((m) => m.id === r.paymentMethodId)
  if (matched?.name) return matched.name
  if (r.currency === "PKR") {
    return r.accountNumber?.startsWith("03") ? "EasyPaisa/JazzCash" : "Local Agent"
  }
  return "Local Agent"
}

// ─── Main Server Component (only deposits) ────────────────────────────────────
export default async function DepositsServerPage() {
  let initialDeposits: any[] = []        // Crypto deposits (TRC20/Binance)
  let initialMerchantTransactions: any[] = []  // Merchant deposits

  try {
    // Fetch only DEPOSIT type transactions from both tables
    const [cryptoTx, merchantTx, paymentMethods] = await Promise.all([
      prisma.transaction.findMany({
        where: { type: "DEPOSIT" },     // ← Sirf deposit transactions
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),

      prisma.merchantTransaction.findMany({
        where: { type: "DEPOSIT" },     // ← Sirf deposit merchant transactions
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),

      fetchPaymentMethods()
    ])

    initialDeposits = cryptoTx

    // Merchant transactions ko map karte waqt method name resolve karo
    initialMerchantTransactions = merchantTx.map((r: any) => {
      const resolvedMethod = resolveMerchantMethodName(r, paymentMethods)
      return {
        ...r,
        resolvedMethodName: resolvedMethod, 
        isLocalMobileWallet: resolvedMethod === "EasyPaisa/JazzCash" || r.accountNumber?.startsWith("03")
      }
    })

  } catch (error) {
    console.error("Backend server pre-fetch dynamic error:", error)
  }

  // Client component ko filtered data pass karo
  return (
    <ClientDepositsPage 
      initialDeposits={initialDeposits} 
      serverMerchantTx={initialMerchantTransactions} 
    />
  )
}