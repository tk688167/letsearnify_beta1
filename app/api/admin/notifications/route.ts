import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ notifications: [], unreadCount: 0 })
    }

    // Get the admin's last read timestamp from a simple system config
    let lastReadAt = new Date(0)
    try {
      const config = await prisma.systemConfig.findUnique({ where: { key: "ADMIN_NOTIFICATIONS_READ_AT" } })
      if (config?.value) {
        lastReadAt = new Date((config.value as any).timestamp || 0)
      }
    } catch {}

    const since = new Date()
    since.setDate(since.getDate() - 30) // last 30 days

    // Fetch recent events in parallel
    const [pendingMerchantDeposits, pendingWithdrawals, recentSignups, recentUnlocks, pendingTaskApprovals] = await Promise.all([
      prisma.merchantTransaction.findMany({
        where: { createdAt: { gte: since } }, // Get all in range for detailed panel
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 50
      }),
      prisma.transaction.findMany({
        where: { type: "WITHDRAWAL", createdAt: { gte: since } },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 50
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: since } },
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 50
      }),
      prisma.mLMLog.findMany({
        where: { type: "ACCOUNT_UNLOCK", createdAt: { gte: since } },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 50
      }),
      prisma.taskCompletion.findMany({
        where: { createdAt: { gte: since } },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 50
      })
    ])

    const notifications: any[] = []

    // Merchant deposits
    for (const tx of pendingMerchantDeposits) {
      notifications.push({
        id: `merchant-${tx.id}`,
        type: tx.type === 'DEPOSIT' ? 'merchant_deposit' : 'withdrawal',
        title: `New Merchant ${tx.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'}`,
        description: `${tx.user?.name || 'User'} submitted $${tx.amount.toFixed(2)} ${tx.type.toLowerCase()} via ${tx.countryCode}`,
        href: "/admin/merchant/deposits",
        time: formatTimeAgo(tx.createdAt),
        read: new Date(tx.createdAt) < lastReadAt,
        sortDate: tx.createdAt
      })
    }

    // Pending withdrawals
    for (const tx of pendingWithdrawals) {
      notifications.push({
        id: `withdrawal-${tx.id}`,
        type: 'withdrawal',
        title: "New Withdrawal Request",
        description: `${tx.user?.name || 'User'} requested $${tx.amount.toFixed(2)} withdrawal`,
        href: "/admin/withdrawals",
        time: formatTimeAgo(tx.createdAt),
        read: new Date(tx.createdAt) < lastReadAt,
        sortDate: tx.createdAt
      })
    }

    // New signups
    for (const u of recentSignups) {
      notifications.push({
        id: `signup-${u.id}`,
        type: 'signup',
        title: "New User Signup",
        description: `${u.name || 'Someone'} (${u.email}) joined the platform`,
        href: "/admin/users",
        time: formatTimeAgo(u.createdAt),
        read: new Date(u.createdAt) < lastReadAt,
        sortDate: u.createdAt
      })
    }

    // Account unlocks
    for (const log of recentUnlocks) {
      notifications.push({
        id: `unlock-${log.id}`,
        type: 'unlock',
        title: "Account Activated",
        description: `${log.user?.name || 'User'} unlocked their account with $1`,
        href: "/admin/unlocks",
        time: formatTimeAgo(log.createdAt),
        read: new Date(log.createdAt) < lastReadAt,
        sortDate: log.createdAt
      })
    }

    // Task submissions
    for (const tc of pendingTaskApprovals) {
      notifications.push({
        id: `task-${tc.id}`,
        type: 'task_submission',
        title: "Task Pending Approval",
        description: `${tc.user?.name || 'User'} submitted a task for review`,
        href: "/admin/tasks/approvals",
        time: formatTimeAgo(tc.createdAt),
        read: new Date(tc.createdAt) < lastReadAt,
        sortDate: tc.createdAt
      })
    }

    // Sort by date (newest first)
    notifications.sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())

    // Increase returned count for detailed view
    const trimmed = notifications.slice(0, 100)
    const unreadCount = trimmed.filter(n => !n.read).length

    return NextResponse.json({ notifications: trimmed, unreadCount })
  } catch (error) {
    console.error("Admin notifications error:", error)
    return NextResponse.json({ notifications: [], unreadCount: 0 })
  }
}

// Mark all as read
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.systemConfig.upsert({
      where: { key: "ADMIN_NOTIFICATIONS_READ_AT" },
      update: { value: { timestamp: new Date().toISOString() } },
      create: { key: "ADMIN_NOTIFICATIONS_READ_AT", value: { timestamp: new Date().toISOString() } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark notifications read error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

function formatTimeAgo(date: Date | string): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString()
}