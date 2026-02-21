import UnderDevelopment from "@/app/(dashboard)/dashboard/UnderDevelopment"
import { BanknotesIcon, ChartPieIcon, ShieldCheckIcon, GlobeAmericasIcon } from "@heroicons/react/24/outline"

export const dynamic = 'force-dynamic'

export default function InvestmentsPage() {
  return (
    <UnderDevelopment 
      title="Mudaraba Pool" 
      description="An ethical, crowdfunding-based investment model. We pool resources to strategically invest in diversified portfolios, delivering secure and transparent returns." 
      icon={<BanknotesIcon className="w-8 h-8" strokeWidth={1.5} />} 
    >
      <div className="space-y-4 pt-1">
          
          <div className="flex items-start gap-4">
              <div className="shrink-0 p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 ring-1 ring-teal-500/20 shadow-sm">
                  <BanknotesIcon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                  <h4 className="text-[14px] font-bold text-foreground">Accessible Growth</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed md:text-[13px]">
                      Start with a minimum deposit of just $1.00. Our platform empowers everyone to participate in profit-sharing, regardless of initial capital size.
                  </p>
              </div>
          </div>
          
          <div className="flex items-start gap-4">
              <div className="shrink-0 p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20 shadow-sm">
                  <ChartPieIcon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                  <h4 className="text-[14px] font-bold text-foreground">Strategic Allocation</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed md:text-[13px]">
                       Investments are intelligently distributed across high-value assets—including real estate, equities, and commodities—and held for 1 to 3 months to optimize returns.
                  </p>
              </div>
          </div>

          <div className="flex items-start gap-4">
              <div className="shrink-0 p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20 shadow-sm">
                  <GlobeAmericasIcon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                  <h4 className="text-[14px] font-bold text-foreground">Managed Trust</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed md:text-[13px]">
                      Our internationally managed operations ensure total transparency and institutional-grade security, making sure your funds are protected at all times.
                  </p>
              </div>
          </div>

      </div>
    </UnderDevelopment>
  )
}
