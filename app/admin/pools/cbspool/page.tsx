import CbspHistorySection from "@/app/admin/components/CbspHistorySection"

export default function AdminCbspPage() {
  return (
    <div className="p-6 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CBSP Pool Management</h1>
        <p className="text-gray-500 dark:text-gray-400">Track system-wide contributions to the Company Business Share Profit Pool.</p>
      </div>
      
      <CbspHistorySection />
    </div>
  )
}
