import { prisma } from "@/lib/prisma"


export async function createNotification(userId: string, title: string, message: string, type: string = "GENERAL") {
    try {
        return await prisma.userNotification.create({
            data: {
                userId,
                title,
                message,
                type
            }
        });
    } catch (error) {
        console.error("[Notification] Error creating notification:", error);
    }
}

export async function cleanupNotifications() {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const deleted = await prisma.userNotification.deleteMany({
            where: {
                createdAt: { lt: thirtyDaysAgo }
            }
        });
        
        if (deleted.count > 0) {
            console.log(`[Notification] Cleaned up ${deleted.count} old notifications.`);
        }
    } catch (error) {
        console.error("[Notification] Error cleaning up notifications:", error);
    }
}
