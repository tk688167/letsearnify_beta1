import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, body, url, notificationId } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    // Get all admin subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        user: {
          role: "ADMIN",
        },
      },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No admin subscriptions found",
      });
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const sub of subscriptions) {
      const result = await sendPushNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys as any,
        },
        {
          title,
          body,
          url: url || "/admin/notifications",
          notificationId: notificationId || `notif_${Date.now()}`,
        }
      );

      if (result.success) {
        sentCount++;
      } else if (result.expired) {
        await prisma.pushSubscription.delete({
          where: {
            endpoint: sub.endpoint,
          },
        });
        failedCount++;
      } else {
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      total: subscriptions.length,
    });
  } catch (error: any) {
    console.error("❌ Push send error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send push notification" },
      { status: 500 }
    );
  }
}