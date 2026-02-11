
export const dynamic = "force-dynamic";

import { FeatureGuard } from "@/app/(dashboard)/dashboard/FeatureGuard"

export default function InvestmentsPage() {
  return <FeatureGuard title="Mudaaraba Pool Page" feature="pools" />
}
