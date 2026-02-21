export const dynamic = "force-dynamic"

import { AdminSidebar } from "./components/AdminSidebar"
import MobileAdminNav from "./components/mobile-admin-nav"

import { getPendingCounts } from "@/app/actions/admin/counts"

import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 1. Strict Server-Side Security Check
  let session;
  try {
      session = await auth()
  } catch (e) {
      console.error("Admin Layout Auth Failed:", e);
      // Fallback ONLY in Development
      if (process.env.NODE_ENV === 'development') {
          session = { user: { role: "ADMIN", email: "admin@local" } };
      }
  }
  
  if (session?.user?.role !== "ADMIN") {
      console.warn("🚨 Unauthorized Admin Access Attempt:", session?.user?.email || "Unknown")
      redirect("/unauthorized") // Or "/"
  }

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

