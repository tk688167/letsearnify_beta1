import { AdminSidebar } from "./components/AdminSidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware handles auth check now.
  return (
    <div className="flex min-h-screen bg-gray-50/50 font-sans">
      <AdminSidebar />
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
