import DashboardMarketplaceClient from "./DashboardMarketplaceClient"
import MarketplaceDevScreen from "@/app/components/pages/MarketplaceDevScreen"
import { getMarketplaceMode } from "@/lib/marketplace-mode"
import { FeatureGuard } from "../FeatureGuard"

// Re-render on every request so toggling mode takes effect immediately
export const dynamic = "force-dynamic"

export default async function MarketplacePage() {
  const mode = await getMarketplaceMode()

  if (mode === "development") {
    return <MarketplaceDevScreen />
  }

  return (
    <FeatureGuard title="Marketplace" feature="marketplace" previewMode={true}>
      <DashboardMarketplaceClient />
    </FeatureGuard>
  )
}
