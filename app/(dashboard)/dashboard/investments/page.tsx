import { FeatureGuard } from "@/app/(dashboard)/dashboard/FeatureGuard"
import MudarabaContent from "./MudarabaContent"

export default function InvestmentsPage() {
  return (
    <FeatureGuard title="Mudaraba Pool" feature="default">
        <MudarabaContent />
    </FeatureGuard>
  )
}
