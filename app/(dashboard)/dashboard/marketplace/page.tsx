import UnderDevelopment from "@/app/(dashboard)/dashboard/UnderDevelopment"
import { ShoppingBagIcon, ShieldCheckIcon, WalletIcon, StarIcon } from "@heroicons/react/24/outline"

export const dynamic = 'force-dynamic'

export default function MarketplacePage() {
  return (
    <UnderDevelopment 
      title="Freelance Marketplace" 
      description="A premium hub connecting top-tier talent with ambitious clients. Experience the power of major networks without the exorbitant middleman fees." 
      icon={<ShoppingBagIcon className="w-8 h-8" strokeWidth={1.5} />} 
    >
      <div className="space-y-4 pt-1">
          
          <div className="flex items-start gap-4">
              <div className="shrink-0 p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 shadow-sm">
                  <WalletIcon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                  <h4 className="text-[14px] font-bold text-foreground">30% Upfront Escrow</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed md:text-[13px]">
                      Initiate contracts with a reasonable 30% deposit. The final balance is held securely and only released upon your complete review and portfolio approval.
                  </p>
              </div>
          </div>
          
          <div className="flex items-start gap-4">
              <div className="shrink-0 p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20 shadow-sm">
                  <ShieldCheckIcon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                  <h4 className="text-[14px] font-bold text-foreground">100% Authentic Talent</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed md:text-[13px]">
                      Every freelancer must pass rigorous KYC and portfolio background checks. Engage only with authentic, highly-skilled professionals.
                  </p>
              </div>
          </div>

          <div className="flex items-start gap-4">
              <div className="shrink-0 p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20 shadow-sm">
                  <StarIcon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                  <h4 className="text-[14px] font-bold text-foreground">Zero Hidden Fees</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed md:text-[13px]">
                      Unlike platforms such as Upwork or Fiverr, our transparent fee structure ensures you maximize your budget while freelancers retain their hard-earned money.
                  </p>
              </div>
          </div>

      </div>
    </UnderDevelopment>
  )
}
