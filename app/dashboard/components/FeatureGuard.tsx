import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { DepositRequired } from "./DepositRequired"
import { ComingSoon } from "./ComingSoon"
import { getComingSoonConfig } from "@/app/actions/admin/settings"

interface FeatureGuardProps {
    title?: string;
    feature?: 'tasks' | 'pools' | 'marketplace' | 'default';
    children?: React.ReactNode; 
}

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
  // "Unlocked" means they have paid the entry fee (deposit >= 1 or manual active)
  const isUnlocked = user && (user.isActiveMember || user.balance >= 1.00 || user.totalDeposit >= 1.00);

  if (!isUnlocked) {
      return (
          <div className="w-full max-w-5xl mx-auto py-6">
             <div className="mb-6">
                 <h1 className="text-3xl font-serif font-bold text-gray-900">{title}</h1>
             </div>
             <DepositRequired />
          </div>
      )
  }

  // 2. Fetch Config for Coming Soon status
  const globalConfig = await getComingSoonConfig()
  
  // NOTE: Logic to check if SPECIFIC feature is enabled in Admin Config.
  // Assuming globalConfig has keys like 'tasksEnabled', 'poolsEnabled', 'marketplaceEnabled'
  // If not, we default to showing children or ComingSoon based on a hardcoded check or config map.
  
  // Mapping feature string to config key (adjust based on actual settings schema)
  const isFeatureEnabled = feature === 'default' ? true : 
                           feature === 'tasks' ? globalConfig?.tasksEnabled :
                           feature === 'pools' ? globalConfig?.poolsEnabled :
                           feature === 'marketplace' ? globalConfig?.marketplaceEnabled : true;

  // For beta, let's assume if it's explicitly 'tasks', 'pools', 'marketplace', it might be dev unless admin says otherwise.
  // If config is missing, default to Coming Soon for safety in beta.
  if (!isFeatureEnabled) {
      return (
        <div className="w-full max-w-5xl mx-auto py-6">
             <div className="mb-6">
                 <h1 className="text-3xl font-serif font-bold text-gray-900">{title}</h1>
             </div>
             <ComingSoon feature={feature} config={globalConfig} />
        </div>
      )
  }

  // 3. Render Content (Unlocked & Live)
  return <>{children}</>
}
