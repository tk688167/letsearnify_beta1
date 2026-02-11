export const dynamic = "force-dynamic";

import UserManagementClient from "./user-management-client"
import { getAdminUsers } from "@/lib/services/admin"

export default async function AdminUsersPage() {
  const { users, total, isOffline } = await getAdminUsers();

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gray-50/50">
       {isOffline && (
           <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
               ⚠️ <strong>Offline Mode Active:</strong> Database connection is currently unavailable. Displaying placeholders.
           </div>
       )}
       <UserManagementClient initialUsers={users} initialTotal={total} />
    </div>
  )
}
