import { prisma } from "@/lib/prisma"
import UserManagementClient from "./user-management-client"

export const dynamic = 'force-dynamic'

// Force rebuild
export default async function AdminUsersPage() {
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      take: 2000,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        balance: true,
        tier: true,
        points: true,
        activeMembers: true,
        memberId: true 
      }
    }),
    prisma.user.count()
  ])

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gray-50/50">
       <UserManagementClient initialUsers={users} initialTotal={total} />
    </div>
  )
}
