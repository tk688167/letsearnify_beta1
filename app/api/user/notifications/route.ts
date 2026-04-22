import { NextResponse } from "next/server"
import { auth } from "@/auth"

import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const notifications = await prisma.userNotification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        })
        return NextResponse.json({ notifications })
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await req.json()

        if (body.markAll === true) {
            // Mark every unread notification for this user as read in one query
            await prisma.userNotification.updateMany({
                where: { userId: session.user.id, isRead: false },
                data: { isRead: true }
            })
        } else {
            // Mark a single notification as read
            await prisma.userNotification.update({
                where: { id: body.id, userId: session.user.id },
                data: { isRead: true }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")
        
        if (id) {
            await prisma.userNotification.delete({
                where: { id, userId: session.user.id }
            })
        } else {
            // Delete all read notifications
            await prisma.userNotification.deleteMany({
                where: { userId: session.user.id, isRead: true }
            })
        }
        
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
    }
}
