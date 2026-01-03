
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { DepositRequired } from "./DepositRequired"
import { ComingSoon } from "./ComingSoon"

interface FeatureGuardProps {
    title?: string;
    children?: React.ReactNode; 
}

export async function FeatureGuard({ title, children }: FeatureGuardProps) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return null 
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totalDeposit: true }
  })

  // 1. Check Deposit Requirement ($1.00)
  if (!user || user.totalDeposit < 1.00) {
      return (
          <div className="flex-1 w-full max-w-5xl mx-auto p-6">
             <div className="mb-8 border-b border-gray-200 pb-8">
                 <h1 className="text-3xl font-serif font-bold text-gray-900">{title}</h1>
             </div>
             <DepositRequired />
          </div>
      )
  }

  // 2. If Deposited -> Show "Coming Soon" (or children if we were releasing it)
  // For now, prompt requirements say "After deposit, show a Coming Soon card."
  // So we show ComingSoon even if condition is met, effectively gating the *real* content.
  // If `children` were passed, we would render `children` here in a real scenario.
  
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-6">
        <div className="mb-8 border-b border-gray-200 pb-8">
             <h1 className="text-3xl font-serif font-bold text-gray-900">{title}</h1>
        </div>
        <ComingSoon title={title} />
    </div>
  )
}
