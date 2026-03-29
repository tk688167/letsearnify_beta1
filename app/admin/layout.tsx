import { AdminSidebar } from "./components/AdminSidebar"
import MobileAdminNav from "./components/mobile-admin-nav"

import { getPendingCounts } from "@/app/actions/admin/counts"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware handles auth check now.
  const counts = await getPendingCounts()

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans md:flex-row flex-col overflow-hidden">
      <AdminSidebar counts={counts} />
      <div className="flex flex-col flex-1 h-full overflow-hidden">
         <MobileAdminNav counts={counts} />
         <main className="flex-1 w-full max-w-7xl mx-auto overflow-y-auto">
           {children}
         </main>
      </div>
    </div>
  )
}

