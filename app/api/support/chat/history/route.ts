import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
    }

    // Verify conversation ownership and fetch messages
    // USE findFirst instead of findUnique because {id, userId} is not a compound unique index
    const conversation = await (prisma as any).chatConversation.findFirst({
      where: { id: conversationId, userId: session.user.id }
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found or unauthorized" }, { status: 404 })
    }

    const messages = await (prisma as any).chatMessage.findMany({
      where: { conversationId: conversationId },
      orderBy: { createdAt: "asc" },
    })

    // Reset user unread count when opening the history
    // Filter only by the unique 'id' to prevent Prisma crashes
    await (prisma as any).chatConversation.update({
      where: { id: conversationId },
      data: { unreadCountUser: 0 }
    })

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error("Chat History Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
