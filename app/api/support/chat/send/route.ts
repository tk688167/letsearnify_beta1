import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { generateConversationTitle } from "@/lib/support-utils"

export const runtime = "nodejs"

export async function POST(req: Request) {
  // ─────────────────────────────────────────────────────────────────
  // STEP 1: Auth & Input validation
  // ─────────────────────────────────────────────────────────────────
  let session: any
  try {
    session = await auth()
  } catch {
    return NextResponse.json({ success: false, error: "Auth failed" }, { status: 401 })
  }

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  let bodyMessage: string | null = null
  let bodyConversationId: string | null = null

  try {
    const body = await req.json()
    bodyMessage = body.message
    bodyConversationId = body.conversationId
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
  }

  if (!bodyMessage || typeof bodyMessage !== "string" || !bodyMessage.trim()) {
    return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 })
  }

  const trimmedMessage = bodyMessage.trim()
  const db = prisma as any

  // ─────────────────────────────────────────────────────────────────
  // STEP 2: Resolve active conversation ID (with existence check)
  // ─────────────────────────────────────────────────────────────────
  let activeConvId: string | null = null
  let isNewConversation = false

  // Sanitize incoming ID
  if (bodyConversationId && bodyConversationId !== "undefined" && bodyConversationId !== "") {
    try {
      const existingConv = await db.chatConversation.findFirst({
        where: { id: bodyConversationId, userId: session.user.id },
        select: { id: true }
      })
      if (existingConv) {
        activeConvId = existingConv.id
      } else {
        console.warn(`[Chat Send] Conv ${bodyConversationId} not found/unauthorized. Will create new.`)
      }
    } catch (checkErr) {
      console.error("[Chat Send] Existence check error, will create new conv:", checkErr)
    }
  }

  // Create new conversation if needed
  if (!activeConvId) {
    try {
      const title = generateConversationTitle(trimmedMessage)
      const newConv = await db.chatConversation.create({
        data: {
          userId: session.user.id,
          title,
          status: "OPEN",
        }
      })
      activeConvId = newConv.id
      isNewConversation = true
    } catch (convErr: any) {
      console.error("[Chat Send] Failed to create conversation:", convErr)
      return NextResponse.json({ success: false, error: "Could not create chat session." }, { status: 200 })
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // STEP 3: Save the message (critical — must succeed)
  // ─────────────────────────────────────────────────────────────────
  let newMessage: any
  try {
    newMessage = await db.chatMessage.create({
      data: {
        userId: session.user.id,
        conversationId: activeConvId,
        message: trimmedMessage,
        sender: "USER",
        status: "UNREAD",
      }
    })
  } catch (msgErr: any) {
    console.error("[Chat Send] Failed to save message:", msgErr)
    return NextResponse.json({ success: false, error: "Message could not be saved. Please try again." }, { status: 200 })
  }

  // ─────────────────────────────────────────────────────────────────
  // STEP 4: Non-blocking side effects (never crash the request)
  // ─────────────────────────────────────────────────────────────────

  // Update unread counter + timestamp
  db.chatConversation.update({
    where: { id: activeConvId },
    data: { updatedAt: new Date(), unreadCountAdmin: { increment: 1 } }
  }).catch((e: any) => console.warn("[Chat Send] Conversation update failed (non-blocking):", e))

  // Admin notification
  db.adminNotification.create({
    data: {
      type: "support_message",
      title: "New Support Message",
      message: `New message from ${session.user.name || "User"}`,
      metadata: JSON.stringify({ conversationId: activeConvId }),
      isRead: false,
    },
  }).catch((e: any) => console.warn("[Chat Send] Admin notify failed (non-blocking):", e))

  // Auto-reply for brand-new threads only
  if (isNewConversation) {
    db.chatMessage.create({
      data: {
        userId: session.user.id,
        conversationId: activeConvId,
        message: "Welcome to LetsEarnify Support 🚀\nOur team will respond within 24 hours.",
        sender: "ADMIN",
        status: "READ",
      },
    }).catch((e: any) => console.warn("[Chat Send] Auto-reply failed (non-blocking):", e))
  }

  // ─────────────────────────────────────────────────────────────────
  // STEP 5: Return success
  // ─────────────────────────────────────────────────────────────────
  return NextResponse.json({
    success: true,
    message: newMessage,
    conversationId: activeConvId,
  })
}
