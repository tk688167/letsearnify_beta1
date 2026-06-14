import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ unreadCount: 0 })
    }

    const conversations = await (prisma as any).chatConversation.findMany({
      where: { userId: session.user.id },
      select: { unreadCountUser: true }
    })

    const totalUnread = conversations.reduce((acc: number, conv: any) => acc + (conv.unreadCountUser || 0), 0)

    return NextResponse.json({ unreadCount: totalUnread })
  } catch (error) {
    console.error("Unread Count API Error:", error)
    return NextResponse.json({ unreadCount: 0 })
  }
}
