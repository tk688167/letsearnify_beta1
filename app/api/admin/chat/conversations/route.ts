import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all conversations with their user and last message
    const conversations = await (prisma as any).chatConversation.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { updatedAt: "desc" }
    })

    const formatted = await Promise.all(
      conversations.map(async (conv: any) => {
        // Calculate unread user messages for this specific conversation
        const unreadCount = await (prisma as any).chatMessage.count({
          where: { 
            conversationId: conv.id,
            sender: "USER", 
            status: "UNREAD" 
          }
        })

        return {
          id: conv.id,
          title: conv.title,
          status: conv.status,
          updatedAt: conv.updatedAt,
          user: conv.user,
          lastMessage: conv.messages[0] || null,
          unreadCount
        }
      })
    )

    return NextResponse.json({ conversations: formatted })
  } catch (error: any) {
    console.error("Admin Chat Conversations Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
