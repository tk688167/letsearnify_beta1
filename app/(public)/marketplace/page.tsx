import { Metadata } from "next"
import MarketplaceClient from "@/app/components/pages/MarketplaceClient"
import MarketplaceDevScreen from "@/app/components/pages/MarketplaceDevScreen"
import { getMarketplaceMode } from "@/lib/marketplace-mode"

// Force dynamic: re-run on every request so mode changes take effect immediately
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Freelance Marketplace | LetsEarnify — Hire Verified Professionals",
  description:
    "Browse verified freelancers across design, development, writing, marketing, and more. LetsEarnify Freelance Marketplace connects you with top-tier professionals worldwide.",
  keywords: ["freelance marketplace", "hire freelancer", "verified professionals", "LetsEarnify"],
  openGraph: {
    title: "LetsEarnify Freelance Marketplace",
    description: "Connect with verified, professional freelancers.",
    type: "website",
  },
}

export default async function MarketplacePage() {
  const mode = await getMarketplaceMode()

  if (mode === "live") {
    return <MarketplaceClient />
  }

  return <MarketplaceDevScreen />
}
