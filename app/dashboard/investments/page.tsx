
import { FeatureGuard } from "@/app/dashboard/components/FeatureGuard"

export default function InvestmentsPage() {
  return <FeatureGuard title="Mudaaraba Pool Page" feature="pools" />
}
