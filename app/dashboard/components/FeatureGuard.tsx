import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { DepositRequired } from "./DepositRequired"
import { ComingSoon } from "./ComingSoon"

interface FeatureGuardProps {
    title?: string;
    feature?: 'tasks' | 'pools' | 'marketplace' | 'default';
    children?: React.ReactNode; 
}

import { getComingSoonConfig } from "@/app/actions/admin/settings"

// ... imports remain same ...

export async function FeatureGuard({ title, feature = 'default', children }: FeatureGuardProps) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return null 
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totalDeposit: true, balance: true, isActiveMember: true }
  })

  // 1. Check Deposit Requirement ($1.00)
  const isUnlocked = user && (user.isActiveMember || user.balance >= 1.00 || user.totalDeposit >= 1.00);

  if (!isUnlocked) {
      return (
          <div className="flex-1 w-full max-w-5xl mx-auto p-6">
             <div className="mb-8 border-b border-gray-200 pb-8">
                 <h1 className="text-3xl font-serif font-bold text-gray-900">{title}</h1>
             </div>
             <DepositRequired />
          </div>
      )
  }

  // 2. Fetch Config for Coming Soon
  const globalConfig = await getComingSoonConfig()

  // 3. Render Coming Soon Modal (Gating Content)
  // Even if unlocked, we show Coming Soon for now as features are in dev.
  return (
    <div className="flex-1 w-full bg-transparent">
        <ComingSoon title={title} config={globalConfig} feature={feature} />
    </div>
  )
}
