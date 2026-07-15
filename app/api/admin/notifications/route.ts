// app/api/admin/notifications/route.ts
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
    const [pendingMerchantDeposits, pendingWithdrawals, recentSignups, recentUnlocks, pendingTaskApprovals, recentDailyInvestments, recentSpinRewards] = await Promise.all([
      prisma.merchantTransaction.findMany({
        where: { createdAt: { gte: since } },
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
      }),
      prisma.dailyEarningInvestment.findMany({
        where: { createdAt: { gte: since } },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 50
      }),
      prisma.mLMLog.findMany({
        where: { type: "SPIN_REWARD", createdAt: { gte: since } },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 50
      })
    ])

    const notifications: any[] = []
    const newNotifications: any[] = [] // Naye notifications track karne ke liye

    // Merchant deposits
    for (const tx of pendingMerchantDeposits) {
      const isRead = new Date(tx.createdAt) < lastReadAt
      const notification = {
        id: `merchant-${tx.id}`,
        type: tx.type === 'DEPOSIT' ? 'merchant_deposit' : 'withdrawal',
        title: `New Merchant ${tx.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'}`,
        description: `${tx.user?.name || 'User'} submitted $${tx.amount.toFixed(2)} ${tx.type.toLowerCase()} via ${tx.countryCode}`,
        href: "/admin/merchant/deposits",
        time: formatTimeAgo(tx.createdAt),
        read: isRead,
        sortDate: tx.createdAt,
        userData: {
          name: tx.user?.name || 'User',
          email: tx.user?.email || 'N/A',
          amount: tx.amount
        }
      }
      notifications.push(notification)
      if (!isRead) {
        newNotifications.push(notification)
      }
    }

    // Pending withdrawals
    for (const tx of pendingWithdrawals) {
      const isRead = new Date(tx.createdAt) < lastReadAt
      const notification = {
        id: `withdrawal-${tx.id}`,
        type: 'withdrawal',
        title: "New Withdrawal Request",
        description: `${tx.user?.name || 'User'} requested $${tx.amount.toFixed(2)} withdrawal`,
        href: "/admin/withdrawals",
        time: formatTimeAgo(tx.createdAt),
        read: isRead,
        sortDate: tx.createdAt,
        userData: {
          name: tx.user?.name || 'User',
          email: tx.user?.email || 'N/A',
          amount: tx.amount
        }
      }
      notifications.push(notification)
      if (!isRead) {
        newNotifications.push(notification)
      }
    }

    // New signups
    for (const u of recentSignups) {
      const isRead = new Date(u.createdAt) < lastReadAt
      const notification = {
        id: `signup-${u.id}`,
        type: 'signup',
        title: "New User Signup",
        description: `${u.name || 'Someone'} (${u.email}) joined the platform`,
        href: "/admin/users",
        time: formatTimeAgo(u.createdAt),
        read: isRead,
        sortDate: u.createdAt,
        userData: {
          name: u.name || 'Someone',
          email: u.email || 'N/A'
        }
      }
      notifications.push(notification)
      if (!isRead) {
        newNotifications.push(notification)
      }
    }

    // Account unlocks
    for (const log of recentUnlocks) {
      const isRead = new Date(log.createdAt) < lastReadAt
      const notification = {
        id: `unlock-${log.id}`,
        type: 'unlock',
        title: "Account Activated",
        description: `${log.user?.name || 'User'} unlocked their account with $1`,
        href: "/admin/unlocks",
        time: formatTimeAgo(log.createdAt),
        read: isRead,
        sortDate: log.createdAt,
        userData: {
          name: log.user?.name || 'User',
          email: log.user?.email || 'N/A'
        }
      }
      notifications.push(notification)
      if (!isRead) {
        newNotifications.push(notification)
      }
    }

    // Task submissions
    for (const tc of pendingTaskApprovals) {
      const isRead = new Date(tc.createdAt) < lastReadAt
      const notification = {
        id: `task-${tc.id}`,
        type: 'task_submission',
        title: "Task Pending Approval",
        description: `${tc.user?.name || 'User'} submitted a task for review`,
        href: "/admin/tasks?tab=approvals",
        time: formatTimeAgo(tc.createdAt),
        read: isRead,
        sortDate: tc.createdAt,
        userData: {
          name: tc.user?.name || 'User',
          email: tc.user?.email || 'N/A'
        }
      }
      notifications.push(notification)
      if (!isRead) {
        newNotifications.push(notification)
      }
    }

    // Daily Earning Pool investments
    for (const inv of recentDailyInvestments) {
      const isRead = new Date(inv.createdAt) < lastReadAt
      const notification = {
        id: `daily-inv-${inv.id}`,
        type: 'daily_earning',
        title: "Daily Pool Investment",
        description: `${inv.user?.name || 'User'} invested $${inv.amount.toFixed(2)} in the Daily Pool`,
        href: "/admin/daily-earning",
        time: formatTimeAgo(inv.createdAt),
        read: isRead,
        sortDate: inv.createdAt,
        userData: {
          name: inv.user?.name || 'User',
          email: inv.user?.email || 'N/A',
          amount: inv.amount
        }
      }
      notifications.push(notification)
      if (!isRead) {
        newNotifications.push(notification)
      }
    }

    // Spin Wheel Activities
    for (const spin of recentSpinRewards) {
      const isRead = new Date(spin.createdAt) < lastReadAt
      const notification = {
        id: `spin-${spin.id}`,
        type: 'spin_wheel',
        title: "Spin Reward Won",
        description: `${spin.user?.name || 'User'} ${spin.description.toLowerCase()}`,
        href: "/admin/spin-timers",
        time: formatTimeAgo(spin.createdAt),
        read: isRead,
        sortDate: spin.createdAt,
        userData: {
          name: spin.user?.name || 'User',
          email: spin.user?.email || 'N/A'
        }
      }
      notifications.push(notification)
      if (!isRead) {
        newNotifications.push(notification)
      }
    }

    // ✅ Naye notifications ke liye PUSH notification send karein (Email nahi)
    if (newNotifications.length > 0) {
      await sendPushForNewNotifications(newNotifications)
    }

    // Sort by date (newest first)
    notifications.sort((a: any, b: any) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())

    // Increase returned count for detailed view
    const trimmed = notifications.slice(0, 100)
    const unreadCount = trimmed.filter((n: any) => !n.read).length

    return NextResponse.json({ notifications: trimmed, unreadCount })
  } catch (error) {
    console.error("Admin notifications error:", error)
    return NextResponse.json({ notifications: [], unreadCount: 0 })
  }
}

// ✅ PUSH notification send karne ka function (Email nahi)
async function sendPushForNewNotifications(newNotifications: any[]) {
  try {
    if (newNotifications.length === 0) return;

    // Sirf pehli 5 notifications send karein
    const notificationsToSend = newNotifications.slice(0, 5);
    
    for (const notif of notificationsToSend) {
      // Build push notification payload
      const typeConfig: Record<string, { emoji: string; badge: string }> = {
        signup: { emoji: "👤", badge: "New User" },
        deposit: { emoji: "💰", badge: "Deposit" },
        withdrawal: { emoji: "💸", badge: "Withdrawal" },
        merchant_deposit: { emoji: "🏦", badge: "Merchant Deposit" },
        task_submission: { emoji: "📝", badge: "Task Submission" },
        unlock: { emoji: "🔓", badge: "Account Unlock" },
        daily_earning: { emoji: "📊", badge: "Daily Pool" },
        spin_wheel: { emoji: "🎡", badge: "Spin Reward" },
      };

      const config = typeConfig[notif.type] || { emoji: "🔔", badge: "Notification" };
      
      const pushTitle = `${config.emoji} ${notif.title}`;
      const pushBody = notif.userData?.name 
        ? `${notif.userData.name}: ${notif.description}` 
        : notif.description;

      // Send push notification via API
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/push/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: pushTitle,
            body: pushBody,
            url: "/admin/notifications",
            notificationId: notif.id,
          }),
        });
        
        console.log(`✅ Push notification sent for: ${notif.title}`);
      } catch (pushError) {
        console.error(`❌ Push notification failed for: ${notif.title}`, pushError);
      }
      
      // Rate limiting ke liye thoda wait karein
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`✅ ${notificationsToSend.length} push notifications sent`);
  } catch (error) {
    console.error("❌ Error sending push notifications:", error);
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