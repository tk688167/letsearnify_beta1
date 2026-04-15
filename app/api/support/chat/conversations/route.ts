import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const conversations = await (prisma as any).chatConversation.findMany({
      where: { userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Calculate unread count globally or per conversation if needed
    // For now, let's just return conversations with their last message
    const formatted = conversations.map((conv: any) => ({
      id: conv.id,
      title: conv.title,
      status: conv.status,
      updatedAt: conv.updatedAt,
      lastMessage: conv.messages[0] || null
    }))

    return NextResponse.json({ conversations: formatted })
  } catch (error: any) {
    console.error("Chat Conversations Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
