
import { FeatureGuard } from "@/app/dashboard/components/FeatureGuard"

export default function TasksPage() {
  return <FeatureGuard title="Task Center" feature="tasks" />
}
