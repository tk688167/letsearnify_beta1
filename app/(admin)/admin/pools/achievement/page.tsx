export const dynamic = "force-dynamic";

import AchievementHistorySection from "@/app/(admin)/admin/components/AchievementHistorySection"

export default function AdminAchievementPage() {
  return (
    <div className="p-6 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Achievement Pool Management</h1>
        <p className="text-gray-500 dark:text-gray-400">Track system-wide $1 activations and the percentage allocated to the Achievement Reward Pool.</p>
      </div>
      
      <AchievementHistorySection />
    </div>
  )
}
