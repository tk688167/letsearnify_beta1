import { UnderDevelopmentPage } from "@/app/(dashboard)/dashboard/UnderDevelopment"

export const dynamic = 'force-dynamic'

export default function InvestmentsPage() {
  return (
    <UnderDevelopmentPage 
      title="Mudaraba Pool" 
      description="An ethical, crowdfunding-based investment model. We pool resources to strategically invest in diversified portfolios, delivering secure and transparent returns." 
      icon="📈"
      userEmail=""
    />
  )
}