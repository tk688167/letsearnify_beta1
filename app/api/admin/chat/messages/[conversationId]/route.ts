import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let { conversationId } = await params

    if (!conversationId || conversationId === "undefined") {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
    }

    const messages = await (prisma as any).chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    })

    // Mark messages as read and reset admin unread count when admin views them
    // Non-blocking update to ensure messages are returned quickly
    try {
      await (prisma as any).chatMessage.updateMany({
        where: { conversationId, sender: "USER", status: "UNREAD" },
        data: { status: "READ" }
      })

      await (prisma as any).chatConversation.update({
        where: { id: conversationId },
        data: { unreadCountAdmin: 0 }
      })
    } catch (updateError) {
      console.warn("Failed to update unread status, but messages loaded:", updateError)
    }

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error("Admin Chat Messages Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversationId } = await params
    const { message } = await req.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Get the user ID from the conversation
    const conversation = await (prisma as any).chatConversation.findUnique({
      where: { id: conversationId },
      select: { userId: true }
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const newMessage = await (prisma as any).chatMessage.create({
      data: {
        conversationId,
        userId: conversation.userId,
        message,
        sender: "ADMIN",
        status: "READ",
      },
    })

    // Update conversation: update timestamp, increment user unread count, and reset admin unread count
    await (prisma as any).chatConversation.update({
      where: { id: conversationId },
      data: { 
        updatedAt: new Date(),
        unreadCountUser: { increment: 1 },
        unreadCountAdmin: 0
      }
    })

    return NextResponse.json({ success: true, message: newMessage })
  } catch (error: any) {
    console.error("Admin Chat Reply Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
