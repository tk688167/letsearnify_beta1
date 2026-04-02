import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { DepositRequired } from "./DepositRequired"
import { UnderDevelopmentPage } from "./UnderDevelopment"
import { getComingSoonConfig } from "@/app/actions/admin/settings"
import Link from "next/link"
import { LockClosedIcon, CheckCircleIcon, ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/solid"

interface FeatureGuardProps {
    title?: string;
    feature?: 'tasks' | 'pools' | 'cbsp' | 'royalty' | 'marketplace' | 'mudarabah' | 'partner' | 'default';
    previewMode?: boolean;
    children?: React.ReactNode; 
}

// Features that are NOT launched yet — after $1 unlock, show "Under Development"
// When admin launches them, remove from this array
const UNDER_DEVELOPMENT_FEATURES = ['marketplace', 'mudarabah', 'cbsp', 'royalty'];

// Feature-specific titles for the lock screen
const FEATURE_TITLES: Record<string, string> = {
    marketplace: '🔒 Marketplace Locked',
    mudarabah: '🔒 Mudarabah Pool Locked',
    pools: '🔒 Reward Pools Locked',
    partner: '🔒 Partner Program Locked',
}

const FEATURE_DESCRIPTIONS: Record<string, string> = {
    marketplace: 'This is the Marketplace page, where users can access platform products and services. To unlock the Marketplace and other premium features, please activate your account with $1.',
    mudarabah: 'This is the Mudarabah Pool, where users can access ethical investment opportunities. To unlock the Mudarabah Pool, please activate your account with $1.',
    pools: 'This is the Reward Pools section, where active members earn from CBSP, Royalty, and Achievement pools. To unlock Reward Pools, please activate your account with $1.',
    partner: 'The Partner Program allows you to earn commissions from your referral network. To unlock the Partner Program, please activate your account with $1.',
}

// Under Development info per feature
const DEV_FEATURE_INFO: Record<string, { title: string, description: string, icon: string }> = {
    marketplace: {
        title: "Freelance Marketplace",
        description: "Our marketplace is being built where you can buy, sell, and trade digital services with platform members. Get early access as soon as it launches.",
        icon: "🛍️"
    },
    mudarabah: {
        title: "Mudarabah Investment Pool",
        description: "The Mudarabah Pool is an ethical investment opportunity where your funds are invested in halal ventures. Profit sharing will be distributed monthly.",
        icon: "📈"
    },
    cbsp: {
        title: "CBSP Pool",
        description: "This feature is currently under development. You will be notified once it becomes available. The CBSP Pool logic is being finalized for launch.",
        icon: "👥"
    },
    royalty: {
        title: "Royalty Pool",
        description: "This feature is currently under development. You will be notified once it becomes available. The Royalty Pool distribution mechanics are being finalized for launch.",
        icon: "👑"
    },
}

export async function FeatureGuard({ title, feature = 'default', previewMode = false, children }: FeatureGuardProps) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return null 
  }

  let user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totalDeposit: true, balance: true, isActiveMember: true, email: true }
  })

  // Anti-Gravity: Super Admin Bypass
  if (!user && session.user.id === "super-admin-id") {
      user = { totalDeposit: 5000, balance: 5000, isActiveMember: true, email: "admin@letsearnify.com" } as any;
  }

  const isUnlocked = user && user.isActiveMember;

  // ════════════════════════════════════════════════════════════════
  //  STEP 1: Not activated? Show $1 lock screen for restricted features
  // ════════════════════════════════════════════════════════════════
  const isRestrictedFeature = 
    feature === 'marketplace' || 
    feature === 'pools' || 
    feature === 'mudarabah' || 
    feature === 'partner' ||
    title?.includes('Withdraw') || 
    title?.includes('Transfer');

  if (!isUnlocked && isRestrictedFeature) {
      const lockTitle = FEATURE_TITLES[feature] || `🔒 ${title || 'Feature'} Locked`;
      const lockDescription = FEATURE_DESCRIPTIONS[feature] || `This feature is currently locked. To unlock the ${title || 'platform'}, please activate your account with $1.`;

      if (previewMode) {
          return (
             <div className="fixed inset-y-[64px] inset-x-0 md:inset-y-0 md:right-0 md:left-72 z-[50] flex flex-col bg-white dark:bg-gray-950 overflow-hidden select-none">
                 <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none blur-[8px] opacity-60 transition-all duration-500 bg-white/50 dark:bg-black/50">
                     {children}
                 </div>
                 <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 sm:p-6 bg-black/10 dark:bg-black/50 backdrop-blur-[4px]">
                     <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 max-w-[380px] sm:max-w-[420px] w-full shadow-2xl flex flex-col animate-in zoom-in-95 duration-500 max-h-full overflow-hidden relative">
                         <Link href="/dashboard" className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors z-20">
                             <XMarkIcon className="w-4 h-4" />
                         </Link>
                         <div className="flex flex-col items-center justify-center gap-2.5 sm:gap-3 mb-4 shrink-0">
                             <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/20 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-amber-500/20">
                                 <LockClosedIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-500 drop-shadow-sm" />
                             </div>
                             <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 dark:text-white tracking-tight text-center">{lockTitle}</h3>
                         </div>
                         <p className="text-sm sm:text-[15px] font-medium text-gray-700 dark:text-gray-200 mb-5 sm:mb-6 text-center leading-relaxed shrink-0">{lockDescription}</p>
                         <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700/50 shrink-0">
                             <div className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 sm:mb-4 text-center">After activation, you will get access to</div>
                             <ul className="space-y-2.5 sm:space-y-3">
                                 {["Marketplace Access", "Mudarabah Pool Access", "Reward Pools", "Premium Tasks", "Withdrawal & Transfer", "Premium Spin Wheel", "Locked Balance Release"].map((item, i) => (
                                     <li key={i} className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-medium">
                                         <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
                                         {item}
                                     </li>
                                 ))}
                             </ul>
                         </div>
                         <div className="flex flex-col gap-2.5 sm:gap-3 shrink-0 mt-auto">
                             <Link href="/dashboard/wallet?tab=deposit" className="w-full py-3.5 sm:py-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm sm:text-base font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2">
                                 Activate for $1.00 <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                             </Link>
                             <Link href="/dashboard" className="w-full py-3 sm:py-3.5 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm sm:text-base font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white transition-all flex items-center justify-center">
                                 Go Back
                             </Link>
                         </div>
                     </div>
                 </div>
             </div>
          )
      } else {
          return (
              <div className="w-full max-w-5xl mx-auto py-6">
                 <div className="mb-6"><h1 className="text-3xl font-serif font-bold text-foreground">{title}</h1></div>
                 <DepositRequired />
              </div>
          )
      }
  }

  // ════════════════════════════════════════════════════════════════
  //  STEP 2: Activated BUT feature not launched? Show "Under Development"
  // ════════════════════════════════════════════════════════════════
  if (isUnlocked && UNDER_DEVELOPMENT_FEATURES.includes(feature)) {
      const devInfo = DEV_FEATURE_INFO[feature]
      return (
        <UnderDevelopmentPage
          title={devInfo?.title || title || "Feature"}
          description={devInfo?.description || "This feature is currently under development."}
          icon={devInfo?.icon || "🚧"}
          userEmail={user?.email || ""}
        />
      )
  }

  // ════════════════════════════════════════════════════════════════
  //  STEP 3: Check Coming Soon config for other features
  // ════════════════════════════════════════════════════════════════
  const globalConfig = await getComingSoonConfig()
  const isFeatureEnabled = feature === 'default' ? true : 
                           feature === 'tasks' ? globalConfig?.tasksEnabled :
                           true; 

  if (!isFeatureEnabled) {
      return (
        <div className="w-full max-w-5xl mx-auto py-6">
             <div className="mb-6"><h1 className="text-3xl font-serif font-bold text-foreground">{title}</h1></div>
             {/* Fallback to a simple message */}
             <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <p className="text-foreground font-bold text-lg">Coming Soon</p>
                <p className="text-sm text-muted-foreground mt-1">This feature is not yet available.</p>
             </div>
        </div>
      )
  }

  // ════════════════════════════════════════════════════════════════
  //  STEP 4: Activated + Feature is live → Show actual content
  // ════════════════════════════════════════════════════════════════
  return <>{children}</>
}